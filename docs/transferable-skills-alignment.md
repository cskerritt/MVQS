# Transferable Skills Alignment (MVQS_DC_FrontEnds_v314)

This project now includes a dedicated transferable-skills analysis mode that is intentionally aligned to the legacy MVQS source package shared in:

- `/Users/chrisskerritt/Downloads/MVQS_DC_FrontEnds_v314/The MVQS Theory of Transferable Skills.doc`
- `/Users/chrisskerritt/Downloads/MVQS_DC_FrontEnds_v314/MVQS_Codes_15.doc`
- `/Users/chrisskerritt/Downloads/MVQS_DC_FrontEnds_v314/The Relationship Between Reliability and Validity.doc`
- `/Users/chrisskerritt/Downloads/MVQS_DC_FrontEnds_v314/MVQS_DC_FrontEnd_with_Adobe.accdb`

## Implemented in MVQS Modern

- Endpoint: `POST /api/transferable-skills/analyze`
- UI action: `Run Transferable Skills`
- Core output fields:
  - `tsp_percent`
  - `tsp_level`
  - `tsp_label`
  - `transfer_direction`
  - `signal_scores` (trait/dot/onet/vq/svp components)

## Mapping to MVQS concepts

- TSP bands match MVQS code sheet ranges:
  - Level 1: `0-19`
  - Level 2: `20-39`
  - Level 3: `40-59`
  - Level 4: `60-79`
  - Level 5: `80-97`
- VQ rule aligned to MVQS transferability notes:
  - target jobs with `VQ < 85` are constrained to Level 1 (`0-19`).
- Ranking factors use currently available modern SQLite fields:
  - 24-trait profile similarity from `trait_vector`
  - DOT prefix similarity from `dot_code` (first 3 digits emphasized)
  - O*NET prefix similarity from `onet_ou_code`
  - `vq` proximity
  - `svp` proximity
- Legacy front-end string extraction from `MVQS_DC_FrontEnd_with_Adobe.accdb` showed `PreTSP0-4` and `PostTSP0-4` style fields; MVQS Modern now exposes equivalent banded counts as `tsp_band_counts.level_1` through `tsp_band_counts.level_5`.

## Current-structure constraint

The modern database does not currently store all legacy crosswalk variables referenced by historical MVQS TSA implementations (for example, full MPSMS/MTEWA/SIC/SOC/CEN/IND comparisons as independently queryable tables). The implemented analysis therefore uses the highest-signal variables that do exist in the current schema and reports component scores transparently.

## Additional manual corpus alignment

Legacy run/install/manual docs for MVQS/VDARE/Volcano (2015-2017) were also reviewed to align UI presentation and workflow language. Source list and applied mapping are documented in `docs/manual-intent-map.md`.
