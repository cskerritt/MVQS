# MVQS TSA Computation Validity and Reliability Report

Generated: 2026-02-16 (UTC)
Workspace: `/Users/chrisskerritt/Downloads/MVQS`

## 1. Executive Summary

This review validates how the current Transferable Skills Analysis (TSA) math works in code, how case/profile data flows into that math, and how closely outputs match provided MTSP sample PDFs.

### Overall judgement

- **Data readiness**: PASS (`/api/readiness` overall pass, non-blocking).
- **Computation reliability (consistency/stability)**: **Strong**.
- **Computation validity for TS% (transferability score)**: **Strong** against provided examples.
- **Computation validity for VA% (adjustment score)**: **Limited** relative to legacy outputs; current implementation is an approximation.

### Key measured outcomes

- Determinism and invariants: **12/12** scenario checks passed.
- Raj reference scenario (Brevard, FL): **Pre=6, Post=0**, matching sample structure.
- Cross-PDF replay (7 usable samples, 740 overlapping rows):
  - **Weighted TS MAE = 0.988**
  - **Weighted VA MAE = 15.784**

Interpretation:
- TS math is currently well-calibrated to sample outputs.
- VA math needs targeted calibration or legacy-field reconstruction to claim high parity.

## 2. What Data Drives the Computation

### Core trait model

- 24 critical worker traits with bounded levels are defined in:
  - `/Users/chrisskerritt/Downloads/MVQS/src/traits.js:1`
- Default profile baseline is defined in:
  - `/Users/chrisskerritt/Downloads/MVQS/src/traits.js:28`

### Case profile construction (4-profile workflow)

- Profile 1 (work history): max trait demand across source DOT work history.
  - `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1272`
- Profile 2 (evaluative): clinician-entered/edited profile.
- Profile 3 (pre): strict mode derives `max(Profile1, Profile2)`.
- Profile 4 (post/residual): editable residual profile, optionally bounded by Profile 3.
  - Residual capping: `/Users/chrisskerritt/Downloads/MVQS/src/server.js:868`
  - Upsert/derivation flow: `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1486`

### Profile VQ estimate

- Estimated VQ is median of top-25 match VQs for each profile, with fallback to all-states if regional sample is sparse.
  - `/Users/chrisskerritt/Downloads/MVQS/src/server.js:891`

## 3. TSA Math: Exact Computational Logic

### 3.1 Tier gate (legacy TS bins)

`deriveMtspTier` assigns one of 5 tiers/ranges using VQ threshold + DOT/O*NET overlap:

- Level 1 (0-19): target VQ < 85
- Level 2 (20-39): limited overlap
- Level 3 (40-59): moderate overlap
- Level 4 (60-79): stronger overlap
- Level 5 (80-97): strongest overlap

Code:
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1756`

### 3.2 Signal construction

Inputs per source-target pair:

- DOT prefix score: `{1.00, 0.67, 0.33, 0}`
  - `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1719`
- O*NET prefix score: `{1.00, 0.75, 0.45, 0}`
  - `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1739`
- Trait similarity (normalized mean over 24 traits)
  - `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1831`
- Trait coverage and deficit ratio
  - `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1916`
- Profile compatibility and deficit ratio
  - `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1941`
- Scalar proximity terms for VQ and SVP
  - `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1821`

### 3.3 Strength (PD1) handling

- Strength trait index = PD1.
- Strength contributes both in-tier progression and caps.
- Profile strength deficit cap mapping:
  - deficit 0 -> 97
  - deficit 1 -> 79
  - deficit 2 -> 59
  - deficit 3 -> 39
  - deficit 4+ -> 19

Code:
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1849`
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1877`

### 3.4 TS computation

Primary function:
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2018`

Core weighted progression within tier:

- `tierCoreScore = clamp(DOT*0.38 + ONET*0.22 + VQ*0.15 + SVP*0.10 + Strength*0.15)`
- Tier-specific offset:
  - Level 5: `-0.10`
  - Levels 2-4: `-0.45`
- Optional profile multiplier (if profile supplied): `0.65 + compatibility*0.35`
- Strength multiplier applied.

