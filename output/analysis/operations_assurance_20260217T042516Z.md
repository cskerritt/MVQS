# MVQS Operations Assurance Report

- Generated: 2026-02-17T04:25:22.633453+00:00
- Base URL: `http://localhost:4173`
- Workspace: `/Users/chrisskerritt/Downloads/MVQS`
- Total checks: 15
- Passed: 15
- Failed: 0

## Environment

- Health ok: True
- Readiness overall: pass
- Readiness blocking: False

## Smoke Coverage

- Smoke exit code: 0
- Smoke PASS lines: 40

## Key Findings

- [PASS] `platform.health_and_readiness`
- [PASS] `platform.smoke_api`
- [PASS] `setup.source_dot_discovery`
- [PASS] `case.create`
- [PASS] `case.intake_block_gate`
- [PASS] `case.patch_required_fields`
- [PASS] `case.work_history_put`
- [PASS] `profiles.residual_cap_enforced`
- [PASS] `case.analysis_transferable`
- [PASS] `analysis.pagination_aggregate_consistency`
- [PASS] `analysis.multi_source_best_source_selection`
- [PASS] `reports.match_save`
- [PASS] `reports.tsa_save`
- [PASS] `exports.hash_parity_validation`
- [PASS] `exports.case_packet_integrity`

## Scale Trend (200/500/1000)

| Run | Cases | Deterministic Pass | Any Rule Failures | High Total Mean | Low Total Mean | High Avg TS Mean |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 200 | 200 | 200 | 0 | 241.41 | 82.29 | 21.482 |
| 500 | 500 | 500 | 0 | 248.22 | 82.05 | 20.956 |
| 1000 | 1000 | 1000 | 0 | 241.71 | 74.79 | 20.56 |

## Standard Error Snapshot

- Cases for rule-rate SE: 1000
- `deterministic_fail`: failures=0, error_rate=0.0, se=0.0, upper95=0.0029912495450953314
- `gate_invariant_fail`: failures=0, error_rate=0.0, se=0.0, upper95=0.0029912495450953314
- `unskilled_cap_fail`: failures=0, error_rate=0.0, se=0.0, upper95=0.0029912495450953314
- `monotonic_total_fail`: failures=0, error_rate=0.0, se=0.0, upper95=0.0029912495450953314
- `monotonic_overlap_fail`: failures=0, error_rate=0.0, se=0.0, upper95=0.0029912495450953314
- `strength_cap_fail`: failures=0, error_rate=0.0, se=0.0, upper95=0.0029912495450953314
- `aggregate_consistency_fail`: failures=0, error_rate=0.0, se=0.0, upper95=0.0029912495450953314

## External Parity Error Snapshot

- TS MAE=0.9875675675675676, SE=0.07247897091215182, CI95=[0.84550878457975, 1.1296263505553852]
- VA MAE=15.784324324324324, SE=0.31783310173484425, CI95=[15.161371444924029, 16.407277203724618]

## Evidence Files

- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_200_report.md`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_500_report.md`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_1000_report.md`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_trend_comparison.md`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/computation_validity_report.md`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/standard_error_summary.md`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/pdf_case_replay_metrics.json`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_external_parity_standard_error.json`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_1000_standard_error.json`
