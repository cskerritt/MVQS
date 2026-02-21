#!/usr/bin/env python3
"""
Seed sample MVQS cases with work history, profiles, saved TSA reports,
and export validation for UI testing.

Usage:
  python3 scripts/seed_sample_cases.py --base-url http://localhost:4173 --count 6
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
from dataclasses import dataclass
from typing import Any


def request_json(
    base_url: str,
    path: str,
    method: str = "GET",
    body: dict[str, Any] | None = None,
    expected_status: int = 200,
) -> dict[str, Any]:
    url = urllib.parse.urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))
    payload: bytes | None = None
    headers = {"Accept": "application/json"}
    if body is not None:
        payload = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=payload, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            status = response.getcode()
            raw = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        status = exc.code
        raw = exc.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as exc:
        raise RuntimeError(f"{method} {path} failed: {exc.reason}") from exc

    try:
        parsed = json.loads(raw) if raw else {}
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{method} {path} returned non-JSON: {raw[:200]!r}") from exc

    if status != expected_status:
        raise RuntimeError(
            f"{method} {path} expected {expected_status}, got {status}. Payload: {json.dumps(parsed)[:300]}"
        )
    return parsed


def request_raw(
    base_url: str,
    path: str,
    method: str = "GET",
    body: dict[str, Any] | None = None,
    expected_status: int = 200,
) -> dict[str, Any]:
    url = urllib.parse.urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))
    payload: bytes | None = None
    headers = {"Accept": "*/*"}
    if body is not None:
        payload = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=payload, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
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


@dataclass
class SampleCaseTemplate:
    first_name: str
    last_name: str
    city: str
    postal_code: str
    diagnosis: str
    referral: str
    vipr_type: str


SAMPLE_CASES: list[SampleCaseTemplate] = [
    SampleCaseTemplate(
        first_name="Avery",
        last_name="Harris",
        city="Los Angeles",
        postal_code="90017",
        diagnosis="Lumbar spine injury with chronic pain",
        referral="Assess post-injury transferable skills and residual employability",
        vipr_type="ISTJ",
    ),
    SampleCaseTemplate(
        first_name="Jordan",
        last_name="Mitchell",
        city="Houston",
        postal_code="77002",
        diagnosis="Shoulder injury with lifting restrictions",
        referral="Evaluate labor market access under medium-to-light residual profile",
        vipr_type="ESTP",
    ),
    SampleCaseTemplate(
        first_name="Taylor",
        last_name="Nguyen",
        city="Miami",
        postal_code="33131",
        diagnosis="Neuropathy with fine-motor limitations",
        referral="Analyze transferable skills and identify stable target occupations",
        vipr_type="INTJ",
    ),
    SampleCaseTemplate(
        first_name="Morgan",
        last_name="Patel",
        city="Chicago",
        postal_code="60601",
        diagnosis="Cervical injury with positional tolerance limits",
        referral="Determine vocational adjustment options and TSA ranking",
        vipr_type="ISFJ",
    ),
    SampleCaseTemplate(
        first_name="Riley",
        last_name="Bennett",
        city="Seattle",
        postal_code="98101",
        diagnosis="Lower extremity impairment affecting mobility",
        referral="Compare pre/post residual labor market access and TS levels",
        vipr_type="ENFP",
    ),
    SampleCaseTemplate(
        first_name="Cameron",
        last_name="Reyes",
        city="Phoenix",
        postal_code="85004",
        diagnosis="Combined orthopedic and environmental intolerance restrictions",
        referral="Generate TSA report package suitable for export/parity checks",
        vipr_type="ENTJ",
    ),
]


def choose_states(base_url: str, needed: int) -> list[dict[str, Any]]:
    states = request_json(base_url, "/api/states").get("states", [])
    assert_true(bool(states), "no states returned from /api/states")
    preferred = ["CA", "TX", "FL", "IL", "WA", "AZ", "NY", "PA", "OH", "MI", "GA"]
    by_abbrev = {str(row.get("state_abbrev", "")): row for row in states}

    selected: list[dict[str, Any]] = []
    for code in preferred:
        row = by_abbrev.get(code)
        if row and row not in selected:
            selected.append(row)
        if len(selected) >= needed:
            return selected

    for row in states:
        if row not in selected:
            selected.append(row)
        if len(selected) >= needed:
            break
    return selected


def choose_county(base_url: str, state_id: int | None) -> tuple[int | None, str | None]:
    if state_id is None:
        return None, None
    counties = request_json(base_url, f"/api/counties?stateId={state_id}").get("counties", [])
    if not counties:
        return None, None
    first = counties[0]
    return int(first["county_id"]), str(first.get("county_name") or "")


def collect_source_dots(base_url: str, profile: list[int], state_id: int | None) -> list[str]:
    dot_pool: list[str] = []

    search_jobs = request_json(base_url, "/api/jobs/search?limit=120").get("jobs", [])
    for row in search_jobs:
        dot = row.get("dot_code")
        if isinstance(dot, str) and dot and dot not in dot_pool:
            dot_pool.append(dot)

    match_payload = {
        "q": "",
        "stateId": state_id,
        "countyId": None,
        "profile": profile,
        "limit": 80,
    }
    match_rows = request_json(base_url, "/api/match", method="POST", body=match_payload).get("results", [])
    for row in match_rows:
        dot = row.get("dot_code")
        if isinstance(dot, str) and dot and dot not in dot_pool:
            dot_pool.append(dot)

    assert_true(len(dot_pool) >= 12, "unable to gather enough source DOTs for seeding")
    return dot_pool


def lower_profile(profile: list[int], traits: list[dict[str, Any]], severity: int) -> list[int]:
    lowered = list(profile)
    pd_indices = list(range(11, 17))
    ec_indices = list(range(17, 24))
    apt_indices = list(range(3, 11))
    ged_indices = [0, 1, 2]

    for idx in pd_indices + ec_indices:
        minimum = int(traits[idx]["min"])
        lowered[idx] = max(minimum, int(lowered[idx]) - severity)

    apt_drop = 1 if severity >= 2 else 0
    if apt_drop > 0:
        for idx in apt_indices:
            minimum = int(traits[idx]["min"])
            lowered[idx] = max(minimum, int(lowered[idx]) - apt_drop)

    ged_drop = 1 if severity >= 3 else 0
    if ged_drop > 0:
        for idx in ged_indices:
            minimum = int(traits[idx]["min"])
            lowered[idx] = max(minimum, int(lowered[idx]) - ged_drop)

    return lowered


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed MVQS sample cases and validate report exports")
    parser.add_argument("--base-url", default="http://localhost:4173", help="MVQS server base URL")
    parser.add_argument("--count", type=int, default=6, help="Number of sample cases to create (max 6)")
    args = parser.parse_args()
    base_url = args.base_url
    count = max(1, min(args.count, len(SAMPLE_CASES)))

    health = request_json(base_url, "/api/health")
    assert_true(bool(health.get("ok")), "server health check failed")
    readiness = request_json(base_url, "/api/readiness")
    assert_true(readiness.get("overall_status") == "pass", "readiness check did not pass")

    traits_payload = request_json(base_url, "/api/traits")
    traits = traits_payload.get("traits", [])
    default_profile = traits_payload.get("defaultProfile", [])
    assert_true(len(traits) == len(default_profile) > 0, "traits/default profile missing")

    psych_catalog = request_json(base_url, "/api/psychometrics/catalog").get("tests", [])
    test_code = psych_catalog[0]["test_code"] if psych_catalog else None

    selected_states = choose_states(base_url, count)
    dot_pool = collect_source_dots(base_url, default_profile, int(selected_states[0]["state_id"]))

    created_rows: list[dict[str, Any]] = []
    timestamp_suffix = str(int(time.time()))

    for idx in range(count):
        template = SAMPLE_CASES[idx]
        state_row = selected_states[idx % len(selected_states)]
        state_id = int(state_row["state_id"])
        county_id, county_name = choose_county(base_url, state_id)
        case_reference = f"SAMPLE-{timestamp_suffix}-{idx + 1:02d}"

        created_case = request_json(
            base_url,
            "/api/cases",
            method="POST",
            body={
                "firstName": template.first_name,
                "lastName": template.last_name,
                "email": f"sample.{template.first_name.lower()}.{template.last_name.lower()}.{timestamp_suffix}@example.com",
                "caseReference": case_reference,
                "caseName": f"{template.last_name}, {template.first_name} - Sample TSA",
                "addressLine1": f"{200 + idx} Market Street",
                "addressLine2": f"Suite {100 + idx}",
                "city": template.city,
                "postalCode": template.postal_code,
                "countryName": "USA",
                "demographicStateId": state_id,
                "demographicCountyId": county_id,
                "reasonForReferral": template.referral,
                "caseDiagnosis": template.diagnosis,
                "viprType": template.vipr_type,
                "evaluationYear": 2026,
                "notes": "Autogenerated sample case for wizard/export validation",
            },
            expected_status=201,
        )
        case_row = created_case.get("case", {})
        user_id = int(case_row["user_id"])

        source_dots = [
            dot_pool[(idx * 2) % len(dot_pool)],
            dot_pool[(idx * 2 + 1) % len(dot_pool)],
            dot_pool[(idx * 2 + 2) % len(dot_pool)],
        ]
        request_json(
            base_url,
            f"/api/cases/{user_id}/work-history-dots",
            method="PUT",
            body={"sourceDots": [{"dotCode": dot} for dot in source_dots]},
        )

        profiles_response = request_json(base_url, f"/api/cases/{user_id}/profiles")
        profiles = profiles_response.get("profiles", {})
        profile2 = list(profiles.get("profile2", default_profile))
        profile4 = list(profiles.get("profile4", default_profile))
        severity = (idx % 3) + 1
        profile4_adjusted = lower_profile(profile4, traits, severity)

        updated_profiles = request_json(
            base_url,
            f"/api/cases/{user_id}/profiles",
            method="PUT",
            body={
                "profile2": profile2,
                "profile4": profile4_adjusted,
                "clinicalOverrideMode": False,
                "enforceResidualCap": True,
            },
        ).get("profiles", {})
        final_profile4 = list(updated_profiles.get("profile4", profile4_adjusted))

        analysis = request_json(
            base_url,
            f"/api/cases/{user_id}/analysis/transferable",
            method="POST",
            body={},
        )
        analysis_rows = analysis.get("results", [])
        selected_dot = analysis_rows[0]["dot_code"] if analysis_rows else source_dots[0]

        if test_code:
            request_json(
                base_url,
                f"/api/users/{user_id}/psychometrics",
                method="POST",
                body={
                    "testCode": test_code,
                    "rawScore": 40 + idx,
                    "scaledScore": 95 + idx,
                    "percentile": 50 + idx,
                    "interpretation": "Autogenerated sample psychometric entry",
                },
                expected_status=201,
            )

        saved = request_json(
            base_url,
            "/api/reports/transferable-skills/save",
            method="POST",
            body={
                "userId": user_id,
                "label": f"Sample TSA {case_reference}",
                "q": "",
                "stateId": None,
                "countyId": None,
                "profile": final_profile4,
                "sourceDots": source_dots,
                "selectedDot": selected_dot,
                "limit": 30,
                "taskLimit": 20,
            },
            expected_status=201,
        )
        saved_report = saved.get("saved_report", {})
        saved_report_id = int(saved_report["saved_report_id"])
        expected_md_hash = str(saved.get("report_markdown_hash_sha256", ""))
        expected_html_hash = str(saved.get("render_html_hash_sha256", ""))

        validation = request_json(base_url, f"/api/reports/saved/{saved_report_id}/export/validate")
        assert_true(bool(validation.get("markdown_hash_matches")), f"markdown hash mismatch for case {case_reference}")
        assert_true(bool(validation.get("html_hash_matches")), f"html hash mismatch for case {case_reference}")
        assert_true(
            bool(validation.get("pdf_export_uses_same_html_source")),
            f"pdf/html parity mismatch for case {case_reference}",
        )
        assert_true(
            validation.get("computed_markdown_hash_sha256") == expected_md_hash,
            f"computed markdown hash mismatch for case {case_reference}",
        )
        assert_true(
            validation.get("computed_html_hash_sha256") == expected_html_hash,
            f"computed html hash mismatch for case {case_reference}",
        )

        packet = request_raw(base_url, f"/api/reports/saved/{saved_report_id}/export/case-packet")
        assert_true(packet["raw"].startswith(b"PK"), f"case packet is not zip for case {case_reference}")
        with zipfile.ZipFile(io.BytesIO(packet["raw"])) as archive:
            names = set(archive.namelist())
            required = {"report.json", "report.md", "report.html", "report.pdf", "manifest.json"}
            assert_true(required.issubset(names), f"case packet missing files for case {case_reference}")

        created_rows.append(
            {
                "user_id": user_id,
                "case_reference": case_reference,
                "name": f"{template.last_name}, {template.first_name}",
                "state": state_row.get("state_abbrev"),
                "county": county_name or "n/a",
                "source_dots": source_dots,
                "analysis_rows": len(analysis_rows),
                "saved_report_id": saved_report_id,
            }
        )

    print("")
    print("Created sample cases:")
    for row in created_rows:
        print(
            f"- user_id={row['user_id']} | case_ref={row['case_reference']} | "
            f"name={row['name']} | state={row['state']} | county={row['county']} | "
            f"source_dots={','.join(row['source_dots'])} | analysis_rows={row['analysis_rows']} | "
            f"saved_report_id={row['saved_report_id']}"
        )

    print("")
    print(f"Done. Seeded {len(created_rows)} sample cases with validated export parity.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
