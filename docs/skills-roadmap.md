# MVQS Skill Roadmap (UX + Methodology)

This roadmap defines focused skills to make the app simpler and more reliable.

## 1) `case-intake-guardrails`
- Purpose: Make intake completion obvious and fast without blocking early workflow.
- Adds:
  - Required-field progress meter.
  - One-click “Fix missing fields” jump links.
  - Inline county/state requirement hints.
- Success metric: New user reaches completed intake in <5 minutes.

## 2) `work-history-dot-curation`
- Purpose: Make Work History DOT entry easy and non-confusing.
- Adds:
  - Smart DOT suggestions from recent searches.
  - Batch add/paste DOT codes.
  - Duplicate/source-quality warnings.
- Success metric: Add 3+ source DOTs in <60 seconds.

## 3) `profile-adjustment-coach`
- Purpose: Reduce confusion in the 4-profile adjustments screen.
- Adds:
  - Side-by-side clinical adjustment guidance.
  - “Lower by injury pattern” presets.
  - Real-time warnings for impossible profile states.
- Success metric: 0 invalid profile saves in guided mode.

## 4) `tsa-explainability`
- Purpose: Make TSA math transparent for expert review.
- Adds:
  - Per-row explainability panel (TS raw, transformed TS%, VA, component matches).
  - “Why this rank?” tooltip with source DOT and contributions.
- Success metric: Every ranked row has reproducible scoring trace.

## 5) `legacy-parity-auditor`
- Purpose: Keep methodology aligned with legacy MTSP behavior.
- Adds:
  - Snapshot parity checks against canonical PDF samples.
  - Threshold gating (TS/VA MAE + confidence bounds).
- Success metric: Automated parity report on every build run.

## 6) `export-parity-qa`
- Purpose: Guarantee preview/export visual and content parity.
- Adds:
  - HTML/PDF structural diff checks.
  - Case-level bundle completeness + hash audit.
- Success metric: 100% artifact completeness and hash parity in smoke tests.

## 7) `workflow-simplifier`
- Purpose: Keep UI focused on next action only.
- Adds:
  - Context-aware progressive disclosure.
  - Removal of low-value controls from default views.
  - Clear “Now do this” callouts per step.
- Success metric: Fewer blocked/pause moments in first-run testing.

## 8) `operations-assurance`
- Purpose: Prevent regressions while moving quickly.
- Adds:
  - Single command for readiness + smoke + parity + export checks.
  - Timestamped reliability report outputs.
- Success metric: One-command release readiness artifact.

## Implementation order
1. `work-history-dot-curation`
2. `workflow-simplifier`
3. `profile-adjustment-coach`
4. `tsa-explainability`
5. `legacy-parity-auditor`
6. `export-parity-qa`
7. `operations-assurance`
8. `case-intake-guardrails` (continuous hardening)
