# MVQS TSA 200-Case Batch Validation

- Generated: 2026-02-16T21:25:22.880185+00:00
- Base URL: `http://localhost:4173`
- DB Path: `/Users/chrisskerritt/Downloads/MVQS/data/mvqs-modern.db`
- Cases Requested: 1000
- Cases Run: 1000
- Seed: 20260216
- Tighten Mode: clinical_mild
- Raw JSON: `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_1000_metrics.json`

## Health and Readiness

- `/api/health.ok`: True
- `/api/readiness.overall_status`: pass
- `/api/readiness.blocking`: False

## Reliability Checks

- Deterministic pass/fail: 1000/0
- Gate invariant failures: 0
- Unskilled cap failures: 0
- Monotonic total failures: 0
- Monotonic overlap failures: 0
- Strength cap failures: 0
- Aggregate pagination consistency failures: 0

## Distribution Stats

- High-profile totals: mean=241.71, median=64.5, p90=652.5000000000001, min=1, max=4671
- Low-profile totals: mean=74.79, median=9.0, p90=160.10000000000002, min=0, max=2768
- High-profile average TSP: mean=20.56, median=19.15, p90=35.830000000000005, min=4.5, max=97.0

## Notes

- If all failure counters are zero, the computation is highly stable for repeatability and rule invariants under this 200-case sample.
- This benchmark validates internal consistency and constraints, not external ground-truth parity for every case.
