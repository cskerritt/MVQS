# MVQS Standard Error Summary

Generated: 2026-02-16 UTC

## 1) Rule/Invariant Error-Rate Standard Error (1000-case run)

Source: `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_1000_standard_error.json`

- Sample size: `n=1000`
- Observed failures for each rule category: `0`
- Observed error rate: `0.0000`
- Binomial SE at observed rate: `0.0000`

When failures are zero, use an upper bound estimate:

- 95% one-sided upper bound (rule of 3): `3/n = 0.0030` (0.30%)
- 95% one-sided Clopper-Pearson upper bound: `0.002991` (0.299%)

Interpretation: with 1000 tested scenarios and zero observed failures, the true failure rate is likely below ~0.3% per rule class at 95% confidence.

## 2) External Parity MAE Standard Error (PDF replay set)

Source: `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_external_parity_standard_error.json`

- Matched rows: `n=740`

TS absolute error:

- MAE: `0.9876`
- SD of absolute error: `1.9716`
- SE of MAE: `0.0725`
- Approx. 95% CI for MAE: `[0.8455, 1.1296]`

VA absolute error:

- MAE: `15.7843`
- SD of absolute error: `8.6460`
- SE of MAE: `0.3178`
- Approx. 95% CI for MAE: `[15.1614, 16.4073]`

Interpretation: TS parity error is low and tightly estimated; VA parity error is materially higher and remains the primary calibration gap.

