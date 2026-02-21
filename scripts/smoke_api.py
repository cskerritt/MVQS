#!/usr/bin/env python3
"""
Smoke-check core MVQS API routes and error contracts.

Usage:
  python3 scripts/smoke_api.py --base-url http://localhost:4173
"""

from __future__ import annotations

import argparse
import io
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from typing import Any


def request_json(
    base_url: str,
    path: str,
    method: str = "GET",
    body: dict[str, Any] | None = None,
    expected_status: int = 200,
    return_meta: bool = False,
) -> Any:
    url = urllib.parse.urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))
    data: bytes | None = None
    headers = {"Accept": "application/json"}
    response_headers: dict[str, str] = {}

    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            status = response.getcode()
            raw = response.read().decode("utf-8")
            response_headers = dict(response.headers.items())
    except urllib.error.HTTPError as exc:
        status = exc.code
        raw = exc.read().decode("utf-8", errors="replace")
        response_headers = dict(exc.headers.items())
    except urllib.error.URLError as exc:
        raise RuntimeError(f"{method} {path} failed: {exc.reason}") from exc

    try:
        payload = json.loads(raw) if raw else {}
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{method} {path} returned non-JSON response: {raw[:180]!r}") from exc

    if status != expected_status:
        raise RuntimeError(
            f"{method} {path} expected {expected_status}, got {status}. Payload: {json.dumps(payload)[:300]}"
        )

    if return_meta:
        return {"payload": payload, "status": status, "headers": response_headers}

    return payload


