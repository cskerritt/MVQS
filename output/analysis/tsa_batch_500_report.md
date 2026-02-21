# MVQS TSA 200-Case Batch Validation

- Generated: 2026-02-16T21:23:24.062848+00:00
- Base URL: `http://localhost:4173`
- DB Path: `/Users/chrisskerritt/Downloads/MVQS/data/mvqs-modern.db`
- Cases Requested: 500
- Cases Run: 500
- Seed: 20260216
- Tighten Mode: clinical_mild
- Raw JSON: `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_500_metrics.json`

## Health and Readiness

- `/api/health.ok`: True
- `/api/readiness.overall_status`: pass
- `/api/readiness.blocking`: False

## Reliability Checks

- Deterministic pass/fail: 500/0
- Gate invariant failures: 0
- Unskilled cap failures: 0
- Monotonic total failures: 0
- Monotonic overlap failures: 0
- Strength cap failures: 0
- Aggregate pagination consistency failures: 0

## Distribution Stats

- High-profile totals: mean=248.22, median=65.0, p90=664.400000000001, min=1, max=4671
- Low-profile totals: mean=82.05, median=10.0, p90=177.20000000000005, min=0, max=2768
- High-profile average TSP: mean=20.956, median=19.0, p90=36.740000000000016, min=4.5, max=97.0

## Notes

- If all failure counters are zero, the computation is highly stable for repeatability and rule invariants under this 200-case sample.
- This benchmark validates internal consistency and constraints, not external ground-truth parity for every case.
