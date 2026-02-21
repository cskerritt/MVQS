# MVQS Modern (Rewrite Baseline)

Modern web interface and API built from legacy MVQS data files.

## What this includes
- Legacy data ingestion into SQLite from:
  - `DOTTitle.prn`, `DOTDesc.PRN`, `DOTVar.prn`, `DOTSkills.prn`, `DOTPop.prn`, `DOTDis.prn`
  - `MVQS2016.mdb` (`DOTTS` task metadata)
  - `jcontrol.mdb` (state/county lookups)
  - state/province job bank MDBs (`tblJobBanks`)
- API for:
  - health, states, counties
  - strict readiness validation (`/api/readiness`) for block-and-fix startup checks
  - job search (with region filters)
  - job detail + task statements
  - profile-based job matching on 24 MVQS worker traits (supports `limit` + `offset`)
  - transferable-skills analysis using MVQS-style TSP bands and current SQLite fields
  - match-report generation (JSON payload suitable for export)
  - app-layer case dashboard APIs:
    - user CRUD
    - psychometric testing catalog + case-specific test result tracking
    - saved report management and export validation
- Modern responsive web UI for search and matching workflows.
- In-app workflow dashboard with step-by-step guidance from data verification through case-packet export.

## Quick start

1. Install dependencies.

```bash
npm install
```

2. Confirm local `mdb-tools` prerequisites.

```bash
npm run check:mdb-tools
```

3. Build the modern SQLite database from your legacy MVQS folder.

```bash
npm run build:data -- --legacy-dir "/Users/chrisskerritt/Dropbox/My Mac (chriss-MacBook-Pro.local)/Downloads/MVQS (1)"
```

If you want to use the newer Access package you added (`MVQS_Database 2`), run:

```bash
npm run build:data -- --legacy-dir "/Users/chrisskerritt/MVQS/MVQS_Database 2" --source dc
```

`--source auto` (default) will auto-detect and prefer `MVQS_DC_*.accdb` when present.

Optional: import only selected states/provinces for faster build.

```bash
npm run build:data -- --legacy-dir "/path/to/MVQS (1)" --states "US,TX,CA"
```

4. Start the app.

```bash
npm run dev
```

5. Open:
- `http://localhost:4173`

6. Optional: run API smoke checks.

```bash
npm run smoke:api
```

7. Optional: audit Access VBA/query/report coverage signals from the front-end.

```bash
npm run audit:access-objects -- \
  --front-end-path "/Users/chrisskerritt/Downloads/MVQS_DC_FrontEnd_with_Adobe.accdb" \
  --vba-path "/Users/chrisskerritt/Downloads/Option Compare Database (1).docx"
```

This writes timestamped audit artifacts under `output/analysis/`:
- `access_object_usage_audit_*.json`
- `access_object_usage_audit_*.md`

To enforce full accounting (non-zero exit if anything remains unaccounted):

```bash
npm run audit:access-objects:strict -- \
  --front-end-path "/Users/chrisskerritt/Downloads/MVQS_DC_FrontEnd_with_Adobe.accdb" \
  --vba-path "/Users/chrisskerritt/Downloads/Option Compare Database (1).docx"
```

## Strict parity pipeline (all Access objects)

Run strict inventory coverage across both front-ends and both DC data sources:

```bash
npm run parity:inventory
```

Build deterministic query order and hard-fail missing source-table taps:

```bash
npm run parity:table-taps
```

Validate modern mapping coverage for all modules/reports/queries:

```bash
npm run parity:map-modern
```

Composite strict gate (inventory + table taps + mapping):

```bash
npm run parity:strict
```

To require the Windows Access runtime execution gate in the same strict run:

```bash
python3 scripts/parity_strict.py --run-access-execution --require-access-execution
```

Windows-only authoritative Access runtime execution (queries/reports/VBA compile + module entrypoint attempts):

```bash
npm run parity:execute-access
```

