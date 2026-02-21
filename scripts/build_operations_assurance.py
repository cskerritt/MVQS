#!/usr/bin/env python3
"""
Build an operations assurance package proving key MVQS behaviors.

Outputs:
- JSON evidence ledger
- Markdown assurance report
"""

from __future__ import annotations

import argparse
import io
import json
import math
import os
import subprocess
import sys
import urllib.error
import urllib.request
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


class ApiClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def request_json(
        self,
        path: str,
        method: str = "GET",
        body: dict[str, Any] | None = None,
        expected_status: int | None = 200,
    ) -> dict[str, Any]:
        url = self.base_url + "/" + path.lstrip("/")
        data: bytes | None = None
        headers = {"Accept": "application/json"}
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=180) as response:
                raw = response.read().decode("utf-8")
                status = response.status
                if expected_status is not None and status != expected_status:
                    raise RuntimeError(f"{method} {path} expected {expected_status}, got {status}")
                return json.loads(raw)
        except urllib.error.HTTPError as exc:
            payload = exc.read().decode("utf-8", errors="replace")
            if expected_status is not None and exc.code == expected_status:
                return json.loads(payload)
            raise RuntimeError(f"{method} {path} failed {exc.code}: {payload[:500]}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"{method} {path} failed: {exc.reason}") from exc

    def request_raw(
        self,
        path: str,
        method: str = "GET",
        body: dict[str, Any] | None = None,
        expected_status: int | None = 200,
    ) -> dict[str, Any]:
        url = self.base_url + "/" + path.lstrip("/")
        data: bytes | None = None
        headers = {"Accept": "*/*"}
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=180) as response:
                raw = response.read()
                status = response.status
                if expected_status is not None and status != expected_status:
                    raise RuntimeError(f"{method} {path} expected {expected_status}, got {status}")
                return {"status": status, "headers": dict(response.headers.items()), "raw": raw}
        except urllib.error.HTTPError as exc:
            payload = exc.read()
            if expected_status is not None and exc.code == expected_status:
                return {"status": exc.code, "headers": dict(exc.headers.items()), "raw": payload}
            decoded = payload.decode("utf-8", errors="replace")
            raise RuntimeError(f"{method} {path} failed {exc.code}: {decoded[:500]}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"{method} {path} failed: {exc.reason}") from exc


@dataclass
class CheckResult:
    check_id: str
    passed: bool
    details: dict[str, Any]


def record(results: list[CheckResult], check_id: str, passed: bool, details: dict[str, Any]) -> None:
    results.append(CheckResult(check_id=check_id, passed=passed, details=details))


def parse_dot(row: dict[str, Any]) -> str | None:
    value = row.get("dot_code")
    if isinstance(value, str) and value:
        return value
    return None


def run_smoke(base_url: str, workspace: Path) -> dict[str, Any]:
    cmd = ["python3", str(workspace / "scripts/smoke_api.py"), "--base-url", base_url]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    text = (proc.stdout or "") + (proc.stderr or "")
    pass_lines = [line for line in text.splitlines() if line.strip().startswith("PASS ")]
    return {
        "cmd": cmd,
        "exit_code": proc.returncode,
        "pass_count": len(pass_lines),
        "passes": pass_lines,
        "tail": text.splitlines()[-40:],
    }


def ensure_profile_bounds(profile4: list[int], profile3: list[int]) -> bool:
    if len(profile4) != len(profile3):
        return False
    for index, value in enumerate(profile4):
        if int(value) > int(profile3[index]):
            return False
    return True


def compare_multi_source_best(
    client: ApiClient,
    state_id: int,
    county_id: int | None,
    source_dots: list[str],
    profile: list[int],
    targets: list[str],
) -> dict[str, Any]:
    single_maps: dict[str, dict[str, float]] = {}
    for source_dot in source_dots:
        payload = {
            "sourceDots": [source_dot],
            "q": "",
            "stateId": state_id,
            "countyId": county_id,
            "profile": profile,
            "limit": 250,
            "offset": 0,
        }
        out = client.request_json("/api/transferable-skills/analyze", method="POST", body=payload)
        single_maps[source_dot] = {
            str(row.get("dot_code")): float(row.get("tsp_percent") or 0)
            for row in out.get("results", [])
            if row.get("dot_code")
        }

    combined = client.request_json(
        "/api/transferable-skills/analyze",
        method="POST",
        body={
            "sourceDots": source_dots,
            "q": "",
            "stateId": state_id,
            "countyId": county_id,
            "profile": profile,
            "limit": 250,
            "offset": 0,
        },
    )
    combined_map = {str(row.get("dot_code")): row for row in combined.get("results", []) if row.get("dot_code")}

    checked = 0
    mismatches = []
    for dot_code in targets:
        row = combined_map.get(dot_code)
        if not row:
            continue
        checked += 1
        combined_tsp = float(row.get("tsp_percent") or 0)
        combined_best = str(row.get("best_source_dot_code") or "")

        source_scores = [(source_dot, single_maps.get(source_dot, {}).get(dot_code, 0.0)) for source_dot in source_dots]
        source_scores.sort(key=lambda pair: pair[1], reverse=True)
        expected_best_dot, expected_best_tsp = source_scores[0]

        best_dot_ok = combined_best == expected_best_dot
        tsp_ok = abs(combined_tsp - expected_best_tsp) <= 1e-6
        if not best_dot_ok or not tsp_ok:
            mismatches.append(
                {
                    "target_dot": dot_code,
                    "combined_best_source_dot": combined_best,
                    "expected_best_source_dot": expected_best_dot,
                    "combined_tsp": combined_tsp,
                    "expected_tsp": expected_best_tsp,
                    "source_scores": source_scores,
                }
            )

    return {
        "checked_targets": checked,
        "mismatch_count": len(mismatches),
        "mismatches": mismatches[:20],
    }


def load_json_if_exists(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def build_markdown(payload: dict[str, Any]) -> str:
    checks: list[dict[str, Any]] = payload["checks"]
    passed = [check for check in checks if check["passed"]]
    failed = [check for check in checks if not check["passed"]]

    lines: list[str] = []
    lines.append("# MVQS Operations Assurance Report")
    lines.append("")
    lines.append(f"- Generated: {payload['generated_at_utc']}")
    lines.append(f"- Base URL: `{payload['base_url']}`")
    lines.append(f"- Workspace: `{payload['workspace']}`")
    lines.append(f"- Total checks: {len(checks)}")
    lines.append(f"- Passed: {len(passed)}")
    lines.append(f"- Failed: {len(failed)}")
    lines.append("")
    lines.append("## Environment")
    lines.append("")
    lines.append(f"- Health ok: {payload['health'].get('ok')}")
    lines.append(f"- Readiness overall: {payload['readiness'].get('overall_status')}")
    lines.append(f"- Readiness blocking: {payload['readiness'].get('blocking')}")
    lines.append("")
    lines.append("## Smoke Coverage")
    lines.append("")
    smoke = payload["smoke"]
    lines.append(f"- Smoke exit code: {smoke['exit_code']}")
    lines.append(f"- Smoke PASS lines: {smoke['pass_count']}")
    lines.append("")
    lines.append("## Key Findings")
    lines.append("")
    for check in checks:
        status = "PASS" if check["passed"] else "FAIL"
        lines.append(f"- [{status}] `{check['check_id']}`")
    lines.append("")

    trend = payload.get("trend_comparison")
    if trend:
        runs = trend.get("runs", [])
        if runs:
            lines.append("## Scale Trend (200/500/1000)")
            lines.append("")
            lines.append("| Run | Cases | Deterministic Pass | Any Rule Failures | High Total Mean | Low Total Mean | High Avg TS Mean |")
            lines.append("| --- | ---: | ---: | ---: | ---: | ---: | ---: |")
            for run in runs:
                any_fail = (
                    int(run.get("det_fail", 0))
                    + int(run.get("gate_fail", 0))
                    + int(run.get("unskilled_fail", 0))
                    + int(run.get("mono_total_fail", 0))
                    + int(run.get("mono_overlap_fail", 0))
                    + int(run.get("strength_fail", 0))
                    + int(run.get("agg_fail", 0))
                )
                lines.append(
                    f"| {run.get('run')} | {run.get('cases')} | {run.get('det_pass')} | {any_fail} | {run.get('high_mean')} | {run.get('low_mean')} | {run.get('tsp_mean')} |"
                )
            lines.append("")

    se = payload.get("standard_error")
    if se:
        lines.append("## Standard Error Snapshot")
        lines.append("")
        lines.append(f"- Cases for rule-rate SE: {se.get('n_cases')}")
        for metric in se.get("error_rate_standard_errors", []):
            lines.append(
                f"- `{metric['metric']}`: failures={metric['failures']}, error_rate={metric['error_rate']}, se={metric['se']}, upper95={metric.get('upper_95_cp_if_zero')}"
            )
        lines.append("")

    ext_se = payload.get("external_parity_standard_error")
    if ext_se:
        lines.append("## External Parity Error Snapshot")
        lines.append("")
        lines.append(
            f"- TS MAE={ext_se.get('ts_mae')}, SE={ext_se.get('ts_se_mae')}, CI95={ext_se.get('ts_ci95_mae')}"
        )
        lines.append(
            f"- VA MAE={ext_se.get('va_mae')}, SE={ext_se.get('va_se_mae')}, CI95={ext_se.get('va_ci95_mae')}"
        )
        lines.append("")

    if failed:
        lines.append("## Failed Check Details")
        lines.append("")
        for check in failed:
            lines.append(f"- `{check['check_id']}`: `{json.dumps(check['details'], ensure_ascii=True)}`")
        lines.append("")

    lines.append("## Evidence Files")
    lines.append("")
    for path in payload.get("evidence_files", []):
        lines.append(f"- `{path}`")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build MVQS operations assurance report.")
    parser.add_argument("--base-url", default="http://localhost:4173")
    parser.add_argument("--workspace", default="/Users/chrisskerritt/Downloads/MVQS")
    parser.add_argument(
        "--output-json",
        default="/Users/chrisskerritt/Downloads/MVQS/output/analysis/operations_assurance_evidence.json",
    )
    parser.add_argument(
        "--output-md",
        default="/Users/chrisskerritt/Downloads/MVQS/output/analysis/operations_assurance_report.md",
    )
    args = parser.parse_args()

    workspace = Path(args.workspace)
    analysis_dir = workspace / "output" / "analysis"
    analysis_dir.mkdir(parents=True, exist_ok=True)
    client = ApiClient(args.base_url)
    check_results: list[CheckResult] = []
    evidence_files: list[str] = []

    health = client.request_json("/api/health")
    readiness = client.request_json("/api/readiness")
    record(
        check_results,
        "platform.health_and_readiness",
        bool(health.get("ok")) and readiness.get("overall_status") == "pass" and not readiness.get("blocking"),
        {"health_ok": health.get("ok"), "readiness": readiness.get("overall_status"), "blocking": readiness.get("blocking")},
    )

    smoke = run_smoke(args.base_url, workspace)
    record(
        check_results,
        "platform.smoke_api",
        smoke["exit_code"] == 0 and smoke["pass_count"] >= 20,
        {"exit_code": smoke["exit_code"], "pass_count": smoke["pass_count"], "tail": smoke["tail"]},
    )

    # Discover a stable test region + source dots.
    states = client.request_json("/api/states").get("states", [])
    state_id = 11  # FL preferred for continuity.
    if not any(int(row.get("state_id")) == state_id for row in states):
        state_id = int(states[0]["state_id"])
    counties = client.request_json(f"/api/counties?stateId={state_id}").get("counties", [])
    county_id = int(counties[0]["county_id"]) if counties else None
    search_path = f"/api/jobs/search?stateId={state_id}"
    if county_id is not None:
        search_path += f"&countyId={county_id}"
    search_path += "&limit=15&offset=0"
    jobs = client.request_json(search_path).get("jobs", [])
    source_dots = []
    for row in jobs:
        dot_code = parse_dot(row)
        if dot_code and dot_code not in source_dots:
            source_dots.append(dot_code)
        if len(source_dots) >= 2:
            break
    if len(source_dots) < 2:
        source_dots = source_dots[:1]
    record(
        check_results,
        "setup.source_dot_discovery",
        len(source_dots) >= 1,
        {"state_id": state_id, "county_id": county_id, "source_dots": source_dots},
    )

    created_case_id: int | None = None
    saved_report_id: int | None = None
    tsa_saved_report_id: int | None = None

    try:
        created = client.request_json(
            "/api/cases",
            method="POST",
            body={
                "firstName": "Assurance",
                "lastName": "Run",
                "demographicStateId": state_id,
                "demographicCountyId": county_id,
                "caseName": f"Assurance Case {datetime.now().strftime('%Y%m%d%H%M%S')}",
            },
            expected_status=201,
        )
        created_case_id = int(created["case"]["user_id"])
        record(check_results, "case.create", created_case_id > 0, {"case_id": created_case_id})

        blocked = client.request_json(
            f"/api/cases/{created_case_id}/analysis/transferable",
            method="POST",
            body={},
            expected_status=400,
        )
        missing_fields = blocked.get("missing_fields", [])
        record(
            check_results,
            "case.intake_block_gate",
            isinstance(missing_fields, list) and len(missing_fields) > 0,
            {"missing_fields": missing_fields, "error": blocked.get("error")},
        )

        patched = client.request_json(
            f"/api/cases/{created_case_id}",
            method="PATCH",
            body={
                "firstName": "Assurance",
                "lastName": "Run",
                "addressLine1": "123 Validation Way",
                "city": "Test City",
                "postalCode": "32920",
                "reasonForReferral": "Operations assurance validation",
                "demographicStateId": state_id,
                "demographicCountyId": county_id,
            },
        )
        patched_case = patched.get("case", {})
        record(
            check_results,
            "case.patch_required_fields",
            bool(patched_case.get("address_line1")) and bool(patched_case.get("reason_for_referral")),
            {"case": patched_case},
        )

        wh = client.request_json(
            f"/api/cases/{created_case_id}/work-history-dots",
            method="PUT",
            body={"sourceDots": [{"dotCode": dot_code} for dot_code in source_dots]},
        )
        wh_rows = wh.get("rows", [])
        record(
            check_results,
            "case.work_history_put",
            len(wh_rows) >= len(source_dots),
            {"rows": wh_rows},
        )

        profiles_get = client.request_json(f"/api/cases/{created_case_id}/profiles")
        profiles = profiles_get.get("profiles", {})
        profile3 = list(profiles.get("profile3", []))
        profile4_input = [int(value) + 1 for value in profile3] if profile3 else []
        profiles_put = client.request_json(
            f"/api/cases/{created_case_id}/profiles",
            method="PUT",
            body={"profile4": profile4_input, "enforceResidualCap": True},
        )
        profile_payload = profiles_put.get("profiles", {})
        profile3_out = list(profile_payload.get("profile3", []))
        profile4_out = list(profile_payload.get("profile4", []))
        residual_cap_ok = ensure_profile_bounds(profile4_out, profile3_out)
        record(
            check_results,
            "profiles.residual_cap_enforced",
            residual_cap_ok and len(profile4_out) == 24 and len(profile3_out) == 24,
            {"profile3": profile3_out, "profile4": profile4_out},
        )

        analysis = client.request_json(
            f"/api/cases/{created_case_id}/analysis/transferable",
            method="POST",
            body={"stateId": state_id, "countyId": county_id, "limit": 100, "offset": 0},
        )
        results = analysis.get("results", [])
        analysis_ok = isinstance(results, list) and "report3_summary" in analysis and "report4_summary" in analysis
        record(
            check_results,
            "case.analysis_transferable",
            analysis_ok,
            {
                "total": analysis.get("total"),
                "result_count": len(results),
                "report4_summary": analysis.get("report4_summary"),
                "aggregate_present": analysis.get("aggregate") is not None,
            },
        )

        # Pagination + aggregate consistency.
        profile_for_analysis = analysis.get("profiles", {}).get("profile4", [])
        page_a = client.request_json(
            "/api/transferable-skills/analyze",
            method="POST",
            body={
                "sourceDots": source_dots,
                "q": "",
                "stateId": state_id,
                "countyId": county_id,
                "profile": profile_for_analysis,
                "limit": 40,
                "offset": 0,
            },
        )
        page_b = client.request_json(
            "/api/transferable-skills/analyze",
            method="POST",
            body={
                "sourceDots": source_dots,
                "q": "",
                "stateId": state_id,
                "countyId": county_id,
                "profile": profile_for_analysis,
                "limit": 40,
                "offset": 60,
            },
        )
        aggregate_ok = (
            page_a.get("total") == page_b.get("total")
            and page_a.get("tsp_band_counts") == page_b.get("tsp_band_counts")
            and page_a.get("aggregate") == page_b.get("aggregate")
        )
        record(
            check_results,
            "analysis.pagination_aggregate_consistency",
            aggregate_ok,
            {
                "total_a": page_a.get("total"),
                "total_b": page_b.get("total"),
                "bands_a": page_a.get("tsp_band_counts"),
                "bands_b": page_b.get("tsp_band_counts"),
                "aggregate_a": page_a.get("aggregate"),
                "aggregate_b": page_b.get("aggregate"),
            },
        )

        # Multi-source best source correctness.
        target_dots = [str(row.get("dot_code")) for row in (page_a.get("results") or [])[:12] if row.get("dot_code")]
        if len(source_dots) >= 2 and target_dots:
            best_compare = compare_multi_source_best(
                client=client,
                state_id=state_id,
                county_id=county_id,
                source_dots=source_dots[:2],
                profile=profile_for_analysis,
                targets=target_dots,
            )
            record(
                check_results,
                "analysis.multi_source_best_source_selection",
                best_compare["checked_targets"] > 0 and best_compare["mismatch_count"] == 0,
                best_compare,
            )
        else:
            record(
                check_results,
                "analysis.multi_source_best_source_selection",
                False,
                {"reason": "insufficient source dots or target dots", "source_dots": source_dots, "targets": target_dots},
            )

        selected_dot = str(results[0].get("dot_code")) if results else source_dots[0]
        save_match = client.request_json(
            "/api/reports/match/save",
            method="POST",
            body={
                "userId": created_case_id,
                "label": "Assurance Match",
                "q": "",
                "stateId": state_id,
                "countyId": county_id,
                "profile": profile_for_analysis,
                "selectedDot": selected_dot,
                "limit": 20,
                "taskLimit": 15,
            },
            expected_status=201,
        )
        saved_report_id = int(save_match["saved_report"]["saved_report_id"])
        expected_md_hash = str(save_match.get("report_markdown_hash_sha256") or "")
        expected_html_hash = str(save_match.get("render_html_hash_sha256") or "")
        record(
            check_results,
            "reports.match_save",
            saved_report_id > 0 and len(expected_md_hash) > 10 and len(expected_html_hash) > 10,
            {"saved_report_id": saved_report_id, "markdown_hash": expected_md_hash, "html_hash": expected_html_hash},
        )

        save_tsa = client.request_json(
            "/api/reports/transferable-skills/save",
            method="POST",
            body={
                "userId": created_case_id,
                "label": "Assurance TSA",
                "q": "",
                "stateId": state_id,
                "countyId": county_id,
                "profile": profile_for_analysis,
                "sourceDots": source_dots,
                "selectedDot": selected_dot,
                "limit": 20,
                "taskLimit": 15,
            },
            expected_status=201,
        )
        tsa_saved_report_id = int(save_tsa["saved_report"]["saved_report_id"])
        record(
            check_results,
            "reports.tsa_save",
            tsa_saved_report_id > 0,
            {"saved_report_id": tsa_saved_report_id},
        )

        markdown_export = client.request_raw(f"/api/reports/saved/{saved_report_id}/export/markdown")
        html_export = client.request_raw(f"/api/reports/saved/{saved_report_id}/export/html")
        pdf_export = client.request_raw(f"/api/reports/saved/{saved_report_id}/export/pdf")
        case_packet = client.request_raw(f"/api/reports/saved/{saved_report_id}/export/case-packet")
        validate_export = client.request_json(f"/api/reports/saved/{saved_report_id}/export/validate")

        md_header = str(markdown_export["headers"].get("X-MVQS-Markdown-SHA256", ""))
        md_html_header = str(markdown_export["headers"].get("X-MVQS-HTML-SHA256", ""))
        html_header = str(html_export["headers"].get("X-MVQS-HTML-SHA256", ""))
        pdf_md_header = str(pdf_export["headers"].get("X-MVQS-Markdown-SHA256", ""))
        pdf_html_header = str(pdf_export["headers"].get("X-MVQS-HTML-SHA256", ""))

        export_hash_ok = (
            md_header == expected_md_hash
            and md_html_header == expected_html_hash
            and html_header == expected_html_hash
            and pdf_md_header == expected_md_hash
            and pdf_html_header == expected_html_hash
            and bool(validate_export.get("markdown_hash_matches"))
            and bool(validate_export.get("html_hash_matches"))
            and bool(validate_export.get("pdf_export_uses_same_html_source"))
            and bool(validate_export.get("pdf_export_uses_same_markdown_source"))
        )
        record(
            check_results,
            "exports.hash_parity_validation",
            export_hash_ok,
            {
                "expected_md_hash": expected_md_hash,
                "expected_html_hash": expected_html_hash,
                "headers": {
                    "md": md_header,
                    "md_html": md_html_header,
                    "html": html_header,
                    "pdf_md": pdf_md_header,
                    "pdf_html": pdf_html_header,
                },
                "validate": validate_export,
            },
        )

        zip_ok = False
        zip_details: dict[str, Any] = {}
        try:
            with zipfile.ZipFile(io.BytesIO(case_packet["raw"])) as archive:
                names = set(archive.namelist())
                manifest = json.loads(archive.read("manifest.json").decode("utf-8"))
                required = {"report.json", "report.md", "report.html", "report.pdf", "manifest.json"}
                zip_ok = required.issubset(names) and int(manifest.get("saved_report_id")) == saved_report_id
                zip_details = {
                    "entries": sorted(names),
                    "manifest_saved_report_id": manifest.get("saved_report_id"),
                    "manifest_hashes": manifest.get("hashes"),
                    "manifest_consistency": manifest.get("consistency"),
                }
        except Exception as exc:  # pragma: no cover
            zip_ok = False
            zip_details = {"error": str(exc)}

        record(check_results, "exports.case_packet_integrity", zip_ok, zip_details)

    finally:
        # Cleanup in reverse order; ignore cleanup errors but keep evidence.
        if saved_report_id is not None:
            try:
                client.request_json(f"/api/reports/saved/{saved_report_id}", method="DELETE")
            except Exception:
                pass
        if tsa_saved_report_id is not None:
            try:
                client.request_json(f"/api/reports/saved/{tsa_saved_report_id}", method="DELETE")
            except Exception:
                pass
        if created_case_id is not None:
            try:
                client.request_json(f"/api/cases/{created_case_id}", method="DELETE")
            except Exception:
                pass

    # Pull in previously generated benchmark/parity evidence files if present.
    trend_json = analysis_dir / "tsa_batch_trend_comparison.json"
    se_json = analysis_dir / "tsa_batch_1000_standard_error.json"
    external_se_json = analysis_dir / "tsa_external_parity_standard_error.json"

    trend = load_json_if_exists(trend_json)
    se_data = load_json_if_exists(se_json)
    external_se = load_json_if_exists(external_se_json)

    for path in [
        analysis_dir / "tsa_batch_200_report.md",
        analysis_dir / "tsa_batch_500_report.md",
        analysis_dir / "tsa_batch_1000_report.md",
        analysis_dir / "tsa_batch_trend_comparison.md",
        analysis_dir / "computation_validity_report.md",
        analysis_dir / "standard_error_summary.md",
        analysis_dir / "pdf_case_replay_metrics.json",
        analysis_dir / "tsa_external_parity_standard_error.json",
        analysis_dir / "tsa_batch_1000_standard_error.json",
    ]:
        if path.exists():
            evidence_files.append(str(path))

    payload = {
        "generated_at_utc": now_utc(),
        "base_url": args.base_url,
        "workspace": str(workspace),
        "health": health,
        "readiness": readiness,
        "smoke": smoke,
        "checks": [
            {"check_id": row.check_id, "passed": row.passed, "details": row.details}
            for row in check_results
        ],
        "summary": {
            "total_checks": len(check_results),
            "passed": sum(1 for row in check_results if row.passed),
            "failed": sum(1 for row in check_results if not row.passed),
        },
        "trend_comparison": trend,
        "standard_error": se_data,
        "external_parity_standard_error": external_se,
        "evidence_files": evidence_files,
    }

    output_json = Path(args.output_json)
    output_md = Path(args.output_md)
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    output_md.write_text(build_markdown(payload), encoding="utf-8")
    print(f"Wrote JSON: {output_json}")
    print(f"Wrote report: {output_md}")
    print(json.dumps(payload["summary"], indent=2))

    return 0 if payload["summary"]["failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())