Unadjusted baseline score (for VA gap):

- `unadjusted = TraitSimilarity*0.30 + TraitCoverage*0.16 + DOT*0.14 + ONET*0.14 + VQ*0.08 + SVP*0.06 + Strength*0.12`

Tier-1 special formula (0-19 range):

- `tier1Score = DOT*0.50 + ONET*0.25 + VQ*0.15 + SVP*0.10`
- `TS = clamp(tier1Score * 19, 0, 19)`

Global caps/gates:

- Strength cap by profile deficit.
- Unskilled source cap (`source VQ<85 or source SVP<=2`) => `TS<=19`.
- Strict profile gate: any profile deficit => `TS=0`.
- Same-DOT perfect match only when all strict conditions pass => `TS=97`.

### 3.5 VA computation

- `adjustmentGap = max(0, TS_unadjusted - TS_adjusted)`
- `VA = clamp(adjustmentGap*1.1 - 1, 0, 39)`
- Same-DOT perfect match => `VA=0`

Code:
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2104`

### 3.6 Multi-source aggregation

For each target job, all source DOTs are scored and the source DOT yielding highest TS is selected.

Code:
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2691`

### 3.7 Matched result set

- Candidate jobs are scored.
- Only rows with `TS > 0` are retained as transferable matches.

Code:
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2773`
- Filtering line: `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2801`

## 4. Case Workflow Computation (Pre/Post)

Case endpoint:
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:4522`

Flow:

1. Intake completeness gate blocks analysis if required fields missing.
2. Work history DOT list defines source jobs.
3. Pre run uses Profile 3.
4. Post run uses Profile 4.
5. Residual computed as rounded `post/pre` (%), with explicit zero/undefined fallback behavior.
   - `/Users/chrisskerritt/Downloads/MVQS/src/server.js:1440`

## 5. Reliability and Validity Evidence Collected

Artifacts generated:

- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_validation_metrics.json`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/pdf_case_replay_metrics.json`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_200_metrics.json`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_200_report.md`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_500_metrics.json`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_500_report.md`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_1000_metrics.json`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_1000_report.md`
- `/Users/chrisskerritt/Downloads/MVQS/output/analysis/tsa_batch_trend_comparison.md`

### 5.1 Data integrity readiness

Readiness status: PASS

Counts validated:

- jobs: 12,975
- job_tasks: 119,354
- states: 69
- counties: 3,298
- state_job_counts: 158,471
- county_job_counts: 3,388,936
- psychometric_catalog: 15

