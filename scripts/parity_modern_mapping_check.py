#!/usr/bin/env python3
"""
Validate/expand modern mapping coverage for all Access objects in registry.

Outputs:
- output/analysis/parity/modern_mapping_coverage_<timestamp>.json
"""

from __future__ import annotations

import argparse
import fnmatch
import json
from datetime import datetime, timezone
from pathlib import Path


TYPE_TO_PLURAL = {
    "module": "modules",
    "report": "reports",
    "query": "queries",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate modern object mapping coverage from registry.")
    parser.add_argument("--mapping-path", required=True, help="Path to docs/access_object_mapping.json")
    parser.add_argument("--registry-json", required=True, help="Path to access_registry_*.json")
    parser.add_argument("--out-dir", default="output/analysis/parity", help="Output directory")
    parser.add_argument("--snapshot-id", help="Optional snapshot id")
    parser.add_argument(
        "--fail-on-unmapped",
        action="store_true",
        help="Exit non-zero when any object is unmapped.",
    )
    return parser.parse_args()


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def timestamp_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def canonical_object_rows(registry: dict) -> dict[str, list[str]]:
    return {
        "module": sorted(
            [row.get("name") for row in registry.get("objects", {}).get("modules", []) if row.get("name")],
            key=lambda v: v.lower(),
        ),
        "report": sorted(
            [row.get("name") for row in registry.get("objects", {}).get("reports", []) if row.get("name")],
            key=lambda v: v.lower(),
        ),
        "query": sorted(
            [row.get("name") for row in registry.get("objects", {}).get("queries", []) if row.get("name")],
            key=lambda v: v.lower(),
        ),
    }


def find_mapping_for_object(
    mapping_manifest: dict,
    object_type: str,
    object_name: str,
) -> tuple[dict | None, str | None]:
    objects = mapping_manifest.get("objects", {})
    bucket = TYPE_TO_PLURAL[object_type]
    explicit = (objects.get(bucket) or {}).get(object_name)
    if explicit is not None:
        return explicit, "explicit"

    rules = mapping_manifest.get("rules", [])
    for rule in rules:
        if str(rule.get("object_type", "")).strip().lower() != object_type:
            continue

        pattern = str(rule.get("pattern", "")).strip()
        if not pattern:
            continue

        if fnmatch.fnmatchcase(object_name.lower(), pattern.lower()):
            return rule, f"rule:{rule.get('name', 'unnamed')}"

    return None, None


def validate_mapping_entry(entry: dict | None) -> tuple[bool, list[str]]:
    if not isinstance(entry, dict):
        return False, ["mapping entry missing"]

    errors: list[str] = []
    target = str(entry.get("modern_target", "")).strip()
    justification = str(entry.get("runtime_justification", "")).strip()

    if not target:
        errors.append("modern_target is required")

    if not justification:
        errors.append("runtime_justification is required")

    return len(errors) == 0, errors


def main() -> int:
    args = parse_args()
    mapping_path = Path(args.mapping_path).expanduser().resolve()
    registry_path = Path(args.registry_json).expanduser().resolve()

    if not mapping_path.exists():
        raise RuntimeError(f"Mapping file not found: {mapping_path}")
    if not registry_path.exists():
        raise RuntimeError(f"Registry file not found: {registry_path}")

    mapping_manifest = load_json(mapping_path)
    registry = load_json(registry_path)

    snapshot_id = args.snapshot_id or registry.get("snapshot_id") or timestamp_id()

    objects_by_type = canonical_object_rows(registry)

    coverage_rows: dict[str, list[dict]] = {
        "modules": [],
        "reports": [],
        "queries": [],
    }
    unmapped_rows: list[dict] = []

    for object_type, names in objects_by_type.items():
        plural = TYPE_TO_PLURAL[object_type]
        for name in names:
            mapping_entry, source = find_mapping_for_object(mapping_manifest, object_type, name)
            is_valid, errors = validate_mapping_entry(mapping_entry)

            row = {
                "object_name": name,
                "object_type": object_type,
                "mapping_source": source,
                "mapped": is_valid,
                "errors": errors,
                "mapping": mapping_entry,
            }
            coverage_rows[plural].append(row)
            if not is_valid:
                unmapped_rows.append(
                    {
                        "object_name": name,
                        "object_type": object_type,
                        "mapping_source": source,
                        "errors": errors,
                    }
                )

    counts = {
        "modules_total": len(coverage_rows["modules"]),
        "reports_total": len(coverage_rows["reports"]),
        "queries_total": len(coverage_rows["queries"]),
        "unmapped_total": len(unmapped_rows),
    }

    report = {
        "generated_at_utc": now_iso(),
        "snapshot_id": snapshot_id,
        "inputs": {
            "mapping_path": str(mapping_path),
            "registry_json": str(registry_path),
        },
        "counts": counts,
        "gate": {
            "mapped_coverage_pass": counts["unmapped_total"] == 0,
            "unmapped_total": counts["unmapped_total"],
        },
        "coverage": coverage_rows,
        "unmapped": unmapped_rows,
    }

    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    out_path = out_dir / f"modern_mapping_coverage_{snapshot_id}.json"
    out_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    latest_path = out_dir / "latest_modern_mapping_coverage.json"
    latest_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote mapping coverage: {out_path}")
    print(f"Wrote latest alias: {latest_path}")
    print(
        json.dumps(
            {
                "modules_total": counts["modules_total"],
                "reports_total": counts["reports_total"],
                "queries_total": counts["queries_total"],
                "unmapped_total": counts["unmapped_total"],
                "mapped_coverage_pass": report["gate"]["mapped_coverage_pass"],
            },
            indent=2,
        )
    )

    if args.fail_on_unmapped and counts["unmapped_total"] > 0:
        return 2
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}")
        raise SystemExit(1)