Parity artifacts are written under `output/analysis/parity/` with timestamped files plus stable aliases:
- `latest_access_registry.json`
- `latest_query_order.json`
- `latest_table_tap_coverage.json`
- `latest_modern_mapping_coverage.json`

## Report workflow

Use this flow to generate report outputs from the full MVQS payload currently stored in SQLite:

1. Set filters (`query`, `state`, optional `county`) and optionally adjust the 24-trait profile.
2. Confirm **Workflow Dashboard** readiness is `Pass`.
3. Run **Search Jobs**, **Run Match**, or **Run Transferable Skills**.
3. Use **Load More** in Results when additional rows are available.
4. Select a target DOT job in the result list.
5. Click **Generate Report** in the **Report Builder** panel (Match mode).
6. Save report in **Case Dashboard > Saved Reports**.
7. Download report artifacts:
   - **JSON**: full structured report
   - **Markdown**: human-readable narrative + ranked table
   - **Case Packet**: zip containing JSON, Markdown, PDF, and hash manifest

The report payload includes:
- all `jobs` fields (`title`, `description`, `trait_vector`, `vq`, `svp`, `population`, `disability_code`, `skill_vq`, `skill_alt`, `skill_bucket`, `onet_ou_code`)
- trait gap analysis against the selected profile
- selected job task statements
- selected DOT pinning (if the selected DOT is outside the top report `limit`, the API still resolves and includes that selected DOT when it matches current filters)
- top state counts and, when a state is selected, top county counts
- dataset provenance and totals from `metadata`

If your local `data/mvqs-modern.db` was built before these report changes, re-run `npm run build:data ...` so the new report indexes are included.

## Section 7 resolution artifacts

- Human-readable matrix: `/Users/chrisskerritt/Downloads/MVQS/docs/section7_resolution_matrix.md`
- API/runtime source of truth: `/Users/chrisskerritt/Downloads/MVQS/docs/section7_resolution_matrix.json`
- Runtime loader module: `/Users/chrisskerritt/Downloads/MVQS/src/methodology/section7_resolution.js`

## API additions

- `GET /api/metadata`
  - Returns importer/build metadata from SQLite.
- `GET /api/readiness`
  - Returns strict data-integrity and load-readiness checks used by the workflow dashboard.
- `GET /api/methodology/section7`
  - Returns the 14-item Section 7 confidence-tagged matrix and evidence references.
- `POST /api/match`
  - Input: `{ q, stateId, countyId, profile, limit, offset }`
  - Output: `{ profile, total, results, limit, offset }`
- `POST /api/transferable-skills/analyze`
  - Input: `{ sourceDot, q, stateId, countyId, limit, offset }`
  - Output: `{ source_job, total, results, limit, offset, tsp_levels, tsp_band_counts }`
  - Uses current SQLite fields (`dot_code`, `onet_ou_code`, `trait_vector`, `vq`, `svp`, regional job counts) to compute a MVQS-style transferability score (`tsp_percent`, `tsp_level`).
  - `methodology` and `analysis_basis` now include:
    - `section7_resolution_version`
    - `section7_unresolved_ids`
    - `section7_confidence_profile`
- `POST /api/reports/match`
  - Input: `{ q, stateId, countyId, profile, selectedDot, limit, taskLimit }`
  - Output: `{ report }` containing ranked matches, selected-job deep detail, trait gaps, and MVQS provenance.
  - `report.summary` includes `selected_requested_dot_code` and `selected_included_in_results` for selected-DOT traceability.
- `GET /api/psychometrics/catalog`
  - Returns psychometric test catalog entries used by the dashboard.
- `POST /api/psychometrics/catalog`
  - Adds a custom psychometric test definition.
- `GET /api/users`, `POST /api/users`, `GET/PATCH/DELETE /api/users/:userId`
  - Client user CRUD for case management.
- `GET /api/users/:userId/psychometrics`
  - Lists psychometric results for the user.
- `POST /api/users/:userId/psychometrics`
  - Adds a psychometric result for the user.
