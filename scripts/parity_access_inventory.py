#!/usr/bin/env python3
"""
Build a canonical Access parity registry across multiple front-ends plus required source DB catalogs.

Outputs:
- output/analysis/parity/access_registry_<timestamp>.json
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

try:
    csv.field_size_limit(sys.maxsize)
except OverflowError:
    csv.field_size_limit(2**31 - 1)


MODULE_TYPE = "-32761"
REPORT_TYPE = "-32764"
QUERY_TYPE = "5"


@dataclass(frozen=True)
class FrontEndContext:
    key: str
    path: Path
    msysobjects_rows: list[dict[str, str]]
    msysqueries_rows: list[dict[str, str]]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build Access parity registry and source catalogs.")
    parser.add_argument(
        "--front-end-paths",
        nargs="+",
        required=True,
        help="One or more Access front-end paths (both are required by policy).",
    )
    parser.add_argument("--dc-data-path", required=True, help="Path to MVQS_DC_Data.accdb")
    parser.add_argument("--dc-jobbank-path", required=True, help="Path to MVQS_DC_Data_JobBank.accdb")
    parser.add_argument("--out-dir", default="output/analysis/parity", help="Output directory")
    parser.add_argument("--snapshot-id", help="Optional snapshot id")
    parser.add_argument(
        "--fail-on-query-sql-mismatch",
        action="store_true",
        help="Fail when same canonical query name has different SQL text across front-ends.",
    )
    return parser.parse_args()


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def timestamp_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def require_tool(name: str) -> None:
    if shutil.which(name) is None:
        raise RuntimeError(f"Required tool '{name}' is not available in PATH.")


def run_command(args: list[str], stdin_text: str | None = None, check: bool = True) -> tuple[int, str, str]:
    proc = subprocess.run(
        args,
        input=(stdin_text.encode("utf-8") if stdin_text is not None else None),
        capture_output=True,
        check=False,
    )
    stdout = (proc.stdout or b"").decode("utf-8", errors="replace")
    stderr = (proc.stderr or b"").decode("utf-8", errors="replace")
    if check and proc.returncode != 0:
        raise RuntimeError(f"Command failed ({proc.returncode}): {' '.join(args)}\n{stderr[:1200]}")
    return proc.returncode, stdout, stderr


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()


def load_csv_rows_from_export(db_path: Path, table_name: str) -> list[dict[str, str]]:
    _, output, _ = run_command(["mdb-export", str(db_path), table_name])
    return list(csv.DictReader(output.splitlines()))


def list_tables(db_path: Path, include_system: bool = True) -> list[str]:
    cmd = ["mdb-tables"]
    if include_system:
        cmd.append("-S")
    cmd.extend(["-1", str(db_path)])
    _, output, _ = run_command(cmd)
    return sorted([line.strip() for line in output.splitlines() if line.strip()])


def extract_query_sql(front_end_path: Path, query_name: str) -> tuple[str | None, str | None]:
    code, output, stderr = run_command(["mdb-queries", str(front_end_path), query_name], check=False)
    text = output.strip()
    if code != 0 or not text:
        err = (stderr or output or "unknown query export error").strip()
        return None, err[:2000]
    return text, None


def normalize_name(value: str | None) -> str:
    return (value or "").strip().lower()


def extract_query_edges(
    msysqueries_rows: list[dict[str, str]], object_id_to_query: dict[int, str], query_lookup: dict[str, str]
) -> tuple[set[tuple[str, str]], Counter, Counter]:
    edges: set[tuple[str, str]] = set()
    inbound = Counter()
    outbound = Counter()

    for row in msysqueries_rows:
        raw_id = (row.get("ObjectId") or "").strip()
        if not raw_id:
            continue
        try:
            obj_id = int(raw_id)
        except ValueError:
            continue

        src = object_id_to_query.get(obj_id)
        if not src:
            continue

        refs: set[str] = set()
        for key in ("Name1", "Name2"):
            value = (row.get(key) or "").strip()
            if value:
                refs.add(value)

        expr = (row.get("Expression") or "").strip()
        if expr:
            for match in re.finditer(r"\[([^\]]+)\]\.", expr):
                refs.add(match.group(1).strip())

        for ref in refs:
            dest = query_lookup.get(ref.lower())
            if not dest or dest == src:
                continue
            edge = (src, dest)
            if edge in edges:
                continue
            edges.add(edge)
            outbound[src] += 1
            inbound[dest] += 1

    return edges, inbound, outbound


def canonicalize_object_rows(front_end_ctx: list[FrontEndContext], obj_type: str) -> list[dict]:
    merged: dict[str, dict] = {}
    for ctx in front_end_ctx:
        for row in ctx.msysobjects_rows:
            if row.get("Type") != obj_type:
                continue
            name = (row.get("Name") or "").strip()
            if not name:
                continue
            key = name
            if key not in merged:
                merged[key] = {
                    "name": name,
                    "type": obj_type,
                    "present_in_sources": [],
                }

            merged[key]["present_in_sources"].append(
                {
                    "source_key": ctx.key,
                    "source_path": str(ctx.path),
                    "object_id": (row.get("Id") or "").strip() or None,
                    "parent_id": (row.get("ParentId") or "").strip() or None,
                    "date_create": row.get("DateCreate") or None,
                    "date_update": row.get("DateUpdate") or None,
                    "flags": (row.get("Flags") or "").strip() or None,
                }
            )

    results = sorted(merged.values(), key=lambda item: item["name"].lower())
    for item in results:
        item["source_count"] = len(item["present_in_sources"])
    return results


def extract_linked_table_bindings(front_end_ctx: list[FrontEndContext]) -> list[dict]:
    bindings: list[dict] = []
    for ctx in front_end_ctx:
        for row in ctx.msysobjects_rows:
            if row.get("Type") != "6":
                continue
            table_name = (row.get("Name") or "").strip()
            foreign_name = (row.get("ForeignName") or "").strip() or table_name
            database_path = (row.get("Database") or "").strip() or None
            connect = (row.get("Connect") or "").strip() or None
            if not table_name:
                continue
            bindings.append(
                {
                    "source_key": ctx.key,
                    "source_path": str(ctx.path),
                    "table_name": table_name,
                    "foreign_name": foreign_name,
                    "database_path": database_path,
                    "connect": connect,
                    "flags": (row.get("Flags") or "").strip() or None,
                }
            )
    return sorted(bindings, key=lambda item: (item["table_name"].lower(), item["source_key"]))


def ensure_file(path_str: str) -> Path:
    raw = Path(path_str).expanduser()
    if raw.exists():
        return raw.resolve()

    cwd = Path.cwd()
    home = Path.home()
    basename = raw.name

    search_dirs = [
        cwd,
        cwd / "MVQS_Database 2",
        cwd.parent,
        cwd.parent / "MVQS_Database 2",
        home / "Downloads",
        home / "Downloads" / "MVQS",
        home / "Downloads" / "MVQS_Database 2",
        home / "Downloads" / "MVQS" / "MVQS_Database 2",
    ]

    for base in search_dirs:
        for candidate in (base / path_str, base / basename):
            if candidate.exists():
                return candidate.resolve()

    raise RuntimeError(f"Required path not found: {path_str}")


def make_frontend_context(front_end_path: Path, source_key: str) -> FrontEndContext:
    rows_objects = load_csv_rows_from_export(front_end_path, "MSysObjects")
    rows_queries = load_csv_rows_from_export(front_end_path, "MSysQueries")
    return FrontEndContext(
        key=source_key,
        path=front_end_path,
        msysobjects_rows=rows_objects,
        msysqueries_rows=rows_queries,
    )


def build_registry(args: argparse.Namespace) -> tuple[dict, bool]:
    front_end_paths = [ensure_file(p) for p in args.front_end_paths]
    dc_data_path = ensure_file(args.dc_data_path)
    dc_jobbank_path = ensure_file(args.dc_jobbank_path)

    front_end_ctx: list[FrontEndContext] = []
    for idx, path in enumerate(front_end_paths, start=1):
        front_end_ctx.append(make_frontend_context(path, f"front_end_{idx}"))

    modules = canonicalize_object_rows(front_end_ctx, MODULE_TYPE)
    reports = canonicalize_object_rows(front_end_ctx, REPORT_TYPE)
    queries_all = canonicalize_object_rows(front_end_ctx, QUERY_TYPE)

    query_names = sorted([entry["name"] for entry in queries_all])
    canonical_query_names = sorted([name for name in query_names if not name.startswith("~sq_")])
    hidden_query_names = sorted([name for name in query_names if name.startswith("~sq_")])

    # Query SQL extraction and normalization
    query_sql_by_name: dict[str, dict] = {}
    query_sql_mismatch_count = 0
    for query_name in canonical_query_names:
        source_sql_rows: list[dict] = []
        errors: list[dict] = []
        variant_counter = Counter()

        for ctx in front_end_ctx:
            sql, err = extract_query_sql(ctx.path, query_name)
            if err:
                errors.append({"source_key": ctx.key, "source_path": str(ctx.path), "error": err})
                continue
            assert sql is not None
            sql_sha = sha256_text(sql)
            source_sql_rows.append(
                {
                    "source_key": ctx.key,
                    "source_path": str(ctx.path),
                    "sql": sql,
                    "sql_sha256": sql_sha,
                }
            )
            variant_counter[sql_sha] += 1

        selected_sql = None
        selected_sha = None
        variants = []
        if source_sql_rows:
            selected_sql = source_sql_rows[0]["sql"]
            selected_sha = source_sql_rows[0]["sql_sha256"]
            variants = sorted({row["sql_sha256"] for row in source_sql_rows})
            if len(variants) > 1:
                query_sql_mismatch_count += 1

        query_sql_by_name[query_name] = {
            "name": query_name,
            "sources": source_sql_rows,
            "selected_sql": selected_sql,
            "selected_sql_sha256": selected_sha,
            "sql_variant_sha256": variants,
            "sql_variant_count": len(variants),
            "extract_errors": errors,
        }

    # Dependencies from each front-end's MSysQueries
    edges: set[tuple[str, str]] = set()
    inbound_total = Counter()
    outbound_total = Counter()

    query_lookup = {name.lower(): name for name in query_names}

    for ctx in front_end_ctx:
        obj_id_to_query: dict[int, str] = {}
        for row in ctx.msysobjects_rows:
            if row.get("Type") != QUERY_TYPE:
                continue
            name = (row.get("Name") or "").strip()
            raw_id = (row.get("Id") or "").strip()
            if not name or not raw_id:
                continue
            try:
                obj_id_to_query[int(raw_id)] = name
            except ValueError:
                continue

        fe_edges, fe_inbound, fe_outbound = extract_query_edges(ctx.msysqueries_rows, obj_id_to_query, query_lookup)
        edges |= fe_edges
        inbound_total.update(fe_inbound)
        outbound_total.update(fe_outbound)

    edge_rows = [
        {
            "source_query": src,
            "target_query": dst,
        }
        for src, dst in sorted(edges, key=lambda pair: (pair[0].lower(), pair[1].lower()))
    ]

    # Source catalogs (all required DBs)
    db_catalog_rows = []
    table_to_sources: defaultdict[str, list[str]] = defaultdict(list)

    source_dbs = []
    for ctx in front_end_ctx:
        source_dbs.append((ctx.key, ctx.path, "front_end"))
    source_dbs.extend(
        [
            ("dc_data", dc_data_path, "dc_data"),
            ("dc_jobbank", dc_jobbank_path, "dc_jobbank"),
        ]
    )

    for source_key, path, source_type in source_dbs:
        tables = list_tables(path, include_system=True)
        db_catalog_rows.append(
            {
                "source_key": source_key,
                "source_type": source_type,
                "path": str(path),
                "table_count": len(tables),
                "tables": tables,
            }
        )
        for table_name in tables:
            table_to_sources[table_name.lower()].append(source_key)

    linked_table_bindings = extract_linked_table_bindings(front_end_ctx)
    linked_table_to_databases: defaultdict[str, set[str]] = defaultdict(set)
    for binding in linked_table_bindings:
        table_name = (binding.get("table_name") or "").strip()
        db_path = (binding.get("database_path") or "").strip()
        if table_name and db_path:
            linked_table_to_databases[table_name.lower()].add(db_path)

    # Coverage gate: every object in each front-end is represented with source provenance.
    coverage_ok = True
    coverage_errors: list[str] = []
    merged_presence = {
        "modules": {entry["name"]: {row["source_key"] for row in entry["present_in_sources"]} for entry in modules},
        "reports": {entry["name"]: {row["source_key"] for row in entry["present_in_sources"]} for entry in reports},
        "queries": {entry["name"]: {row["source_key"] for row in entry["present_in_sources"]} for entry in queries_all},
    }

    for ctx in front_end_ctx:
        for row in ctx.msysobjects_rows:
            typ = row.get("Type")
            name = (row.get("Name") or "").strip()
            if typ not in {MODULE_TYPE, REPORT_TYPE, QUERY_TYPE} or not name:
                continue
            bucket = "modules" if typ == MODULE_TYPE else "reports" if typ == REPORT_TYPE else "queries"
            sources = merged_presence.get(bucket, {}).get(name, set())
            if ctx.key not in sources:
                coverage_ok = False
                coverage_errors.append(
                    f"Missing provenance in merged registry for {bucket[:-1]} '{name}' from source {ctx.key}"
                )

    report = {
        "generated_at_utc": now_iso(),
        "snapshot_id": args.snapshot_id or timestamp_id(),
        "inputs": {
            "front_end_paths": [str(path) for path in front_end_paths],
            "dc_data_path": str(dc_data_path),
            "dc_jobbank_path": str(dc_jobbank_path),
        },
        "stats": {
            "front_end_count": len(front_end_ctx),
            "modules_total": len(modules),
            "reports_total": len(reports),
            "queries_total": len(queries_all),
            "canonical_queries_total": len(canonical_query_names),
            "hidden_queries_total": len(hidden_query_names),
            "query_sql_mismatch_count": query_sql_mismatch_count,
            "dependency_edge_count": len(edge_rows),
            "coverage_ok": coverage_ok,
            "coverage_error_count": len(coverage_errors),
        },
        "objects": {
            "modules": modules,
            "reports": reports,
            "queries": queries_all,
        },
        "queries": {
            "canonical_names": canonical_query_names,
            "hidden_names": hidden_query_names,
            "sql_by_name": query_sql_by_name,
        },
        "dependencies": {
            "query_edges": edge_rows,
            "inbound_counts": dict(sorted(inbound_total.items(), key=lambda item: item[0].lower())),
            "outbound_counts": dict(sorted(outbound_total.items(), key=lambda item: item[0].lower())),
        },
        "source_catalog": {
            "databases": db_catalog_rows,
            "table_to_sources": {
                key: sorted(values)
                for key, values in sorted(table_to_sources.items(), key=lambda item: item[0])
            },
            "linked_table_bindings": linked_table_bindings,
            "linked_table_to_databases": {
                key: sorted(values)
                for key, values in sorted(linked_table_to_databases.items(), key=lambda item: item[0])
            },
        },
        "gate": {
            "inventory_coverage_pass": coverage_ok,
            "coverage_errors": coverage_errors[:500],
            "query_sql_mismatch_count": query_sql_mismatch_count,
        },
    }

    if args.fail_on_query_sql_mismatch and query_sql_mismatch_count > 0:
        report["gate"]["query_sql_mismatch_pass"] = False
    else:
        report["gate"]["query_sql_mismatch_pass"] = True

    return report, coverage_ok and report["gate"]["query_sql_mismatch_pass"]


def main() -> int:
    args = parse_args()
    for tool in ("mdb-export", "mdb-queries", "mdb-tables"):
        require_tool(tool)

    report, pass_ok = build_registry(args)

    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = report["snapshot_id"]

    output_json = out_dir / f"access_registry_{stamp}.json"
    output_json.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    latest_json = out_dir / "latest_access_registry.json"
    latest_json.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    summary = {
        "modules_total": report["stats"]["modules_total"],
        "reports_total": report["stats"]["reports_total"],
        "queries_total": report["stats"]["queries_total"],
        "canonical_queries_total": report["stats"]["canonical_queries_total"],
        "dependency_edge_count": report["stats"]["dependency_edge_count"],
        "query_sql_mismatch_count": report["stats"]["query_sql_mismatch_count"],
        "inventory_coverage_pass": report["gate"]["inventory_coverage_pass"],
    }

    print(f"Wrote registry: {output_json}")
    print(f"Wrote latest alias: {latest_json}")
    print(json.dumps(summary, indent=2))

    if not pass_ok:
        return 2
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}")
        raise SystemExit(1)
