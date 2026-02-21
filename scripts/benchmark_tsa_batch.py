#!/usr/bin/env python3
"""
Batch reliability/validity benchmark for MVQS TSA API.

Runs a large set of deterministic API checks against sampled source DOT + region
scenarios, validates invariants, and writes JSON + markdown summaries.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import sqlite3
import statistics
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


TRAIT_MINS = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]
STRENGTH_CAP_BY_DEFICIT = {0: 97, 1: 79, 2: 59, 3: 39, 4: 19}


def api_json(base_url: str, path: str, method: str = "GET", body: dict[str, Any] | None = None) -> dict[str, Any]:
    url = base_url.rstrip("/") + "/" + path.lstrip("/")
    data: bytes | None = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{method} {path} failed with {exc.code}: {payload[:500]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"{method} {path} failed: {exc.reason}") from exc


@dataclass
class Scenario:
    state_id: int
    county_id: int
    dot_code: str
    title: str
    trait_vector: str
    vq: float | None
    svp: int | None
    job_count: int


def sample_scenarios(db_path: Path, count: int, pool_limit: int, seed: int, min_job_count: int) -> list[Scenario]:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT
          cjc.state_id,
          cjc.county_id,
          cjc.dot_code,
          cjc.job_count,
          j.title,
          j.trait_vector,
          j.vq,
          j.svp
        FROM county_job_counts cjc
        JOIN jobs j ON j.dot_code = cjc.dot_code
        WHERE cjc.job_count >= ?
          AND j.trait_vector IS NOT NULL
          AND LENGTH(j.trait_vector) = 24
        ORDER BY cjc.job_count DESC, cjc.state_id ASC, cjc.county_id ASC, cjc.dot_code ASC
        LIMIT ?
        """,
        (min_job_count, pool_limit),
    ).fetchall()
    conn.close()

    if not rows:
        raise RuntimeError("No candidate scenarios found in database.")

    rng = random.Random(seed)
    sample_n = min(count, len(rows))
    selected = rng.sample(rows, sample_n)
    scenarios = [
        Scenario(
            state_id=int(row["state_id"]),
            county_id=int(row["county_id"]),
            dot_code=str(row["dot_code"]),
            title=str(row["title"] or ""),
            trait_vector=str(row["trait_vector"]),
            vq=float(row["vq"]) if row["vq"] is not None else None,
            svp=int(row["svp"]) if row["svp"] is not None else None,
            job_count=int(row["job_count"]),
        )
        for row in selected
    ]
    return scenarios


def profile_from_trait_vector(trait_vector: str) -> list[int]:
    if len(trait_vector) != 24 or any(ch < "0" or ch > "9" for ch in trait_vector):
        raise RuntimeError(f"Invalid trait vector: {trait_vector!r}")
    return [int(ch) for ch in trait_vector]


def tighten_profile(profile: list[int], mode: str) -> list[int]:
    reduced = list(profile)
    if mode == "all_traits":
        return [max(minimum, value - 1) for value, minimum in zip(profile, TRAIT_MINS)]

    if mode == "strength_only":
        index = 11  # PD1
        reduced[index] = max(TRAIT_MINS[index], reduced[index] - 1)
        return reduced

    if mode == "clinical_mild":
        # Mild residual profile reduction across selected cognitive/physical/environment traits.
        for index in [0, 1, 2, 11, 17]:
            reduced[index] = max(TRAIT_MINS[index], reduced[index] - 1)
        return reduced

    raise RuntimeError(f"Unsupported tighten mode: {mode}")


