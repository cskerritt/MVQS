# MVQS MTSP Corpus Retest

- Generated: 2026-02-17T21:29:24.418894Z
- Base URL: http://localhost:4173
- PDF directory: /Users/chrisskerritt/Downloads/MTSP Files
- Files scanned: 40
- Files parsed: 40
- Files replayed: 13
- Files compared: 13
- Files skipped: 27
- Rows compared: 2660

## Metrics

- TS MAE: 2.472 (gate=2.0, pass=False)
- VA MAE (direct 0-39): 21.797
- VA MAE (100-minus transform): 63.078
- VA MAE (adaptive per-file): 19.397 (gate=5.0, pass=False)
- TS RMSE: 7.015
- VA RMSE (adaptive per-file): 21.704
- TS 95% CI MAE: [2.222, 2.721]
- VA 95% CI MAE (adaptive): [19.027, 19.767]
- Overall pass: False

## Skips

- missing_state: 25
- missing_report_rows: 2

## Worst Files by VA MAE

- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP (2025).pdf: overlap=22, ts_mae=4.268, va_mae=25.264, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Abad MTSP.pdf: overlap=1, ts_mae=1.000, va_mae=23.100, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Abril Erazo, Angel - MTSP.pdf: overlap=1, ts_mae=1.000, va_mae=23.100, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf: overlap=432, ts_mae=5.966, va_mae=22.913, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP light profile.pdf: overlap=198, ts_mae=7.193, va_mae=22.042, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Acosta MTSP (2025).pdf: overlap=1, ts_mae=1.000, va_mae=21.300, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf: overlap=1813, ts_mae=1.140, va_mae=19.530, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP sedentary profile.pdf: overlap=28, ts_mae=1.793, va_mae=19.404, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Acosta MTSP (2024).pdf: overlap=2, ts_mae=1.000, va_mae=14.450, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Acosta MTSP (2024_2).pdf: overlap=2, ts_mae=1.000, va_mae=14.450, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP.pdf: overlap=73, ts_mae=1.767, va_mae=4.910, va_mode=direct_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Abbate MTSP.pdf: overlap=84, ts_mae=2.643, va_mae=3.949, va_mode=inverted_100_minus_api_va
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP.pdf: overlap=3, ts_mae=1.467, va_mae=3.800, va_mode=inverted_100_minus_api_va

## Largest Row Deltas

- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=525687126 | sample TS/VA=0/46 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=46.0/54.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=525687074 | sample TS/VA=0/46 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=46.0/54.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=405687010 | sample TS/VA=0/45 | api TS/VA=1.7/0.0 | abs TS=1.7 | abs VA direct/inverted=45.0/55.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=922687058 | sample TS/VA=0/43 | api TS/VA=10.0/0.0 | abs TS=10.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=979687022 | sample TS/VA=0/43 | api TS/VA=9.9/0.0 | abs TS=9.9 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=362686010 | sample TS/VA=0/43 | api TS/VA=9.2/0.0 | abs TS=9.2 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP light profile.pdf | dot=230687010 | sample TS/VA=0/43 | api TS/VA=6.4/0.0 | abs TS=6.4 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=230687010 | sample TS/VA=0/43 | api TS/VA=6.4/0.0 | abs TS=6.4 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=529686034 | sample TS/VA=0/43 | api TS/VA=5.9/0.0 | abs TS=5.9 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=979687022 | sample TS/VA=0/43 | api TS/VA=5.6/0.0 | abs TS=5.6 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=955687018 | sample TS/VA=0/43 | api TS/VA=5.6/0.0 | abs TS=5.6 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=922687062 | sample TS/VA=0/43 | api TS/VA=5.6/0.0 | abs TS=5.6 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=922687058 | sample TS/VA=0/43 | api TS/VA=5.6/0.0 | abs TS=5.6 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=920687190 | sample TS/VA=0/43 | api TS/VA=5.6/0.0 | abs TS=5.6 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=909687014 | sample TS/VA=0/43 | api TS/VA=5.6/0.0 | abs TS=5.6 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP light profile.pdf | dot=209587034 | sample TS/VA=0/43 | api TS/VA=5.6/0.0 | abs TS=5.6 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=209587034 | sample TS/VA=0/43 | api TS/VA=5.6/0.0 | abs TS=5.6 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=403687018 | sample TS/VA=0/43 | api TS/VA=5.5/0.0 | abs TS=5.5 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=735687010 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=652686038 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=589687026 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=586686022 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=809687022 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=550687010 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=362686010 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=361687018 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=369687018 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=230687010 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=209587034 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=529686034 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=403687018 | sample TS/VA=0/43 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=579667010 | sample TS/VA=0/43 | api TS/VA=1.7/0.0 | abs TS=1.7 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=691687010 | sample TS/VA=0/43 | api TS/VA=1.7/0.0 | abs TS=1.7 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=363687014 | sample TS/VA=0/43 | api TS/VA=1.7/0.0 | abs TS=1.7 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=404687014 | sample TS/VA=0/43 | api TS/VA=1.7/0.0 | abs TS=1.7 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=403687022 | sample TS/VA=0/43 | api TS/VA=1.7/0.0 | abs TS=1.7 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=402687014 | sample TS/VA=0/43 | api TS/VA=1.7/0.0 | abs TS=1.7 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=409687018 | sample TS/VA=0/43 | api TS/VA=1.7/0.0 | abs TS=1.7 | abs VA direct/inverted=43.0/57.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=381687018 | sample TS/VA=0/42 | api TS/VA=10.2/0.0 | abs TS=10.2 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=381687034 | sample TS/VA=0/42 | api TS/VA=10.0/0.0 | abs TS=10.0 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=312687010 | sample TS/VA=9/42 | api TS/VA=18.4/0.0 | abs TS=9.4 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP (2025).pdf | dot=311677010 | sample TS/VA=0/42 | api TS/VA=8.8/0.0 | abs TS=8.8 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP light profile.pdf | dot=311677010 | sample TS/VA=11/42 | api TS/VA=19.0/0.0 | abs TS=8.0 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=311677018 | sample TS/VA=11/42 | api TS/VA=19.0/0.0 | abs TS=8.0 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/Abreu MTSP profile.pdf | dot=311677010 | sample TS/VA=11/42 | api TS/VA=19.0/0.0 | abs TS=8.0 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=312687010 | sample TS/VA=0/42 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=311677018 | sample TS/VA=0/42 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=311677010 | sample TS/VA=0/42 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=409687014 | sample TS/VA=0/42 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=42.0/58.0
- /Users/chrisskerritt/Downloads/MTSP Files/A.K - MTSP( Average Worker).pdf | dot=389687014 | sample TS/VA=0/42 | api TS/VA=2.0/0.0 | abs TS=2.0 | abs VA direct/inverted=42.0/58.0