Readiness checks implementation:
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2243`

### 5.2 Determinism and invariant tests

Across 12 source-dot scenarios:

- deterministic output hash: **12/12 pass**
- strict profile-gate invariant violations: **0**
- unskilled-cap violations: **0**
- monotonicity violations when profile is tightened: **0**
- strength-cap violations: **0**

### 5.3 Raj scenario parity

Reference PDF:
- `/Users/chrisskerritt/Downloads/Raj, Randolph - MTSP.pdf`

Replayed API scenario (source DOT `312687010`, FL/Brevard):

- Pre total matches: **6**
- Post total matches: **0**
- Pre TS bins: all 6 in Level 1 (`0-19`)
- Post TS bins: 0 in all bins

This matches the key Report 4 structure for TS availability.

### 5.4 Cross-PDF replay parity

Compared Report 8 rows to API replay rows using parsed source DOTs, profile 4 vector, and region from each PDF.

Usable overlap: **740 rows** across 7 PDFs.

- Weighted TS MAE: **0.988**
- Weighted VA MAE: **15.784**

Observed pattern:

- TS parity is generally close (median TS absolute error 0).
- VA parity diverges materially in several packets.

### 5.5 200-case batch reliability run

Method:

- Sampled 200 source DOT + county-region scenarios from live county-job counts.
- Replayed TSA using source-trait profile as high profile.
- Built a clinically mild low profile (small reductions across selected cognitive/strength/environment traits).
- Verified determinism, profile-gate invariants, unskilled cap, monotonicity, strength cap, and pagination-aggregate consistency.

Results (200/200):

- deterministic pass/fail: **200/0**
- gate invariant failures: **0**
- unskilled-cap failures: **0**
- monotonic-total failures: **0**
- monotonic-overlap failures: **0**
- strength-cap failures: **0**
- aggregate pagination consistency failures: **0**

Distribution highlights:

- High-profile totals: mean **241.41**, median **70.5**, p90 **715.7**, max **2791**
- Low-profile totals: mean **82.29**, median **10.0**, p90 **189.5**, max **2335**
- High-profile average TS: mean **21.482**, median **19.0**, p90 **37.1**, max **97.0**

Interpretation:

- This materially increases confidence that the computation is stable and rule-consistent under a broad scenario sample.
- It validates **reliability and invariant correctness**, but does not replace external ground-truth calibration for VA parity.

### 5.6 Scale-up trend run (500 and 1000)

Expanded run results:

- 500-case batch:
  - deterministic pass/fail: **500/0**
  - all invariant/rule failure counters: **0**
- 1000-case batch:
  - deterministic pass/fail: **1000/0**
  - all invariant/rule failure counters: **0**

Trend summary (see `tsa_batch_trend_comparison.md`):

- High-profile totals remain stable as sample size increases:
  - mean: 241.41 (200), 248.22 (500), 241.71 (1000)
  - median: 70.5 (200), 65.0 (500), 64.5 (1000)
- Low-profile totals remain stable in direction:
  - mean: 82.29 (200), 82.05 (500), 74.79 (1000)
  - median: 10.0 (200), 10.0 (500), 9.0 (1000)
- High-profile average TS remains close:
  - mean: 21.482 (200), 20.956 (500), 20.560 (1000)
  - median: 19.0 (200), 19.0 (500), 19.15 (1000)

Interpretation:

- Reliability findings are now supported across **200, 500, and 1000** sampled scenarios with no invariant failures.
- The TS computation appears numerically stable at larger sample sizes under randomized county-job scenario coverage.

## 6. Why TS Is Strong but VA Is Weaker

The model self-documents a key limitation:

- VA is estimated from adjusted vs unadjusted TS spread because classic crosswalk fields are not present in current schema.

Code note:
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2684`

That directly explains the metric profile:

- TS can align tightly from trait/tier logic and gating.
- VA remains an approximation until legacy crosswalk logic/fields are restored or a new validated VA calibration is fit.

## 7. Reliability Improvement Applied During This Review

Issue fixed:

- Summary averages could vary with pagination because they were computed from paged rows only.

Fix applied:

- Added full-population aggregate stats in transferability query and used them for report summaries.
- This makes average TS/VA stable across `limit/offset` changes.

Relevant code:

- Aggregate builder: `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2667`
- Query aggregate return: `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2773`
- Summary function aggregate use: `/Users/chrisskerritt/Downloads/MVQS/src/server.js:2990`
- Case report4 summary aggregate use: `/Users/chrisskerritt/Downloads/MVQS/src/server.js:4663`
- TSA analyze response now includes aggregate: `/Users/chrisskerritt/Downloads/MVQS/src/server.js:5538`

Verification after fix:

- `node --check` passed.
- `scripts/smoke_api.py` passed end-to-end.

## 8. Validity/Reliability Conclusion

Current system status:

- **Reliable for repeatable TS computation** under same inputs.
- **Valid for TS ranking and TS bins** against supplied MTSP examples.
- **Not yet fully valid for VA parity** with legacy packets due known approximation path.

If your acceptance target is “legacy-identical TS + VA,” TS is close; VA still needs a dedicated calibration phase.

## 9. Recommended Next Validation Phase

1. Add a locked validation corpus (all provided sample PDFs) with parsed inputs and per-row assertions in CI.
2. Implement a VA calibration module using available schema fields plus case-level modifiers, then re-evaluate MAE by packet.
3. Define acceptance thresholds explicitly, for example:
   - TS MAE <= 2.0 overall and <= 4.0 per packet.
   - VA MAE target to be set after first calibrated model pass.
4. Add sensitivity tests for clinical adjustments (single-trait edits) to document expected directional behavior trait-by-trait.
