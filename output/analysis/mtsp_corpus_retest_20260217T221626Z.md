# MVQS MTSP Corpus Retest

- Generated: 2026-02-17T22:16:26.263627Z
- Base URL: http://localhost:4173
- PDF directory: /Users/chrisskerritt/Downloads/MTSP Files
- Files scanned: 3631
- Files parsed: 3631
- Files replayed: 2843
- Files compared: 2840
- Files skipped: 791
- Rows compared: 251934

## Metrics

- TS MAE (direct): 2.212
- TS MAE (band floor 0/20/40/60/80): 1.350
- TS MAE (adaptive per-file): 1.298 (gate=2.0, pass=True)
- VA MAE (direct 0-39): 30.631
- VA MAE (100-minus transform): 51.456
- VA MAE (adaptive per-file): 9.296 (gate=5.0, pass=False)
- TS RMSE (adaptive per-file): 4.166
- VA RMSE (adaptive per-file): 12.101
- TS 95% CI MAE (adaptive): [1.283, 1.314]
- VA 95% CI MAE (adaptive): [9.266, 9.327]
- Overall pass: False

## Skips

- missing_state: 382
- missing_report_rows: 378
- missing_source_dots: 24
- missing_profile_vector: 4
- no_overlap: 3

## Worst Files by VA MAE

- /Users/chrisskerritt/Downloads/MTSP Files/Crosbie.MTSP.pdf: overlap=4, ts_mae=0.750, va_mae=24.707, ts_mode=band_floor_20_steps, va_mode=legacy_pct_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Frasca MTSP.pdf: overlap=173, ts_mae=0.121, va_mae=20.538, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/McLeod MTSP.pdf: overlap=3, ts_mae=0.000, va_mae=19.406, ts_mode=band_floor_20_steps, va_mode=legacy_pct_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Tasy MTSP.pdf: overlap=17, ts_mae=3.565, va_mae=18.771, ts_mode=direct_api_ts, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Livingston MTSP (2019).pdf: overlap=259, ts_mae=1.718, va_mae=17.879, ts_mode=band_floor_20_steps, va_mode=legacy_pct_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Ofenbakh MTSP.pdf: overlap=331, ts_mae=2.108, va_mae=17.856, ts_mode=direct_api_ts, va_mode=legacy_pct_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Bonsall MTSP.pdf: overlap=159, ts_mae=0.264, va_mae=17.112, ts_mode=band_floor_20_steps, va_mode=legacy_pct_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Gamel MTSP.pdf: overlap=58, ts_mae=3.084, va_mae=17.093, ts_mode=direct_api_ts, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Hu MTSP.pdf: overlap=326, ts_mae=2.294, va_mae=16.967, ts_mode=direct_api_ts, va_mode=legacy_pct_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Barrington MTSP.pdf: overlap=167, ts_mae=2.230, va_mae=16.831, ts_mode=direct_api_ts, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Akerley MTSP.pdf: overlap=4, ts_mae=0.000, va_mae=16.800, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/McConaghy MTSP Profile.pdf: overlap=6, ts_mae=2.350, va_mae=16.683, ts_mode=direct_api_ts, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Streicher - MTSP.pdf: overlap=48, ts_mae=1.979, va_mae=16.177, ts_mode=band_floor_20_steps, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Foley MTSP.pdf: overlap=25, ts_mae=0.600, va_mae=16.115, ts_mode=band_floor_20_steps, va_mode=legacy_pct_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Gardiner MTSP.pdf: overlap=34, ts_mae=4.079, va_mae=16.065, ts_mode=direct_api_ts, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Podesta MTSP.pdf: overlap=148, ts_mae=2.576, va_mae=15.770, ts_mode=direct_api_ts, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Robinson MTSP (2022).pdf: overlap=68, ts_mae=2.485, va_mae=15.759, ts_mode=band_floor_20_steps, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Weinberg MTSP.pdf: overlap=46, ts_mae=1.565, va_mae=15.743, ts_mode=band_floor_20_steps, va_mode=legacy_pct_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Ancillotti MTSP.pdf: overlap=178, ts_mae=1.551, va_mae=15.628, ts_mode=band_floor_20_steps, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Walsh MTSP (2019).pdf: overlap=60, ts_mae=2.733, va_mae=15.608, ts_mode=band_floor_20_steps, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Mayo.MTSP.pdf: overlap=196, ts_mae=2.042, va_mae=15.563, ts_mode=direct_api_ts, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Frias Batista - MTSP Sedentary Profile.pdf: overlap=17, ts_mae=4.471, va_mae=15.459, ts_mode=band_floor_20_steps, va_mode=legacy_raw_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Wright MTSP (2018).pdf: overlap=122, ts_mae=2.467, va_mae=15.402, ts_mode=band_floor_20_steps, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Crosbie MTSP.pdf: overlap=6, ts_mae=3.833, va_mae=15.384, ts_mode=band_floor_20_steps, va_mode=legacy_pct_46_minus_tsraw
- /Users/chrisskerritt/Downloads/MTSP Files/Thomas, Tammie - MTSP.pdf: overlap=293, ts_mae=6.601, va_mae=15.229, ts_mode=band_floor_20_steps, va_mode=direct_api_va

