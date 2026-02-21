# MVQS MTSP Corpus Retest

- Generated: 2026-02-17T21:35:42.977093Z
- Base URL: http://localhost:4173
- PDF directory: /Users/chrisskerritt/Downloads/MTSP Files
- Files scanned: 40
- Files parsed: 40
- Files replayed: 13
- Files compared: 13
- Files skipped: 27
- Rows compared: 2660

## Metrics

- TS MAE (direct): 2.472
- TS MAE (band floor 0/20/40/60/80): 1.458
- TS MAE (adaptive per-file): 1.454 (gate=2.0, pass=True)
- VA MAE (direct 0-39): 21.797
- VA MAE (100-minus transform): 63.078
- VA MAE (adaptive per-file): 9.414 (gate=5.0, pass=False)
- TS RMSE (adaptive per-file): 7.048
- VA RMSE (adaptive per-file): 11.926
- TS 95% CI MAE (adaptive): [1.192, 1.716]
- VA 95% CI MAE (adaptive): [9.136, 9.692]
- Overall pass: False

## Skips

- missing_state: 25
- missing_report_rows: 2

## Worst Files by VA MAE

- /Users/chrisskerritt/Downloads/MTSP Files/Acosta MTSP (2024).pdf: overlap=2, ts_mae=0.000, va_mae=11.000, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Acosta MTSP (2024_2).pdf: overlap=2, ts_mae=0.000, va_mae=11.000, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf: overlap=1813, ts_mae=0.000, va_mae=10.829, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP sedentary profile.pdf: overlap=28, ts_mae=0.929, va_mae=8.568, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP light profile.pdf: overlap=198, ts_mae=6.444, va_mae=7.068, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP (2025).pdf: overlap=22, ts_mae=1.182, va_mae=6.677, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf: overlap=432, ts_mae=5.296, va_mae=6.633, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP.pdf: overlap=73, ts_mae=1.767, va_mae=4.910, ts_mode=direct_api_ts, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Abad MTSP.pdf: overlap=1, ts_mae=0.000, va_mae=4.000, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Abril Erazo, Angel - MTSP.pdf: overlap=1, ts_mae=0.000, va_mae=4.000, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Acosta MTSP (2025).pdf: overlap=1, ts_mae=0.000, va_mae=4.000, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Abbate MTSP.pdf: overlap=84, ts_mae=1.464, va_mae=3.949, ts_mode=band_floor_20_steps, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP.pdf: overlap=3, ts_mae=0.000, va_mae=3.800, ts_mode=band_floor_20_steps, va_mode=inverted_100_minus_api_va

## Largest Row Deltas

- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=801381010 | sample TS/VA=91/36 | api TS/VA=97.0/0.0 | abs TS direct/band=6.0/11.0 | abs VA direct/inverted/raw46/pct46=36.0/64.0/36.0/36.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=299137010 | sample TS/VA=20/4 | api TS/VA=21.0/7.8 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=3.8/88.2/32.0/74.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=185167046 | sample TS/VA=20/4 | api TS/VA=21.0/7.0 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=3.0/89.0/32.0/74.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=142061014 | sample TS/VA=20/4 | api TS/VA=21.0/7.4 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=3.4/88.6/32.0/74.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=141137010 | sample TS/VA=20/4 | api TS/VA=21.0/7.0 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=3.0/89.0/32.0/74.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=185167014 | sample TS/VA=20/4 | api TS/VA=21.0/9.9 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=5.9/86.1/32.0/74.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=185167022 | sample TS/VA=20/4 | api TS/VA=21.0/7.4 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=3.4/88.6/32.0/74.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=185167030 | sample TS/VA=20/4 | api TS/VA=21.0/8.6 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=4.6/87.4/32.0/74.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=185167038 | sample TS/VA=20/4 | api TS/VA=21.0/7.1 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=3.1/88.9/32.0/74.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=169167038 | sample TS/VA=20/4 | api TS/VA=21.0/5.9 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.9/90.1/32.0/74.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=211132010 | sample TS/VA=20/5 | api TS/VA=21.0/7.3 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=2.3/87.7/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=211137010 | sample TS/VA=20/5 | api TS/VA=21.0/7.2 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=2.2/87.8/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=211137014 | sample TS/VA=20/5 | api TS/VA=21.0/7.2 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=2.2/87.8/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=216137014 | sample TS/VA=20/5 | api TS/VA=21.0/7.0 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=2.0/88.0/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=211137022 | sample TS/VA=20/5 | api TS/VA=21.0/6.4 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.4/88.6/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=214137010 | sample TS/VA=20/5 | api TS/VA=21.0/7.1 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=2.1/87.9/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=214137022 | sample TS/VA=20/5 | api TS/VA=21.0/6.4 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.4/88.6/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=205137014 | sample TS/VA=20/5 | api TS/VA=21.0/7.1 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=2.1/87.9/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=205162010 | sample TS/VA=20/5 | api TS/VA=21.0/6.3 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.3/88.7/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=248137018 | sample TS/VA=20/5 | api TS/VA=21.0/7.0 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=2.0/88.0/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=249137026 | sample TS/VA=20/5 | api TS/VA=21.0/6.1 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.1/88.9/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=241137010 | sample TS/VA=20/5 | api TS/VA=21.0/6.1 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.1/88.9/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=241137018 | sample TS/VA=20/5 | api TS/VA=21.0/6.2 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.2/88.8/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=239137014 | sample TS/VA=20/5 | api TS/VA=21.0/6.1 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.1/88.9/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=238137010 | sample TS/VA=20/5 | api TS/VA=21.0/7.1 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=2.1/87.9/31.0/73.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=379132010 | sample TS/VA=20/5 | api TS/VA=21.2/6.8 | abs TS direct/band=1.2/0.0 | abs VA direct/inverted/raw46/pct46=1.8/88.2/30.9/73.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=962167014 | sample TS/VA=20/5 | api TS/VA=21.5/7.8 | abs TS direct/band=1.5/0.0 | abs VA direct/inverted/raw46/pct46=2.8/87.2/30.8/72.8
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=381137014 | sample TS/VA=20/6 | api TS/VA=21.0/6.9 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.9/87.1/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=139167010 | sample TS/VA=20/6 | api TS/VA=21.0/7.0 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.0/87.0/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=210132010 | sample TS/VA=20/6 | api TS/VA=21.0/7.7 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.7/86.3/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=209132010 | sample TS/VA=20/6 | api TS/VA=21.0/7.0 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.0/87.0/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=209137010 | sample TS/VA=20/6 | api TS/VA=21.0/7.3 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.3/86.7/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=216132010 | sample TS/VA=20/6 | api TS/VA=21.0/6.9 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.9/87.1/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=219132014 | sample TS/VA=20/6 | api TS/VA=21.0/6.6 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.6/87.4/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=215137014 | sample TS/VA=20/6 | api TS/VA=21.0/6.6 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.6/87.4/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=203137010 | sample TS/VA=20/6 | api TS/VA=21.0/6.7 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.7/87.3/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=222137030 | sample TS/VA=20/6 | api TS/VA=21.0/7.5 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.5/86.5/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=221137018 | sample TS/VA=20/6 | api TS/VA=21.0/7.3 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.3/86.7/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=222137050 | sample TS/VA=20/6 | api TS/VA=21.0/6.9 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.9/87.1/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=222137034 | sample TS/VA=20/6 | api TS/VA=21.0/7.3 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.3/86.7/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=239132010 | sample TS/VA=20/6 | api TS/VA=21.0/7.3 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.3/86.7/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=243137010 | sample TS/VA=20/6 | api TS/VA=21.0/6.8 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.8/87.2/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=235137010 | sample TS/VA=20/6 | api TS/VA=21.0/6.8 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.8/87.2/30.0/72.3
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP (2025).pdf | dot=359673010 | sample TS/VA=94/29 | api TS/VA=97.0/0.0 | abs TS direct/band=3.0/14.0 | abs VA direct/inverted/raw46/pct46=29.0/71.0/29.0/29.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=354677010 | sample TS/VA=20/7 | api TS/VA=21.0/6.6 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.4/86.4/29.0/71.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=365131010 | sample TS/VA=20/7 | api TS/VA=21.0/7.7 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.7/85.3/29.0/71.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=166267042 | sample TS/VA=20/7 | api TS/VA=21.0/5.8 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=1.2/87.2/29.0/71.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=039264010 | sample TS/VA=20/7 | api TS/VA=21.0/9.2 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=2.2/83.8/29.0/71.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=032262010 | sample TS/VA=20/7 | api TS/VA=21.0/6.8 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.2/86.2/29.0/71.3
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=031262014 | sample TS/VA=20/7 | api TS/VA=21.0/7.7 | abs TS direct/band=1.0/0.0 | abs VA direct/inverted/raw46/pct46=0.7/85.3/29.0/71.3