def request_raw(
    base_url: str,
    path: str,
    method: str = "GET",
    body: dict[str, Any] | None = None,
    expected_status: int = 200,
) -> dict[str, Any]:
    url = urllib.parse.urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))
    data: bytes | None = None
    headers = {"Accept": "*/*"}
    response_headers: dict[str, str] = {}

    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            status = response.getcode()
            raw = response.read()
            response_headers = dict(response.headers.items())
    except urllib.error.HTTPError as exc:
        status = exc.code
        raw = exc.read()
        response_headers = dict(exc.headers.items())
    except urllib.error.URLError as exc:
        raise RuntimeError(f"{method} {path} failed: {exc.reason}") from exc

    if status != expected_status:
        preview = raw[:200].decode("utf-8", errors="replace")
        raise RuntimeError(f"{method} {path} expected {expected_status}, got {status}. Payload: {preview!r}")

    return {"status": status, "headers": response_headers, "raw": raw}


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke-check MVQS APIs")
    parser.add_argument("--base-url", default="http://localhost:4173", help="Base URL for MVQS server")
    args = parser.parse_args()
    base_url = args.base_url

    print(f"Smoke check target: {base_url}")

    health = request_json(base_url, "/api/health")
    assert_true(bool(health.get("ok")), "/api/health did not return ok=true")
    print("PASS /api/health")

    readiness = request_json(base_url, "/api/readiness")
    assert_true(readiness.get("overall_status") == "pass", "/api/readiness overall_status is not pass")
    checks = readiness.get("checks", [])
    assert_true(isinstance(checks, list) and len(checks) > 0, "readiness checks payload missing")
    check_ids = {row.get("id") for row in checks if isinstance(row, dict)}
    required_check_ids = {
        "core.db.ready",
        "core.app_db.ready",
        "core.metadata.table",
        "core.metadata.required_keys",
        "core.tables.nonempty",
        "core.metadata.totals_match",
        "core.states.installed",
        "core.psychometric_catalog.nonempty",
        "legacy_sync.columns.present",
        "legacy_sync.crosswalk.coverage",
        "legacy_sync.values.coverage",
        "legacy_sync.metadata.coverage_match",
    }
    assert_true(
        required_check_ids.issubset(check_ids),
        f"/api/readiness missing required checks: {sorted(required_check_ids - check_ids)}",
    )
    legacy_sync = readiness.get("core", {}).get("legacy_sync", {})
    assert_true(bool(legacy_sync.get("ready")), "/api/readiness core.legacy_sync.ready is not true")
    print("PASS /api/readiness")

    section7 = request_json(base_url, "/api/methodology/section7")
    assert_true(bool(section7.get("version")), "/api/methodology/section7 missing version")
    section7_items = section7.get("items", [])
    assert_true(isinstance(section7_items, list) and len(section7_items) == 14, "/api/methodology/section7 must return 14 items")
    for item in section7_items:
        assert_true(bool(item.get("status")), "section7 item missing status")
        assert_true(bool(item.get("confidence")), "section7 item missing confidence")
        evidence = item.get("evidence")
        assert_true(isinstance(evidence, list) and len(evidence) > 0, "section7 item missing evidence references")
    print("PASS /api/methodology/section7")

    metadata_payload = request_json(base_url, "/api/metadata")
    metadata = metadata_payload.get("metadata", {})
    assert_true(isinstance(metadata, dict), "/api/metadata payload missing metadata object")
    for key in ("jobs_crosswalk_coverage_count", "jobs_value_coverage_count", "legacy_snapshot_id"):
        assert_true(key in metadata, f"/api/metadata missing {key}")
    assert_true(
        bool(str(metadata.get("legacy_snapshot_id", "")).strip()),
        "/api/metadata legacy_snapshot_id is empty",
    )
    print("PASS /api/metadata")

    ai_status = request_json(base_url, "/api/ai/status")
    assert_true(isinstance(ai_status.get("enabled"), bool), "/api/ai/status enabled flag missing")
    assert_true(bool(ai_status.get("model")), "/api/ai/status model missing")
    print("PASS /api/ai/status")

    traits = request_json(base_url, "/api/traits")
    trait_rows = traits.get("traits", [])
    default_profile = traits.get("defaultProfile", [])
    assert_true(isinstance(trait_rows, list) and len(trait_rows) > 0, "traits list missing or empty")
    assert_true(
        isinstance(default_profile, list) and len(default_profile) == len(trait_rows),
        "defaultProfile length mismatch against traits",
    )
    print("PASS /api/traits")

    states_payload = request_json(base_url, "/api/states")
    states = states_payload.get("states", [])
    assert_true(isinstance(states, list), "states payload is not a list")
    print("PASS /api/states")

    search_meta = request_json(base_url, "/api/jobs/search?limit=5&offset=2", return_meta=True)
    search = search_meta.get("payload", {})
    jobs = search.get("jobs", [])
    assert_true(isinstance(jobs, list), "jobs list missing in /api/jobs/search")
    assert_true(isinstance(search.get("total"), int), "total missing or non-integer in /api/jobs/search")
    assert_true(search.get("limit") == 5, "search response did not echo limit=5")
    assert_true(search.get("offset") == 2, "search response did not echo offset=2")
    cache_control = str(search_meta.get("headers", {}).get("Cache-Control", "")).lower()
    assert_true("no-store" in cache_control, "API response is missing Cache-Control: no-store")
    print("PASS /api/jobs/search")

    state_id = states[0]["state_id"] if states else None
    demo_county_id = None
    if state_id is not None:
      counties_payload = request_json(base_url, f"/api/counties?stateId={state_id}")
      counties = counties_payload.get("counties", [])
      demo_county_id = counties[0]["county_id"] if counties else None
      assert_true(isinstance(counties, list), "counties payload is not a list")
      print("PASS /api/counties (demographic source)")
    match_payload = {
        "q": "",
        "stateId": state_id,
        "countyId": None,
        "profile": default_profile,
        "limit": 10,
    }
    match = request_json(base_url, "/api/match", method="POST", body=match_payload)
    results = match.get("results", [])
    assert_true(isinstance(results, list), "results missing in /api/match")
    assert_true(isinstance(match.get("offset"), int), "offset missing in /api/match response")
    print("PASS /api/match")

    source_dots: list[str] = []
    for row in results:
        dot = row.get("dot_code")
        if isinstance(dot, str) and dot and dot not in source_dots:
            source_dots.append(dot)
        if len(source_dots) >= 2:
            break
    if len(source_dots) < 2:
        for row in jobs:
            dot = row.get("dot_code")
            if isinstance(dot, str) and dot and dot not in source_dots:
                source_dots.append(dot)
            if len(source_dots) >= 2:
                break
    source_dot = source_dots[0] if source_dots else None
    assert_true(bool(source_dot), "unable to find source DOT for transferable-skills smoke test")

    tsa_payload = {
        "sourceDots": source_dots,
        "q": "",
        "stateId": state_id,
        "countyId": None,
        "profile": default_profile,
        "limit": 10,
        "offset": 0,
    }
    tsa = request_json(base_url, "/api/transferable-skills/analyze", method="POST", body=tsa_payload)
    tsa_results = tsa.get("results", [])
    assert_true(isinstance(tsa_results, list), "results missing in /api/transferable-skills/analyze")
    assert_true(isinstance(tsa.get("total"), int), "total missing in /api/transferable-skills/analyze")
    assert_true(isinstance(tsa.get("offset"), int), "offset missing in /api/transferable-skills/analyze")
    source_jobs = tsa.get("source_jobs", [])
    assert_true(isinstance(source_jobs, list) and len(source_jobs) > 0, "source_jobs missing in TSA response")
    methodology = tsa.get("methodology", {})
    assert_true(isinstance(methodology, dict), "methodology missing in TSA response")
    assert_true(bool(methodology.get("methodology_version") or methodology.get("selected_model")), "methodology version missing in TSA response")
    assert_true(bool(methodology.get("section7_resolution_version")), "methodology missing section7_resolution_version")
    assert_true(isinstance(methodology.get("section7_unresolved_ids"), list), "methodology missing section7_unresolved_ids")
    confidence_profile = methodology.get("section7_confidence_profile")
    assert_true(isinstance(confidence_profile, dict), "methodology missing section7_confidence_profile")
    source_job = tsa.get("source_job", {})
    assert_true(source_job.get("dot_code") == source_dot, "source_job.dot_code mismatch in TSA response")
    analysis_basis = tsa.get("analysis_basis", {})
    assert_true(isinstance(analysis_basis, dict), "analysis_basis missing in TSA response")
    assert_true(bool(analysis_basis.get("section7_resolution_version")), "analysis_basis missing section7_resolution_version")
    assert_true(isinstance(analysis_basis.get("section7_unresolved_ids"), list), "analysis_basis missing section7_unresolved_ids")
    assert_true(
        isinstance(analysis_basis.get("section7_confidence_profile"), dict),
        "analysis_basis missing section7_confidence_profile",
    )
    loaded_source_dots = {row.get("dot_code") for row in source_jobs if isinstance(row, dict)}
    assert_true(
        source_dot in loaded_source_dots,
        "requested source DOT not present in TSA source_jobs",
    )
    if tsa_results:
        first = tsa_results[0]
        assert_true("tsp_percent" in first, "tsp_percent missing from TSA result row")
        assert_true("tsp_percent_unadjusted" in first, "tsp_percent_unadjusted missing from TSA result row")
        assert_true("va_adjustment_percent" in first, "va_adjustment_percent missing from TSA result row")
        assert_true("ts_raw_0_to_46" in first or "tsp_raw_0_to_46" in first, "ts raw score missing from TSA result row")
        assert_true("methodology_version" in first, "methodology_version missing from TSA result row")
        assert_true(isinstance(first.get("component_matches"), dict), "component_matches missing from TSA result row")
        assert_true(isinstance(first.get("legacy_trace"), dict), "legacy_trace missing from TSA result row")
        component_matches = first.get("component_matches") or {}
        crosswalk_keys = {"sic", "soc", "cen", "ind", "wf1", "onet_group"}
        assert_true(
            any(key in component_matches for key in crosswalk_keys),
            "component_matches missing expected crosswalk trace keys",
        )
        assert_true("tsp_level" in first, "tsp_level missing from TSA result row")
        assert_true("best_source_dot_code" in first, "best_source_dot_code missing from TSA result row")
        assert_true("physical_demand_target_level" in first, "physical_demand_target_level missing from TSA result row")
        assert_true("physical_demand_profile_level" in first, "physical_demand_profile_level missing from TSA result row")
        assert_true(
            "physical_demand_profile_deficit_count" in first,
            "physical_demand_profile_deficit_count missing from TSA result row",
        )
        assert_true("physical_demand_gate_failed" in first, "physical_demand_gate_failed missing from TSA result row")
    print("PASS /api/transferable-skills/analyze")

    selected_dot = source_dot

    report_payload = {
        "q": "",
        "stateId": state_id,
        "countyId": None,
        "profile": default_profile,
        "selectedDot": selected_dot,
        "limit": 20,
        "taskLimit": 15,
    }
    report = request_json(base_url, "/api/reports/match", method="POST", body=report_payload)
    report_body = report.get("report", {})
    assert_true(isinstance(report_body, dict), "report object missing in /api/reports/match")
    assert_true("matches" in report_body, "report.matches missing in /api/reports/match")
    render_html = report.get("render_html")
    render_html_hash = report.get("render_html_hash_sha256")
    assert_true(isinstance(render_html, str) and "<html" in render_html.lower(), "render_html missing in /api/reports/match")
    assert_true(
        isinstance(render_html_hash, str) and len(render_html_hash) > 10,
        "render_html_hash_sha256 missing in /api/reports/match",
    )
    print("PASS /api/reports/match")

    if len(results) > 1:
        requested_dot = results[1].get("dot_code")
        pinned_report_payload = {
            "q": "",
            "stateId": state_id,
            "countyId": None,
            "profile": default_profile,
            "selectedDot": requested_dot,
            "limit": 1,
            "taskLimit": 15,
        }
        pinned_report_response = request_json(
            base_url, "/api/reports/match", method="POST", body=pinned_report_payload
        )
        pinned_report = pinned_report_response.get("report", {})
        pinned_selected = pinned_report.get("selected_job") or {}
        summary = pinned_report.get("summary") or {}
        assert_true(
            pinned_selected.get("dot_code") == requested_dot,
            "report.selected_job did not honor selectedDot outside ranked limit",
        )
        assert_true(
            summary.get("selected_requested_dot_code") == requested_dot,
            "summary.selected_requested_dot_code mismatch for pinned report",
        )
        assert_true(
            summary.get("selected_included_in_results") is False,
            "summary.selected_included_in_results should be false for outside-limit selectedDot",
        )
        print("PASS /api/reports/match selectedDot outside ranked rows")
    else:
        print("SKIP /api/reports/match selectedDot outside ranked rows (insufficient match rows)")

    tsa_report_payload = {
        "q": "",
        "stateId": state_id,
        "countyId": None,
        "profile": default_profile,
        "sourceDots": source_dots,
        "selectedDot": selected_dot,
        "limit": 20,
        "taskLimit": 15,
    }
    tsa_report_response = request_json(
        base_url, "/api/reports/transferable-skills", method="POST", body=tsa_report_payload
    )
    tsa_report = tsa_report_response.get("report", {})
    assert_true(
        tsa_report.get("report_type") == "mvqs_transferable_skills_report",
        "report_type mismatch in /api/reports/transferable-skills",
    )
    assert_true(bool(tsa_report.get("methodology_version")), "methodology_version missing in TSA report payload")
    assert_true(bool(tsa_report.get("layout_version")), "layout_version missing in TSA report payload")
    assert_true("parity_profile" in tsa_report, "parity_profile missing in TSA report payload")
    tsa_render_html = tsa_report_response.get("render_html")
    tsa_render_hash = tsa_report_response.get("render_html_hash_sha256")
    assert_true(
        isinstance(tsa_render_html, str) and "<html" in tsa_render_html.lower(),
        "render_html missing in /api/reports/transferable-skills",
    )
    assert_true(
        isinstance(tsa_render_hash, str) and len(tsa_render_hash) > 10,
        "render_html_hash_sha256 missing in /api/reports/transferable-skills",
    )
    assert_true("Report 6" in tsa_render_html, "report6 heading missing in transferable report HTML")
    assert_true("Report 7" in tsa_render_html, "report7 heading missing in transferable report HTML")
    assert_true("Report 9" in tsa_render_html, "report9 heading missing in transferable report HTML")
    assert_true("Report 10" in tsa_render_html, "report10 heading missing in transferable report HTML")
    assert_true(
        "wage fields are unavailable" in tsa_render_html.lower(),
        "earning-capacity fallback note missing from transferable report HTML",
    )
    tsa_report_sources = tsa_report.get("source_jobs", [])
    assert_true(isinstance(tsa_report_sources, list) and len(tsa_report_sources) > 0, "source_jobs missing in TSA report")
    assert_true(bool(tsa_report.get("section7_resolution_version")), "section7_resolution_version missing in TSA report payload")
    assert_true(isinstance(tsa_report.get("section7_unresolved_ids"), list), "section7_unresolved_ids missing in TSA report payload")
    report_sections = tsa_report_response.get("report_sections", [])
    assert_true(isinstance(report_sections, list), "report_sections missing in /api/reports/transferable-skills")
    section_ids = {row.get("id") for row in report_sections if isinstance(row, dict)}
    required_section_ids = {"report1", "report3", "report4", "report5", "report6", "report7", "report8", "report9", "report10"}
    assert_true(
        required_section_ids.issubset(section_ids),
        f"missing transferable report sections: {sorted(required_section_ids - section_ids)}",
    )
    print("PASS /api/reports/transferable-skills")

    bad_region = request_json(base_url, "/api/jobs/search?countyId=123", expected_status=400)
    assert_true(bad_region.get("error") == "countyId requires stateId", "unexpected region filter error message")
    print("PASS /api/jobs/search bad region validation")

    bad_limit = request_json(
        base_url,
        "/api/match",
        method="POST",
        body={
            "q": "",
            "stateId": state_id,
            "countyId": None,
            "profile": default_profile,
            "limit": "not-an-integer",
        },
        expected_status=400,
    )
    assert_true(bad_limit.get("error") == "limit must be an integer", "unexpected limit validation error message")
    print("PASS /api/match limit validation")

    bad_source = request_json(
        base_url,
        "/api/transferable-skills/analyze",
        method="POST",
        body={
            "sourceDots": ["000000000"],
            "q": "",
            "stateId": state_id,
            "countyId": None,
        },
        expected_status=404,
    )
    assert_true("Source" in str(bad_source.get("error", "")), "unexpected TSA source-dot validation error")
    print("PASS /api/transferable-skills/analyze source-dot validation")

    not_found = request_json(base_url, "/api/route-that-does-not-exist", expected_status=404)
    assert_true(not_found.get("error") == "API route not found", "unexpected API not-found error message")
    print("PASS /api/* JSON not-found contract")

    assert_true(bool(health.get("appDbReady")), "/api/health did not report appDbReady=true")
    print("PASS /api/health app database readiness")

    psych_catalog = request_json(base_url, "/api/psychometrics/catalog")
    tests = psych_catalog.get("tests", [])
    assert_true(isinstance(tests, list) and len(tests) > 0, "psychometric catalog is empty")
    test_code = tests[0].get("test_code")
    assert_true(bool(test_code), "psychometric catalog row missing test_code")
    print("PASS /api/psychometrics/catalog")

    unique_suffix = str(int(time.time()))
    created_user = request_json(
        base_url,
        "/api/users",
        method="POST",
        body={
            "firstName": "Smoke",
            "lastName": f"User{unique_suffix}",
            "caseReference": f"SMOKE-{unique_suffix}",
            "caseName": f"Smoke Case {unique_suffix}",
            "email": f"smoke{unique_suffix}@example.com",
            "addressLine1": "123 Test St",
            "addressLine2": "Suite 100",
            "city": "Minneapolis",
            "postalCode": "55401",
            "countryName": "USA",
            "demographicStateId": state_id,
            "demographicCountyId": demo_county_id,
            "reasonForReferral": "Automated smoke referral test",
            "notes": "Automated smoke check user",
        },
        expected_status=201,
    )
    user = created_user.get("user", {})
    user_id = user.get("user_id")
    assert_true(isinstance(user_id, int), "created user is missing user_id")
    if state_id is not None:
        assert_true(user.get("demographic_state_id") == state_id, "created user demographic_state_id mismatch")
    if demo_county_id is not None:
        assert_true(
            user.get("demographic_county_id") == demo_county_id,
            "created user demographic_county_id mismatch",
        )
    print("PASS /api/users create")

    users_list = request_json(base_url, "/api/users")
    users_rows = users_list.get("users", [])
    assert_true(any(row.get("user_id") == user_id for row in users_rows), "created user not found in /api/users")
    print("PASS /api/users list")

    cases_list = request_json(base_url, "/api/cases")
    cases_rows = cases_list.get("cases", [])
    assert_true(any(row.get("user_id") == user_id for row in cases_rows), "created case not found in /api/cases")
    case_detail = request_json(base_url, f"/api/cases/{user_id}")
    assert_true(case_detail.get("case", {}).get("user_id") == user_id, "case detail mismatch")
    print("PASS /api/cases list/detail")

    wh_put = request_json(
        base_url,
        f"/api/cases/{user_id}/work-history-dots",
        method="PUT",
        body={"sourceDots": [{"dotCode": dot} for dot in source_dots]},
    )
    wh_rows = wh_put.get("rows", [])
    assert_true(len(wh_rows) >= len(source_dots), "work history PUT did not persist source DOTs")
    print("PASS /api/cases/:id/work-history-dots PUT")

    extra_dot = None
    for row in jobs + results + tsa_results:
        dot = row.get("dot_code") if isinstance(row, dict) else None
        if isinstance(dot, str) and dot and dot not in {r.get("dot_code") for r in wh_rows}:
            extra_dot = dot
            break
    if extra_dot:
        wh_post = request_json(
            base_url,
            f"/api/cases/{user_id}/work-history-dots",
            method="POST",
            body={"dotCode": extra_dot},
            expected_status=201,
        )
        assert_true(
            any(row.get("dot_code") == extra_dot for row in wh_post.get("rows", [])),
            "work history POST did not add extra DOT",
        )
        print("PASS /api/cases/:id/work-history-dots POST")
    else:
        print("SKIP /api/cases/:id/work-history-dots POST (no extra DOT candidate)")

    wh_get = request_json(base_url, f"/api/cases/{user_id}/work-history-dots")
    wh_get_rows = wh_get.get("rows", [])
    assert_true(isinstance(wh_get_rows, list) and len(wh_get_rows) > 0, "work history GET returned empty")
    dot_to_delete = wh_get_rows[-1]["dot_code"]
    wh_delete = request_json(
        base_url,
        f"/api/cases/{user_id}/work-history-dots/{dot_to_delete}",
        method="DELETE",
    )
    remaining = wh_delete.get("rows", [])
    assert_true(
        all(row.get("dot_code") != dot_to_delete for row in remaining),
        "work history DOT delete failed",
    )
    print("PASS /api/cases/:id/work-history-dots GET/DELETE")

    profiles_get = request_json(base_url, f"/api/cases/{user_id}/profiles")
    profiles_obj = profiles_get.get("profiles", {})
    assert_true(len(profiles_obj.get("profile1", [])) == len(default_profile), "profiles GET profile1 length mismatch")
    assert_true(len(profiles_obj.get("profile4", [])) == len(default_profile), "profiles GET profile4 length mismatch")
    editable_profile2 = list(profiles_obj.get("profile2", []))
    editable_profile4 = list(profiles_obj.get("profile4", []))
    if editable_profile2:
        editable_profile2[0] = max(1, min(6, int(editable_profile2[0]) + 1))
    if editable_profile4:
        editable_profile4[0] = max(1, min(6, int(editable_profile4[0])))
    profiles_put = request_json(
        base_url,
        f"/api/cases/{user_id}/profiles",
        method="PUT",
        body={"profile2": editable_profile2, "profile4": editable_profile4},
    )
    put_profiles = profiles_put.get("profiles", {})
    assert_true(len(put_profiles.get("profile3", [])) == len(default_profile), "profiles PUT did not return derived profile3")
    print("PASS /api/cases/:id/profiles GET/PUT")

    case_analysis = request_json(
        base_url,
        f"/api/cases/{user_id}/analysis/transferable",
        method="POST",
        body={},
    )
    assert_true(isinstance(case_analysis.get("results"), list), "case analysis missing results list")
    assert_true(isinstance(case_analysis.get("methodology"), dict), "case analysis missing methodology")
    assert_true(isinstance(case_analysis.get("analysis_basis"), dict), "case analysis missing analysis_basis")
    assert_true("report3_summary" in case_analysis, "case analysis missing report3_summary")
    assert_true("report4_summary" in case_analysis, "case analysis missing report4_summary")
    print("PASS /api/cases/:id/analysis/transferable")

    created_psych = request_json(
        base_url,
        f"/api/users/{user_id}/psychometrics",
        method="POST",
        body={
            "testCode": test_code,
            "rawScore": 42,
            "scaledScore": 103,
            "percentile": 61,
            "interpretation": "Smoke test interpretation note",
        },
        expected_status=201,
    )
    psych_result = created_psych.get("result", {})
    result_id = psych_result.get("result_id")
    assert_true(isinstance(result_id, int), "psychometric result missing result_id")
    print("PASS /api/users/:userId/psychometrics create")

    psych_list = request_json(base_url, f"/api/users/{user_id}/psychometrics")
    psych_rows = psych_list.get("results", [])
    assert_true(any(row.get("result_id") == result_id for row in psych_rows), "psychometric result not listed")
    print("PASS /api/users/:userId/psychometrics list")

    saved_report = request_json(
        base_url,
        "/api/reports/match/save",
        method="POST",
        body={
            "userId": user_id,
            "label": "Smoke Save",
            "q": "",
            "stateId": state_id,
            "countyId": None,
            "profile": default_profile,
            "selectedDot": selected_dot,
            "limit": 20,
            "taskLimit": 15,
        },
        expected_status=201,
    )
    saved_obj = saved_report.get("saved_report", {})
    saved_report_id = saved_obj.get("saved_report_id")
    expected_markdown_hash = saved_report.get("report_markdown_hash_sha256")
    expected_html_hash = saved_report.get("render_html_hash_sha256")
    assert_true(isinstance(saved_report_id, int), "saved report missing saved_report_id")
    assert_true(isinstance(expected_markdown_hash, str) and len(expected_markdown_hash) > 10, "saved report hash missing")
    assert_true(isinstance(expected_html_hash, str) and len(expected_html_hash) > 10, "saved report HTML hash missing")
    print("PASS /api/reports/match/save")

    tsa_saved_report = request_json(
        base_url,
        "/api/reports/transferable-skills/save",
        method="POST",
        body={
            "userId": user_id,
            "label": "Smoke TSA Save",
            "q": "",
            "stateId": state_id,
            "countyId": None,
            "profile": default_profile,
            "sourceDots": source_dots,
            "selectedDot": selected_dot,
            "limit": 20,
            "taskLimit": 15,
        },
        expected_status=201,
    )
    tsa_saved_obj = tsa_saved_report.get("saved_report", {})
    tsa_saved_report_id = tsa_saved_obj.get("saved_report_id")
    assert_true(isinstance(tsa_saved_report_id, int), "saved TSA report missing saved_report_id")
    print("PASS /api/reports/transferable-skills/save")

    saved_list = request_json(base_url, f"/api/reports/saved?userId={user_id}")
    saved_rows = saved_list.get("reports", [])
    assert_true(any(row.get("saved_report_id") == saved_report_id for row in saved_rows), "saved report not listed")
    assert_true(any(row.get("saved_report_id") == tsa_saved_report_id for row in saved_rows), "saved TSA report not listed")
    print("PASS /api/reports/saved list")

    saved_detail = request_json(base_url, f"/api/reports/saved/{saved_report_id}")
    assert_true(
        saved_detail.get("saved_report", {}).get("saved_report_id") == saved_report_id,
        "saved report detail mismatch",
    )
    print("PASS /api/reports/saved/:id detail")

    markdown_export = request_raw(base_url, f"/api/reports/saved/{saved_report_id}/export/markdown")
    markdown_hash_header = str(markdown_export["headers"].get("X-MVQS-Markdown-SHA256", ""))
    markdown_html_hash_header = str(markdown_export["headers"].get("X-MVQS-HTML-SHA256", ""))
    assert_true(markdown_hash_header == expected_markdown_hash, "markdown export hash header mismatch")
    assert_true(markdown_html_hash_header == expected_html_hash, "markdown export HTML hash header mismatch")
    markdown_text = markdown_export["raw"].decode("utf-8", errors="replace")
    assert_true("# MVQS Match Report" in markdown_text, "markdown export content missing report heading")
    print("PASS /api/reports/saved/:id/export/markdown")

    html_export = request_raw(base_url, f"/api/reports/saved/{saved_report_id}/export/html")
    html_content_type = str(html_export["headers"].get("Content-Type", "")).lower()
    html_hash_header = str(html_export["headers"].get("X-MVQS-HTML-SHA256", ""))
    assert_true("text/html" in html_content_type, "html export content-type mismatch")
    assert_true(html_hash_header == expected_html_hash, "html export hash header mismatch")
    assert_true(b"<html" in html_export["raw"].lower(), "html export payload missing html root")
    print("PASS /api/reports/saved/:id/export/html")

    pdf_export = request_raw(base_url, f"/api/reports/saved/{saved_report_id}/export/pdf")
    pdf_hash_header = str(pdf_export["headers"].get("X-MVQS-Markdown-SHA256", ""))
    pdf_html_hash_header = str(pdf_export["headers"].get("X-MVQS-HTML-SHA256", ""))
    pdf_content_type = str(pdf_export["headers"].get("Content-Type", "")).lower()
    assert_true(pdf_hash_header == expected_markdown_hash, "pdf export markdown hash header mismatch")
    assert_true(pdf_html_hash_header == expected_html_hash, "pdf export html hash header mismatch")
    assert_true("application/pdf" in pdf_content_type, "pdf export content-type mismatch")
    assert_true(pdf_export["raw"].startswith(b"%PDF"), "pdf export payload does not start with %PDF")
    print("PASS /api/reports/saved/:id/export/pdf")

    case_packet_export = request_raw(base_url, f"/api/reports/saved/{saved_report_id}/export/case-packet")
    case_packet_content_type = str(case_packet_export["headers"].get("Content-Type", "")).lower()
    case_packet_disposition = str(case_packet_export["headers"].get("Content-Disposition", "")).lower()
    assert_true("application/zip" in case_packet_content_type, "case packet export content-type mismatch")
    assert_true(
        "mvqs-case-packet-" in case_packet_disposition and ".zip" in case_packet_disposition,
        "case packet export content-disposition filename mismatch",
    )
    assert_true(case_packet_export["raw"].startswith(b"PK"), "case packet payload does not appear to be zip data")
    with zipfile.ZipFile(io.BytesIO(case_packet_export["raw"])) as archive:
        names = set(archive.namelist())
        required_files = {"report.json", "report.md", "report.html", "report.pdf", "manifest.json"}
        assert_true(required_files.issubset(names), "case packet zip missing expected files")
        manifest = json.loads(archive.read("manifest.json").decode("utf-8"))
        assert_true(manifest.get("saved_report_id") == saved_report_id, "case packet manifest saved_report_id mismatch")
        hashes = manifest.get("hashes", {})
        assert_true(
            hashes.get("stored_markdown_hash_sha256") == expected_markdown_hash,
            "case packet manifest markdown hash mismatch",
        )
        assert_true(
            hashes.get("computed_html_hash_sha256") == expected_html_hash,
            "case packet manifest HTML hash mismatch",
        )
    print("PASS /api/reports/saved/:id/export/case-packet")

    case_bundle_export = request_raw(base_url, f"/api/cases/{user_id}/export/report-bundle")
    case_bundle_content_type = str(case_bundle_export["headers"].get("Content-Type", "")).lower()
    case_bundle_disposition = str(case_bundle_export["headers"].get("Content-Disposition", "")).lower()
    assert_true("application/zip" in case_bundle_content_type, "case bundle export content-type mismatch")
    assert_true(
        "mvqs-case-report-bundle-" in case_bundle_disposition and ".zip" in case_bundle_disposition,
        "case bundle export content-disposition filename mismatch",
    )
    assert_true(case_bundle_export["raw"].startswith(b"PK"), "case bundle payload does not appear to be zip data")
    with zipfile.ZipFile(io.BytesIO(case_bundle_export["raw"])) as archive:
        names = set(archive.namelist())
        assert_true("manifest.json" in names, "case bundle zip missing manifest.json")
        expected_prefixes = {
            f"reports/{saved_report_id}/report.json",
            f"reports/{saved_report_id}/report.md",
            f"reports/{saved_report_id}/report.html",
            f"reports/{saved_report_id}/report.pdf",
            f"reports/{saved_report_id}/validate.json",
            f"reports/{tsa_saved_report_id}/report.json",
            f"reports/{tsa_saved_report_id}/report.md",
            f"reports/{tsa_saved_report_id}/report.html",
            f"reports/{tsa_saved_report_id}/report.pdf",
            f"reports/{tsa_saved_report_id}/validate.json",
        }
        assert_true(expected_prefixes.issubset(names), "case bundle zip missing per-report artifacts")
        bundle_manifest = json.loads(archive.read("manifest.json").decode("utf-8"))
        assert_true(bundle_manifest.get("case_id") == user_id, "case bundle manifest case_id mismatch")
        assert_true(
            int(bundle_manifest.get("report_count", 0)) >= 2,
            "case bundle manifest report_count is lower than expected",
        )
    print("PASS /api/cases/:caseId/export/report-bundle")

    export_validation = request_json(base_url, f"/api/reports/saved/{saved_report_id}/export/validate")
    assert_true(
        bool(export_validation.get("markdown_hash_matches")),
        "export validation markdown hash mismatch",
    )
    assert_true(
        bool(export_validation.get("html_hash_matches")),
        "export validation html hash mismatch",
    )
    assert_true(
        bool(export_validation.get("pdf_export_uses_same_markdown_source")),
        "export validation indicates mismatched markdown source for PDF",
    )
    assert_true(
        bool(export_validation.get("pdf_export_uses_same_html_source")),
        "export validation indicates mismatched html source for PDF",
    )
    assert_true(
        export_validation.get("computed_markdown_hash_sha256") == expected_markdown_hash,
        "export validation markdown hash does not match expected hash",
    )
    assert_true(
        export_validation.get("computed_html_hash_sha256") == expected_html_hash,
        "export validation html hash does not match expected hash",
    )
    print("PASS /api/reports/saved/:id/export/validate")

    for report_id_to_delete in [saved_report_id, tsa_saved_report_id]:
        deleted_report = request_json(
            base_url,
            f"/api/reports/saved/{report_id_to_delete}",
            method="DELETE",
        )
        assert_true(bool(deleted_report.get("ok")), "saved report delete did not return ok=true")
    print("PASS /api/reports/saved/:id delete")

    deleted_psych = request_json(
        base_url,
        f"/api/users/{user_id}/psychometrics/{result_id}",
        method="DELETE",
    )
    assert_true(bool(deleted_psych.get("ok")), "psychometric delete did not return ok=true")
    print("PASS /api/users/:userId/psychometrics/:resultId delete")

    deleted_user = request_json(base_url, f"/api/users/{user_id}", method="DELETE")
    assert_true(bool(deleted_user.get("ok")), "user delete did not return ok=true")
    print("PASS /api/users/:id delete")

    print("Smoke check completed successfully.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
