#!/usr/bin/env python3
"""
Composite strict parity gate for Access object inventory, table taps, mapping, and runtime execution.
"""

from __future__ import annotations

import argparse
import json
import platform
import shlex
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


@dataclass
class StepResult:
    name: str
    command: list[str]
    return_code: int
    stdout: str
    stderr: str


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def timestamp_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run composite strict Access parity gate.")
    parser.add_argument("--out-dir", default="output/analysis/parity", help="Output directory")
    parser.add_argument("--snapshot-id", help="Optional snapshot id")
    parser.add_argument(
        "--front-end-paths",
        nargs="+",
        default=[
            "MVQS_DC_FrontEnd_with_Adobe.accdb",
            "MVQS_DC_FrontEnd.accdb",
        ],
        help="Access front-end paths",
    )
    parser.add_argument(
        "--dc-data-path",
        default="MVQS_Database 2/MVQS_DC_Data.accdb",
        help="DC data database path",
    )
    parser.add_argument(
        "--dc-jobbank-path",
        default="MVQS_Database 2/MVQS_DC_Data_JobBank.accdb",
        help="DC jobbank database path",
    )
    parser.add_argument(
        "--mapping-path",
        default="docs/access_object_mapping.json",
        help="Modern mapping manifest path",
    )
    parser.add_argument(
        "--module-entrypoints-json",
        help="Optional module-entrypoint map used by Windows Access harness",
    )
    parser.add_argument(
        "--run-access-execution",
        action="store_true",
        help="Run Windows Access execution harness when host supports it.",
    )
    parser.add_argument(
        "--require-access-execution",
        action="store_true",
        help="Fail if Access execution harness is not run/passing.",
    )
    parser.add_argument(
        "--strict-query-sql-mismatch",
        action="store_true",
        help="Fail inventory step when canonical query SQL differs across front-ends.",
    )
    return parser.parse_args()


def resolve_file_path(path_str: str) -> Path:
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
        home / "Downloads" / "MVQS_Database 2",
        home / "Downloads" / "MVQS",
        home / "Downloads" / "MVQS" / "MVQS_Database 2",
    ]

    candidates = []
    for base in search_dirs:
        candidates.append(base / path_str)
        candidates.append(base / basename)

    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()

    raise RuntimeError(f"Required path not found: {path_str}")


def run_step(name: str, command: list[str]) -> StepResult:
    proc = subprocess.run(command, capture_output=True, text=True, check=False)
    return StepResult(
        name=name,
        command=command,
        return_code=proc.returncode,
        stdout=proc.stdout,
        stderr=proc.stderr,
    )


def main() -> int:
    args = parse_args()
    snapshot_id = args.snapshot_id or timestamp_id()
    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    front_end_paths = [str(resolve_file_path(p)) for p in args.front_end_paths]
    dc_data_path = str(resolve_file_path(args.dc_data_path))
    dc_jobbank_path = str(resolve_file_path(args.dc_jobbank_path))
    mapping_path = str(resolve_file_path(args.mapping_path))

    registry_path = out_dir / f"access_registry_{snapshot_id}.json"
    table_taps_path = out_dir / f"table_tap_coverage_{snapshot_id}.json"
    query_order_path = out_dir / f"query_order_{snapshot_id}.json"
    mapping_coverage_path = out_dir / f"modern_mapping_coverage_{snapshot_id}.json"
    access_exec_path = out_dir / f"access_execution_{snapshot_id}.json"

    steps: list[StepResult] = []

    inventory_cmd = [
        sys.executable,
        "scripts/parity_access_inventory.py",
        "--front-end-paths",
        *front_end_paths,
        "--dc-data-path",
        dc_data_path,
        "--dc-jobbank-path",
        dc_jobbank_path,
        "--out-dir",
        str(out_dir),
        "--snapshot-id",
        snapshot_id,
    ]
    if args.strict_query_sql_mismatch:
        inventory_cmd.append("--fail-on-query-sql-mismatch")

    steps.append(run_step("inventory", inventory_cmd))

    table_taps_cmd = [
        sys.executable,
        "scripts/parity_table_taps.py",
        "--registry-json",
        str(registry_path),
        "--out-dir",
        str(out_dir),
        "--snapshot-id",
        snapshot_id,
        "--fail-on-missing-table",
    ]
    steps.append(run_step("table_taps", table_taps_cmd))

    mapping_cmd = [
        sys.executable,
        "scripts/parity_modern_mapping_check.py",
        "--mapping-path",
        mapping_path,
        "--registry-json",
        str(registry_path),
        "--out-dir",
        str(out_dir),
        "--snapshot-id",
        snapshot_id,
        "--fail-on-unmapped",
    ]
    steps.append(run_step("mapping", mapping_cmd))

    ran_access_execution = False
    if args.run_access_execution and platform.system().lower().startswith("win"):
        access_cmd = [
            "pwsh",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            "scripts/parity_access_execute_windows.ps1",
            "-FrontEndPaths",
            *front_end_paths,
            "-RegistryJson",
            str(registry_path),
            "-OutDir",
            str(out_dir),
            "-SnapshotId",
            snapshot_id,
        ]
        if args.module_entrypoints_json:
            access_cmd.extend(["-ModuleEntrypointsJson", str(Path(args.module_entrypoints_json).expanduser().resolve())])
        steps.append(run_step("access_execution", access_cmd))
        ran_access_execution = True

    if args.require_access_execution and not ran_access_execution:
        steps.append(
            StepResult(
                name="access_execution",
                command=["<skipped>"] ,
                return_code=2,
                stdout="",
                stderr="Access execution was required but not run (use --run-access-execution on Windows host).",
            )
        )

    step_summaries = []
    for step in steps:
        step_summaries.append(
            {
                "name": step.name,
                "return_code": step.return_code,
                "command": " ".join(shlex.quote(token) for token in step.command),
                "stdout_tail": step.stdout[-2000:],
                "stderr_tail": step.stderr[-2000:],
                "pass": step.return_code == 0,
            }
        )

    strict_fail = any(step.return_code != 0 for step in steps)

    artifact_presence = {
        "registry_exists": registry_path.exists(),
        "query_order_exists": query_order_path.exists(),
        "table_taps_exists": table_taps_path.exists(),
        "mapping_coverage_exists": mapping_coverage_path.exists(),
        "access_execution_exists": access_exec_path.exists(),
    }

    report = {
        "generated_at_utc": now_iso(),
        "snapshot_id": snapshot_id,
        "inputs": {
            "front_end_paths": front_end_paths,
            "dc_data_path": dc_data_path,
            "dc_jobbank_path": dc_jobbank_path,
            "mapping_path": mapping_path,
            "run_access_execution": args.run_access_execution,
            "require_access_execution": args.require_access_execution,
        },
        "artifacts": {
            "access_registry": str(registry_path),
            "query_order": str(query_order_path),
            "table_tap_coverage": str(table_taps_path),
            "modern_mapping_coverage": str(mapping_coverage_path),
            "access_execution": str(access_exec_path),
            "presence": artifact_presence,
        },
        "steps": step_summaries,
        "gate": {
            "strict_pass": not strict_fail,
        },
    }

    out_path = out_dir / f"parity_strict_{snapshot_id}.json"
    out_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote strict report: {out_path}")
    print(json.dumps({"strict_pass": not strict_fail, "step_count": len(steps)}, indent=2))

    return 0 if not strict_fail else 2


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}")
        raise SystemExit(1)
