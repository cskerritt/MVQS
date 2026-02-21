#!/usr/bin/env python3
"""
Run legacy-sync parity validation against one or more MTSP sample PDFs.

Outputs timestamped JSON + markdown summaries under output/analysis.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import statistics
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import pdfplumber
except Exception as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency: pdfplumber. Install with `python3 -m pip install --user pdfplumber`."
    ) from exc

DOT_PATTERN = re.compile(r"\d{3}\.\d{3}-\d{3}")
PCT_PATTERN = re.compile(r"\d{1,3}%")
TS_LEVELS = [
    (5, 80, 97),
    (4, 60, 79.9),
    (3, 40, 59.9),
    (2, 20, 39.9),
    (1, 0, 19.9),
]


def now_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def api_json(base_url: str, path: str, method: str = "GET", body: dict[str, Any] | None = None) -> Any:
    url = base_url.rstrip("/") + "/" + path.lstrip("/")
    data: bytes | None = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{method} {path} failed with {exc.code}: {payload[:500]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"{method} {path} failed: {exc.reason}") from exc


def normalize_dot(value: str) -> str:
    return value.replace(".", "").replace("-", "")


def to_band(score: float) -> int:
    numeric = max(0.0, min(97.0, float(score)))
    for level, low, high in TS_LEVELS:
        if low <= numeric <= high:
            return level
    return 1


def parse_pdf_rows(pdf_path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        page_indexes = [4, 5, 6, 7]
        for page_index in page_indexes:
            if page_index >= len(pdf.pages):
                continue
            words = pdf.pages[page_index].extract_words(use_text_flow=True, keep_blank_chars=False)
            dot_words = [word for word in words if DOT_PATTERN.fullmatch(word["text"])]
            for dot_word in dot_words:
                near = [word for word in words if abs(word["top"] - dot_word["top"]) <= 1.3]
                pcts = sorted([word for word in near if PCT_PATTERN.fullmatch(word["text"])], key=lambda word: word["x0"])
                if len(pcts) < 2:
                    continue
                title_tokens = sorted(
                    [
                        word
                        for word in near
                        if word["x0"] > dot_word["x1"] + 3
                        and word["x0"] < 240
                        and word["text"]
                        not in {
                            "Job",
                            "Profile",
                            "Report",
                            "8:",
                            "Matches",
                            "by",
                            "Transferable",
                            "Skills",
                            "(TS)",
                            "-",
                            "Demands",
                            "Skill",
                            "Level",
                        }
                    ],
                    key=lambda word: word["x0"],
                )
                rows.append(
                    {
                        "dot_code": normalize_dot(dot_word["text"]),
                        "title": " ".join(token["text"] for token in title_tokens),
                        "sample_ts_percent": int(pcts[0]["text"][:-1]),
                        "sample_va_percent": int(pcts[1]["text"][:-1]),
                    }
                )

    dedup: dict[str, dict[str, Any]] = {}
    for row in rows:
        dedup[row["dot_code"]] = row
    return list(dedup.values())


def mae(values: list[float]) -> float:
    return float(sum(values) / len(values)) if values else float("nan")


def std_error(values: list[float]) -> float:
    if len(values) <= 1:
        return 0.0
    return float(statistics.stdev(values) / math.sqrt(len(values)))


def spearman_rank_correlation(xs: list[float], ys: list[float]) -> float:
    if len(xs) <= 1 or len(xs) != len(ys):
        return float("nan")

    def ranks(values: list[float]) -> list[float]:
        order = sorted((value, idx) for idx, value in enumerate(values))
        out = [0.0] * len(values)
        rank = 1
        i = 0
        while i < len(order):
            j = i
            while j + 1 < len(order) and order[j + 1][0] == order[i][0]:
                j += 1
            avg = (rank + rank + (j - i)) / 2.0
            for k in range(i, j + 1):
                out[order[k][1]] = avg
            rank += (j - i + 1)
            i = j + 1
        return out

    rx = ranks(xs)
    ry = ranks(ys)
    mean_rx = statistics.fmean(rx)
    mean_ry = statistics.fmean(ry)
    cov = sum((a - mean_rx) * (b - mean_ry) for a, b in zip(rx, ry))
    std_rx = math.sqrt(sum((a - mean_rx) ** 2 for a in rx))
    std_ry = math.sqrt(sum((b - mean_ry) ** 2 for b in ry))
    if std_rx == 0 or std_ry == 0:
        return float("nan")
    return float(cov / (std_rx * std_ry))


def build_markdown(report: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("# MVQS Legacy-Sync Validation")
    lines.append("")
    lines.append(f"- Generated: {report['generated_at_utc']}")
    lines.append(f"- Base URL: {report['base_url']}")
    lines.append(f"- Methodology: {report.get('methodology_version')}")
    lines.append(f"- TS MAE: {report['metrics']['ts_mae']:.3f}")
    lines.append(f"- VA MAE: {report['metrics']['va_mae']:.3f}")
    lines.append(f"- TS Std Error: {report['metrics']['ts_std_error']:.4f}")
    lines.append(f"- VA Std Error: {report['metrics']['va_std_error']:.4f}")
    lines.append(f"- TS 95% CI: [{report['metrics']['ts_ci95_low']:.3f}, {report['metrics']['ts_ci95_high']:.3f}]")
    lines.append(f"- VA 95% CI: [{report['metrics']['va_ci95_low']:.3f}, {report['metrics']['va_ci95_high']:.3f}]")
    lines.append(f"- Top-25 overlap: {report['metrics']['top25_overlap']}")
    lines.append(f"- Spearman rank correlation: {report['metrics']['spearman_rank_corr']:.4f}")
    lines.append("")
    lines.append("## Acceptance")
    lines.append("")
    lines.append(f"- TS MAE <= gate: {report['gates']['ts_mae_pass']} (gate={report['gates']['ts_mae_gate']})")
    lines.append(f"- VA MAE <= gate: {report['gates']['va_mae_pass']} (gate={report['gates']['va_mae_gate']})")
    lines.append(f"- Overall pass: {report['gates']['overall_pass']}")
    lines.append("")
    lines.append("## Samples")
    lines.append("")
    for sample in report["samples"]:
        lines.append(
            f"- {sample['pdf_path']}: extracted={sample['sample_rows']}, overlap={sample['overlap_rows']}, "
            f"ts_mae={sample['ts_mae']:.3f}, va_mae={sample['va_mae']:.3f}"
        )
    lines.append("")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate MVQS legacy-sync methodology parity")
    parser.add_argument("--base-url", default="http://localhost:4173", help="MVQS base URL")
    parser.add_argument("--pdf-path", action="append", dest="pdf_paths", required=True, help="Sample MTSP PDF path")
    parser.add_argument("--state-abbrev", default="NY", help="State abbreviation for TSA query")
    parser.add_argument(
        "--source-dots",
        default="090227010,160267026,189117026",
        help="Comma-separated source DOTs",
    )
    parser.add_argument(
        "--profile",
        default="5,5,5,3,3,4,2,2,2,1,1,2,0,0,0,1,1,1,0,0,0,0,0,0",
        help="Comma-separated 24-trait profile",
    )
    parser.add_argument("--out-dir", default="output/analysis", help="Output directory for reports")
    parser.add_argument("--ts-mae-gate", type=float, default=2.0, help="Phase gate for TS MAE")
    parser.add_argument("--va-mae-gate", type=float, default=5.0, help="Phase gate for VA MAE")
    args = parser.parse_args()

    source_dots = [token.strip() for token in args.source_dots.split(",") if token.strip()]
    profile = [int(token.strip()) for token in args.profile.split(",") if token.strip()]

    states = api_json(args.base_url, "/api/states").get("states", [])
    state = next((row for row in states if str(row.get("state_abbrev", "")).upper() == args.state_abbrev.upper()), None)
    if not state:
        raise RuntimeError(f"State abbreviation {args.state_abbrev!r} not found in /api/states")

    tsa_payload = api_json(
        args.base_url,
        "/api/transferable-skills/analyze",
        method="POST",
        body={
            "sourceDots": source_dots,
            "q": "",
            "stateId": state["state_id"],
            "countyId": None,
            "profile": profile,
            "limit": 500,
            "offset": 0,
        },
    )
    methodology = tsa_payload.get("methodology", {}) or {}
    analysis_basis = tsa_payload.get("analysis_basis", {}) or {}
    if not methodology.get("section7_resolution_version"):
        raise RuntimeError("TSA methodology is missing section7_resolution_version.")
    if not isinstance(methodology.get("section7_unresolved_ids"), list):
        raise RuntimeError("TSA methodology is missing section7_unresolved_ids.")
    if not isinstance(methodology.get("section7_confidence_profile"), dict):
        raise RuntimeError("TSA methodology is missing section7_confidence_profile.")
    if not analysis_basis.get("section7_resolution_version"):
        raise RuntimeError("TSA analysis_basis is missing section7_resolution_version.")
    if not isinstance(analysis_basis.get("section7_unresolved_ids"), list):
        raise RuntimeError("TSA analysis_basis is missing section7_unresolved_ids.")
    if not isinstance(analysis_basis.get("section7_confidence_profile"), dict):
        raise RuntimeError("TSA analysis_basis is missing section7_confidence_profile.")
    api_rows = tsa_payload.get("results", [])
    by_dot = {row.get("dot_code"): row for row in api_rows if isinstance(row, dict)}

    all_matches: list[dict[str, Any]] = []
    sample_summaries: list[dict[str, Any]] = []

    for pdf_raw in args.pdf_paths:
        pdf_path = Path(pdf_raw).expanduser().resolve()
        sample_rows = parse_pdf_rows(pdf_path)
        matched_rows = []
        for sample in sample_rows:
            api_row = by_dot.get(sample["dot_code"])
            if not api_row:
                continue
            matched = {
                "dot_code": sample["dot_code"],
                "title": sample["title"],
                "sample_ts_percent": sample["sample_ts_percent"],
                "sample_va_percent": sample["sample_va_percent"],
                "api_ts_percent": float(api_row.get("ts_percent") or api_row.get("tsp_percent") or 0),
                "api_va_percent": float(api_row.get("va_percent") or api_row.get("va_adjustment_percent") or 0),
            }
            matched["abs_ts_error"] = abs(matched["api_ts_percent"] - matched["sample_ts_percent"])
            matched["abs_va_error"] = abs(matched["api_va_percent"] - matched["sample_va_percent"])
            matched_rows.append(matched)
        if not matched_rows:
            sample_summaries.append(
                {
                    "pdf_path": str(pdf_path),
                    "sample_rows": len(sample_rows),
                    "overlap_rows": 0,
                    "ts_mae": float("nan"),
                    "va_mae": float("nan"),
                }
            )
            continue

        all_matches.extend(matched_rows)
        ts_errors = [row["abs_ts_error"] for row in matched_rows]
        va_errors = [row["abs_va_error"] for row in matched_rows]
        sample_summaries.append(
            {
                "pdf_path": str(pdf_path),
                "sample_rows": len(sample_rows),
                "overlap_rows": len(matched_rows),
                "ts_mae": mae(ts_errors),
                "va_mae": mae(va_errors),
            }
        )

    if not all_matches:
        raise RuntimeError("No overlap between sample PDFs and API transferable-skills results.")

    ts_errors = [row["abs_ts_error"] for row in all_matches]
    va_errors = [row["abs_va_error"] for row in all_matches]
    ts_mae = mae(ts_errors)
    va_mae = mae(va_errors)
    ts_se = std_error(ts_errors)
    va_se = std_error(va_errors)

    confusion: dict[str, int] = {}
    for row in all_matches:
        sample_band = to_band(row["sample_ts_percent"])
        api_band = to_band(row["api_ts_percent"])
        key = f"sample_{sample_band}->api_{api_band}"
        confusion[key] = confusion.get(key, 0) + 1

    sample_top = [row["dot_code"] for row in sorted(all_matches, key=lambda r: r["sample_ts_percent"], reverse=True)[:25]]
    api_top = [row.get("dot_code") for row in sorted(api_rows, key=lambda r: float(r.get("ts_percent") or r.get("tsp_percent") or 0), reverse=True)[:25]]
    top_overlap = len(set(sample_top) & set(api_top))

    sample_ranks = [float(row["sample_ts_percent"]) for row in all_matches]
    api_ranks = [float(row["api_ts_percent"]) for row in all_matches]
    spearman = spearman_rank_correlation(sample_ranks, api_ranks)

    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "base_url": args.base_url,
        "methodology_version": methodology.get("methodology_version") or methodology.get("selected_model"),
        "methodology": methodology,
        "samples": sample_summaries,
        "metrics": {
            "rows_compared": len(all_matches),
            "ts_mae": ts_mae,
            "va_mae": va_mae,
            "ts_std_error": ts_se,
            "va_std_error": va_se,
            "ts_ci95_low": ts_mae - 1.96 * ts_se,
            "ts_ci95_high": ts_mae + 1.96 * ts_se,
            "va_ci95_low": va_mae - 1.96 * va_se,
            "va_ci95_high": va_mae + 1.96 * va_se,
            "top25_overlap": top_overlap,
            "spearman_rank_corr": spearman,
            "ts_band_confusion": confusion,
        },
        "gates": {
            "ts_mae_gate": args.ts_mae_gate,
            "va_mae_gate": args.va_mae_gate,
            "ts_mae_pass": ts_mae <= args.ts_mae_gate,
            "va_mae_pass": va_mae <= args.va_mae_gate,
            "overall_pass": ts_mae <= args.ts_mae_gate and va_mae <= args.va_mae_gate,
        },
    }

    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_id()
    json_path = out_dir / f"legacy_sync_validation_{stamp}.json"
    md_path = out_dir / f"legacy_sync_validation_{stamp}.md"
    json_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(build_markdown(report), encoding="utf-8")

    print(f"Wrote: {json_path}")
    print(f"Wrote: {md_path}")
    print(f"TS MAE: {ts_mae:.3f} | VA MAE: {va_mae:.3f}")
    print(f"TS SE: {ts_se:.4f} | VA SE: {va_se:.4f}")
    print(f"Overall pass: {report['gates']['overall_pass']}")

    return 0 if report["gates"]["overall_pass"] else 2


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
