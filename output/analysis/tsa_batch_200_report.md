# MVQS TSA 200-Case Batch Validation

- Generated: 2026-02-16T20:37:40.623882+00:00
- Base URL: `http://localhost:4173`
- DB Path: `/Users/chrisskerritt/Downloads/MVQS/data/mvqs-modern.db`
- Cases Requested: 200
- Cases Run: 200
- Seed: 20260216
- Tighten Mode: clinical_mild
- Raw JSON: `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_200_metrics.json`

## Health and Readiness

- `/api/health.ok`: True
- `/api/readiness.overall_status`: pass
- `/api/readiness.blocking`: False

## Reliability Checks

- Deterministic pass/fail: 200/0
- Gate invariant failures: 0
- Unskilled cap failures: 0
- Monotonic total failures: 0
- Monotonic overlap failures: 0
- Strength cap failures: 0
- Aggregate pagination consistency failures: 0

## Distribution Stats

- High-profile totals: mean=241.41, median=70.5, p90=715.6999999999998, min=1, max=2791
- Low-profile totals: mean=82.29, median=10.0, p90=189.49999999999991, min=0, max=2335
- High-profile average TSP: mean=21.482, median=19.0, p90=37.1, min=4.6, max=97.0

## Notes

- If all failure counters are zero, the computation is highly stable for repeatability and rule invariants under this 200-case sample.
- This benchmark validates internal consistency and constraints, not external ground-truth parity for every case.
