#!/usr/bin/env python3
"""
Audit Access front-end object coverage (VBA modules, queries, reports).

The script uses:
- MSysObjects (object inventory)
- MSysQueries (query dependency signals)
- VBA text (plain text or .docx via textutil extraction)
- workspace source/docs text (optional string-reference check)

Usage example:
  python3 scripts/audit_access_object_usage.py \
    --front-end-path "/Users/chrisskerritt/Downloads/MVQS_DC_FrontEnd_with_Adobe.accdb" \
    --vba-path "/Users/chrisskerritt/Downloads/Option Compare Database (1).docx"
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

try:
    csv.field_size_limit(sys.maxsize)
except OverflowError:
    csv.field_size_limit(2**31 - 1)

MODULE_TYPE = "-32761"
REPORT_TYPE = "-32764"
QUERY_TYPE = "5"

TEXT_EXTENSIONS = {
    ".md",
    ".js",
    ".mjs",
    ".cjs",
    ".py",
    ".json",
    ".txt",
    ".sql",
    ".csv",
    ".ts",
    ".tsx",
    ".jsx",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit Access object usage coverage.")
    parser.add_argument("--front-end-path", required=True, help="Path to Access front-end .accdb")
    parser.add_argument(
        "--vba-path",
        help="Path to VBA export text (.txt) or .docx file containing module code.",
    )
    parser.add_argument(
        "--workspace-root",
        default=".",
        help="Workspace root used to scan src/scripts/docs/README for string references.",
    )
    parser.add_argument(
        "--out-dir",
        default="output/analysis",
        help="Output directory for audit artifacts (default: output/analysis).",
    )
    parser.add_argument(
        "--fail-on-unaccounted",
        action="store_true",
        help="Exit non-zero if any module/report/canonical-query remains unaccounted.",
    )
    return parser.parse_args()


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def require_tool(name: str) -> None:
    if shutil.which(name) is None:
        raise RuntimeError(f"Required tool '{name}' is not available in PATH.")


def run_command(args: list[str], *, stdin_text: str | None = None) -> str:
    input_bytes = stdin_text.encode("utf-8") if stdin_text is not None else None
    proc = subprocess.run(
        args,
        input=input_bytes,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"Command failed ({proc.returncode}): {' '.join(args)}\n"
            f"stderr: {(proc.stderr or b'').decode('utf-8', errors='replace').strip()[:800]}"
        )
    return (proc.stdout or b"").decode("utf-8", errors="replace")


def export_system_table(front_end_path: Path, table_name: str, out_path: Path) -> None:
    data = run_command(["mdb-export", str(front_end_path), table_name])
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(data, encoding="utf-8")


def load_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", errors="replace") as f:
        return list(csv.DictReader(f))


def safe_read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""


def extract_vba_text(vba_path: Path, tmp_dir: Path) -> tuple[str, str]:
    if not vba_path.exists():
        raise RuntimeError(f"VBA path does not exist: {vba_path}")

    suffix = vba_path.suffix.lower()
    if suffix != ".docx":
        return safe_read_text(vba_path), str(vba_path)

    require_tool("textutil")
    text = run_command(["textutil", "-convert", "txt", "-stdout", str(vba_path)])
    extracted_path = tmp_dir / "vba_text_from_docx.txt"
    extracted_path.parent.mkdir(parents=True, exist_ok=True)
    extracted_path.write_text(text, encoding="utf-8")
    return text, str(extracted_path)


def collect_workspace_text(workspace_root: Path) -> tuple[str, list[str]]:
    include_roots = [
        workspace_root / "README.md",
        workspace_root / "src",
        workspace_root / "scripts",
        workspace_root / "docs",
    ]
    content_parts: list[str] = []
    files_read: list[str] = []

    for root in include_roots:
        if root.is_file():
            content_parts.append(safe_read_text(root))
            files_read.append(str(root))
            continue

        if not root.is_dir():
            continue

        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in TEXT_EXTENSIONS:
                continue
            files_read.append(str(path))
            content_parts.append(safe_read_text(path))

    return "\n".join(content_parts), files_read


def quoted_string_tokens(text: str) -> set[str]:
    tokens = set()
    for match in re.finditer(r'"([^"\r\n]{1,400})"', text):
        token = match.group(1).strip()
        if token:
            tokens.add(token.lower())
    return tokens


def names_present_by_substring(names: Iterable[str], text: str) -> set[str]:
    found: set[str] = set()
    haystack = text.lower()
    for name in names:
        if name.lower() in haystack:
            found.add(name)
    return found


def normalize_blob_text(value: str) -> str:
    if not value:
        return ""
    # Access blobs often store UTF-16LE text with interleaved null bytes.
    value = value.replace("\x00", "")
    value = "".join(ch if ord(ch) >= 32 else " " for ch in value)
    value = re.sub(r"\s+", " ", value).strip()
    return value.lower()


def build_access_storage_corpus(storage_rows: list[dict[str, str]]) -> str:
    chunks: list[str] = []
    for row in storage_rows:
        name_value = (row.get("Name") or "").strip()
        # DirData is mostly object catalogs; exclude to reduce pure-listing false positives.
        if "dirdata" in name_value.lower():
            continue
        lv_value = row.get("Lv") or ""
        norm = normalize_blob_text(lv_value)
        if norm:
            chunks.append(norm)
    return "\n".join(chunks)


def parse_query_dependencies(
    msysqueries_rows: list[dict[str, str]], object_id_to_query: dict[int, str], query_lookup: dict[str, str]
) -> tuple[dict[str, set[str]], Counter]:
    outbound: dict[str, set[str]] = defaultdict(set)
    inbound: Counter = Counter()

    for row in msysqueries_rows:
        raw_object_id = (row.get("ObjectId") or "").strip()
        if not raw_object_id:
            continue

        try:
            object_id = int(raw_object_id)
        except ValueError:
            continue

        source_query = object_id_to_query.get(object_id)
        if not source_query:
            continue

        raw_refs: set[str] = set()
        for key in ("Name1", "Name2"):
            value = (row.get(key) or "").strip()
            if value:
                raw_refs.add(value)

        expr = (row.get("Expression") or "").strip()
        if expr:
            for match in re.finditer(r"\[([^\]]+)\]\.", expr):
                raw_refs.add(match.group(1).strip())

        for ref in raw_refs:
            resolved = query_lookup.get(ref.lower())
            if not resolved:
                continue
            if resolved == source_query:
                continue
            outbound[source_query].add(resolved)
            inbound[resolved] += 1

    return outbound, inbound


def summarize_top(values: list[str], limit: int = 60) -> list[str]:
    return sorted(values)[:limit]


def build_markdown(report: dict) -> str:
    c = report["counts"]
    sig = report["signals"]

    lines: list[str] = []
    lines.append("# Access Object Usage Audit")
    lines.append("")
    lines.append(f"- Generated (UTC): {report['generated_at_utc']}")
    lines.append(f"- Front-end: `{report['front_end_path']}`")
    lines.append(f"- VBA source text: `{report['vba_source_path']}`")
    lines.append("")
    lines.append("## Inventory")
    lines.append("")
    lines.append(f"- Modules: {c['modules_total']}")
    lines.append(f"- Reports: {c['reports_total']}")
    lines.append(f"- Queries (all): {c['queries_total']}")
    lines.append(f"- Queries (canonical): {c['queries_canonical_total']}")
    lines.append(f"- Queries (hidden `~sq_`): {c['queries_hidden_total']}")
    lines.append("")
    lines.append("## Static Evidence Signals")
    lines.append("")
    lines.append(f"- Modules name-matched in VBA text: {sig['modules_name_in_vba']}")
    lines.append(f"- Reports name-matched in VBA text: {sig['reports_name_in_vba']}")
    lines.append(f"- Reports name-matched in hidden Access queries: {sig['reports_name_in_hidden_queries']}")
    lines.append(f"- Canonical queries found in VBA quoted strings: {sig['queries_in_vba_quoted']}")
    lines.append(f"- Canonical queries name-matched in VBA text: {sig['queries_in_vba_substring']}")
    lines.append(f"- Canonical queries referenced by other saved queries: {sig['queries_referenced_by_queries']}")
    lines.append(f"- Modules name-matched in Access storage (non-DirData): {sig['modules_name_in_access_storage_non_dir']}")
    lines.append(f"- Reports name-matched in Access storage (non-DirData): {sig['reports_name_in_access_storage_non_dir']}")
    lines.append(
        f"- Canonical queries name-matched in Access storage (non-DirData): {sig['canonical_queries_name_in_access_storage_non_dir']}"
    )
    lines.append(f"- Legacy object names found in modern workspace text: {sig['legacy_names_in_workspace']}")
    lines.append("")
    lines.append("## Accounting")
    lines.append("")
    lines.append(f"- Modules unaccounted: {report['accounting']['modules_unaccounted_count']}")
    lines.append(f"- Reports unaccounted: {report['accounting']['reports_unaccounted_count']}")
    lines.append(f"- Canonical queries unaccounted: {report['accounting']['canonical_queries_unaccounted_count']}")
    lines.append("")
    lines.append("## Coverage Snapshot")
    lines.append("")
    lines.append(
        "- Static analysis can prove some objects are referenced, but cannot prove non-referenced objects are unused at runtime."
    )
    lines.append(
        "- Access storage matches prove object presence in the Access file internals, not guaranteed end-user execution paths."
    )
    lines.append("")
    lines.append("### Modules still unaccounted (possible false negatives)")
    lines.append("")
    for name in report["modules"]["without_accounted_signal_sample"]:
        lines.append(f"- {name}")
    lines.append("")
    lines.append("### Reports still unaccounted (possible false negatives)")
    lines.append("")
    for name in report["reports"]["without_static_signal_sample"]:
        lines.append(f"- {name}")
    lines.append("")
    lines.append("### Canonical queries still unaccounted (possible false negatives)")
    lines.append("")
    for name in report["queries"]["canonical_without_static_signal_sample"]:
        lines.append(f"- {name}")
    lines.append("")
    lines.append("## Key Conclusion")
    lines.append("")
    lines.append(
        "- The modern MVQS app currently imports data from `MVQS_DC_Data.accdb` and `MVQS_DC_Data_JobBank.accdb`; it does not directly execute Access VBA modules, saved Access queries, or Access report objects."
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    args = parse_args()
    require_tool("mdb-export")

    front_end_path = Path(args.front_end_path).expanduser().resolve()
    if not front_end_path.exists():
        raise RuntimeError(f"Front-end database not found: {front_end_path}")

    workspace_root = Path(args.workspace_root).expanduser().resolve()
    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_dir = out_dir / "access_audit_tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    msysobjects_csv = tmp_dir / "msysobjects_frontend.csv"
    msysqueries_csv = tmp_dir / "msysqueries_frontend.csv"
    msysaccessstorage_csv = tmp_dir / "msysaccessstorage_frontend.csv"
    export_system_table(front_end_path, "MSysObjects", msysobjects_csv)
    export_system_table(front_end_path, "MSysQueries", msysqueries_csv)
    export_system_table(front_end_path, "MSysAccessStorage", msysaccessstorage_csv)

    msysobjects_rows = load_csv_rows(msysobjects_csv)
    msysqueries_rows = load_csv_rows(msysqueries_csv)
    msysaccessstorage_rows = load_csv_rows(msysaccessstorage_csv)

    modules = sorted([row["Name"] for row in msysobjects_rows if row.get("Type") == MODULE_TYPE and row.get("Name")])
    reports = sorted([row["Name"] for row in msysobjects_rows if row.get("Type") == REPORT_TYPE and row.get("Name")])
    queries_all = sorted([row["Name"] for row in msysobjects_rows if row.get("Type") == QUERY_TYPE and row.get("Name")])
    queries_hidden = sorted([name for name in queries_all if name.startswith("~sq_")])
    queries_canonical = sorted([name for name in queries_all if not name.startswith("~sq_")])

    object_id_to_query: dict[int, str] = {}
    for row in msysobjects_rows:
        if row.get("Type") != QUERY_TYPE:
            continue
        name = (row.get("Name") or "").strip()
        raw_id = (row.get("Id") or "").strip()
        if not name or not raw_id:
            continue
        try:
            object_id_to_query[int(raw_id)] = name
        except ValueError:
            continue

    query_lookup = {name.lower(): name for name in queries_all}
    query_outbound, query_inbound = parse_query_dependencies(msysqueries_rows, object_id_to_query, query_lookup)
    storage_corpus = build_access_storage_corpus(msysaccessstorage_rows)

    vba_text = ""
    vba_source_path = ""
    if args.vba_path:
        vba_text, vba_source_path = extract_vba_text(Path(args.vba_path).expanduser().resolve(), tmp_dir)

    workspace_text, workspace_files = collect_workspace_text(workspace_root)

    vba_quoted = quoted_string_tokens(vba_text)
    modules_in_vba = names_present_by_substring(modules, vba_text)
    reports_in_vba = names_present_by_substring(reports, vba_text)
    queries_in_vba_sub = names_present_by_substring(queries_canonical, vba_text)
    queries_in_vba_quoted = sorted([name for name in queries_canonical if name.lower() in vba_quoted])
    modules_in_storage = names_present_by_substring(modules, storage_corpus)
    reports_in_storage = names_present_by_substring(reports, storage_corpus)
    queries_in_storage = names_present_by_substring(queries_canonical, storage_corpus)

    reports_in_hidden_query = set()
    hidden_joined = "\n".join(queries_hidden).lower()
    for report_name in reports:
        if report_name.lower() in hidden_joined:
            reports_in_hidden_query.add(report_name)

    queries_inbound = sorted([name for name in queries_canonical if query_inbound.get(name, 0) > 0])

    all_legacy_names = modules + reports + queries_all
    legacy_names_in_workspace = names_present_by_substring(all_legacy_names, workspace_text)

    query_static_signal = set(queries_in_vba_sub) | set(queries_in_vba_quoted) | set(queries_inbound)
    report_static_signal = set(reports_in_vba) | set(reports_in_hidden_query)
    module_static_signal = set(modules_in_vba)

    query_accounted = query_static_signal | set(queries_in_storage)
    report_accounted = report_static_signal | set(reports_in_storage)
    module_accounted = module_static_signal | set(modules_in_storage)

    module_without_signal = sorted(set(modules) - module_accounted)
    report_without_signal = sorted(set(reports) - report_accounted)
    query_without_signal = sorted(set(queries_canonical) - query_accounted)

    report_payload = {
        "generated_at_utc": now_utc_iso(),
        "front_end_path": str(front_end_path),
        "vba_source_path": vba_source_path or "(none provided)",
        "counts": {
            "modules_total": len(modules),
            "reports_total": len(reports),
            "queries_total": len(queries_all),
            "queries_canonical_total": len(queries_canonical),
            "queries_hidden_total": len(queries_hidden),
            "msysobjects_rows": len(msysobjects_rows),
            "msysqueries_rows": len(msysqueries_rows),
            "msysaccessstorage_rows": len(msysaccessstorage_rows),
            "workspace_files_scanned": len(workspace_files),
        },
        "signals": {
            "modules_name_in_vba": len(modules_in_vba),
            "reports_name_in_vba": len(reports_in_vba),
            "reports_name_in_hidden_queries": len(reports_in_hidden_query),
            "queries_in_vba_substring": len(queries_in_vba_sub),
            "queries_in_vba_quoted": len(queries_in_vba_quoted),
            "queries_referenced_by_queries": len(queries_inbound),
            "modules_name_in_access_storage_non_dir": len(modules_in_storage),
            "reports_name_in_access_storage_non_dir": len(reports_in_storage),
            "canonical_queries_name_in_access_storage_non_dir": len(queries_in_storage),
            "legacy_names_in_workspace": len(legacy_names_in_workspace),
        },
        "modules": {
            "all": modules,
            "with_vba_name_match": sorted(modules_in_vba),
            "with_access_storage_non_dir_match": sorted(modules_in_storage),
            "without_accounted_signal_count": len(module_without_signal),
            "without_accounted_signal_sample": summarize_top(module_without_signal, 60),
        },
        "reports": {
            "all": reports,
            "with_vba_name_match": sorted(reports_in_vba),
            "with_hidden_query_name_match": sorted(reports_in_hidden_query),
            "with_access_storage_non_dir_match": sorted(reports_in_storage),
            "without_static_signal_count": len(report_without_signal),
            "without_static_signal_sample": summarize_top(report_without_signal, 60),
        },
        "queries": {
            "all": queries_all,
            "canonical": queries_canonical,
            "hidden": queries_hidden,
            "canonical_with_vba_substring_match": sorted(queries_in_vba_sub),
            "canonical_with_vba_quoted_match": queries_in_vba_quoted,
            "canonical_with_query_inbound_reference": queries_inbound,
            "canonical_with_access_storage_non_dir_match": sorted(queries_in_storage),
            "canonical_without_static_signal_count": len(query_without_signal),
            "canonical_without_static_signal_sample": summarize_top(query_without_signal, 120),
            "query_inbound_counts_top20": [
                {"name": name, "inbound_count": count}
                for name, count in sorted(query_inbound.items(), key=lambda item: item[1], reverse=True)[:20]
            ],
            "query_outbound_counts_top20": [
                {"name": name, "outbound_count": len(targets)}
                for name, targets in sorted(query_outbound.items(), key=lambda item: len(item[1]), reverse=True)[:20]
            ],
        },
        "workspace": {
            "files_scanned": workspace_files,
            "legacy_names_found_sample": summarize_top(sorted(legacy_names_in_workspace), 80),
        },
        "conclusions": [
            "Static signals prove partial reference coverage only; they do not prove runtime execution for every Access object.",
            "MSysAccessStorage evidence confirms object presence in Access internal storage, not guaranteed user-triggered execution.",
            "Modern MVQS app imports Access data tables but does not directly execute Access VBA/query/report objects.",
        ],
        "accounting": {
            "modules_unaccounted_count": len(module_without_signal),
            "reports_unaccounted_count": len(report_without_signal),
            "canonical_queries_unaccounted_count": len(query_without_signal),
        },
    }

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    json_path = out_dir / f"access_object_usage_audit_{timestamp}.json"
    md_path = out_dir / f"access_object_usage_audit_{timestamp}.md"
    json_path.write_text(json.dumps(report_payload, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(build_markdown(report_payload), encoding="utf-8")

    print(f"Wrote JSON: {json_path}")
    print(f"Wrote Markdown: {md_path}")
    print(
        json.dumps(
            {
                "modules_total": report_payload["counts"]["modules_total"],
                "reports_total": report_payload["counts"]["reports_total"],
                "queries_total": report_payload["counts"]["queries_total"],
                "reports_with_static_signal": report_payload["counts"]["reports_total"]
                - report_payload["reports"]["without_static_signal_count"],
                "canonical_queries_with_static_signal": report_payload["counts"]["queries_canonical_total"]
                - report_payload["queries"]["canonical_without_static_signal_count"],
                "modules_unaccounted": report_payload["accounting"]["modules_unaccounted_count"],
                "reports_unaccounted": report_payload["accounting"]["reports_unaccounted_count"],
                "canonical_queries_unaccounted": report_payload["accounting"]["canonical_queries_unaccounted_count"],
            },
            indent=2,
        )
    )
    if args.fail_on_unaccounted:
        unresolved_total = (
            report_payload["accounting"]["modules_unaccounted_count"]
            + report_payload["accounting"]["reports_unaccounted_count"]
            + report_payload["accounting"]["canonical_queries_unaccounted_count"]
        )
        if unresolved_total > 0:
            print(f"FAIL: unresolved access objects remaining: {unresolved_total}")
            return 2
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}")
        raise SystemExit(1)
