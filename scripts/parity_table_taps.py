#!/usr/bin/env python3
"""
Build deterministic Access query ordering and table-tap coverage from parity registry.

Outputs:
- output/analysis/parity/query_order_<timestamp>.json
- output/analysis/parity/table_tap_coverage_<timestamp>.json
"""

from __future__ import annotations

import argparse
import json
import os
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

IDENTIFIER_TOKEN = r"(?:\[[^\]]+\]|\"[^\"]+\"|`[^`]+`|[A-Za-z0-9_.$~]+)"
CLAUSE_PATTERNS = (
    re.compile(rf"\bFROM\s+({IDENTIFIER_TOKEN})", re.IGNORECASE),
    re.compile(rf"\bJOIN\s+({IDENTIFIER_TOKEN})", re.IGNORECASE),
    re.compile(rf"\bUPDATE\s+({IDENTIFIER_TOKEN})", re.IGNORECASE),
    re.compile(rf"\bINTO\s+({IDENTIFIER_TOKEN})", re.IGNORECASE),
    re.compile(rf"\bDELETE\s+FROM\s+({IDENTIFIER_TOKEN})", re.IGNORECASE),
)
NUMERIC_RE = re.compile(r"(\d+)")
MULTISPACE_RE = re.compile(r"\s+")

SKIP_IDENTIFIERS = {
    "select",
    "distinct",
    "distinctrow",
    "top",
    "inner",
    "left",
    "right",
    "full",
    "where",
    "group",
    "order",
    "having",
    "as",
    "set",
    "on",
    "values",
    "union",
    "all",
}



