# TSA Batch Trend Comparison (200 vs 500 vs 1000)

| Run | Cases | Deterministic Pass | Any Rule Failures | High Total Mean | High Total Median | High Total P90 | Low Total Mean | Low Total Median | Low Total P90 | High Avg TS Mean | High Avg TS Median | High Avg TS P90 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200 | 200 | 200 | 0 | 241.41 | 70.5 | 715.6999999999998 | 82.29 | 10.0 | 189.49999999999991 | 21.482 | 19.0 | 37.1 |
| 500 | 500 | 500 | 0 | 248.22 | 65.0 | 664.400000000001 | 82.05 | 10.0 | 177.20000000000005 | 20.956 | 19.0 | 36.740000000000016 |
| 1000 | 1000 | 1000 | 0 | 241.71 | 64.5 | 652.5000000000001 | 74.79 | 9.0 | 160.10000000000002 | 20.56 | 19.15 | 35.830000000000005 |

## Stability Notes

- All three runs show zero invariant/rule failures.
- Distribution statistics are directionally stable as sample size increases to 1000.
- Minor drift in means/percentiles is expected from random scenario sampling.
