# Section 7 Resolution Matrix

Source anchor: `/Users/chrisskerritt/Downloads/MVQS.docx`  
Resolution artifact version: `2026-02-18.local-evidence.v2`

This matrix documents what is answerable from currently available local evidence, what remains unresolved, and how each item is handled in implementation.

| ID | Follow-up Question | Filled Answer | Confidence | Status | Implementation Handling |
| --- | --- | --- | --- | --- | --- |
| 1 | Exact list and definitions of the 24 MTSP variables | `R M L S P Q K F M E C + PD1..PD6 + EC1..EC7` with bounds from manuals and `src/traits.js` | High | Resolved | Use as canonical trait dictionary. |
| 2 | Mapping assessments to 24 variables | Worksheets/percentile guidance exists, but no complete instrument-to-trait algorithm | Low | Unresolved | Keep as parity blocker pending primary mapping evidence. |
| 3 | Meaning of `RML/GVNSPQKFMEC/123456/1234567` | `RMLSPQKFMEC1234561234567` maps to GED + aptitudes + PD1-6 + EC1-7; `GVN` variant not fully documented | Medium | Partial | Standardize modern mapping and note unresolved header variant semantics. |
| 4 | Precise TSP tens-digit scoring map | Current `deriveMtspTier` maps documented pattern classes, not a published exact legacy tens table | Medium | Partial | Keep current tier map as explicit assumption. |
| 5 | Precise ones digit increment rule | Legacy text states accumulation across crosswalk matches; exact weights are not published | Medium | Partial | Keep current composite crosswalk behavior and annotate non-identical weighting uncertainty. |
| 6 | Raw score to 0-97 transform | Current model uses `round((raw_0_to_46 / 46) * 97, 1)`; SSTS docs separately show `raw/6*100` for a different matrix | Medium | Partial | Publish current transform in methodology notes and payload trace fields. |
| 7 | VQ1 derivation from O*NET element data | Exact formula not recoverable from local corpus | Low | Unresolved | Require primary source extraction. |
| 8 | VQ raw 0-204 to mean 100 SD 15 | Recovered direct basCalculate_VQ coefficients/intercept from Option Compare Database module export; implemented deterministic profile VQ computation in modern app. | Medium | Resolved | Use recovered coefficients for profile VQ outputs and surface method in payloads/reports. |
| 9 | Definition of “match” | Current implementation: strict all-trait non-deficit profile gate (`target <= profile`) plus weighted ranking | High | Resolved | Document as current operational behavior. |
| 10 | Work-order aggregation weighting | Explicit openings-weighted vs unweighted rule not recovered | Low | Unresolved | Keep unresolved until pipeline-level source evidence is extracted. |
| 11 | Statistica outlier criteria | OES/Indiana 2-SD style references exist; state work-order diagnostic details are still unspecified | Low | Unresolved | Keep as unresolved state-pipeline parity gap. |
| 12 | Louisiana sample count discrepancy | Conflict identified; no authoritative reconciliation found locally | Low | Unresolved | Keep as blocker requiring source reconciliation. |
| 13 | Link relatives and inflation adjustments | ECLR/link-relative intent documented; exact computational sequence incomplete | Low | Partial | Preserve current behavior; mark formula details unresolved. |
| 14 | Report format specifications | Legacy manuals enumerate report menus/titles; complete field-level rules for all formats remain partial | Medium | Partial | Implement core report expansion now; defer full MTSP 1-22 parity. |

Primary evidence references:
- `/Users/chrisskerritt/Downloads/MVQS/src/traits.js`
- `/Users/chrisskerritt/Downloads/MVQS/src/server.js`
- `/Users/chrisskerritt/Downloads/MVQS/src/report_template.js`
- `/Users/chrisskerritt/Downloads/MVQS_DC_FrontEnds_v314/MVQS_Codes_15.doc`
- `/Users/chrisskerritt/Downloads/06RunMVQS2017.doc`
- `/Users/chrisskerritt/Downloads/05MVQSVDARE2017Manual.doc`
- `/Users/chrisskerritt/Downloads/91MVQS Rehabilitation Economist Program Manual.doc`
