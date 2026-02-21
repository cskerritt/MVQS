#!/usr/bin/env python3
"""
Extract canonical MVQS legacy Access tables into a versioned snapshot directory.

Usage:
  python3 scripts/extract_legacy_access_snapshot.py \
    --front-end-path "/path/to/MVQS_DC_FrontEnd_with_Adobe.accdb" \
    --data-path "/path/to/MVQS_DC_Data.accdb" \
    --jobbank-path "/path/to/MVQS_DC_Data_JobBank.accdb"
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ExtractTarget:
    table: str
    source_key: str


DEFAULT_TARGETS: list[ExtractTarget] = [
    ExtractTarget("tblXLU_Occupations", "data"),
    ExtractTarget("tblXLU_Occupations_12775PRE", "data"),
    ExtractTarget("tblJob_Bank", "jobbank"),
    ExtractTarget("tblClientStatistics", "frontend"),
    ExtractTarget("tblEvaluee_Statistics", "frontend"),
    ExtractTarget("tblEvaluee_Occupations", "frontend"),
    ExtractTarget("tblEvaluee_Profiles", "frontend"),
    ExtractTarget("tblPeople", "frontend"),
    ExtractTarget("tblEvaluee_Rpt_Table_of_Contents", "frontend"),
    ExtractTarget("tblXLU_TSPReportLevels", "data"),
    ExtractTarget("tblXLU_ECLR_Constants", "data"),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract MVQS Access snapshot tables into CSV + manifest")
    parser.add_argument("--front-end-path", required=True, help="Path to MVQS front-end .accdb")
    parser.add_argument("--data-path", help="Path to MVQS data .accdb")
    parser.add_argument("--jobbank-path", help="Path to MVQS job-bank .accdb")
    parser.add_argument(
        "--output-root",
        default="data/legacy_snapshot",
        help="Root folder for timestamped snapshots (default: data/legacy_snapshot)",
    )
    parser.add_argument("--snapshot-id", help="Optional fixed snapshot id; default UTC timestamp")
    parser.add_argument(
        "--allow-missing",
        action="store_true",
        help="Continue if a table or source DB is missing (records failures in manifest)",
    )
    return parser.parse_args()


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def timestamp_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def run_command(args: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, text=True, capture_output=True, check=check)


def require_tool(tool: str) -> None:
    if shutil.which(tool) is None:
        raise RuntimeError(
            f"Required tool '{tool}' not found in PATH. Install mdbtools (mdb-export, mdb-sql, mdb-schema) or provide an alternate extractor."
        )


def sanitize_name(value: str) -> str:
    safe = "".join(ch if ch.isalnum() or ch in {"-", "_", "."} else "_" for ch in value)
    return safe.strip("_") or "unnamed"


def sha256_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def csv_stats(csv_text: str) -> dict[str, Any]:
    reader = csv.DictReader(csv_text.splitlines())
    if reader.fieldnames is None:
        return {"row_count": 0, "columns": []}

    null_counts: dict[str, int] = {name: 0 for name in reader.fieldnames}
    row_count = 0
    for row in reader:
        row_count += 1
        for name in reader.fieldnames:
            value = row.get(name)
            if value is None or str(value).strip() == "":
                null_counts[name] += 1

    columns = []
    for name in reader.fieldnames:
        null_count = null_counts[name]
        null_rate = (null_count / row_count) if row_count > 0 else 0.0
        columns.append(
            {
                "name": name,
                "null_count": null_count,
                "null_rate": round(null_rate, 6),
            }
        )
    return {"row_count": row_count, "columns": columns}


def export_schema(db_path: Path, out_path: Path) -> dict[str, Any]:
    proc = run_command(["mdb-schema", str(db_path), "sqlite"], check=False)
    schema_text = proc.stdout or ""
    write_text(out_path, schema_text)
    return {
        "path": str(out_path),
        "sha256": sha256_bytes(schema_text.encode("utf-8")),
        "exit_code": proc.returncode,
    }


def export_table(db_path: Path, table_name: str) -> subprocess.CompletedProcess[str]:
    return run_command(["mdb-export", str(db_path), table_name], check=False)


def main() -> int:
    args = parse_args()
    require_tool("mdb-export")
    require_tool("mdb-sql")
    require_tool("mdb-schema")

    source_paths = {
        "frontend": Path(args.front_end_path).expanduser().resolve(),
        "data": Path(args.data_path).expanduser().resolve() if args.data_path else None,
        "jobbank": Path(args.jobbank_path).expanduser().resolve() if args.jobbank_path else None,
    }

    for key, path in source_paths.items():
        if path is None:
            continue
        if not path.exists():
            raise RuntimeError(f"{key} database not found: {path}")

    snapshot_id = args.snapshot_id or timestamp_id()
    output_dir = Path(args.output_root).expanduser().resolve() / snapshot_id
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, Any] = {
        "manifest_version": 1,
        "snapshot_id": snapshot_id,
        "extracted_at_utc": now_iso(),
        "source_paths": {key: (str(path) if path else None) for key, path in source_paths.items()},
        "objects": [],
        "schemas": {},
        "errors": [],
    }

    for key, db_path in source_paths.items():
        if db_path is None:
            continue
        schema_path = output_dir / "schemas" / f"{key}.schema.sql"
        try:
            manifest["schemas"][key] = export_schema(db_path, schema_path)
        except Exception as exc:  # pragma: no cover - environment-specific
            message = f"schema export failed for {key}: {exc}"
            manifest["errors"].append(message)
            if not args.allow_missing:
                raise RuntimeError(message) from exc

    for target in DEFAULT_TARGETS:
        db_path = source_paths.get(target.source_key)
        if db_path is None:
            message = f"source database not provided for table {target.table} (source={target.source_key})"
            manifest["errors"].append(message)
            if not args.allow_missing:
                raise RuntimeError(message)
            continue

        proc = export_table(db_path, target.table)
        if proc.returncode != 0:
            message = (
                f"table export failed for {target.table} from {target.source_key}: "
                f"{(proc.stderr or proc.stdout or '').strip()[:500]}"
            )
            manifest["errors"].append(message)
            if not args.allow_missing:
                raise RuntimeError(message)
            continue

        csv_text = proc.stdout or ""
        csv_bytes = csv_text.encode("utf-8")
        table_file = output_dir / "tables" / f"{target.source_key}__{sanitize_name(target.table)}.csv"
        write_bytes(table_file, csv_bytes)
        stats = csv_stats(csv_text)
        manifest["objects"].append(
            {
                "table": target.table,
                "source": target.source_key,
                "db_path": str(db_path),
                "csv_path": str(table_file),
                "record_count": stats["row_count"],
                "sha256": sha256_bytes(csv_bytes),
                "field_dictionary": stats["columns"],
            }
        )

    summary = {
        "tables_requested": len(DEFAULT_TARGETS),
        "tables_extracted": len(manifest["objects"]),
        "errors": len(manifest["errors"]),
    }
    manifest["summary"] = summary

    manifest_path = output_dir / "legacy_snapshot_manifest.json"
    write_text(manifest_path, json.dumps(manifest, indent=2) + "\n")

    print(f"Snapshot written: {output_dir}")
    print(json.dumps(summary, indent=2))

    if manifest["errors"] and not args.allow_missing:
        return 1
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
