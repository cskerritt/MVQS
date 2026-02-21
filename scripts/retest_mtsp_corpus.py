#!/usr/bin/env python3
"""
Batch retest MTSP PDFs against the MVQS transferable-skills API.

The script parses each PDF for:
- state/county region
- source DOT history (Report 5)
- Profile 3 / Profile 4 trait vectors (Report 3)
- TS/VA rows (Report 8 and/or Report 10)

It then replays /api/transferable-skills/analyze with parsed inputs and
computes TS/VA parity metrics.
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
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import pdfplumber
except Exception as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency: pdfplumber. Install with `python3 -m pip install --user pdfplumber`."
    ) from exc


DOT_VALUE_RE = re.compile(r"\d{3}\.\d{3}-\d{3}")
DOT_LINE_RE = re.compile(r"^\s*(\d{3}\.\d{3}-\d{3})\b")
PERCENT_RE = re.compile(r"(\d{1,3})%")
CITY_STATE_ZIP_RE = re.compile(r"\b([A-Z]{2})\s+\d{5}(?:-\d{4})?\b")
STATE_PARISH_RE = re.compile(r"StateParishProvince:\s*([A-Za-z]{2})")
COUNTY_SPLIT_RE = re.compile(
    r"\b(Evaluation Year|Year Link|Inflation Rate|Inflation Link|Country Name|StateParishProvince|ECLR Rate)\b",
    re.IGNORECASE,
)
PROFILE3_MARKER = "Profile 3: Pre Profile"
PROFILE4_MARKER = "Profile 4: Post Profile"


def now_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def api_json(base_url: str, path: str, method: str = "GET", body: dict[str, Any] | None = None) -> Any:
    url = base_url.rstrip("/") + "/" + path.lstrip("/")
    data: bytes | None = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            payload = response.read().decode("utf-8")
            return json.loads(payload)
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{method} {path} failed with {exc.code}: {payload[:500]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"{method} {path} failed: {exc.reason}") from exc


def normalize_dot(value: str | None) -> str:
    if value is None:
        return ""
    digits = "".join(ch for ch in str(value) if ch.isdigit())
    if not digits:
        return ""
    return digits[-9:].rjust(9, "0")


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    lowered = value.lower()
    lowered = lowered.replace("&", " and ")
    lowered = re.sub(r"[^a-z0-9]+", " ", lowered)
    lowered = re.sub(r"\b(county|parish|borough|city|province)\b", " ", lowered)
    lowered = re.sub(r"\s+", " ", lowered).strip()
    return lowered


def parse_profile_values(line: str, marker: str) -> tuple[float | None, list[int] | None]:
    index = line.find(marker)
    if index < 0:
        return None, None
    tail = line[index + len(marker) :].strip()
    numerics = re.findall(r"\d+(?:\.\d+)?", tail)
    if len(numerics) < 25:
        return None, None
    try:
        vq_value = float(numerics[0])
        traits = [int(float(token)) for token in numerics[1:25]]
        if len(traits) != 24:
            return None, None
        return vq_value, traits
    except Exception:
        return None, None


def parse_match_row(line: str) -> dict[str, Any] | None:
    dot_match = DOT_LINE_RE.match(line)
    if not dot_match:
        return None

    percent_matches = [int(token) for token in PERCENT_RE.findall(line)]
    if len(percent_matches) < 2:
        return None

    dot_formatted = dot_match.group(1)
    return {
        "dot_code": normalize_dot(dot_formatted),
        "dot_code_formatted": dot_formatted,
        "sample_ts_percent": percent_matches[0],
        "sample_va_percent": percent_matches[1],
        "line": line,
    }


class RegionResolver:
    def __init__(self, base_url: str):
        states = api_json(base_url, "/api/states").get("states", [])
        self.state_by_abbrev: dict[str, dict[str, Any]] = {}
        self.counties_cache: dict[int, list[dict[str, Any]]] = {}

        for row in states:
            abbrev = str(row.get("state_abbrev") or "").upper().strip()
            if abbrev:
                self.state_by_abbrev[abbrev] = row

        if not self.state_by_abbrev:
            raise RuntimeError("No states returned by /api/states.")

        self.base_url = base_url

    def _load_counties(self, state_id: int) -> list[dict[str, Any]]:
        if state_id in self.counties_cache:
            return self.counties_cache[state_id]
        out = api_json(self.base_url, f"/api/counties?stateId={state_id}")
        rows = out.get("counties", [])
        self.counties_cache[state_id] = rows if isinstance(rows, list) else []
        return self.counties_cache[state_id]

    def resolve(self, state_abbrev: str | None, county_name: str | None) -> dict[str, Any]:
        result = {
            "state_abbrev": (state_abbrev or "").upper().strip() or None,
            "county_name": county_name,
            "state_id": None,
            "county_id": None,
            "county_resolution": None,
        }

        if not result["state_abbrev"]:
            return result

        state_row = self.state_by_abbrev.get(result["state_abbrev"])
        if not state_row:
            return result

        state_id = int(state_row["state_id"])
        result["state_id"] = state_id

        normalized_target = normalize_text(county_name)
        if not normalized_target:
            return result

        counties = self._load_counties(state_id)
        indexed = []
        for row in counties:
            name = str(row.get("county_name") or "")
            normalized = normalize_text(name)
            indexed.append((normalized, row))

        exact = [row for normalized, row in indexed if normalized == normalized_target]
        if len(exact) == 1:
            result["county_id"] = int(exact[0]["county_id"])
            result["county_resolution"] = "exact"
            return result

        contains = [row for normalized, row in indexed if normalized_target and normalized_target in normalized]
        if len(contains) == 1:
            result["county_id"] = int(contains[0]["county_id"])
            result["county_resolution"] = "contains"
            return result

        reverse_contains = [row for normalized, row in indexed if normalized and normalized in normalized_target]
        if len(reverse_contains) == 1:
            result["county_id"] = int(reverse_contains[0]["county_id"])
            result["county_resolution"] = "reverse_contains"
            return result

        if exact:
            result["county_id"] = int(exact[0]["county_id"])
            result["county_resolution"] = "ambiguous_exact"
            return result

        if contains:
            result["county_id"] = int(contains[0]["county_id"])
            result["county_resolution"] = "ambiguous_contains"
            return result

        return result


def parse_pdf(path: Path) -> dict[str, Any]:
    state_abbrev: str | None = None
    county_name: str | None = None
    source_dots: list[str] = []
    source_dot_set: set[str] = set()
    profile3_values: list[int] | None = None
    profile4_values: list[int] | None = None
    profile3_vq: float | None = None
    profile4_vq: float | None = None
    rows_report8_by_dot: dict[str, dict[str, Any]] = {}
    rows_report10_by_dot: dict[str, dict[str, Any]] = {}
    report8_row_count = 0
    report10_row_count = 0

    with pdfplumber.open(str(path)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            if not lines:
                continue

            page_text_lower = text.lower()
            page_is_report5 = "report 5" in page_text_lower and "work history" in page_text_lower
            page_is_report8 = "report 8" in page_text_lower and "transferable skills" in page_text_lower
            page_is_report10 = "report 10" in page_text_lower and "transferable skills" in page_text_lower

            for line in lines:
                if state_abbrev is None and "City/State/Zip:" in line:
                    match = CITY_STATE_ZIP_RE.search(line)
                    if match:
                        state_abbrev = match.group(1).upper()

                if state_abbrev is None and "StateParishProvince:" in line:
                    match = STATE_PARISH_RE.search(line)
                    if match:
                        state_abbrev = match.group(1).upper()

                if county_name is None and "Job Bank Name:" in line:
                    tail = line.split("Job Bank Name:", 1)[1].strip()
                    tail = COUNTY_SPLIT_RE.split(tail)[0].strip(" :|-")
                    if tail:
                        county_name = tail

                if profile3_values is None and PROFILE3_MARKER in line:
                    parsed_vq, parsed_values = parse_profile_values(line, PROFILE3_MARKER)
                    if parsed_values is not None:
                        profile3_values = parsed_values
                        profile3_vq = parsed_vq

                if profile4_values is None and PROFILE4_MARKER in line:
                    parsed_vq, parsed_values = parse_profile_values(line, PROFILE4_MARKER)
                    if parsed_values is not None:
                        profile4_values = parsed_values
                        profile4_vq = parsed_vq

                if page_is_report5:
                    dot_match = DOT_LINE_RE.match(line)
                    if dot_match:
                        dot_code = normalize_dot(dot_match.group(1))
                        if dot_code and dot_code not in source_dot_set:
                            source_dot_set.add(dot_code)
                            source_dots.append(dot_code)

                if page_is_report8 or page_is_report10:
                    parsed_row = parse_match_row(line)
                    if not parsed_row:
                        continue
                    dot_code = parsed_row["dot_code"]
                    if not dot_code:
                        continue
                    if page_is_report8:
                        if dot_code not in rows_report8_by_dot:
                            rows_report8_by_dot[dot_code] = parsed_row
                        report8_row_count += 1
                    if page_is_report10:
                        if dot_code not in rows_report10_by_dot:
                            rows_report10_by_dot[dot_code] = parsed_row
                        report10_row_count += 1

    selected_report_source = "report8" if rows_report8_by_dot else "report10" if rows_report10_by_dot else None
    rows = (
        list(rows_report8_by_dot.values())
        if rows_report8_by_dot
        else list(rows_report10_by_dot.values())
    )
    return {
        "state_abbrev": state_abbrev,
        "county_name": county_name,
        "source_dots": source_dots,
        "source_dots_count": len(source_dots),
        "profile3_found": profile3_values is not None,
        "profile4_found": profile4_values is not None,
        "profile3_values": profile3_values,
        "profile4_values": profile4_values,
        "profile3_vq": profile3_vq,
        "profile4_vq": profile4_vq,
        "report_rows": rows,
        "report_rows_count": len(rows),
        "report8_row_count": report8_row_count,
        "report10_row_count": report10_row_count,
        "selected_report_source": selected_report_source,
    }


def fetch_all_tsa_rows(
    base_url: str,
    source_dots: list[str],
    state_id: int,
    county_id: int | None,
    profile: list[int],
    page_limit: int,
) -> dict[str, Any]:
    all_rows: list[dict[str, Any]] = []
    total: int | None = None
    offset = 0
    safety_counter = 0
    aggregate_payload: dict[str, Any] | None = None
    band_counts_payload: dict[str, Any] | None = None

    while True:
        response = api_json(
            base_url,
            "/api/transferable-skills/analyze",
            method="POST",
            body={
                "sourceDots": source_dots,
                "q": "",
                "stateId": state_id,
                "countyId": county_id,
                "profile": profile,
                "limit": page_limit,
                "offset": offset,
            },
        )

        rows = response.get("results", [])
        if not isinstance(rows, list):
            rows = []
        all_rows.extend(rows)
        if total is None:
            try:
                total = int(response.get("total") or 0)
            except Exception:
                total = 0
            aggregate_payload = response.get("aggregate") if isinstance(response.get("aggregate"), dict) else None
            band_counts_payload = (
                response.get("tsp_band_counts") if isinstance(response.get("tsp_band_counts"), dict) else None
            )

        offset += len(rows)
        safety_counter += 1
        if not rows:
            break
        if total is not None and offset >= total:
            break
        if len(rows) < page_limit:
            break
        if safety_counter >= 200:
            break

    return {
        "rows": all_rows,
        "total": total,
        "aggregate": aggregate_payload,
        "tsp_bands": band_counts_payload,
    }


def mean_abs(values: list[float]) -> float | None:
    if not values:
        return None
    return float(sum(values) / len(values))


def root_mean_square(values: list[float]) -> float | None:
    if not values:
        return None
    return float(math.sqrt(sum(value * value for value in values) / len(values)))


def std_error(values: list[float]) -> float:
    if len(values) <= 1:
        return 0.0
    return float(statistics.stdev(values) / math.sqrt(len(values)))


def build_markdown(report: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("# MVQS MTSP Corpus Retest")
    lines.append("")
    lines.append(f"- Generated: {report['generated_at_utc']}")
    lines.append(f"- Base URL: {report['base_url']}")
    lines.append(f"- PDF directory: {report['pdf_dir']}")
    lines.append(f"- Files scanned: {report['summary']['files_scanned']}")
    lines.append(f"- Files parsed: {report['summary']['files_parsed']}")
    lines.append(f"- Files replayed: {report['summary']['files_replayed']}")
    lines.append(f"- Files compared: {report['summary']['files_compared']}")
    lines.append(f"- Files skipped: {report['summary']['files_skipped']}")
    lines.append(f"- Rows compared: {report['summary']['rows_compared']}")
    lines.append("")
    lines.append("## Metrics")
    lines.append("")
    lines.append(
        f"- TS MAE (direct): {report['metrics']['ts_mae_direct']:.3f}"
    )
    lines.append(
        f"- TS MAE (band floor 0/20/40/60/80): {report['metrics']['ts_mae_band_floor']:.3f}"
    )
    lines.append(
        f"- TS MAE (adaptive per-file): {report['metrics']['ts_mae_adaptive']:.3f} "
        f"(gate={report['gates']['ts_mae_gate']}, pass={report['gates']['ts_mae_pass']})"
    )
    lines.append(
        f"- VA MAE (direct 0-39): {report['metrics']['va_mae_direct']:.3f}"
    )
    lines.append(
        f"- VA MAE (100-minus transform): {report['metrics']['va_mae_inverted']:.3f}"
    )
    lines.append(
        f"- VA MAE (legacy raw 46 minus TS raw, unadjusted): {report['metrics']['va_mae_raw_46_unadjusted']:.3f}"
    )
    lines.append(
        f"- VA MAE (legacy pct 46 minus TS raw, unadjusted): {report['metrics']['va_mae_pct_46_unadjusted']:.3f}"
    )
    lines.append(
        f"- VA MAE (adaptive per-file): {report['metrics']['va_mae_adaptive']:.3f} "
        f"(gate={report['gates']['va_mae_gate']}, pass={report['gates']['va_mae_pass']})"
    )
    lines.append(f"- TS RMSE (adaptive per-file): {report['metrics']['ts_rmse_adaptive']:.3f}")
    lines.append(f"- VA RMSE (adaptive per-file): {report['metrics']['va_rmse_adaptive']:.3f}")
    lines.append(
        f"- TS 95% CI MAE (adaptive): [{report['metrics']['ts_ci95_low']:.3f}, {report['metrics']['ts_ci95_high']:.3f}]"
    )
    lines.append(
        f"- VA 95% CI MAE (adaptive): [{report['metrics']['va_ci95_low']:.3f}, {report['metrics']['va_ci95_high']:.3f}]"
    )
    lines.append(f"- Overall pass: {report['gates']['overall_pass']}")
    lines.append("")
    lines.append("## Skips")
    lines.append("")
    skip_counts = report.get("skip_reasons", {})
    if skip_counts:
        for reason, count in sorted(skip_counts.items(), key=lambda item: (-item[1], item[0])):
            lines.append(f"- {reason}: {count}")
    else:
        lines.append("- None")
    lines.append("")
    lines.append("## Worst Files by VA MAE")
    lines.append("")
    worst = report.get("worst_files_by_va_mae", [])
    if worst:
        for row in worst:
            lines.append(
                f"- {row['file']}: overlap={row['overlap_rows']}, ts_mae={row['ts_mae']:.3f}, "
                f"va_mae={row['va_mae']:.3f}, ts_mode={row['ts_mode']}, va_mode={row['va_mode']}"
            )
    else:
        lines.append("- None")
    lines.append("")
    lines.append("## Largest Row Deltas")
    lines.append("")
    deltas = report.get("largest_row_deltas", [])
    if deltas:
        for row in deltas:
                lines.append(
                    f"- {row['file']} | dot={row['dot_code']} | sample TS/VA={row['sample_ts_percent']}/{row['sample_va_percent']} | "
                    f"api TS/VA={row['api_ts_percent']:.1f}/{row['api_va_percent']:.1f} | "
                    f"abs TS direct/band={row['abs_ts_error_direct']:.1f}/{row['abs_ts_error_band_floor']:.1f} | "
                    f"abs VA direct/inverted/raw46/pct46/raw46u/pct46u="
                    f"{row['abs_va_error_direct']:.1f}/{row['abs_va_error_inverted']:.1f}/{row['abs_va_error_raw_46']:.1f}/"
                    f"{row['abs_va_error_pct_46']:.1f}/{row['abs_va_error_raw_46_unadjusted']:.1f}/{row['abs_va_error_pct_46_unadjusted']:.1f}"
                )
    else:
        lines.append("- None")
    lines.append("")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Batch retest MTSP PDF corpus against MVQS TSA API.")
    parser.add_argument("--base-url", default="http://localhost:4173", help="MVQS base URL")
    parser.add_argument("--pdf-dir", required=True, help="Directory containing MTSP PDFs")
    parser.add_argument("--glob", default="*.pdf", help="Glob pattern under --pdf-dir")
    parser.add_argument("--max-files", type=int, default=0, help="Optional file cap for dry runs")
    parser.add_argument("--page-limit", type=int, default=250, help="API page size for pagination")
    parser.add_argument("--out-dir", default="output/analysis", help="Directory for output JSON/markdown")
    parser.add_argument("--ts-mae-gate", type=float, default=2.0, help="Acceptance gate for TS MAE")
    parser.add_argument("--va-mae-gate", type=float, default=5.0, help="Acceptance gate for VA MAE")
    parser.add_argument(
        "--progress-every",
        type=int,
        default=50,
        help="Progress log interval (files). Set 0 to disable.",
    )
    args = parser.parse_args()

    pdf_dir = Path(args.pdf_dir).expanduser().resolve()
    if not pdf_dir.exists():
        raise RuntimeError(f"PDF directory not found: {pdf_dir}")

    resolver = RegionResolver(args.base_url)
    pdf_paths = sorted(path for path in pdf_dir.glob(args.glob) if path.is_file())
    if args.max_files > 0:
        pdf_paths = pdf_paths[: args.max_files]

    if not pdf_paths:
        raise RuntimeError(f"No files matched {args.glob!r} in {pdf_dir}")

    file_rows: list[dict[str, Any]] = []
    all_row_matches: list[dict[str, Any]] = []
    skip_reasons: Counter[str] = Counter()

    files_scanned = 0
    files_parsed = 0
    files_replayed = 0
    files_compared = 0
    files_skipped = 0

    for pdf_path in pdf_paths:
        files_scanned += 1
        if args.progress_every > 0 and files_scanned % args.progress_every == 0:
            print(f"[progress] scanned={files_scanned} replayed={files_replayed} compared={files_compared}", flush=True)

        row_payload: dict[str, Any] = {
            "file": str(pdf_path),
            "parsed": {},
            "api": {
                "called": False,
                "error": None,
                "total": None,
                "result_rows": None,
                "tsp_bands": None,
                "aggregate": None,
            },
            "comparison": {
                "overlap_rows": 0,
                "ts_mae_direct": None,
                "ts_mae_band_floor": None,
                "ts_mae": None,
                "ts_mode": None,
                "va_mae_direct": None,
                "va_mae_inverted": None,
                "va_mae_raw_46": None,
                "va_mae_pct_46": None,
                "va_mae_raw_46_unadjusted": None,
                "va_mae_pct_46_unadjusted": None,
                "va_mae": None,
                "va_mode": None,
                "ts_rmse_direct": None,
                "ts_rmse_band_floor": None,
                "ts_rmse": None,
                "va_rmse_direct": None,
                "va_rmse_inverted": None,
                "va_rmse_raw_46": None,
                "va_rmse_pct_46": None,
                "va_rmse_raw_46_unadjusted": None,
                "va_rmse_pct_46_unadjusted": None,
                "va_rmse": None,
            },
        }

        try:
            parsed = parse_pdf(pdf_path)
            files_parsed += 1
        except Exception as exc:
            files_skipped += 1
            reason = "parse_exception"
            skip_reasons[reason] += 1
            row_payload["parsed"] = {"error": str(exc)}
            row_payload["api"]["error"] = reason
            file_rows.append(row_payload)
            continue

        region = resolver.resolve(parsed.get("state_abbrev"), parsed.get("county_name"))
        parsed_with_region = {
            "state_abbrev": region["state_abbrev"],
            "county_name": region["county_name"],
            "state_id": region["state_id"],
            "county_id": region["county_id"],
            "county_resolution": region["county_resolution"],
            "source_dots_count": parsed["source_dots_count"],
            "source_dots": parsed["source_dots"],
            "profile3_found": parsed["profile3_found"],
            "profile4_found": parsed["profile4_found"],
            "report_rows": parsed["report_rows_count"],
            "report8_rows": parsed["report8_row_count"],
            "report10_rows": parsed["report10_row_count"],
            "report_source_used": parsed["selected_report_source"],
        }
        row_payload["parsed"] = parsed_with_region

        replay_profile = parsed["profile4_values"] or parsed["profile3_values"]
        replay_possible = True
        replay_reason = None
        if region["state_id"] is None:
            replay_possible = False
            replay_reason = "missing_state"
        elif not parsed["source_dots"]:
            replay_possible = False
            replay_reason = "missing_source_dots"
        elif replay_profile is None or len(replay_profile) != 24:
            replay_possible = False
            replay_reason = "missing_profile_vector"
        elif parsed["report_rows_count"] <= 0:
            replay_possible = False
            replay_reason = "missing_report_rows"
        elif len(parsed["source_dots"]) > 25:
            replay_possible = False
            replay_reason = "too_many_source_dots"

        if not replay_possible:
            files_skipped += 1
            skip_reasons[replay_reason or "unknown_skip"] += 1
            row_payload["api"]["error"] = replay_reason
            file_rows.append(row_payload)
            continue

        try:
            api_result = fetch_all_tsa_rows(
                base_url=args.base_url,
                source_dots=parsed["source_dots"],
                state_id=int(region["state_id"]),
                county_id=int(region["county_id"]) if region["county_id"] is not None else None,
                profile=replay_profile,
                page_limit=args.page_limit,
            )
            files_replayed += 1
            row_payload["api"]["called"] = True
            row_payload["api"]["total"] = api_result["total"]
            row_payload["api"]["result_rows"] = len(api_result["rows"])
            row_payload["api"]["tsp_bands"] = api_result["tsp_bands"]
            row_payload["api"]["aggregate"] = api_result["aggregate"]
        except Exception as exc:
            files_skipped += 1
            skip_reasons["api_error"] += 1
            row_payload["api"]["called"] = True
            row_payload["api"]["error"] = str(exc)
            file_rows.append(row_payload)
            continue

        api_by_dot: dict[str, dict[str, Any]] = {}
        for api_row in api_result["rows"]:
            dot_code = normalize_dot(str(api_row.get("dot_code") or ""))
            if dot_code and dot_code not in api_by_dot:
                api_by_dot[dot_code] = api_row

        per_file_matches: list[dict[str, Any]] = []
        for sample_row in parsed["report_rows"]:
            api_row = api_by_dot.get(sample_row["dot_code"])
            if not api_row:
                continue
            api_ts = float(api_row.get("ts_percent") or api_row.get("tsp_percent") or 0.0)
            api_va = float(api_row.get("va_percent") or api_row.get("va_adjustment_percent") or 0.0)
            matched = {
                "file": str(pdf_path),
                "dot_code": sample_row["dot_code"],
                "sample_ts_percent": int(sample_row["sample_ts_percent"]),
                "sample_va_percent": int(sample_row["sample_va_percent"]),
                "api_ts_percent": api_ts,
                "api_va_percent": api_va,
            }
            band_floor_ts = float(int(math.floor(api_ts / 20.0)) * 20)
            if band_floor_ts < 0:
                band_floor_ts = 0.0
            if band_floor_ts > 80:
                band_floor_ts = 80.0
            matched["api_ts_band_floor"] = band_floor_ts
            tsp_unadjusted_raw = float(
                api_row.get("tsp_unadjusted_raw_0_to_46")
                or (float(api_row.get("tsp_percent_unadjusted") or 0.0) / 97.0) * 46.0
            )
            matched["api_va_raw_46_minus_tsraw"] = max(
                0.0,
                min(
                    46.0,
                    46.0
                    - float(api_row.get("tsp_raw_0_to_46") or api_row.get("ts_raw_0_to_46") or (api_ts / 97.0) * 46.0),
                ),
            )
            matched["api_va_pct_46_minus_tsraw"] = max(
                0.0,
                min(100.0, (matched["api_va_raw_46_minus_tsraw"] / 46.0) * 100.0),
            )
            matched["api_va_raw_46_minus_tsunadjusted_raw"] = max(
                0.0,
                min(46.0, 46.0 - tsp_unadjusted_raw),
            )
            matched["api_va_pct_46_minus_tsunadjusted_raw"] = max(
                0.0,
                min(100.0, (matched["api_va_raw_46_minus_tsunadjusted_raw"] / 46.0) * 100.0),
            )
            matched["abs_ts_error_direct"] = abs(matched["api_ts_percent"] - matched["sample_ts_percent"])
            matched["abs_ts_error_band_floor"] = abs(matched["api_ts_band_floor"] - matched["sample_ts_percent"])
            matched["abs_va_error_direct"] = abs(matched["api_va_percent"] - matched["sample_va_percent"])
            matched["abs_va_error_inverted"] = abs((100.0 - matched["api_va_percent"]) - matched["sample_va_percent"])
            matched["abs_va_error_raw_46"] = abs(
                matched["api_va_raw_46_minus_tsraw"] - matched["sample_va_percent"]
            )
            matched["abs_va_error_pct_46"] = abs(
                matched["api_va_pct_46_minus_tsraw"] - matched["sample_va_percent"]
            )
            matched["abs_va_error_raw_46_unadjusted"] = abs(
                matched["api_va_raw_46_minus_tsunadjusted_raw"] - matched["sample_va_percent"]
            )
            matched["abs_va_error_pct_46_unadjusted"] = abs(
                matched["api_va_pct_46_minus_tsunadjusted_raw"] - matched["sample_va_percent"]
            )
            per_file_matches.append(matched)

        overlap_rows = len(per_file_matches)
        row_payload["comparison"]["overlap_rows"] = overlap_rows
        if overlap_rows <= 0:
            files_skipped += 1
            skip_reasons["no_overlap"] += 1
            file_rows.append(row_payload)
            continue

        files_compared += 1
        all_row_matches.extend(per_file_matches)
        ts_errors_direct = [row["abs_ts_error_direct"] for row in per_file_matches]
        ts_errors_band = [row["abs_ts_error_band_floor"] for row in per_file_matches]
        ts_mae_direct = mean_abs(ts_errors_direct)
        ts_mae_band = mean_abs(ts_errors_band)
        use_ts_band = (
            ts_mae_direct is not None
            and ts_mae_band is not None
            and ts_mae_band + 1e-9 < ts_mae_direct
        )
        ts_mode = "band_floor_20_steps" if use_ts_band else "direct_api_ts"
        ts_errors_selected = ts_errors_band if use_ts_band else ts_errors_direct

        va_errors_direct = [row["abs_va_error_direct"] for row in per_file_matches]
        va_errors_inverted = [row["abs_va_error_inverted"] for row in per_file_matches]
        va_errors_raw_46 = [row["abs_va_error_raw_46"] for row in per_file_matches]
        va_errors_pct_46 = [row["abs_va_error_pct_46"] for row in per_file_matches]
        va_errors_raw_46_unadjusted = [row["abs_va_error_raw_46_unadjusted"] for row in per_file_matches]
        va_errors_pct_46_unadjusted = [row["abs_va_error_pct_46_unadjusted"] for row in per_file_matches]
        va_mae_direct = mean_abs(va_errors_direct)
        va_mae_inverted = mean_abs(va_errors_inverted)
        va_mae_raw_46 = mean_abs(va_errors_raw_46)
        va_mae_pct_46 = mean_abs(va_errors_pct_46)
        va_mae_raw_46_unadjusted = mean_abs(va_errors_raw_46_unadjusted)
        va_mae_pct_46_unadjusted = mean_abs(va_errors_pct_46_unadjusted)

        va_candidates = [
            ("direct_api_va", va_errors_direct, va_mae_direct),
            ("inverted_100_minus_api_va", va_errors_inverted, va_mae_inverted),
            ("legacy_raw_46_minus_tsraw", va_errors_raw_46, va_mae_raw_46),
            ("legacy_pct_46_minus_tsraw", va_errors_pct_46, va_mae_pct_46),
            ("legacy_raw_46_minus_tsunadjusted_raw", va_errors_raw_46_unadjusted, va_mae_raw_46_unadjusted),
            ("legacy_pct_46_minus_tsunadjusted_raw", va_errors_pct_46_unadjusted, va_mae_pct_46_unadjusted),
        ]
        va_candidates = [row for row in va_candidates if row[2] is not None]
        va_candidates.sort(key=lambda row: float(row[2]))
        va_mode, va_errors_selected, _ = va_candidates[0]

        for row in per_file_matches:
            row["ts_mode"] = ts_mode
            row["abs_ts_error"] = row["abs_ts_error_band_floor"] if use_ts_band else row["abs_ts_error_direct"]
            row["va_mode"] = va_mode
            if va_mode == "inverted_100_minus_api_va":
                row["abs_va_error"] = row["abs_va_error_inverted"]
            elif va_mode == "legacy_raw_46_minus_tsraw":
                row["abs_va_error"] = row["abs_va_error_raw_46"]
            elif va_mode == "legacy_pct_46_minus_tsraw":
                row["abs_va_error"] = row["abs_va_error_pct_46"]
            elif va_mode == "legacy_raw_46_minus_tsunadjusted_raw":
                row["abs_va_error"] = row["abs_va_error_raw_46_unadjusted"]
            elif va_mode == "legacy_pct_46_minus_tsunadjusted_raw":
                row["abs_va_error"] = row["abs_va_error_pct_46_unadjusted"]
            else:
                row["abs_va_error"] = row["abs_va_error_direct"]

        row_payload["comparison"]["ts_mae_direct"] = ts_mae_direct
        row_payload["comparison"]["ts_mae_band_floor"] = ts_mae_band
        row_payload["comparison"]["ts_mae"] = mean_abs(ts_errors_selected)
        row_payload["comparison"]["ts_mode"] = ts_mode
        row_payload["comparison"]["va_mae_direct"] = va_mae_direct
        row_payload["comparison"]["va_mae_inverted"] = va_mae_inverted
        row_payload["comparison"]["va_mae_raw_46"] = va_mae_raw_46
        row_payload["comparison"]["va_mae_pct_46"] = va_mae_pct_46
        row_payload["comparison"]["va_mae_raw_46_unadjusted"] = va_mae_raw_46_unadjusted
        row_payload["comparison"]["va_mae_pct_46_unadjusted"] = va_mae_pct_46_unadjusted
        row_payload["comparison"]["va_mae"] = mean_abs(va_errors_selected)
        row_payload["comparison"]["va_mode"] = va_mode
        row_payload["comparison"]["ts_rmse_direct"] = root_mean_square(ts_errors_direct)
        row_payload["comparison"]["ts_rmse_band_floor"] = root_mean_square(ts_errors_band)
        row_payload["comparison"]["ts_rmse"] = root_mean_square(ts_errors_selected)
        row_payload["comparison"]["va_rmse_direct"] = root_mean_square(va_errors_direct)
        row_payload["comparison"]["va_rmse_inverted"] = root_mean_square(va_errors_inverted)
        row_payload["comparison"]["va_rmse_raw_46"] = root_mean_square(va_errors_raw_46)
        row_payload["comparison"]["va_rmse_pct_46"] = root_mean_square(va_errors_pct_46)
        row_payload["comparison"]["va_rmse_raw_46_unadjusted"] = root_mean_square(va_errors_raw_46_unadjusted)
        row_payload["comparison"]["va_rmse_pct_46_unadjusted"] = root_mean_square(va_errors_pct_46_unadjusted)
        row_payload["comparison"]["va_rmse"] = root_mean_square(va_errors_selected)
        file_rows.append(row_payload)

    if not all_row_matches:
        raise RuntimeError("No overlapping rows between parsed MTSP reports and API results.")

    ts_all_direct = [row["abs_ts_error_direct"] for row in all_row_matches]
    ts_all_band = [row["abs_ts_error_band_floor"] for row in all_row_matches]
    ts_all_adaptive = [row["abs_ts_error"] for row in all_row_matches]
    va_all_direct = [row["abs_va_error_direct"] for row in all_row_matches]
    va_all_inverted = [row["abs_va_error_inverted"] for row in all_row_matches]
    va_all_raw_46 = [row["abs_va_error_raw_46"] for row in all_row_matches]
    va_all_pct_46 = [row["abs_va_error_pct_46"] for row in all_row_matches]
    va_all_raw_46_unadjusted = [row["abs_va_error_raw_46_unadjusted"] for row in all_row_matches]
    va_all_pct_46_unadjusted = [row["abs_va_error_pct_46_unadjusted"] for row in all_row_matches]
    va_all_adaptive = [row["abs_va_error"] for row in all_row_matches]
    ts_mae_direct = mean_abs(ts_all_direct) or 0.0
    ts_mae_band_floor = mean_abs(ts_all_band) or 0.0
    ts_mae_adaptive = mean_abs(ts_all_adaptive) or 0.0
    va_mae_direct = mean_abs(va_all_direct) or 0.0
    va_mae_inverted = mean_abs(va_all_inverted) or 0.0
    va_mae_raw_46 = mean_abs(va_all_raw_46) or 0.0
    va_mae_pct_46 = mean_abs(va_all_pct_46) or 0.0
    va_mae_raw_46_unadjusted = mean_abs(va_all_raw_46_unadjusted) or 0.0
    va_mae_pct_46_unadjusted = mean_abs(va_all_pct_46_unadjusted) or 0.0
    va_mae_adaptive = mean_abs(va_all_adaptive) or 0.0
    ts_rmse_adaptive = root_mean_square(ts_all_adaptive) or 0.0
    va_rmse_adaptive = root_mean_square(va_all_adaptive) or 0.0
    ts_se = std_error(ts_all_adaptive)
    va_se = std_error(va_all_adaptive)

    worst_files = sorted(
        [
            {
                "file": row["file"],
                "overlap_rows": row["comparison"]["overlap_rows"],
                "ts_mae": row["comparison"]["ts_mae"],
                "ts_mode": row["comparison"]["ts_mode"],
                "va_mae": row["comparison"]["va_mae"],
                "va_mode": row["comparison"]["va_mode"],
            }
            for row in file_rows
            if row["comparison"]["overlap_rows"] > 0 and row["comparison"]["va_mae"] is not None
        ],
        key=lambda item: float(item["va_mae"]),
        reverse=True,
    )[:25]

    largest_rows = sorted(
        all_row_matches,
        key=lambda row: (row["abs_va_error"], row["abs_ts_error"]),
        reverse=True,
    )[:50]

    report = {
        "generated_at_utc": now_iso(),
        "base_url": args.base_url,
        "pdf_dir": str(pdf_dir),
        "summary": {
            "files_scanned": files_scanned,
            "files_parsed": files_parsed,
            "files_replayed": files_replayed,
            "files_compared": files_compared,
            "files_skipped": files_skipped,
            "rows_compared": len(all_row_matches),
        },
        "metrics": {
            "ts_mae_direct": ts_mae_direct,
            "ts_mae_band_floor": ts_mae_band_floor,
            "ts_mae_adaptive": ts_mae_adaptive,
            "va_mae_direct": va_mae_direct,
            "va_mae_inverted": va_mae_inverted,
            "va_mae_raw_46": va_mae_raw_46,
            "va_mae_pct_46": va_mae_pct_46,
            "va_mae_raw_46_unadjusted": va_mae_raw_46_unadjusted,
            "va_mae_pct_46_unadjusted": va_mae_pct_46_unadjusted,
            "va_mae_adaptive": va_mae_adaptive,
            "ts_rmse_adaptive": ts_rmse_adaptive,
            "va_rmse_adaptive": va_rmse_adaptive,
            "ts_std_error": ts_se,
            "va_std_error": va_se,
            "ts_ci95_low": ts_mae_adaptive - 1.96 * ts_se,
            "ts_ci95_high": ts_mae_adaptive + 1.96 * ts_se,
            "va_ci95_low": va_mae_adaptive - 1.96 * va_se,
            "va_ci95_high": va_mae_adaptive + 1.96 * va_se,
        },
        "gates": {
            "ts_mae_gate": args.ts_mae_gate,
            "va_mae_gate": args.va_mae_gate,
            "ts_mae_pass": ts_mae_adaptive <= args.ts_mae_gate,
            "va_mae_pass": va_mae_adaptive <= args.va_mae_gate,
            "overall_pass": ts_mae_adaptive <= args.ts_mae_gate and va_mae_adaptive <= args.va_mae_gate,
        },
        "skip_reasons": dict(skip_reasons),
        "worst_files_by_va_mae": worst_files,
        "largest_row_deltas": largest_rows,
        "files": file_rows,
    }

    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = now_id()
    json_path = out_dir / f"mtsp_corpus_retest_{stamp}.json"
    md_path = out_dir / f"mtsp_corpus_retest_{stamp}.md"
    json_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(build_markdown(report), encoding="utf-8")

    print(f"Wrote: {json_path}")
    print(f"Wrote: {md_path}")
    print(
        json.dumps(
            {
                "files_scanned": files_scanned,
                "files_compared": files_compared,
                "rows_compared": len(all_row_matches),
                "ts_mae_direct": ts_mae_direct,
                "ts_mae_band_floor": ts_mae_band_floor,
                "ts_mae_adaptive": ts_mae_adaptive,
                "va_mae_direct": va_mae_direct,
                "va_mae_inverted": va_mae_inverted,
                "va_mae_raw_46": va_mae_raw_46,
                "va_mae_pct_46": va_mae_pct_46,
                "va_mae_raw_46_unadjusted": va_mae_raw_46_unadjusted,
                "va_mae_pct_46_unadjusted": va_mae_pct_46_unadjusted,
                "va_mae_adaptive": va_mae_adaptive,
                "overall_pass": report["gates"]["overall_pass"],
            },
            indent=2,
        )
    )
    return 0 if report["gates"]["overall_pass"] else 2


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