# Tables that are linked/referenced in Access queries but are known to not exist in any
# backend database (they are stubs, linked-table placeholders, import-staging tables, or
# administrative Access infrastructure). These are excluded from the missing-table gate.
KNOWN_ABSENT_TABLES: set[str] = {
    "tblCompanies",
    "tblEvaluee_Household_Chores",
    "tblEvaluee_Household_Chores_Occupations",
    "tblEvaluee_Jobs",
    "tblEvaluee_Rpt_Table_of_Contents",
    "tblIMPORT_USBLS_All_data",
    "tblIMPORT_USBLS_All_May_2023_data",
    "tblIMPORT_USBLS_state_data",
    "tblSystem_Database_Usage_Data",
    "tblVALUES",
    "tblXLU_Household_Chore_Categories",
    "tblXLU_Household_Chore_Items",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build deterministic query order and table-tap coverage.")
    parser.add_argument("--registry-json", required=True, help="Path to access_registry_*.json")
    parser.add_argument("--out-dir", default="output/analysis/parity", help="Output directory")
    parser.add_argument("--snapshot-id", help="Optional snapshot id")
    parser.add_argument(
        "--fail-on-missing-table",
        action="store_true",
        help="Exit non-zero when missing table references exist.",
    )
    parser.add_argument(
        "--exclude-tables",
        nargs="*",
        default=[],
        help="Additional table names to exclude from the missing-table gate.",
    )
    return parser.parse_args()


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def timestamp_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_identifier(raw: str | None) -> str | None:
    if raw is None:
        return None

    text = raw.strip().rstrip(",;")
    if not text:
        return None

    if text.startswith("[") and text.endswith("]"):
        text = text[1:-1]
    elif text.startswith('"') and text.endswith('"'):
        text = text[1:-1]
    elif text.startswith("`") and text.endswith("`"):
        text = text[1:-1]

    text = text.strip().rstrip(",;")
    if not text:
        return None

    lowered = text.lower()
    if lowered in SKIP_IDENTIFIERS:
        return None
    if "!" in text:
        return None
    if text.startswith("("):
        return None

    return text


def normalize_sql(sql: str) -> str:
    without_comments = re.sub(r"--[^\n\r]*", " ", sql)
    without_comments = re.sub(r"/\*.*?\*/", " ", without_comments, flags=re.DOTALL)
    return MULTISPACE_RE.sub(" ", without_comments).strip()


def extract_identifiers_from_sql(sql: str) -> set[str]:
    refs: set[str] = set()
    normalized_sql = normalize_sql(sql)

    for pattern in CLAUSE_PATTERNS:
        for match in pattern.finditer(normalized_sql):
            value = normalize_identifier(match.group(1))
            if value:
                refs.add(value)

    return refs


def sequence_sort_key(name: str) -> tuple:
    parts = NUMERIC_RE.split(name.lower())
    key_parts: list[tuple] = []
    for idx, part in enumerate(parts):
        if idx % 2 == 1:
            key_parts.append((0, int(part), len(part)))
        else:
            key_parts.append((1, part))
    return tuple(key_parts)


def topo_sort_with_fallback(nodes: list[str], edges: set[tuple[str, str]]) -> tuple[list[str], list[str]]:
    adjacency: dict[str, set[str]] = {name: set() for name in nodes}
    indegree: dict[str, int] = {name: 0 for name in nodes}

    for src, dst in edges:
        if src not in adjacency or dst not in adjacency or src == dst:
            continue
        if dst in adjacency[src]:
            continue
        adjacency[src].add(dst)
        indegree[dst] += 1

    frontier = sorted([name for name in nodes if indegree[name] == 0], key=lambda n: (sequence_sort_key(n), n.lower()))
    ordered: list[str] = []

    while frontier:
        current = frontier.pop(0)
        ordered.append(current)

        for neighbor in sorted(adjacency[current], key=lambda n: (sequence_sort_key(n), n.lower())):
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                frontier.append(neighbor)
        frontier.sort(key=lambda n: (sequence_sort_key(n), n.lower()))

    cycle_nodes = [name for name in nodes if name not in set(ordered)]
    if cycle_nodes:
        cycle_nodes = sorted(cycle_nodes, key=lambda n: (sequence_sort_key(n), n.lower()))
        ordered.extend(cycle_nodes)

    return ordered, cycle_nodes


def build_query_order(registry: dict, snapshot_id: str) -> dict:
    canonical_queries: list[str] = list(registry.get("queries", {}).get("canonical_names", []))
    all_queries = set(item.get("name") for item in registry.get("objects", {}).get("queries", []) if item.get("name"))

    edges: set[tuple[str, str]] = set()
    for row in registry.get("dependencies", {}).get("query_edges", []):
        src = row.get("source_query")
        dst = row.get("target_query")
        if src and dst and src in canonical_queries and dst in canonical_queries and src != dst:
            edges.add((src, dst))

    sql_by_name = registry.get("queries", {}).get("sql_by_name", {})

    # Augment dependencies from SQL table/query references for canonical queries.
    for query_name in canonical_queries:
        sql_text = (sql_by_name.get(query_name) or {}).get("selected_sql")
        if not sql_text:
            continue
        for ref in extract_identifiers_from_sql(sql_text):
            if ref in all_queries and ref in canonical_queries and ref != query_name:
                edges.add((query_name, ref))

    ordered, cycle_nodes = topo_sort_with_fallback(canonical_queries, edges)

    inbound: dict[str, int] = {name: 0 for name in canonical_queries}
    outbound: dict[str, int] = {name: 0 for name in canonical_queries}
    for src, dst in edges:
        outbound[src] += 1
        inbound[dst] += 1

    return {
        "generated_at_utc": now_iso(),
        "snapshot_id": snapshot_id,
        "stats": {
            "canonical_queries_total": len(canonical_queries),
            "dependency_edges_total": len(edges),
            "cycle_node_count": len(cycle_nodes),
        },
        "cycle_nodes": cycle_nodes,
        "ordered_queries": [
            {
                "position": idx + 1,
                "name": name,
                "inbound_dependencies": inbound[name],
                "outbound_dependencies": outbound[name],
                "cycle_fallback": name in set(cycle_nodes),
            }
            for idx, name in enumerate(ordered)
        ],
        "dependencies": [
            {"source_query": src, "target_query": dst}
            for src, dst in sorted(edges, key=lambda pair: (pair[0].lower(), pair[1].lower()))
        ],
    }


def build_table_tap_coverage(registry: dict, query_order: dict, snapshot_id: str) -> dict:
    sql_by_name = registry.get("queries", {}).get("sql_by_name", {})
    query_names = [row["name"] for row in query_order.get("ordered_queries", [])]
    query_lookup = {item.get("name", "").lower(): item.get("name") for item in registry.get("objects", {}).get("queries", [])}

    table_to_sources: dict[str, list[str]] = registry.get("source_catalog", {}).get("table_to_sources", {})
    source_db_rows = registry.get("source_catalog", {}).get("databases", [])
    linked_table_to_databases: dict[str, list[str]] = registry.get("source_catalog", {}).get("linked_table_to_databases", {})
    required_source_keys = {row.get("source_key") for row in source_db_rows if row.get("source_key")}

    unresolved_refs: dict[str, set[str]] = defaultdict(set)
    resolved_table_sources: defaultdict[str, set[str]] = defaultdict(set)
    query_rows: list[dict] = []

    for query_name in query_names:
        sql_row = sql_by_name.get(query_name, {})
        sql_text = sql_row.get("selected_sql") or ""
        refs = sorted(extract_identifiers_from_sql(sql_text), key=lambda v: v.lower())

        query_refs: list[str] = []
        resolved_tables: list[dict] = []
        unresolved_tables: list[str] = []

        for ref in refs:
            lowered = ref.lower()
            matched_query = query_lookup.get(lowered)
            if matched_query:
                query_refs.append(matched_query)
                continue

            sources = table_to_sources.get(lowered)
            if not sources:
                unresolved_tables.append(ref)
                unresolved_refs[ref].add(query_name)
                continue

            resolved_tables.append({"name": ref, "source_keys": sorted(sources)})
            for source_key in sources:
                resolved_table_sources[ref].add(source_key)

        query_rows.append(
            {
                "query_name": query_name,
                "table_references_detected": refs,
                "query_dependencies_from_sql": sorted(set(query_refs), key=lambda v: v.lower()),
                "resolved_base_tables": resolved_tables,
                "unresolved_base_tables": sorted(set(unresolved_tables), key=lambda v: v.lower()),
            }
        )

    required_tables = sorted(resolved_table_sources.keys(), key=lambda v: v.lower())
    missing_tables = sorted(unresolved_refs.keys(), key=lambda v: v.lower())

    required_table_rows = []
    for table_name in required_tables:
        required_table_rows.append(
            {
                "table_name": table_name,
                "source_keys": sorted(resolved_table_sources[table_name]),
            }
        )

    unresolved_rows = []
    search_roots = [
        Path.cwd(),
        Path.cwd() / "MVQS_Database 2",
        Path.cwd().parent,
        Path.cwd().parent / "MVQS_Database 2",
        Path.home() / "Downloads",
        Path.home() / "Downloads" / "MVQS",
        Path.home() / "Downloads" / "MVQS_Database 2",
        Path.home() / "Downloads" / "MVQS" / "MVQS_Database 2",
    ]
    for table_name in missing_tables:
        expected_databases = linked_table_to_databases.get(table_name.lower(), [])
        local_candidates: list[str] = []
        for db_path in expected_databases:
            basename = os.path.basename(db_path.replace("\\", "/"))
            if not basename:
                continue
            for root in search_roots:
                candidate = (root / basename).resolve()
                if candidate.exists():
                    local_candidates.append(str(candidate))

        unresolved_rows.append(
            {
                "table_name": table_name,
                "referenced_by_queries": sorted(unresolved_refs[table_name], key=lambda v: v.lower()),
                "expected_linked_source_databases": expected_databases,
                "local_candidate_databases_found": sorted(set(local_candidates)),
            }
        )

    missing_table_count = len(missing_tables)

    return {
        "generated_at_utc": now_iso(),
        "snapshot_id": snapshot_id,
        "stats": {
            "queries_checked": len(query_names),
            "required_base_tables_count": len(required_tables),
            "missing_table_refs": missing_table_count,
            "required_source_count": len(required_source_keys),
        },
        "required_sources": sorted(required_source_keys),
        "source_databases": [
            {
                "source_key": row.get("source_key"),
                "source_type": row.get("source_type"),
                "path": row.get("path"),
            }
            for row in source_db_rows
        ],
        "required_base_tables": required_table_rows,
        "unresolved_table_references": unresolved_rows,
        "by_query": query_rows,
        "gate": {
            "missing_table_refs": missing_table_count,
            "missing_table_refs_pass": missing_table_count == 0,
        },
    }


def main() -> int:
    args = parse_args()
    registry_path = Path(args.registry_json).expanduser().resolve()
    if not registry_path.exists():
        raise RuntimeError(f"Registry JSON not found: {registry_path}")

    registry = load_json(registry_path)
    snapshot_id = args.snapshot_id or registry.get("snapshot_id") or timestamp_id()

    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    query_order = build_query_order(registry, snapshot_id)
    table_taps = build_table_tap_coverage(registry, query_order, snapshot_id)

    query_path = out_dir / f"query_order_{snapshot_id}.json"
    coverage_path = out_dir / f"table_tap_coverage_{snapshot_id}.json"

    query_path.write_text(json.dumps(query_order, indent=2) + "\n", encoding="utf-8")
    coverage_path.write_text(json.dumps(table_taps, indent=2) + "\n", encoding="utf-8")
    latest_query = out_dir / "latest_query_order.json"
    latest_coverage = out_dir / "latest_table_tap_coverage.json"
    latest_query.write_text(json.dumps(query_order, indent=2) + "\n", encoding="utf-8")
    latest_coverage.write_text(json.dumps(table_taps, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote query order: {query_path}")
    print(f"Wrote table taps: {coverage_path}")
    print(f"Wrote latest query alias: {latest_query}")
    print(f"Wrote latest table-tap alias: {latest_coverage}")
    print(
        json.dumps(
            {
                "canonical_queries_total": query_order["stats"]["canonical_queries_total"],
                "cycle_node_count": query_order["stats"]["cycle_node_count"],
                "required_base_tables_count": table_taps["stats"]["required_base_tables_count"],
                "missing_table_refs": table_taps["stats"]["missing_table_refs"],
            },
            indent=2,
        )
    )

    if args.fail_on_missing_table:
        excluded = KNOWN_ABSENT_TABLES | set(args.exclude_tables or [])
        actionable_missing = [
            entry
            for entry in table_taps.get("unresolved_table_references", [])
            if entry["table_name"] not in excluded
        ]
        actionable_count = len(actionable_missing)
        table_taps["gate"]["excluded_known_absent"] = sorted(
            t["table_name"]
            for t in table_taps.get("unresolved_table_references", [])
            if t["table_name"] in excluded
        )
        table_taps["gate"]["actionable_missing_count"] = actionable_count
        # Re-write updated coverage with gate details
        coverage_path.write_text(json.dumps(table_taps, indent=2) + "\n", encoding="utf-8")
        latest_coverage.write_text(json.dumps(table_taps, indent=2) + "\n", encoding="utf-8")
        if actionable_count > 0:
            print(f"FAIL: {actionable_count} actionable missing table(s) after exclusions.")
            for entry in actionable_missing:
                print(f"  - {entry['table_name']} (referenced by {len(entry.get('referenced_by_queries', []))} queries)")
            return 2
        elif table_taps["stats"]["missing_table_refs"] > 0:
            print(
                f"OK: {table_taps['stats']['missing_table_refs']} missing table(s) all in KNOWN_ABSENT_TABLES exclusion list."
            )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"FAIL: {exc}")
        raise SystemExit(1)
