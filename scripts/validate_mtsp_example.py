#!/usr/bin/env python3
"""
Compare MVQS TSA API output to a reference MTSP report PDF.

Usage:
  python3 scripts/validate_mtsp_example.py \
    --base-url http://localhost:4173 \
    --pdf-path "/path/to/Pollack, Michael - MTSP (w. adj).pdf"
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from typing import Any

try:
    import pdfplumber
except Exception as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency: pdfplumber. Install with `python3 -m pip install --user pdfplumber`."
    ) from exc


DOT_PATTERN = re.compile(r"\d{3}\.\d{3}-\d{3}")
PCT_PATTERN = re.compile(r"\d{1,3}%")


def api_json(base_url: str, path: str, method: str = "GET", body: dict[str, Any] | None = None) -> Any:
    url = base_url.rstrip("/") + "/" + path.lstrip("/")
    data: bytes | None = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{method} {path} failed with {exc.code}: {payload[:500]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"{method} {path} failed: {exc.reason}") from exc


def normalize_dot(dot_with_formatting: str) -> str:
    return dot_with_formatting.replace(".", "").replace("-", "")


def parse_pdf_rows(pdf_path: str) -> list[dict[str, Any]]:
    def parse_rows_from_page(words: list[dict[str, Any]]) -> list[dict[str, Any]]:
        parsed: list[dict[str, Any]] = []
        dot_words = [word for word in words if DOT_PATTERN.fullmatch(word["text"])]
        for dot_word in dot_words:
            near = [word for word in words if abs(word["top"] - dot_word["top"]) <= 1.3]
            pcts = sorted(
                [word for word in near if PCT_PATTERN.fullmatch(word["text"])],
                key=lambda word: word["x0"],
            )
            if len(pcts) < 2:
                continue
            title_tokens = sorted(
                [
                    word
                    for word in near
                    if word["x0"] > dot_word["x1"] + 3
                    and word["x0"] < 230
                    and word["text"]
                    not in {
                        "Thursday,",
                        "February",
                        "12,",
                        "2026Michael",
                        "Pollack",
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
            parsed.append(
                {
                    "dot_code": normalize_dot(dot_word["text"]),
                    "title": " ".join(token["text"] for token in title_tokens),
                    "sample_ts_percent": int(pcts[0]["text"][:-1]),
                    "sample_va_percent": int(pcts[1]["text"][:-1]),
                }
            )
        return parsed

    rows: list[dict[str, Any]] = []
    with pdfplumber.open(pdf_path) as pdf:
        preferred_indexes = [4, 5, 6, 7]
        for page_index in preferred_indexes:
            if page_index >= len(pdf.pages):
                continue
            words = pdf.pages[page_index].extract_words(use_text_flow=True, keep_blank_chars=False)
            rows.extend(parse_rows_from_page(words))

        # Fallback for shorter or differently structured sample packets.
        if not rows:
            for page in pdf.pages:
                words = page.extract_words(use_text_flow=True, keep_blank_chars=False)
                rows.extend(parse_rows_from_page(words))

    return rows


def mean_absolute_error(values: list[float]) -> float:
    if not values:
        return float("nan")
    return sum(values) / len(values)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate TSA output against an MTSP sample report")
    parser.add_argument("--base-url", default="http://localhost:4173", help="MVQS base URL")
    parser.add_argument("--pdf-path", required=True, help="Path to MTSP sample PDF")
    parser.add_argument("--state-abbrev", default="NY", help="State abbreviation for TSA query")
    parser.add_argument(
        "--source-dots",
        default="090227010,160267026,189117026",
        help="Comma-separated source DOT codes",
    )
    parser.add_argument(
        "--profile",
        default="5,5,5,3,3,4,2,2,2,1,1,2,0,0,0,1,1,1,0,0,0,0,0,0",
        help="Comma-separated 24-trait profile values",
    )
    args = parser.parse_args()

    source_dots = [token.strip() for token in args.source_dots.split(",") if token.strip()]
    profile = [int(token.strip()) for token in args.profile.split(",") if token.strip()]

    sample_rows = parse_pdf_rows(args.pdf_path)
    if not sample_rows:
        raise RuntimeError("No sample rows extracted from PDF.")

    states = api_json(args.base_url, "/api/states").get("states", [])
    state = next((row for row in states if str(row.get("state_abbrev", "")).upper() == args.state_abbrev.upper()), None)
    if not state:
        raise RuntimeError(f"State abbreviation {args.state_abbrev!r} not found in /api/states")

    api_rows = api_json(
        args.base_url,
        "/api/transferable-skills/analyze",
        method="POST",
        body={
            "sourceDots": source_dots,
            "q": "",
            "stateId": state["state_id"],
            "countyId": None,
            "profile": profile,
            "limit": 250,
            "offset": 0,
        },
    ).get("results", [])
    by_dot = {row.get("dot_code"): row for row in api_rows if isinstance(row, dict)}

    matched = []
    for sample_row in sample_rows:
        api_row = by_dot.get(sample_row["dot_code"])
        if not api_row:
            continue
        matched.append(
            {
                "dot_code": sample_row["dot_code"],
                "title": sample_row["title"],
                "sample_ts_percent": sample_row["sample_ts_percent"],
                "sample_va_percent": sample_row["sample_va_percent"],
                "api_ts_percent": float(api_row.get("tsp_percent") or 0),
                "api_va_percent": float(api_row.get("va_adjustment_percent") or 0),
            }
        )

    if not matched:
        raise RuntimeError("No overlap between sampled PDF rows and current TSA top results.")

    ts_errors = [abs(row["api_ts_percent"] - row["sample_ts_percent"]) for row in matched]
    va_errors = [abs(row["api_va_percent"] - row["sample_va_percent"]) for row in matched]

    print(f"Sample rows extracted: {len(sample_rows)}")
    print(f"Overlapping rows in API top-250: {len(matched)}")
    print(f"TS MAE: {mean_absolute_error(ts_errors):.3f}")
    print(f"VA MAE: {mean_absolute_error(va_errors):.3f}")

    print("\nLargest TS deltas:")
    for row in sorted(matched, key=lambda item: abs(item["api_ts_percent"] - item["sample_ts_percent"]), reverse=True)[:15]:
        print(
            f"{row['dot_code']} | sample TS={row['sample_ts_percent']} API TS={row['api_ts_percent']:.1f} | "
            f"sample VA={row['sample_va_percent']} API VA={row['api_va_percent']:.1f} | {row['title'][:45]}"
        )

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
