#!/usr/bin/env python3
"""
Deep TSA adjustment/math test suite for MVQS.

Focus:
- transferability formula parity vs API outputs
- profile adjustment behaviors (Profile1/2/3/4 derivation and residual caps)
- case analysis pre/post summary correctness
- multi-source best-source selection correctness
- unskilled cap and same-dot perfect-match behavior
- pagination aggregate consistency
- deterministic replay
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import sqlite3
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


TRAITS = [
    {"code": "GEDR", "min": 1, "max": 6},
    {"code": "GEDM", "min": 1, "max": 6},
    {"code": "GEDL", "min": 1, "max": 6},
    {"code": "APTS", "min": 1, "max": 5},
    {"code": "APTP", "min": 1, "max": 5},
    {"code": "APTQ", "min": 1, "max": 5},
    {"code": "APTK", "min": 1, "max": 5},
    {"code": "APTF", "min": 1, "max": 5},
    {"code": "APTM", "min": 1, "max": 5},
    {"code": "APTE", "min": 1, "max": 5},
    {"code": "APTC", "min": 1, "max": 5},
    {"code": "PD1", "min": 1, "max": 5},
    {"code": "PD2", "min": 0, "max": 1},
    {"code": "PD3", "min": 0, "max": 1},
    {"code": "PD4", "min": 0, "max": 1},
    {"code": "PD5", "min": 0, "max": 1},
    {"code": "PD6", "min": 0, "max": 1},
    {"code": "EC1", "min": 1, "max": 3},
    {"code": "EC2", "min": 0, "max": 1},
    {"code": "EC3", "min": 0, "max": 1},
    {"code": "EC4", "min": 0, "max": 1},
    {"code": "EC5", "min": 0, "max": 1},
    {"code": "EC6", "min": 0, "max": 1},
    {"code": "EC7", "min": 0, "max": 1},
]
DEFAULT_PROFILE = [3, 2, 2, 2, 3, 2, 3, 2, 3, 2, 2, 2, 0, 0, 1, 0, 1, 2, 0, 0, 0, 1, 0, 0]
TSP_LEVELS = [
    {"level": 5, "min": 80, "max": 97},
    {"level": 4, "min": 60, "max": 79.9},
    {"level": 3, "min": 40, "max": 59.9},
    {"level": 2, "min": 20, "max": 39.9},
    {"level": 1, "min": 0, "max": 19.9},
]
STRENGTH_TRAIT_INDEX = 11
STRENGTH_CAP_BY_PROFILE_DEFICIT = [97, 79, 59, 39, 19]


class ApiClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def request_json(
        self,
        path: str,
        method: str = "GET",
        body: dict[str, Any] | None = None,
        expected_status: int = 200,
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
                if response.status != expected_status:
                    raise RuntimeError(f"{method} {path}: expected {expected_status}, got {response.status}")
                return json.loads(raw)
        except urllib.error.HTTPError as exc:
            payload = exc.read().decode("utf-8", errors="replace")
            if exc.code == expected_status:
                return json.loads(payload)
            raise RuntimeError(f"{method} {path} failed {exc.code}: {payload[:500]}") from exc


@dataclass
class JobRow:
    state_id: int
    county_id: int
    dot_code: str
    title: str
    trait_vector: str
    vq: float | None
    svp: int | None
    onet_ou_code: str | None
    job_count: int


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def clamp_int(value: Any, min_value: int, max_value: int, fallback: int) -> int:
    try:
        numeric = int(value)
    except Exception:
        numeric = fallback
    return max(min_value, min(max_value, numeric))


def parse_profile(values: list[int] | None) -> list[int]:
    profile = values if isinstance(values, list) and len(values) == len(TRAITS) else DEFAULT_PROFILE
    out: list[int] = []
    for index, trait in enumerate(TRAITS):
        out.append(clamp_int(profile[index], trait["min"], trait["max"], DEFAULT_PROFILE[index]))
    return out


def parse_trait_vector(raw_value: str | None) -> list[int] | None:
    if not raw_value:
        return None
    value = str(raw_value).strip()
    if len(value) != len(TRAITS) or any(ch < "0" or ch > "9" for ch in value):
        return None
    return [int(ch) for ch in value]


def js_round(value: float) -> int:
    if value >= 0:
        return math.floor(value + 0.5)
    return math.ceil(value - 0.5)


def round1(value: float) -> float:
    return js_round(value * 10.0) / 10.0


def round3(value: float) -> float:
    return js_round(value * 1000.0) / 1000.0


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def normalize_dot(value: str | None) -> str:
    if value is None:
        return ""
    digits = "".join(ch for ch in str(value) if ch.isdigit())
    if not digits:
        return ""
    digits = ("0" * 9 + digits)[-9:]
    return digits


def normalize_onet_code(value: str | None) -> str:
    if value is None:
        return ""
    return "".join(ch for ch in str(value).upper() if ch.isalnum())


def shared_prefix_length(lhs: str, rhs: str, max_length: int | None = None) -> int:
    limit = min(len(lhs), len(rhs))
    if max_length is not None:
        limit = min(limit, max_length)
    index = 0
    while index < limit and lhs[index] == rhs[index]:
        index += 1
    return index


def score_dot_prefix(source_dot: str | None, target_dot: str | None) -> float:
    lhs = normalize_dot(source_dot)
    rhs = normalize_dot(target_dot)
    if not lhs or not rhs:
        return 0.0
    prefix = shared_prefix_length(lhs, rhs, 3)
    if prefix >= 3:
        return 1.0
    if prefix == 2:
        return 0.67
    if prefix == 1:
        return 0.33
    return 0.0


def score_onet_prefix(source_onet: str | None, target_onet: str | None) -> float:
    lhs = normalize_onet_code(source_onet)
    rhs = normalize_onet_code(target_onet)
    if not lhs or not rhs:
        return 0.0
    if lhs == rhs:
        return 1.0
    prefix = shared_prefix_length(lhs, rhs, 4)
    if prefix >= 4:
        return 0.75
    if prefix >= 2:
        return 0.45
    return 0.0


def score_scalar_proximity(source_value: Any, target_value: Any, max_delta: float, fallback: float = 0.5) -> float:
    try:
        lhs = float(source_value)
        rhs = float(target_value)
        if not math.isfinite(lhs) or not math.isfinite(rhs):
            return fallback
    except Exception:
        return fallback
    return clamp01(1 - abs(lhs - rhs) / max_delta)


def derive_mtsp_tier(source_job: dict[str, Any], target_job: dict[str, Any], target_vq: float | None) -> dict[str, Any]:
    source_dot = normalize_dot(source_job.get("dot_code"))
    target_dot = normalize_dot(target_job.get("dot_code"))
    source_onet = normalize_onet_code(source_job.get("onet_ou_code"))
    target_onet = normalize_onet_code(target_job.get("onet_ou_code"))

    dot_prefix = shared_prefix_length(source_dot, target_dot, 3)
    onet_prefix = shared_prefix_length(source_onet, target_onet)
    dot1 = dot_prefix >= 1
    dot2 = dot_prefix >= 2
    dot3 = dot_prefix >= 3
    onet2 = onet_prefix >= 2
    onet4 = onet_prefix >= 4
    onet_full = bool(source_onet and target_onet and source_onet == target_onet)

    if target_vq is not None and target_vq < 85:
        return {
            "level": 1,
            "min": 0,
            "max": 19,
            "rule": "target_vq_below_85",
            "dot_prefix_length": dot_prefix,
            "onet_prefix_length": onet_prefix,
        }
    if dot3 and onet_full:
        return {
            "level": 5,
            "min": 80,
            "max": 97,
            "rule": "dot3_and_onet_full",
            "dot_prefix_length": dot_prefix,
            "onet_prefix_length": onet_prefix,
        }
    if dot3 or onet_full or (dot2 and onet4):
        return {
            "level": 4,
            "min": 60,
            "max": 79,
            "rule": "dot3_or_onet_full_or_dot2_onet4",
            "dot_prefix_length": dot_prefix,
            "onet_prefix_length": onet_prefix,
        }
    if dot2 or onet4 or (dot1 and onet2):
        return {
            "level": 3,
            "min": 40,
            "max": 59,
            "rule": "dot2_or_onet4_or_dot1_onet2",
            "dot_prefix_length": dot_prefix,
            "onet_prefix_length": onet_prefix,
        }
    return {
        "level": 2,
        "min": 20,
        "max": 39,
        "rule": "limited_prefix_overlap",
        "dot_prefix_length": dot_prefix,
        "onet_prefix_length": onet_prefix,
    }


def score_trait_similarity(source_trait_vector: str | None, target_trait_vector: str | None) -> float:
    source = parse_trait_vector(source_trait_vector)
    target = parse_trait_vector(target_trait_vector)
    if not source or not target:
        return 0.0
    total = 0.0
    for index, trait in enumerate(TRAITS):
        rng = max(1, trait["max"] - trait["min"])
        diff = abs(source[index] - target[index])
        total += clamp01(1 - diff / rng)
    return total / len(TRAITS)


def score_trait_coverage(source_trait_vector: str | None, target_trait_vector: str | None) -> tuple[float, float]:
    source = parse_trait_vector(source_trait_vector)
    target = parse_trait_vector(target_trait_vector)
    if not source or not target:
        return 0.0, 1.0
    meets = 0
    total_deficit = 0.0
    for index, trait in enumerate(TRAITS):
        rng = max(1, trait["max"] - trait["min"])
        deficit = max(0, target[index] - source[index])
        if deficit == 0:
            meets += 1
        total_deficit += deficit / rng
    return meets / len(TRAITS), total_deficit / len(TRAITS)


def score_profile_compatibility(profile: list[int], target_trait_vector: str | None) -> tuple[bool, float, float]:
    target = parse_trait_vector(target_trait_vector)
    if not target:
        return False, 1.0, 0.0
    profile_values = parse_profile(profile)
    meets = 0
    total_deficit = 0.0
    for index, trait in enumerate(TRAITS):
        rng = max(1, trait["max"] - trait["min"])
        deficit = max(0, target[index] - profile_values[index])
        if deficit == 0:
            meets += 1
        total_deficit += deficit / rng
    deficit_ratio = total_deficit / len(TRAITS)
    compatibility = clamp01(1 - deficit_ratio)
    return True, compatibility, deficit_ratio


def resolve_strength_level_from_trait_vector(raw_trait_vector: str | None) -> int | None:
    values = parse_trait_vector(raw_trait_vector)
    if not values:
        return None
    return int(values[STRENGTH_TRAIT_INDEX])


def resolve_strength_level_from_profile(profile: list[int]) -> int:
    trait = TRAITS[STRENGTH_TRAIT_INDEX]
    return clamp_int(profile[STRENGTH_TRAIT_INDEX], trait["min"], trait["max"], DEFAULT_PROFILE[STRENGTH_TRAIT_INDEX])


def compute_strength_signals(source_trait_vector: str | None, target_trait_vector: str | None, profile: list[int]) -> dict[str, Any]:
    source_strength = resolve_strength_level_from_trait_vector(source_trait_vector)
    target_strength = resolve_strength_level_from_trait_vector(target_trait_vector)
    profile_strength = resolve_strength_level_from_profile(profile)

    source_to_target = score_scalar_proximity(source_strength, target_strength, 4, 0.5)

    source_deficit = None
    source_fit = 0.5
    if source_strength is not None and target_strength is not None:
        source_deficit = max(0, target_strength - source_strength)
        source_fit = clamp01(1 - source_deficit / 4)
    source_multiplier = 0.45 + source_fit * 0.55

    profile_deficit = None
    profile_fit = None
    profile_multiplier = 1.0
    max_tsp_cap_percent = 97
    if target_strength is not None:
        profile_deficit = max(0, target_strength - profile_strength)
        profile_fit = clamp01(1 - profile_deficit / 4)
        profile_multiplier = 0.35 + profile_fit * 0.65
        max_tsp_cap_percent = STRENGTH_CAP_BY_PROFILE_DEFICIT[min(profile_deficit, 4)]

    combined = clamp01(source_multiplier * profile_multiplier)
    return {
        "source_strength": source_strength,
        "target_strength": target_strength,
        "profile_strength": profile_strength,
        "source_deficit": source_deficit,
        "profile_deficit": profile_deficit,
        "profile_fit": profile_fit,
        "source_to_target": source_to_target,
        "in_tier_multiplier": combined,
        "unadjusted_multiplier": combined,
        "max_tsp_cap_percent": max_tsp_cap_percent,
    }


def is_unskilled_source_job(source_vq: float | None, source_svp: int | None) -> bool:
    if source_vq is not None and source_vq < 85:
        return True
    if source_svp is not None and source_svp <= 2:
        return True
    return False


def classify_tsp_level(tsp_percent: float) -> int:
    clamped = min(97.0, max(0.0, float(tsp_percent)))
    for row in TSP_LEVELS:
        if clamped >= row["min"] and clamped <= row["max"]:
            return int(row["level"])
    return 1


def classify_transfer_direction(source_vq: float | None, target_vq: float | None) -> str:
    if source_vq is None or target_vq is None:
        return "unknown"
    delta = target_vq - source_vq
    if delta >= 5:
        return "upward"
    if delta <= -5:
        return "downward"
    return "lateral"


def compute_transferability_signals(source_job: dict[str, Any], target_job: dict[str, Any], profile: list[int]) -> dict[str, Any]:
    source_vq = float(source_job["vq"]) if source_job.get("vq") is not None else None
    target_vq = float(target_job["vq"]) if target_job.get("vq") is not None else None
    source_svp = int(source_job["svp"]) if source_job.get("svp") is not None else None
    target_svp = int(target_job["svp"]) if target_job.get("svp") is not None else None

    trait_similarity = score_trait_similarity(source_job.get("trait_vector"), target_job.get("trait_vector"))
    trait_coverage_ratio, trait_deficit_ratio = score_trait_coverage(source_job.get("trait_vector"), target_job.get("trait_vector"))
    profile_available, profile_compatibility, profile_deficit_ratio = score_profile_compatibility(profile, target_job.get("trait_vector"))
    dot_prefix_score = score_dot_prefix(source_job.get("dot_code"), target_job.get("dot_code"))
    onet_prefix_score = score_onet_prefix(source_job.get("onet_ou_code"), target_job.get("onet_ou_code"))
    vq_proximity = score_scalar_proximity(source_vq, target_vq, 60, 0.5)
    svp_proximity = score_scalar_proximity(source_svp, target_svp, 8, 0.5)
    strength = compute_strength_signals(source_job.get("trait_vector"), target_job.get("trait_vector"), profile)
    tier = derive_mtsp_tier(source_job, target_job, target_vq)

    unadjusted_weighted_score = (
        trait_similarity * 0.3
        + trait_coverage_ratio * 0.16
        + dot_prefix_score * 0.14
        + onet_prefix_score * 0.14
        + vq_proximity * 0.08
        + svp_proximity * 0.06
        + strength["source_to_target"] * 0.12
    )

    tier_core_score = clamp01(
        dot_prefix_score * 0.38
        + onet_prefix_score * 0.22
        + vq_proximity * 0.15
        + svp_proximity * 0.10
        + strength["source_to_target"] * 0.15
    )
    in_tier_progress = tier_core_score
    if tier["level"] == 5:
        in_tier_progress = clamp01(in_tier_progress - 0.10)
    elif 2 <= tier["level"] <= 4:
        in_tier_progress = clamp01(in_tier_progress - 0.45)
    if profile_available:
        profile_multiplier = 0.65 + profile_compatibility * 0.35
        in_tier_progress = clamp01(in_tier_progress * profile_multiplier)
    in_tier_progress = clamp01(in_tier_progress * strength["in_tier_multiplier"])
    strength_adjusted_unadjusted = clamp01(unadjusted_weighted_score * strength["unadjusted_multiplier"])

    source_unskilled_cap_applied = is_unskilled_source_job(source_vq, source_svp)
    profile_gate_failed = profile_available and profile_deficit_ratio > 0

    tsp_percent = round1(tier["min"] + in_tier_progress * (tier["max"] - tier["min"]))
    tsp_unadjusted_percent = round1(tier["min"] + strength_adjusted_unadjusted * (tier["max"] - tier["min"]))

    if tier["level"] == 1:
        unskilled_score = (
            dot_prefix_score * 0.5
            + onet_prefix_score * 0.25
            + vq_proximity * 0.15
            + svp_proximity * 0.1
        )
        unskilled_percent = round1(min(19.0, max(0.0, unskilled_score * 19.0)))
        tsp_percent = unskilled_percent
        tsp_unadjusted_percent = unskilled_percent

    max_tsp_cap = float(strength["max_tsp_cap_percent"])
    tsp_percent = round1(min(tsp_percent, max_tsp_cap))
    tsp_unadjusted_percent = round1(min(tsp_unadjusted_percent, max_tsp_cap))

    if source_unskilled_cap_applied:
        tsp_percent = round1(min(tsp_percent, 19.0))
        tsp_unadjusted_percent = round1(min(tsp_unadjusted_percent, 19.0))

    if profile_gate_failed:
        tsp_percent = 0.0
        tsp_unadjusted_percent = 0.0

    same_dot = source_job.get("dot_code") == target_job.get("dot_code")
    same_dot_perfect_match_allowed = (
        bool(same_dot)
        and not source_unskilled_cap_applied
        and not profile_gate_failed
        and (not profile_available or profile_deficit_ratio == 0)
        and (strength["profile_deficit"] is None or strength["profile_deficit"] == 0)
    )
    if same_dot_perfect_match_allowed:
        tsp_percent = 97.0
        tsp_unadjusted_percent = 97.0

    adjustment_gap = max(0.0, tsp_unadjusted_percent - tsp_percent)
    va_adjustment_percent = round1(max(0.0, min(39.0, adjustment_gap * 1.1 - 1.0)))
    if same_dot_perfect_match_allowed:
        va_adjustment_percent = 0.0

    return {
        "tsp_percent": tsp_percent,
        "tsp_percent_unadjusted": tsp_unadjusted_percent,
        "va_adjustment_percent": va_adjustment_percent,
        "tsp_level": classify_tsp_level(tsp_percent),
        "mtsp_tier_rule": tier["rule"],
        "transfer_direction": classify_transfer_direction(source_vq, target_vq),
        "best_source_dot_code": source_job.get("dot_code"),
        "strength_profile_deficit_levels": strength["profile_deficit"],
        "source_unskilled_cap_applied": 1 if source_unskilled_cap_applied else 0,
        "profile_gate_failed": 1 if profile_gate_failed else 0,
        "signal_scores": {
            "trait_similarity": round3(trait_similarity),
            "trait_coverage": round3(trait_coverage_ratio),
            "trait_deficit_ratio": round3(trait_deficit_ratio),
            "profile_compatibility": round3(profile_compatibility) if profile_available else None,
            "profile_deficit_ratio": round3(profile_deficit_ratio) if profile_available else None,
            "dot_prefix": round3(dot_prefix_score),
            "onet_prefix": round3(onet_prefix_score),
            "vq_proximity": round3(vq_proximity),
            "svp_proximity": round3(svp_proximity),
            "strength_source_to_target": round3(strength["source_to_target"]),
            "strength_source_level": strength["source_strength"],
            "strength_target_level": strength["target_strength"],
            "strength_profile_level": strength["profile_strength"],
            "strength_source_deficit_levels": strength["source_deficit"],
            "strength_profile_deficit_levels": strength["profile_deficit"],
            "strength_profile_fit": round3(strength["profile_fit"]) if strength["profile_fit"] is not None else None,
            "strength_in_tier_multiplier": round3(strength["in_tier_multiplier"]),
            "strength_unadjusted_multiplier": round3(strength["unadjusted_multiplier"]),
            "strength_tsp_cap_percent": strength["max_tsp_cap_percent"],
            "profile_gate_failed": 1 if profile_gate_failed else 0,
            "source_unskilled_cap_applied": 1 if source_unskilled_cap_applied else 0,
            "tier_core_score": round3(tier_core_score),
            "in_tier_progress": round3(in_tier_progress),
            "dot_prefix_length": tier["dot_prefix_length"],
            "onet_prefix_length": tier["onet_prefix_length"],
        },
    }


def sha_json(payload: dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()


def signal_weight(signal_scores: dict[str, Any] | None) -> float:
    if not isinstance(signal_scores, dict):
        return 0.0
    total = 0.0
    for value in signal_scores.values():
        try:
            numeric = float(value)
        except Exception:
            continue
        if math.isfinite(numeric):
            total += numeric
    return total


def update_error_metric(bucket: dict[str, Any], actual: float, expected: float) -> None:
    err = actual - expected
    abs_err = abs(err)
    bucket["count"] += 1
    bucket["sum"] += err
    bucket["sum_abs"] += abs_err
    bucket["sum_sq"] += err * err
    if abs_err > bucket["max_abs"]:
        bucket["max_abs"] = abs_err
    if abs_err <= 1e-6:
        bucket["exact_count"] += 1


def finalize_error_metric(bucket: dict[str, Any]) -> dict[str, Any]:
    count = int(bucket["count"])
    if count <= 0:
        return {
            "count": 0,
            "mean_error": None,
            "mae": None,
            "rmse": None,
            "std_dev": None,
            "std_error_mean": None,
            "max_abs_error": None,
            "exact_match_rate": None,
        }
    mean_error = bucket["sum"] / count
    mae = bucket["sum_abs"] / count
    rmse = math.sqrt(bucket["sum_sq"] / count)
    if count > 1:
        variance = max(0.0, (bucket["sum_sq"] - count * mean_error * mean_error) / (count - 1))
        std_dev = math.sqrt(variance)
        std_error_mean = std_dev / math.sqrt(count)
    else:
        std_dev = 0.0
        std_error_mean = 0.0
    return {
        "count": count,
        "mean_error": round6(mean_error),
        "mae": round6(mae),
        "rmse": round6(rmse),
        "std_dev": round6(std_dev),
        "std_error_mean": round6(std_error_mean),
        "max_abs_error": round6(bucket["max_abs"]),
        "exact_match_rate": round6(bucket["exact_count"] / count),
    }


def round6(value: float) -> float:
    return js_round(value * 1_000_000.0) / 1_000_000.0


def load_pool(db_path: Path, pool_limit: int, min_job_count: int) -> list[JobRow]:
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
          j.svp,
          j.onet_ou_code
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
    return [
        JobRow(
            state_id=int(row["state_id"]),
            county_id=int(row["county_id"]),
            dot_code=str(row["dot_code"]),
            title=str(row["title"] or ""),
            trait_vector=str(row["trait_vector"]),
            vq=float(row["vq"]) if row["vq"] is not None else None,
            svp=int(row["svp"]) if row["svp"] is not None else None,
            onet_ou_code=str(row["onet_ou_code"]) if row["onet_ou_code"] is not None else None,
            job_count=int(row["job_count"]),
        )
        for row in rows
    ]


def build_job_map(pool: list[JobRow]) -> dict[str, JobRow]:
    return {row.dot_code: row for row in pool}


def max_profile(a: list[int], b: list[int]) -> list[int]:
    out: list[int] = []
    for index, trait in enumerate(TRAITS):
        out.append(max(clamp_int(a[index], trait["min"], trait["max"], DEFAULT_PROFILE[index]), clamp_int(b[index], trait["min"], trait["max"], DEFAULT_PROFILE[index])))
    return out


def residual_percent(pre: int, post: int) -> int:
    if pre <= 0:
        return 100
    return int(js_round((post / pre) * 100))


def main() -> int:
    parser = argparse.ArgumentParser(description="MVQS TSA adjustment math deep tests.")
    parser.add_argument("--base-url", default="http://localhost:4173")
    parser.add_argument("--db-path", default="/Users/chrisskerritt/Downloads/MVQS/data/mvqs-modern.db")
    parser.add_argument("--seed", type=int, default=20260216)
    parser.add_argument("--pool-limit", type=int, default=12000)
    parser.add_argument("--min-job-count", type=int, default=1)
    parser.add_argument("--formula-scenarios", type=int, default=200)
    parser.add_argument("--formula-rows-per-scenario", type=int, default=40)
    parser.add_argument("--multisource-scenarios", type=int, default=90)
    parser.add_argument("--multisource-targets-per-scenario", type=int, default=10)
    parser.add_argument("--case-scenarios", type=int, default=32)
    parser.add_argument("--unskilled-scenarios", type=int, default=120)
    parser.add_argument("--same-dot-skilled-scenarios", type=int, default=80)
    parser.add_argument(
        "--output-json",
        default="/Users/chrisskerritt/Downloads/MVQS/output/analysis/adjustment_math_deep_tests.json",
    )
    parser.add_argument(
        "--output-md",
        default="/Users/chrisskerritt/Downloads/MVQS/output/analysis/adjustment_math_deep_tests.md",
    )
    args = parser.parse_args()

    rng = random.Random(args.seed)
    client = ApiClient(args.base_url)
    db_path = Path(args.db_path)
    pool = load_pool(db_path, args.pool_limit, args.min_job_count)
    if not pool:
        raise SystemExit("No job rows available for testing.")
    job_map = build_job_map(pool)

    groups: dict[tuple[int, int], list[JobRow]] = {}
    for row in pool:
        groups.setdefault((row.state_id, row.county_id), []).append(row)
    rich_regions = [key for key, rows in groups.items() if len(rows) >= 3]

    summary = {
        "formula_row_checks": 0,
        "formula_mismatches": 0,
        "signal_score_checks": 0,
        "signal_score_mismatches": 0,
        "determinism_checks": 0,
        "determinism_failures": 0,
        "pagination_checks": 0,
        "pagination_failures": 0,
        "multisource_target_checks": 0,
        "multisource_mismatches": 0,
        "case_profile1_checks": 0,
        "case_profile1_failures": 0,
        "case_profile3_checks": 0,
        "case_profile3_failures": 0,
        "case_residual_cap_checks": 0,
        "case_residual_cap_failures": 0,
        "case_relaxed_cap_checks": 0,
        "case_relaxed_cap_failures": 0,
        "case_report4_checks": 0,
        "case_report4_failures": 0,
        "unskilled_cap_checks": 0,
        "unskilled_cap_failures": 0,
        "same_dot_skilled_checks": 0,
        "same_dot_skilled_failures": 0,
        "methodology_metadata_checks": 0,
        "methodology_metadata_failures": 0,
    }
    error_metric_buckets: dict[str, dict[str, Any]] = {
        "tsp_percent": {"count": 0, "sum": 0.0, "sum_abs": 0.0, "sum_sq": 0.0, "max_abs": 0.0, "exact_count": 0},
        "tsp_percent_unadjusted": {
            "count": 0,
            "sum": 0.0,
            "sum_abs": 0.0,
            "sum_sq": 0.0,
            "max_abs": 0.0,
            "exact_count": 0,
        },
        "va_adjustment_percent": {
            "count": 0,
            "sum": 0.0,
            "sum_abs": 0.0,
            "sum_sq": 0.0,
            "max_abs": 0.0,
            "exact_count": 0,
        },
    }
    mismatches: list[dict[str, Any]] = []

    def add_mismatch(kind: str, payload: dict[str, Any]) -> None:
        if len(mismatches) < 120:
            mismatches.append({"kind": kind, **payload})

    # 1) Formula parity + determinism + pagination consistency (single source).
    formula_sample = rng.sample(pool, min(args.formula_scenarios, len(pool)))
    for scenario in formula_sample:
        profile = parse_profile(parse_trait_vector(scenario.trait_vector))
        payload = {
            "sourceDots": [scenario.dot_code],
            "q": "",
            "stateId": scenario.state_id,
            "countyId": scenario.county_id,
            "profile": profile,
            "limit": max(args.formula_rows_per_scenario, 50),
            "offset": 0,
        }
        out_a = client.request_json("/api/transferable-skills/analyze", method="POST", body=payload)
        out_b = client.request_json("/api/transferable-skills/analyze", method="POST", body=payload)
        summary["determinism_checks"] += 1
        if sha_json(out_a) != sha_json(out_b):
            summary["determinism_failures"] += 1
            add_mismatch(
                "determinism",
                {"source_dot": scenario.dot_code, "state_id": scenario.state_id, "county_id": scenario.county_id},
            )

        summary["methodology_metadata_checks"] += 1
        scenario_methodology = out_a.get("methodology") or {}
        scenario_basis = out_a.get("analysis_basis") or {}
        metadata_ok = (
            bool(scenario_methodology.get("section7_resolution_version"))
            and isinstance(scenario_methodology.get("section7_unresolved_ids"), list)
            and isinstance(scenario_methodology.get("section7_confidence_profile"), dict)
            and bool(scenario_basis.get("section7_resolution_version"))
            and isinstance(scenario_basis.get("section7_unresolved_ids"), list)
            and isinstance(scenario_basis.get("section7_confidence_profile"), dict)
        )
        if not metadata_ok:
            summary["methodology_metadata_failures"] += 1
            add_mismatch(
                "methodology_metadata",
                {
                    "source_dot": scenario.dot_code,
                    "methodology": scenario_methodology,
                    "analysis_basis": scenario_basis,
                },
            )

        out_page = client.request_json(
            "/api/transferable-skills/analyze",
            method="POST",
            body={**payload, "limit": 25, "offset": 40},
        )
        summary["pagination_checks"] += 1
        if not (
            out_a.get("total") == out_page.get("total")
            and out_a.get("tsp_band_counts") == out_page.get("tsp_band_counts")
            and out_a.get("aggregate") == out_page.get("aggregate")
        ):
            summary["pagination_failures"] += 1
            add_mismatch(
                "pagination",
                {
                    "source_dot": scenario.dot_code,
                    "total_a": out_a.get("total"),
                    "total_b": out_page.get("total"),
                    "aggregate_a": out_a.get("aggregate"),
                    "aggregate_b": out_page.get("aggregate"),
                },
            )

        source_job = {
            "dot_code": scenario.dot_code,
            "trait_vector": scenario.trait_vector,
            "vq": scenario.vq,
            "svp": scenario.svp,
            "onet_ou_code": scenario.onet_ou_code,
        }
        rows = (out_a.get("results") or [])[: args.formula_rows_per_scenario]
        for row in rows:
            target_dot = str(row.get("dot_code"))
            target_pool = job_map.get(target_dot)
            target_job = {
                "dot_code": target_dot,
                "trait_vector": str(row.get("trait_vector") or (target_pool.trait_vector if target_pool else "")),
                "vq": row.get("vq", target_pool.vq if target_pool else None),
                "svp": row.get("svp", target_pool.svp if target_pool else None),
                "onet_ou_code": row.get("onet_ou_code", target_pool.onet_ou_code if target_pool else None),
            }
            expected = compute_transferability_signals(source_job, target_job, profile)
            summary["formula_row_checks"] += 1
            actual_tsp = float(row.get("tsp_percent") or 0.0)
            actual_tsp_unadjusted = float(row.get("tsp_percent_unadjusted") or 0.0)
            actual_va = float(row.get("va_adjustment_percent") or 0.0)
            update_error_metric(error_metric_buckets["tsp_percent"], actual_tsp, expected["tsp_percent"])
            update_error_metric(
                error_metric_buckets["tsp_percent_unadjusted"],
                actual_tsp_unadjusted,
                expected["tsp_percent_unadjusted"],
            )
            update_error_metric(error_metric_buckets["va_adjustment_percent"], actual_va, expected["va_adjustment_percent"])
            checks = [
                abs(actual_tsp - expected["tsp_percent"]) <= 1e-6,
                abs(actual_tsp_unadjusted - expected["tsp_percent_unadjusted"]) <= 1e-6,
                abs(actual_va - expected["va_adjustment_percent"]) <= 1e-6,
                int(row.get("tsp_level") or 0) == int(expected["tsp_level"]),
                str(row.get("mtsp_tier_rule") or "") == expected["mtsp_tier_rule"],
                str(row.get("transfer_direction") or "") == expected["transfer_direction"],
                str(row.get("best_source_dot_code") or "") == scenario.dot_code,
            ]
            row_signal_scores = row.get("signal_scores") or {}
            expected_signal_scores = expected.get("signal_scores") or {}
            signal_checks = [
                abs(float(row_signal_scores.get("dot_prefix") or 0.0) - float(expected_signal_scores.get("dot_prefix") or 0.0))
                <= 1e-6,
                abs(float(row_signal_scores.get("onet_prefix") or 0.0) - float(expected_signal_scores.get("onet_prefix") or 0.0))
                <= 1e-6,
                abs(float(row_signal_scores.get("vq_proximity") or 0.0) - float(expected_signal_scores.get("vq_proximity") or 0.0))
                <= 1e-6,
                abs(float(row_signal_scores.get("svp_proximity") or 0.0) - float(expected_signal_scores.get("svp_proximity") or 0.0))
                <= 1e-6,
                int(row_signal_scores.get("profile_gate_failed") or 0) == int(expected_signal_scores.get("profile_gate_failed") or 0),
                int(row_signal_scores.get("source_unskilled_cap_applied") or 0)
                == int(expected_signal_scores.get("source_unskilled_cap_applied") or 0),
            ]
            summary["signal_score_checks"] += 1
            if not all(signal_checks):
                summary["signal_score_mismatches"] += 1
            if not all(checks):
                summary["formula_mismatches"] += 1
                add_mismatch(
                    "formula",
                    {
                        "source_dot": scenario.dot_code,
                        "target_dot": target_dot,
                        "actual": {
                            "tsp_percent": actual_tsp,
                            "tsp_percent_unadjusted": actual_tsp_unadjusted,
                            "va_adjustment_percent": actual_va,
                            "tsp_level": row.get("tsp_level"),
                            "mtsp_tier_rule": row.get("mtsp_tier_rule"),
                            "transfer_direction": row.get("transfer_direction"),
                            "best_source_dot_code": row.get("best_source_dot_code"),
                            "signal_scores": row_signal_scores,
                        },
                        "expected": expected,
                    },
                )

    # 2) Multi-source best source correctness.
    if rich_regions:
        for _ in range(min(args.multisource_scenarios, len(rich_regions))):
            region = rng.choice(rich_regions)
            rows = groups[region]
            source_jobs = rng.sample(rows, 2)
            profile = parse_profile(parse_trait_vector(source_jobs[0].trait_vector))
            source_dots = [source_jobs[0].dot_code, source_jobs[1].dot_code]
            out = client.request_json(
                "/api/transferable-skills/analyze",
                method="POST",
                body={
                    "sourceDots": source_dots,
                    "q": "",
                    "stateId": region[0],
                    "countyId": region[1],
                    "profile": profile,
                    "limit": 80,
                    "offset": 0,
                },
            )
            for row in (out.get("results") or [])[: args.multisource_targets_per_scenario]:
                target_dot = str(row.get("dot_code"))
                target_pool = job_map.get(target_dot)
                if not target_pool:
                    continue
                target_job = {
                    "dot_code": target_pool.dot_code,
                    "trait_vector": target_pool.trait_vector,
                    "vq": target_pool.vq,
                    "svp": target_pool.svp,
                    "onet_ou_code": target_pool.onet_ou_code,
                }
                scored: list[dict[str, Any]] = []
                best_expected: dict[str, Any] | None = None
                for source in source_jobs:
                    source_job = {
                        "dot_code": source.dot_code,
                        "trait_vector": source.trait_vector,
                        "vq": source.vq,
                        "svp": source.svp,
                        "onet_ou_code": source.onet_ou_code,
                    }
                    signal = compute_transferability_signals(source_job, target_job, profile)
                    weight = signal_weight(signal.get("signal_scores"))
                    row_score = {
                        "dot_code": source.dot_code,
                        "tsp_percent": float(signal["tsp_percent"]),
                        "signal_weight": round6(weight),
                    }
                    scored.append(row_score)
                    if (
                        best_expected is None
                        or row_score["tsp_percent"] > best_expected["tsp_percent"]
                        or (
                            row_score["tsp_percent"] == best_expected["tsp_percent"]
                            and row_score["signal_weight"] > best_expected["signal_weight"]
                        )
                    ):
                        best_expected = row_score
                if best_expected is None:
                    continue
                expected_dot = str(best_expected["dot_code"])
                expected_tsp = float(best_expected["tsp_percent"])
                summary["multisource_target_checks"] += 1
                if str(row.get("best_source_dot_code") or "") != expected_dot or abs(float(row.get("tsp_percent") or 0) - expected_tsp) > 1e-6:
                    summary["multisource_mismatches"] += 1
                    add_mismatch(
                        "multisource",
                        {
                            "region": {"state_id": region[0], "county_id": region[1]},
                            "sources": source_dots,
                            "target_dot": target_dot,
                            "actual_best_source": row.get("best_source_dot_code"),
                            "actual_tsp": row.get("tsp_percent"),
                            "expected_best_source": expected_dot,
                            "expected_tsp": expected_tsp,
                            "source_scores": scored,
                        },
                    )

    # 3) Unskilled cap checks.
    unskilled = [row for row in pool if (row.vq is not None and row.vq < 85) or (row.svp is not None and row.svp <= 2)]
    for scenario in rng.sample(unskilled, min(args.unskilled_scenarios, len(unskilled))):
        profile = parse_profile(parse_trait_vector(scenario.trait_vector))
        out = client.request_json(
            "/api/transferable-skills/analyze",
            method="POST",
            body={
                "sourceDots": [scenario.dot_code],
                "q": "",
                "stateId": scenario.state_id,
                "countyId": scenario.county_id,
                "profile": profile,
                "limit": 120,
                "offset": 0,
            },
        )
        max_tsp = max((float(row.get("tsp_percent") or 0) for row in out.get("results") or []), default=0.0)
        summary["unskilled_cap_checks"] += 1
        if max_tsp > 19.0001:
            summary["unskilled_cap_failures"] += 1
            add_mismatch(
                "unskilled_cap",
                {"source_dot": scenario.dot_code, "max_tsp": max_tsp, "source_vq": scenario.vq, "source_svp": scenario.svp},
            )

    # 4) Skilled same-dot perfect-match checks.
    skilled = [row for row in pool if (row.vq is not None and row.vq >= 85) and (row.svp is not None and row.svp > 2)]
    for scenario in rng.sample(skilled, min(args.same_dot_skilled_scenarios, len(skilled))):
        profile = parse_profile(parse_trait_vector(scenario.trait_vector))
        out = client.request_json(
            "/api/transferable-skills/analyze",
            method="POST",
            body={
                "sourceDots": [scenario.dot_code],
                "q": "",
                "stateId": scenario.state_id,
                "countyId": scenario.county_id,
                "profile": profile,
                "limit": 80,
                "offset": 0,
            },
        )
        same = next((row for row in out.get("results") or [] if str(row.get("dot_code")) == scenario.dot_code), None)
        summary["same_dot_skilled_checks"] += 1
        if not same or abs(float(same.get("tsp_percent") or 0) - 97.0) > 1e-6 or abs(float(same.get("va_adjustment_percent") or 0)) > 1e-6:
            summary["same_dot_skilled_failures"] += 1
            add_mismatch(
                "same_dot_skilled",
                {
                    "source_dot": scenario.dot_code,
                    "found": bool(same),
                    "same_row": same,
                    "source_vq": scenario.vq,
                    "source_svp": scenario.svp,
                },
            )

    # 5) Case/profile adjustment behavior checks.
    case_rows = rng.sample(pool, min(args.case_scenarios, len(pool)))
    for idx, scenario in enumerate(case_rows, start=1):
        case_id: int | None = None
        try:
            created = client.request_json(
                "/api/cases",
                method="POST",
                body={
                    "firstName": "Math",
                    "lastName": f"Adjust{idx}",
                    "demographicStateId": scenario.state_id,
                    "demographicCountyId": scenario.county_id,
                    "caseName": f"Math Adjust {idx}",
                },
                expected_status=201,
            )
            case_id = int(created["case"]["user_id"])

            client.request_json(
                f"/api/cases/{case_id}",
                method="PATCH",
                body={
                    "firstName": "Math",
                    "lastName": f"Adjust{idx}",
                    "addressLine1": "100 Test Ave",
                    "city": "Cape Canaveral",
                    "postalCode": "32920",
                    "reasonForReferral": "Adjustment math test",
                    "demographicStateId": scenario.state_id,
                    "demographicCountyId": scenario.county_id,
                },
            )

            region_rows = groups[(scenario.state_id, scenario.county_id)]
            chosen_sources = [scenario]
            if len(region_rows) >= 3:
                extra = [row for row in region_rows if row.dot_code != scenario.dot_code]
                chosen_sources.extend(rng.sample(extra, min(2, len(extra))))
            source_dots = [row.dot_code for row in chosen_sources]

            client.request_json(
                f"/api/cases/{case_id}/work-history-dots",
                method="PUT",
                body={"sourceDots": [{"dotCode": dot_code} for dot_code in source_dots]},
            )

            profiles_get = client.request_json(f"/api/cases/{case_id}/profiles")
            profiles = profiles_get.get("profiles", {})
            p1 = list(map(int, profiles.get("profile1", [])))
            p2 = list(map(int, profiles.get("profile2", [])))
            p3 = list(map(int, profiles.get("profile3", [])))

            expected_p1 = None
            source_vectors = [parse_trait_vector(job_map[dot_code].trait_vector) for dot_code in source_dots if dot_code in job_map]
            source_vectors = [vector for vector in source_vectors if vector]
            if source_vectors:
                expected_p1 = []
                for trait_index, trait in enumerate(TRAITS):
                    expected_p1.append(max(clamp_int(vector[trait_index], trait["min"], trait["max"], DEFAULT_PROFILE[trait_index]) for vector in source_vectors))

            summary["case_profile1_checks"] += 1
            if not expected_p1 or p1 != expected_p1:
                summary["case_profile1_failures"] += 1
                add_mismatch(
                    "case_profile1",
                    {"case_id": case_id, "source_dots": source_dots, "actual_p1": p1, "expected_p1": expected_p1},
                )

            p2_mod = []
            for trait_index, trait in enumerate(TRAITS):
                base = int(p2[trait_index]) if trait_index < len(p2) else DEFAULT_PROFILE[trait_index]
                delta = rng.choice([-1, 0, 1])
                p2_mod.append(clamp_int(base + delta, trait["min"], trait["max"], DEFAULT_PROFILE[trait_index]))

            put_profiles = client.request_json(
                f"/api/cases/{case_id}/profiles",
                method="PUT",
                body={"profile2": p2_mod, "enforceResidualCap": True},
            ).get("profiles", {})
            p1_out = list(map(int, put_profiles.get("profile1", [])))
            p3_out = list(map(int, put_profiles.get("profile3", [])))
            expected_p3 = max_profile(p1_out, p2_mod)
            summary["case_profile3_checks"] += 1
            if p3_out != expected_p3:
                summary["case_profile3_failures"] += 1
                add_mismatch(
                    "case_profile3",
                    {"case_id": case_id, "actual_p3": p3_out, "expected_p3": expected_p3, "p2_mod": p2_mod},
                )

            p4_over = []
            for trait_index, trait in enumerate(TRAITS):
                p4_over.append(clamp_int((p3_out[trait_index] if trait_index < len(p3_out) else trait["min"]) + 1, trait["min"], trait["max"], DEFAULT_PROFILE[trait_index]))

            strict_profiles = client.request_json(
                f"/api/cases/{case_id}/profiles",
                method="PUT",
                body={"profile4": p4_over, "enforceResidualCap": True},
            ).get("profiles", {})
            p3_strict = list(map(int, strict_profiles.get("profile3", [])))
            p4_strict = list(map(int, strict_profiles.get("profile4", [])))
            cap_ok = len(p3_strict) == len(p4_strict) == len(TRAITS) and all(p4_strict[i] <= p3_strict[i] for i in range(len(TRAITS)))
            summary["case_residual_cap_checks"] += 1
            if not cap_ok:
                summary["case_residual_cap_failures"] += 1
                add_mismatch(
                    "case_residual_cap",
                    {"case_id": case_id, "p3": p3_strict, "p4": p4_strict, "p4_over_input": p4_over},
                )

            relaxed_profiles = client.request_json(
                f"/api/cases/{case_id}/profiles",
                method="PUT",
                body={"profile4": p4_over, "enforceResidualCap": False},
            ).get("profiles", {})
            p3_relaxed = list(map(int, relaxed_profiles.get("profile3", [])))
            p4_relaxed = list(map(int, relaxed_profiles.get("profile4", [])))
            has_above = len(p3_relaxed) == len(p4_relaxed) == len(TRAITS) and any(p4_relaxed[i] > p3_relaxed[i] for i in range(len(TRAITS)))
            summary["case_relaxed_cap_checks"] += 1
            if not has_above:
                summary["case_relaxed_cap_failures"] += 1
                add_mismatch(
                    "case_relaxed_cap",
                    {"case_id": case_id, "p3": p3_relaxed, "p4": p4_relaxed, "p4_over_input": p4_over},
                )

            analysis = client.request_json(
                f"/api/cases/{case_id}/analysis/transferable",
                method="POST",
                body={"stateId": scenario.state_id, "countyId": scenario.county_id, "limit": 80, "offset": 0},
            )
            summary["methodology_metadata_checks"] += 1
            analysis_methodology = analysis.get("methodology") or {}
            analysis_basis = analysis.get("analysis_basis") or {}
            analysis_metadata_ok = (
                bool(analysis_methodology.get("section7_resolution_version"))
                and isinstance(analysis_methodology.get("section7_unresolved_ids"), list)
                and isinstance(analysis_methodology.get("section7_confidence_profile"), dict)
                and bool(analysis_basis.get("section7_resolution_version"))
                and isinstance(analysis_basis.get("section7_unresolved_ids"), list)
                and isinstance(analysis_basis.get("section7_confidence_profile"), dict)
            )
            if not analysis_metadata_ok:
                summary["methodology_metadata_failures"] += 1
                add_mismatch(
                    "case_methodology_metadata",
                    {
                        "case_id": case_id,
                        "methodology": analysis_methodology,
                        "analysis_basis": analysis_basis,
                    },
                )
            report4 = analysis.get("report4_summary", {})
            pre_total = int((report4.get("pre") or {}).get("total_jobs") or 0)
            post_total = int((report4.get("post") or {}).get("total_jobs") or 0)
            actual_residual = int(report4.get("residual_percent") or 0)
            expected_residual = residual_percent(pre_total, post_total)

            analysis_profiles = analysis.get("profiles", {})
            profile3_analysis = analysis_profiles.get("profile3")
            profile4_analysis = analysis_profiles.get("profile4")
            pre_api = client.request_json(
                "/api/transferable-skills/analyze",
                method="POST",
                body={
                    "sourceDots": source_dots,
                    "q": "",
                    "stateId": scenario.state_id,
                    "countyId": scenario.county_id,
                    "profile": profile3_analysis,
                    "limit": 30,
                    "offset": 0,
                },
            )
            post_api = client.request_json(
                "/api/transferable-skills/analyze",
                method="POST",
                body={
                    "sourceDots": source_dots,
                    "q": "",
                    "stateId": scenario.state_id,
                    "countyId": scenario.county_id,
                    "profile": profile4_analysis,
                    "limit": 30,
                    "offset": 0,
                },
            )
            pre_avg_case = (report4.get("pre") or {}).get("avg_tsp_percent")
            post_avg_case = (report4.get("post") or {}).get("avg_tsp_percent")
            pre_avg_api = (pre_api.get("aggregate") or {}).get("average_tsp_percent")
            post_avg_api = (post_api.get("aggregate") or {}).get("average_tsp_percent")
            avg_match = pre_avg_case == pre_avg_api and post_avg_case == post_avg_api

            summary["case_report4_checks"] += 1
            if actual_residual != expected_residual or not avg_match:
                summary["case_report4_failures"] += 1
                add_mismatch(
                    "case_report4",
                    {
                        "case_id": case_id,
                        "pre_total": pre_total,
                        "post_total": post_total,
                        "actual_residual": actual_residual,
                        "expected_residual": expected_residual,
                        "pre_avg_case": pre_avg_case,
                        "pre_avg_api": pre_avg_api,
                        "post_avg_case": post_avg_case,
                        "post_avg_api": post_avg_api,
                    },
                )

        finally:
            if case_id is not None:
                try:
                    client.request_json(f"/api/cases/{case_id}", method="DELETE")
                except Exception:
                    pass

    error_metrics = {key: finalize_error_metric(bucket) for key, bucket in error_metric_buckets.items()}
    total_failures = (
        summary["formula_mismatches"]
        + summary["signal_score_mismatches"]
        + summary["determinism_failures"]
        + summary["pagination_failures"]
        + summary["multisource_mismatches"]
        + summary["case_profile1_failures"]
        + summary["case_profile3_failures"]
        + summary["case_residual_cap_failures"]
        + summary["case_relaxed_cap_failures"]
        + summary["case_report4_failures"]
        + summary["unskilled_cap_failures"]
        + summary["same_dot_skilled_failures"]
        + summary["methodology_metadata_failures"]
    )

    payload = {
        "generated_at_utc": now_utc(),
        "base_url": args.base_url,
        "db_path": str(db_path),
        "seed": args.seed,
        "config": {
            "formula_scenarios": args.formula_scenarios,
            "formula_rows_per_scenario": args.formula_rows_per_scenario,
            "multisource_scenarios": args.multisource_scenarios,
            "multisource_targets_per_scenario": args.multisource_targets_per_scenario,
            "case_scenarios": args.case_scenarios,
            "unskilled_scenarios": args.unskilled_scenarios,
            "same_dot_skilled_scenarios": args.same_dot_skilled_scenarios,
        },
        "summary": summary,
        "error_metrics": error_metrics,
        "total_failures": total_failures,
        "sample_mismatches": mismatches,
    }

    output_json = Path(args.output_json)
    output_md = Path(args.output_md)
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    md_lines = [
        "# MVQS Deep Adjustment Math Tests",
        "",
        f"- Generated: {payload['generated_at_utc']}",
        f"- Base URL: `{args.base_url}`",
        f"- Total failures: **{total_failures}**",
        "",
        "## Summary",
        "",
    ]
    for key, value in summary.items():
        md_lines.append(f"- `{key}`: {value}")
    md_lines.extend(["", "## Error Metrics", ""])
    for key, value in error_metrics.items():
        md_lines.append(f"- `{key}`: `{json.dumps(value, ensure_ascii=True)}`")
    md_lines.extend(["", "## Sample Mismatches", ""])
    if mismatches:
        for row in mismatches[:40]:
            md_lines.append(f"- `{row['kind']}`: `{json.dumps(row, ensure_ascii=True)}`")
    else:
        md_lines.append("- None")
    md_lines.append("")
    output_md.write_text("\n".join(md_lines), encoding="utf-8")

    print(f"Wrote JSON: {output_json}")
    print(f"Wrote report: {output_md}")
    print(json.dumps({"total_failures": total_failures, "summary": summary}, indent=2))
    return 0 if total_failures == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