def sha_payload(payload: dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()


def percentile(values: list[float], pct: float) -> float | None:
    if not values:
        return None
    vals = sorted(values)
    k = (len(vals) - 1) * (pct / 100.0)
    floor_i = math.floor(k)
    ceil_i = math.ceil(k)
    if floor_i == ceil_i:
        return vals[int(k)]
    return vals[floor_i] * (ceil_i - k) + vals[ceil_i] * (k - floor_i)


def analyze_scenario(
    base_url: str,
    scenario: Scenario,
    limit_primary: int,
    limit_secondary: int,
    secondary_offset: int,
    tighten_mode: str,
) -> dict[str, Any]:
    base_body = {
        "sourceDots": [scenario.dot_code],
        "q": "",
        "stateId": scenario.state_id,
        "countyId": scenario.county_id,
        "offset": 0,
    }
    profile_hi = profile_from_trait_vector(scenario.trait_vector)
    profile_lo = tighten_profile(profile_hi, tighten_mode)

    hi_a = api_json(
        base_url,
        "/api/transferable-skills/analyze",
        method="POST",
        body={**base_body, "profile": profile_hi, "limit": limit_primary},
    )
    hi_b = api_json(
        base_url,
        "/api/transferable-skills/analyze",
        method="POST",
        body={**base_body, "profile": profile_hi, "limit": limit_primary},
    )
    hi_page = api_json(
        base_url,
        "/api/transferable-skills/analyze",
        method="POST",
        body={**base_body, "profile": profile_hi, "limit": limit_secondary, "offset": secondary_offset},
    )
    lo = api_json(
        base_url,
        "/api/transferable-skills/analyze",
        method="POST",
        body={**base_body, "profile": profile_lo, "limit": limit_primary},
    )

    deterministic = sha_payload(hi_a) == sha_payload(hi_b)

    results_hi = hi_a.get("results", [])
    results_lo = lo.get("results", [])

    gate_violation_count = 0
    for row in results_hi:
        signal_scores = row.get("signal_scores") or {}
        if signal_scores.get("profile_gate_failed") not in (0, 0.0, None):
            gate_violation_count += 1
        if not (float(row.get("tsp_percent") or 0) > 0):
            gate_violation_count += 1

    is_unskilled_source = (scenario.vq is not None and scenario.vq < 85) or (
        scenario.svp is not None and scenario.svp <= 2
    )
    unskilled_cap_violation = False
    if is_unskilled_source:
        max_tsp_hi = max((float(row.get("tsp_percent") or 0) for row in results_hi), default=0.0)
        if max_tsp_hi > 19.0001:
            unskilled_cap_violation = True

    total_hi = int(hi_a.get("total") or 0)
    total_lo = int(lo.get("total") or 0)
    monotonic_total_ok = total_lo <= total_hi

    hi_by_dot = {str(row.get("dot_code")): float(row.get("tsp_percent") or 0) for row in results_hi}
    monotonic_overlap_violation_count = 0
    for row in results_lo:
        dot_code = str(row.get("dot_code"))
        if dot_code not in hi_by_dot:
            continue
        if float(row.get("tsp_percent") or 0) > hi_by_dot[dot_code] + 1e-9:
            monotonic_overlap_violation_count += 1

    strength_cap_violation_count = 0
    for row in results_hi:
        deficit = row.get("strength_profile_deficit_levels")
        if deficit is None:
            continue
        deficit_level = min(max(int(deficit), 0), 4)
        cap = STRENGTH_CAP_BY_DEFICIT[deficit_level]
        if float(row.get("tsp_percent") or 0) > cap + 1e-9:
            strength_cap_violation_count += 1

    aggregate_hi = hi_a.get("aggregate") or {}
    aggregate_page = hi_page.get("aggregate") or {}
    aggregate_consistent = (
        aggregate_hi.get("result_count") == aggregate_page.get("result_count")
        and aggregate_hi.get("average_tsp_percent") == aggregate_page.get("average_tsp_percent")
        and aggregate_hi.get("average_va_adjustment_percent") == aggregate_page.get("average_va_adjustment_percent")
        and hi_a.get("tsp_band_counts") == hi_page.get("tsp_band_counts")
        and hi_a.get("total") == hi_page.get("total")
    )

    return {
        "scenario": {
            "state_id": scenario.state_id,
            "county_id": scenario.county_id,
            "source_dot": scenario.dot_code,
            "source_title": scenario.title,
            "source_vq": scenario.vq,
            "source_svp": scenario.svp,
            "source_job_count": scenario.job_count,
        },
        "profiles": {"high": profile_hi, "low": profile_lo},
        "totals": {"high": total_hi, "low": total_lo},
        "aggregates": {"high": aggregate_hi, "page_check": aggregate_page},
        "checks": {
            "deterministic": deterministic,
            "gate_violation_count": gate_violation_count,
            "unskilled_source": bool(is_unskilled_source),
            "unskilled_cap_violation": bool(unskilled_cap_violation),
            "monotonic_total_ok": monotonic_total_ok,
            "monotonic_overlap_violation_count": monotonic_overlap_violation_count,
            "strength_cap_violation_count": strength_cap_violation_count,
            "aggregate_consistent_across_pages": bool(aggregate_consistent),
        },
    }


def summarize_cases(cases: list[dict[str, Any]]) -> dict[str, Any]:
    total_cases = len(cases)
    if total_cases == 0:
        return {
            "cases_total": 0,
            "deterministic_pass": 0,
            "deterministic_fail": 0,
            "gate_invariant_fail": 0,
            "unskilled_cap_fail": 0,
            "monotonic_total_fail": 0,
            "monotonic_overlap_fail": 0,
            "strength_cap_fail": 0,
            "aggregate_consistency_fail": 0,
        }

    deterministic_pass = sum(1 for case in cases if case["checks"]["deterministic"])
    gate_fail = sum(1 for case in cases if int(case["checks"]["gate_violation_count"]) > 0)
    unskilled_fail = sum(1 for case in cases if case["checks"]["unskilled_cap_violation"])
    monotonic_total_fail = sum(1 for case in cases if not case["checks"]["monotonic_total_ok"])
    monotonic_overlap_fail = sum(
        1 for case in cases if int(case["checks"]["monotonic_overlap_violation_count"]) > 0
    )
    strength_cap_fail = sum(1 for case in cases if int(case["checks"]["strength_cap_violation_count"]) > 0)
    aggregate_fail = sum(1 for case in cases if not case["checks"]["aggregate_consistent_across_pages"])

    totals_high = [int(case["totals"]["high"]) for case in cases]
    totals_low = [int(case["totals"]["low"]) for case in cases]
    avg_tsp_high = [
        float(case["aggregates"]["high"].get("average_tsp_percent"))
        for case in cases
        if case["aggregates"]["high"].get("average_tsp_percent") is not None
    ]

    return {
        "cases_total": total_cases,
        "deterministic_pass": deterministic_pass,
        "deterministic_fail": total_cases - deterministic_pass,
        "gate_invariant_fail": gate_fail,
        "unskilled_cap_fail": unskilled_fail,
        "monotonic_total_fail": monotonic_total_fail,
        "monotonic_overlap_fail": monotonic_overlap_fail,
        "strength_cap_fail": strength_cap_fail,
        "aggregate_consistency_fail": aggregate_fail,
        "totals_high": {
            "mean": round(statistics.mean(totals_high), 2),
            "median": statistics.median(totals_high),
            "p90": percentile([float(v) for v in totals_high], 90),
            "max": max(totals_high),
            "min": min(totals_high),
        },
        "totals_low": {
            "mean": round(statistics.mean(totals_low), 2),
            "median": statistics.median(totals_low),
            "p90": percentile([float(v) for v in totals_low], 90),
            "max": max(totals_low),
            "min": min(totals_low),
        },
        "average_tsp_high": {
            "mean": round(statistics.mean(avg_tsp_high), 3) if avg_tsp_high else None,
            "median": statistics.median(avg_tsp_high) if avg_tsp_high else None,
            "p90": percentile(avg_tsp_high, 90) if avg_tsp_high else None,
            "max": max(avg_tsp_high) if avg_tsp_high else None,
            "min": min(avg_tsp_high) if avg_tsp_high else None,
        },
    }


def markdown_report(
    payload: dict[str, Any], json_path: Path, args: argparse.Namespace, error_examples: list[dict[str, Any]]
) -> str:
    summary = payload["summary"]
    readiness = payload["readiness"]
    health = payload["health"]
    lines: list[str] = []
    lines.append("# MVQS TSA 200-Case Batch Validation")
    lines.append("")
    lines.append(f"- Generated: {payload['generated_at_utc']}")
    lines.append(f"- Base URL: `{args.base_url}`")
    lines.append(f"- DB Path: `{args.db_path}`")
    lines.append(f"- Cases Requested: {args.count}")
    lines.append(f"- Cases Run: {summary['cases_total']}")
    lines.append(f"- Seed: {args.seed}")
    lines.append(f"- Tighten Mode: {args.tighten_mode}")
    lines.append(f"- Raw JSON: `{json_path}`")
    lines.append("")
    lines.append("## Health and Readiness")
    lines.append("")
    lines.append(f"- `/api/health.ok`: {health.get('ok')}")
    lines.append(f"- `/api/readiness.overall_status`: {readiness.get('overall_status')}")
    lines.append(f"- `/api/readiness.blocking`: {readiness.get('blocking')}")
    lines.append("")
    lines.append("## Reliability Checks")
    lines.append("")
    lines.append(f"- Deterministic pass/fail: {summary['deterministic_pass']}/{summary['deterministic_fail']}")
    lines.append(f"- Gate invariant failures: {summary['gate_invariant_fail']}")
    lines.append(f"- Unskilled cap failures: {summary['unskilled_cap_fail']}")
    lines.append(f"- Monotonic total failures: {summary['monotonic_total_fail']}")
    lines.append(f"- Monotonic overlap failures: {summary['monotonic_overlap_fail']}")
    lines.append(f"- Strength cap failures: {summary['strength_cap_fail']}")
    lines.append(f"- Aggregate pagination consistency failures: {summary['aggregate_consistency_fail']}")
    lines.append("")
    lines.append("## Distribution Stats")
    lines.append("")
    lines.append(
        f"- High-profile totals: mean={summary['totals_high']['mean']}, median={summary['totals_high']['median']}, "
        f"p90={summary['totals_high']['p90']}, min={summary['totals_high']['min']}, max={summary['totals_high']['max']}"
    )
    lines.append(
        f"- Low-profile totals: mean={summary['totals_low']['mean']}, median={summary['totals_low']['median']}, "
        f"p90={summary['totals_low']['p90']}, min={summary['totals_low']['min']}, max={summary['totals_low']['max']}"
    )
    lines.append(
        f"- High-profile average TSP: mean={summary['average_tsp_high']['mean']}, median={summary['average_tsp_high']['median']}, "
        f"p90={summary['average_tsp_high']['p90']}, min={summary['average_tsp_high']['min']}, max={summary['average_tsp_high']['max']}"
    )
    lines.append("")
    lines.append("## Notes")
    lines.append("")
    lines.append(
        "- If all failure counters are zero, the computation is highly stable for repeatability and rule invariants under this 200-case sample."
    )
    lines.append(
        "- This benchmark validates internal consistency and constraints, not external ground-truth parity for every case."
    )
    if error_examples:
        lines.append("")
        lines.append("## Failure Examples")
        lines.append("")
        for example in error_examples[:10]:
            lines.append(
                f"- DOT {example['scenario']['source_dot']} ({example['scenario']['state_id']}/{example['scenario']['county_id']}): {example['reason']}"
            )
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Run large-batch TSA reliability benchmark.")
    parser.add_argument("--base-url", default="http://localhost:4173")
    parser.add_argument(
        "--db-path",
        default="/Users/chrisskerritt/Downloads/MVQS/data/mvqs-modern.db",
        help="Path to MVQS SQLite database.",
    )
    parser.add_argument("--count", type=int, default=200, help="Number of scenarios to test.")
    parser.add_argument(
        "--pool-limit",
        type=int,
        default=50000,
        help="Candidate pool size sampled from top county job counts.",
    )
    parser.add_argument("--seed", type=int, default=20260216, help="Random seed.")
    parser.add_argument("--min-job-count", type=int, default=1, help="Minimum county job_count for sampling.")
    parser.add_argument("--limit-primary", type=int, default=100, help="Primary API limit for full-page checks.")
    parser.add_argument("--limit-secondary", type=int, default=40, help="Secondary API limit for aggregate consistency checks.")
    parser.add_argument("--secondary-offset", type=int, default=20, help="Secondary API offset for aggregate consistency checks.")
    parser.add_argument(
        "--tighten-mode",
        choices=["all_traits", "strength_only", "clinical_mild"],
        default="clinical_mild",
        help="How to build the reduced profile used for monotonic checks.",
    )
    parser.add_argument(
        "--output-json",
        default="/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_200_metrics.json",
        help="JSON output path.",
    )
    parser.add_argument(
        "--output-md",
        default="/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_200_report.md",
        help="Markdown output path.",
    )
    args = parser.parse_args()

    db_path = Path(args.db_path)
    if not db_path.exists():
        raise SystemExit(f"Database path does not exist: {db_path}")

    health = api_json(args.base_url, "/api/health")
    readiness = api_json(args.base_url, "/api/readiness")
    scenarios = sample_scenarios(
        db_path=db_path,
        count=args.count,
        pool_limit=args.pool_limit,
        seed=args.seed,
        min_job_count=args.min_job_count,
    )

    case_results: list[dict[str, Any]] = []
    failure_examples: list[dict[str, Any]] = []
    for index, scenario in enumerate(scenarios, start=1):
        try:
            result = analyze_scenario(
                base_url=args.base_url,
                scenario=scenario,
                limit_primary=args.limit_primary,
                limit_secondary=args.limit_secondary,
                secondary_offset=args.secondary_offset,
                tighten_mode=args.tighten_mode,
            )
            case_results.append(result)
            checks = result["checks"]
            reason = None
            if not checks["deterministic"]:
                reason = "non-deterministic output"
            elif checks["gate_violation_count"] > 0:
                reason = "profile gate invariant violation"
            elif checks["unskilled_cap_violation"]:
                reason = "unskilled cap violation"
            elif not checks["monotonic_total_ok"]:
                reason = "monotonic total violation"
            elif checks["monotonic_overlap_violation_count"] > 0:
                reason = "monotonic overlap violation"
            elif checks["strength_cap_violation_count"] > 0:
                reason = "strength cap violation"
            elif not checks["aggregate_consistent_across_pages"]:
                reason = "aggregate pagination mismatch"
            if reason:
                failure_examples.append({"scenario": result["scenario"], "reason": reason})
        except Exception as exc:
            failure_examples.append(
                {
                    "scenario": {
                        "state_id": scenario.state_id,
                        "county_id": scenario.county_id,
                        "source_dot": scenario.dot_code,
                    },
                    "reason": f"runtime_error: {exc}",
                }
            )

        if index % 25 == 0:
            print(f"Processed {index}/{len(scenarios)} scenarios...", file=sys.stderr)

    summary = summarize_cases(case_results)
    payload: dict[str, Any] = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "health": health,
        "readiness": readiness,
        "benchmark_config": {
            "count_requested": args.count,
            "pool_limit": args.pool_limit,
            "seed": args.seed,
            "min_job_count": args.min_job_count,
            "limit_primary": args.limit_primary,
            "limit_secondary": args.limit_secondary,
            "secondary_offset": args.secondary_offset,
            "tighten_mode": args.tighten_mode,
        },
        "summary": summary,
        "failures": failure_examples,
        "cases": case_results,
    }

    output_json = Path(args.output_json)
    output_md = Path(args.output_md)
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    output_md.write_text(markdown_report(payload, output_json, args, failure_examples), encoding="utf-8")

    print(f"Wrote JSON: {output_json}")
    print(f"Wrote report: {output_md}")
    print(json.dumps(summary, indent=2))
    if failure_examples:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