- `DELETE /api/users/:userId/psychometrics/:resultId`
  - Removes a psychometric result.
- `POST /api/reports/match/save`
  - Generates a match report and stores it under a user case.
- `GET /api/reports/saved`
  - Lists saved reports (optionally filtered by `userId`).
- `GET /api/reports/saved/:savedReportId`
  - Fetches saved report payload.
- `DELETE /api/reports/saved/:savedReportId`
  - Deletes a saved report.
- `GET /api/reports/saved/:savedReportId/export/json`
- `GET /api/reports/saved/:savedReportId/export/markdown`
- `GET /api/reports/saved/:savedReportId/export/pdf`
- `GET /api/reports/saved/:savedReportId/export/case-packet`
  - Export routes for saved reports.
  - `X-MVQS-Markdown-SHA256` response header is included on markdown/pdf exports for parity checks.
- `GET /api/reports/saved/:savedReportId/export/validate`
  - Verifies markdown hash and confirms PDF export is built from the same markdown source.

## Runtime behavior updates

- Region filters are validated server-side:
  - `countyId` requires `stateId`
  - unknown `stateId` or invalid `countyId` for a state return `400` JSON errors
- Unknown `/api/*` routes return JSON (`{ error: "API route not found" }`) instead of HTML.
- Invalid JSON bodies return `400` with a JSON error.
- Invalid numeric filters (`stateId`, `countyId`, `limit`, `offset`, `taskLimit`) return `400` JSON errors.
- Invalid DOT inputs (`dotCode`, `selectedDot`) return `400` JSON errors.
- Transferable-skills endpoint validates `sourceDot` and returns `404` JSON when source DOT is not found.
- Search query text is capped at 200 characters (UI + API) to keep request handling predictable.
- Load-more pagination now de-duplicates by DOT and stops gracefully when the API returns no additional unique rows.
- The web UI now persists query/state/county/profile/mode in `localStorage` and restores on reload.
- API smoke script is available at `scripts/smoke_api.py` and wired to `npm run smoke:api`.
- Smoke script now also validates:
  - user CRUD,
  - psychometric result CRUD,
  - saved-report export routes,
  - markdown/PDF hash parity checks for export consistency.

## Transferable skills alignment notes

- The transferable-skills mode aligns with MVQS source artifacts from `MVQS_DC_FrontEnds_v314`:
  - `The MVQS Theory of Transferable Skills.doc`
  - `MVQS_Codes_15.doc`
  - `MVQS_DC_FrontEnd_with_Adobe.accdb` (field/form names recovered via string extraction)
- Implemented alignment:
  - TSP verbal bands: `0-19`, `20-39`, `40-59`, `60-79`, `80-97`.
  - VQ handling: target jobs with `VQ < 85` are constrained to the Level 1 band.
  - Score factors based on available modern schema: 24-trait similarity, DOT prefix similarity, O*NET prefix similarity, VQ proximity, and SVP proximity.
  - Legacy crosswalk overlays now include exact-match handling for `SIC/SOC/CEN/IND/WF1/MPSMS` with `MTEWA` proximity support.
  - Case profile VQ values are now computed from recovered legacy `basCalculate_VQ` coefficients (Option Compare Database export), rather than regional median estimates.

## Legacy manual presentation alignment

- UI now includes a manual-aligned guidance panel for:
  - MVQS vs VDARE vs Volcano scope differences
  - a mapped "10-step" operating flow to modern actions
  - VQ/TS-TSP/SVP code-scale reminders used in legacy runbooks
- TSA mode now shows TS/TSP band totals and analysis-basis notes from API output in the guidance footer.
- A full source-to-UX mapping for all provided 2015-2017 manuals is documented in:
  - `docs/manual-intent-map.md`

## Notes
- This rewrite reproduces data search and trait-based matching behavior using recovered data structures.
- Proprietary/expert-tuned formulas from the original Access/VBA/compiled workflows may still require deeper parity validation.
- See analysis notes in `docs/legacy-analysis.md`.
