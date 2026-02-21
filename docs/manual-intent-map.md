# Manual Intent Map (MVQS/VDARE/Volcano)

This document maps the provided legacy manuals to the current MVQS Modern presentation and workflow.
Goal: preserve legacy intent while using the current SQLite schema and web UX.

## Source corpus reviewed

### Install and operating instructions

- `/Users/chrisskerritt/Downloads/01To Install MVQS2015 Programs from a Flash Drive Memory Stick.doc`
- `/Users/chrisskerritt/Downloads/01To Install MVQS2016 Programs from a Flash Drive Memory Stick.doc`
- `/Users/chrisskerritt/Downloads/01To Install MVQS2017 Programs from a Flash Drive Memory Stick.doc`
- `/Users/chrisskerritt/Downloads/04MVQS VDARE 15 Flash Drive Memory Stick Operating Instructions.doc`
- `/Users/chrisskerritt/Downloads/04MVQS VDARE 16 Flash Drive Memory Stick Operating Instructions.doc`
- `/Users/chrisskerritt/Downloads/04MVQS VDARE 17 Flash Drive Memory Stick Operating Instructions.doc`

### Core run workflows

- `/Users/chrisskerritt/Downloads/06RunMVQS2015.doc`
- `/Users/chrisskerritt/Downloads/06RunMVQS2016.doc`
- `/Users/chrisskerritt/Downloads/06RunMVQS2017.doc`
- `/Users/chrisskerritt/Downloads/06RunVDARE.doc`
- `/Users/chrisskerritt/Downloads/06RunVolcano.doc`
- `/Users/chrisskerritt/Downloads/09RunVolcano.doc`

### Long-form manuals

- `/Users/chrisskerritt/Downloads/05MVQSVDARE2015Manual.doc`
- `/Users/chrisskerritt/Downloads/05MVQSVDARE2016Manual.doc`
- `/Users/chrisskerritt/Downloads/05MVQSVDARE2017Manual.doc`
- `/Users/chrisskerritt/Downloads/05MVQSVolcano2015Manual.doc`
- `/Users/chrisskerritt/Downloads/05MVQSVolcano2016Manual.doc`
- `/Users/chrisskerritt/Downloads/05MVQSVolcano2017Manual.doc`

### Quick-start manuals

- `/Users/chrisskerritt/Downloads/07MVQSVDARE2015QuickStartManualShort.doc`
- `/Users/chrisskerritt/Downloads/07MVQSVDARE2016QuickStartManualShort.doc`
- `/Users/chrisskerritt/Downloads/07MVQSVDARE2017QuickStartManualShort.doc`
- `/Users/chrisskerritt/Downloads/08MVQSVolcano2015QuickStartManualShort.doc`
- `/Users/chrisskerritt/Downloads/08MVQSVolcano2016QuickStartManualShort.doc`
- `/Users/chrisskerritt/Downloads/08MVQSVolcano20176QuickStartManualShort.doc`

### Code sheet and economist references

- `/Users/chrisskerritt/Downloads/03MVQSCode15.doc`
- `/Users/chrisskerritt/Downloads/03MVQSCode16.doc`
- `/Users/chrisskerritt/Downloads/91MVQS Rehabilitation Economist Program Manual.doc`

## Cross-document intent extracted

1. Program distinction should be explicit.
   - MVQS centers on 24 worker-trait matching.
   - VDARE/Volcano add expanded trait-element/temperament context.
2. The user journey is procedural and click-driven.
   - Geolocation selection, profile setup, count/rank matches, inspect, print/export.
3. Scales and labels must stay consistent.
   - VQ summary stats, TS/TSP bands (`0-19`, `20-39`, `40-59`, `60-79`, `80-97`), SVP definitions.
4. Report output is part of core operation.
   - Legacy manuals repeatedly reference producing `JobsDOT.rtf` outputs for review/edit.
5. Wage-loss calculations are related but separate.
   - Rehabilitation Economist workflow is downstream from job-person/TSA steps.

## Applied to MVQS Modern

### UI presentation updates

- Added a **Legacy Manual Guide (2015-2017)** panel in `/Users/chrisskerritt/Downloads/MVQS/public/index.html`.
- The panel includes:
  - MVQS vs VDARE vs Volcano role summary.
  - A mapped workflow from legacy step process to modern actions.
  - VQ/TS-TSP/SVP code-scale references.

### Transferable-skills clarity updates

- `/Users/chrisskerritt/Downloads/MVQS/public/app.js` now surfaces TSA context directly in the guide footer:
  - analysis model name (when available),
  - manual-aligned notes from API,
  - TS/TSP band totals (`L1` to `L5`) across all filtered results.

### Report messaging updates

- Report placeholder/copy now describes report export as the modern replacement for legacy `JobsDOT.rtf`-style output flow.
- TSA mode guidance remains explicit that report export is currently Match-mode based.

## Current-structure boundary

The current database design supports trait vectors, DOT/O*NET identifiers, VQ/SVP, tasks, and regional counts.
Legacy economist tables and some historical crosswalk metrics referenced in manuals are not independently modeled as first-class modern tables, so they remain documented as downstream/offline workflow components.

Section 7 unresolved/partial legacy formula questions and confidence-tagged implementation decisions are tracked in:
- `/Users/chrisskerritt/Downloads/MVQS/docs/section7_resolution_matrix.md`
- `/Users/chrisskerritt/Downloads/MVQS/docs/section7_resolution_matrix.json`