## Largest Row Deltas

- /Users/chrisskerritt/Downloads/MTSP Files/Chopra MTSP.pdf | dot=070101022 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Conroy MTSP.pdf | dot=076121010 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Davidoff MTSP.pdf | dot=153227014 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Goldhirsch.MTSP.pdf | dot=110107010 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Grube MTSP.pdf | dot=076107010 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Gruenbaum MTSP NJ.pdf | dot=072101010 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Gruenbaum MTSP.pdf | dot=072101010 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Kim Zajonz MTSP.pdf | dot=132037022 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Mayorquin MTSP.pdf | dot=070101022 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Osler - MTSP.pdf | dot=862381030 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Vaz MTSP.pdf | dot=030062010 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Goldhirsch.MTSP.pdf | dot=110117010 | sample TS/VA=94/100 | api TS/VA=97.0/0.0 | abs TS direct/band=3.0/14.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Osler - MTSP.pdf | dot=862381034 | sample TS/VA=94/100 | api TS/VA=97.0/0.0 | abs TS direct/band=3.0/14.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Rogers MTSP.pdf | dot=824681010 | sample TS/VA=89/100 | api TS/VA=97.0/0.0 | abs TS direct/band=8.0/9.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Forzisi MTSP.pdf | dot=045107022 | sample TS/VA=97/100 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=100.0/0.0/100.0/100.0
- /Users/chrisskerritt/Downloads/MTSP Files/Bock - MTSP.pdf | dot=092227010 | sample TS/VA=97/99 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=99.0/1.0/99.0/99.0
- /Users/chrisskerritt/Downloads/MTSP Files/McNamara.MTSP.pdf | dot=132037022 | sample TS/VA=97/99 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=99.0/1.0/99.0/99.0
- /Users/chrisskerritt/Downloads/MTSP Files/Mancini MTSP.pdf | dot=828261014 | sample TS/VA=89/98 | api TS/VA=97.0/0.0 | abs TS direct/band=8.0/9.0 | abs VA direct/inverted/raw46/pct46=98.0/2.0/98.0/98.0
- /Users/chrisskerritt/Downloads/MTSP Files/Nigam.MTSP.pdf | dot=290477014 | sample TS/VA=97/96 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=96.0/4.0/96.0/96.0
- /Users/chrisskerritt/Downloads/MTSP Files/Obayemi MTSP.pdf | dot=001061010 | sample TS/VA=97/96 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=96.0/4.0/96.0/96.0
- /Users/chrisskerritt/Downloads/MTSP Files/Scardigno MTSP.pdf | dot=824681010 | sample TS/VA=89/96 | api TS/VA=97.0/0.0 | abs TS direct/band=8.0/9.0 | abs VA direct/inverted/raw46/pct46=96.0/4.0/96.0/96.0
- /Users/chrisskerritt/Downloads/MTSP Files/Boyle MTSP.pdf | dot=891137010 | sample TS/VA=97/95 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=95.0/5.0/95.0/95.0
- /Users/chrisskerritt/Downloads/MTSP Files/Langan MTSP.pdf | dot=099227030 | sample TS/VA=97/95 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=95.0/5.0/95.0/95.0
- /Users/chrisskerritt/Downloads/MTSP Files/Moniz - MTSP Medium.pdf | dot=408131010 | sample TS/VA=97/95 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=95.0/5.0/95.0/95.0
- /Users/chrisskerritt/Downloads/MTSP Files/Chen MTSP.pdf | dot=251357010 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Rafferty MTSP.pdf | dot=007061014 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Sirdashney MTSP.pdf | dot=290477014 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Trauerts MTSP.pdf | dot=153227014 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Chen MTSP.pdf | dot=251357026 | sample TS/VA=94/94 | api TS/VA=97.0/0.0 | abs TS direct/band=3.0/14.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Gosselin - MTSP.pdf | dot=824681010 | sample TS/VA=89/94 | api TS/VA=97.0/0.0 | abs TS direct/band=8.0/9.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Myers MTSP.pdf | dot=824681010 | sample TS/VA=89/94 | api TS/VA=97.0/0.0 | abs TS direct/band=8.0/9.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Hu MTSP.pdf | dot=189167022 | sample TS/VA=94/94 | api TS/VA=97.0/0.0 | abs TS direct/band=3.0/14.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Ofenbakh MTSP.pdf | dot=189167022 | sample TS/VA=94/94 | api TS/VA=97.0/0.0 | abs TS direct/band=3.0/14.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Hu MTSP.pdf | dot=189117022 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Hu MTSP.pdf | dot=189117034 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Loaiza MTSP.pdf | dot=076121014 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Myers MTSP.pdf | dot=319137010 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Ofenbakh MTSP.pdf | dot=189117022 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Ofenbakh MTSP.pdf | dot=189117034 | sample TS/VA=97/94 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=94.0/6.0/94.0/94.0
- /Users/chrisskerritt/Downloads/MTSP Files/Mathis MTSP.pdf | dot=824681010 | sample TS/VA=89/93 | api TS/VA=97.0/0.0 | abs TS direct/band=8.0/9.0 | abs VA direct/inverted/raw46/pct46=93.0/7.0/93.0/93.0
- /Users/chrisskerritt/Downloads/MTSP Files/Burke MTSP (2019).pdf | dot=166267046 | sample TS/VA=97/92 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=92.0/8.0/92.0/92.0
- /Users/chrisskerritt/Downloads/MTSP Files/Hampton MTSP.pdf | dot=141061018 | sample TS/VA=97/92 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=92.0/8.0/92.0/92.0
- /Users/chrisskerritt/Downloads/MTSP Files/Loaiza MTSP.pdf | dot=166267046 | sample TS/VA=97/92 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=92.0/8.0/92.0/92.0
- /Users/chrisskerritt/Downloads/MTSP Files/Cucalon MTSP.pdf | dot=250357018 | sample TS/VA=97/90 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=90.0/10.0/90.0/90.0
- /Users/chrisskerritt/Downloads/MTSP Files/Livingston MTSP (2019).pdf | dot=185167046 | sample TS/VA=97/90 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=90.0/10.0/90.0/90.0
- /Users/chrisskerritt/Downloads/MTSP Files/Moniz - MTSP Medium.pdf | dot=860381022 | sample TS/VA=97/90 | api TS/VA=97.0/0.0 | abs TS direct/band=0.0/17.0 | abs VA direct/inverted/raw46/pct46=90.0/10.0/90.0/90.0
- /Users/chrisskerritt/Downloads/MTSP Files/Cucalon MTSP.pdf | dot=250357014 | sample TS/VA=94/90 | api TS/VA=97.0/0.0 | abs TS direct/band=3.0/14.0 | abs VA direct/inverted/raw46/pct46=90.0/10.0/90.0/90.0
- /Users/chrisskerritt/Downloads/MTSP Files/Livingston MTSP (2019).pdf | dot=185167038 | sample TS/VA=91/90 | api TS/VA=97.0/0.0 | abs TS direct/band=6.0/11.0 | abs VA direct/inverted/raw46/pct46=90.0/10.0/90.0/90.0
- /Users/chrisskerritt/Downloads/MTSP Files/Morrison MTSP (2020).pdf | dot=824681010 | sample TS/VA=89/90 | api TS/VA=97.0/0.0 | abs TS direct/band=8.0/9.0 | abs VA direct/inverted/raw46/pct46=90.0/10.0/90.0/90.0
- /Users/chrisskerritt/Downloads/MTSP Files/Morrison MTSP.pdf | dot=824681010 | sample TS/VA=89/90 | api TS/VA=97.0/0.0 | abs TS direct/band=8.0/9.0 | abs VA direct/inverted/raw46/pct46=90.0/10.0/90.0/90.0

