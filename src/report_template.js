import fs from 'fs';
import { TRAITS, DEFAULT_PROFILE } from './traits.js';

const DEFAULT_TSP_LEVELS = [
  { level: 5, min: 80, max: 97, label: 'High transferable skills' },
  { level: 4, min: 60, max: 79.9, label: 'Moderate transferable skills' },
  { level: 3, min: 40, max: 59.9, label: 'Low transferable skills' },
  { level: 2, min: 20, max: 39.9, label: 'Few transferable skills' },
  { level: 1, min: 0, max: 19.9, label: 'No significant transferable skills' }
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fmtNumber(value) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 'n/a';
  }
  return numeric.toLocaleString();
}

function fmtDecimal(value, digits = 1) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 'n/a';
  }
  return numeric.toFixed(digits);
}

function asMarkdownCell(value) {
  return String(value ?? '').replaceAll('|', '\\|');
}

function deriveSkillLevelLabel(vq, svp) {
  const numericVq = Number(vq);
  const numericSvp = Number(svp);
  if (Number.isFinite(numericVq) && numericVq < 85) {
    return 'Unskilled';
  }
  if (Number.isFinite(numericSvp) && numericSvp <= 2) {
    return 'Unskilled';
  }
  if (Number.isFinite(numericSvp) && numericSvp <= 4) {
    return 'Semi-skilled';
  }
  if (Number.isFinite(numericSvp)) {
    return 'Skilled';
  }
  return 'n/a';
}

const PD1_TRAIT_INDEX = TRAITS.findIndex((trait) => trait.code === 'PD1');
const STRENGTH_LEVEL_LABELS = {
  1: 'Sedentary',
  2: 'Light',
  3: 'Medium',
  4: 'Heavy',
  5: 'Very Heavy'
};
const STRENGTH_LEVEL_SHORT_LABELS = {
  1: 'Sed',
  2: 'Lgt',
  3: 'Med',
  4: 'Hvy',
  5: 'VH'
};

function resolveStrengthLevelFromVector(vector) {
  if (PD1_TRAIT_INDEX < 0) {
    return null;
  }
  const values = parseTraitVector(vector);
  if (!Array.isArray(values) || values.length <= PD1_TRAIT_INDEX) {
    return null;
  }
  const numeric = Number(values[PD1_TRAIT_INDEX]);
  return Number.isFinite(numeric) ? Math.round(numeric) : null;
}

function normalizeStrengthLevel(level) {
  const numeric = Number(level);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  const rounded = Math.round(numeric);
  return STRENGTH_LEVEL_LABELS[rounded] ? rounded : null;
}

function formatPhysicalDemandP(level) {
  const normalized = normalizeStrengthLevel(level);
  if (normalized === null) {
    return 'n/a';
  }
  const short = STRENGTH_LEVEL_SHORT_LABELS[normalized] || '?';
  return `${normalized}/${short}`;
}

function formatCodeValue(value) {
  const normalized = String(value ?? '').trim();
  return normalized || 'n/a';
}

function pickNumericField(row, keys) {
  if (!row || typeof row !== 'object') {
    return null;
  }
  for (const key of keys) {
    const numeric = Number(row[key]);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return null;
}

function resolveWageFields(row) {
  return {
    hourly: pickNumericField(row, ['hourly_wage', 'avg_hourly_wage', 'wage_hourly', 'hourly']),
    annual: pickNumericField(row, ['annual_wage', 'avg_annual_wage', 'wage_annual', 'annual']),
    presentValue: pickNumericField(row, [
      'present_value_earnings',
      'mean_present_value_earnings',
      'pv_earnings',
      'present_value'
    ])
  };
}

function hasAnyWageValue(wages) {
  return Number.isFinite(Number(wages?.hourly)) || Number.isFinite(Number(wages?.annual)) || Number.isFinite(Number(wages?.presentValue));
}

function sortByVqDescending(rows) {
  return [...rows].sort((lhs, rhs) => {
    const left = Number(lhs?.vq);
    const right = Number(rhs?.vq);
    const leftValid = Number.isFinite(left);
    const rightValid = Number.isFinite(right);
    if (leftValid && rightValid && right !== left) {
      return right - left;
    }
    if (leftValid && !rightValid) {
      return -1;
    }
    if (!leftValid && rightValid) {
      return 1;
    }
    return String(lhs?.title || '').localeCompare(String(rhs?.title || ''));
  });
}

function getSelectedRegionLabel(report) {
  const region = report?.filters?.region || {};
  const stateLabel = region.state
    ? `${region.state.state_abbrev} - ${region.state.state_name}`
    : 'All states/provinces';
  if (!region.county) {
    return stateLabel;
  }
  return `${stateLabel} / ${region.county.county_name}`;
}

function describeSelectedSource(report) {
  const summary = report?.summary || {};
  const selectedDot = summary.selected_dot_code || report?.selected_job?.dot_code || null;
  if (!selectedDot) {
    return 'No selected job';
  }

  const requestedDot = summary.selected_requested_dot_code || null;
  if (!requestedDot) {
    return 'Top ranked result';
  }

  if (requestedDot !== selectedDot) {
    return `Fallback to ranked result (${selectedDot})`;
  }

  return summary.selected_included_in_results ? 'Requested DOT in ranked rows' : 'Requested DOT outside ranked rows';
}

function formatProfileVector(profileValues) {
  if (!Array.isArray(profileValues) || profileValues.length !== TRAITS.length) {
    return 'n/a';
  }
  return profileValues.map((value) => fmtNumber(value)).join('');
}

function normalizeCaseContext(caseContext = {}) {
  const firstName = caseContext.first_name || caseContext.firstName || null;
  const lastName = caseContext.last_name || caseContext.lastName || null;
  return {
    user_id: caseContext.user_id || caseContext.userId || null,
    first_name: firstName,
    last_name: lastName,
    full_name: [firstName, lastName].filter(Boolean).join(' ').trim() || null,
    case_reference: caseContext.case_reference || caseContext.caseReference || null,
    case_name: caseContext.case_name || caseContext.caseName || null,
    reason_for_referral: caseContext.reason_for_referral || caseContext.reasonForReferral || null,
    claims_email: caseContext.claims_email || caseContext.claimsEmail || null,
    case_diagnosis: caseContext.case_diagnosis || caseContext.caseDiagnosis || null,
    vipr_type: caseContext.vipr_type || caseContext.viprType || null,
    labor_market_area_label: caseContext.labor_market_area_label || caseContext.laborMarketAreaLabel || 'Labor Market Area',
    evaluation_year: caseContext.evaluation_year || caseContext.evaluationYear || null,
    report_header_notes: caseContext.report_header_notes || caseContext.reportHeaderNotes || null,
    country_name: caseContext.country_name || caseContext.countryName || 'USA',
    address_line1: caseContext.address_line1 || caseContext.addressLine1 || null,
    address_line2: caseContext.address_line2 || caseContext.addressLine2 || null,
    city: caseContext.city || null,
    postal_code: caseContext.postal_code || caseContext.postalCode || null,
    demographic_state_label: caseContext.demographic_state_label || caseContext.demographicStateLabel || null,
    demographic_county_label: caseContext.demographic_county_label || caseContext.demographicCountyLabel || null,
    profiles: caseContext.profiles || null,
    summary_blocks: caseContext.summary_blocks || caseContext.summaryBlocks || null
  };
}

function resolveMtspLogoSrc() {
  try {
    const logoUrl = new URL('../public/assets/mtsp_img_0.jpg', import.meta.url);
    const bytes = fs.readFileSync(logoUrl);
    return `data:image/jpeg;base64,${bytes.toString('base64')}`;
  } catch {
    return '/assets/mtsp_img_0.jpg';
  }
}

const MTSP_LOGO_SRC = resolveMtspLogoSrc();
const MTSP_COPYRIGHT = '(c) Copyright 2002-2021 by Billy J. McCroskey, Ph.D.';
const MTSP_JOB_CATEGORIES = ['Prof', 'TechMgr', 'ClerSales', 'Services', 'Agri', 'Process', 'MachTr', 'Bench', 'Struct', 'Misc'];
const TRAIT_SHORT_HEADERS = ['R', 'M', 'L', 'S', 'P', 'Q', 'K', 'F', 'M', 'E', 'C', '1', '2', '3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '7'];
const TRANSFER_REPORT_STYLE = `
:root {
  --ink: #000;
  --rule: #000;
  --accent: #3366ff;
  --accent-deep: #0000ff;
}
@page {
  size: Letter portrait;
  margin: 0.42in 0.48in;
}
@page mtsp-landscape {
  size: Letter landscape;
  margin: 0.36in 0.42in;
}
@page mtsp-portrait {
  size: Letter portrait;
  margin: 0.42in 0.48in;
}
html, body {
  margin: 0;
  padding: 0;
}
body {
  color: var(--ink);
  font-family: "Times New Roman", Times, serif;
  font-size: 10.5pt;
  line-height: 1.18;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.mtsp-report {
  width: 100%;
}
.mtsp-page {
  page-break-before: always;
  break-before: page;
}
.mtsp-page:first-child {
  page-break-before: auto;
  break-before: auto;
}
.mtsp-page.portrait {
  page: mtsp-portrait;
}
.mtsp-page.landscape {
  page: mtsp-landscape;
}
.mtsp-header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
  margin-bottom: 8px;
}
.mtsp-header.no-logo {
  grid-template-columns: 1fr;
}
.mtsp-logo {
  width: 146px;
  height: auto;
  object-fit: contain;
}
.mtsp-title-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.mtsp-report-code {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  font-weight: 700;
  color: var(--accent-deep);
}
.mtsp-heading {
  font-family: "Times New Roman", Times, serif;
  font-size: 15pt;
  font-weight: 700;
}
.mtsp-subhead {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9pt;
  color: var(--accent);
}
.mtsp-meta {
  margin-top: 2px;
  font-size: 10pt;
}
.mtsp-kv-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 14px;
  row-gap: 3px;
  margin-top: 7px;
}
.mtsp-kv {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 6px;
  align-items: baseline;
}
.mtsp-kv > .k {
  font-weight: 700;
  white-space: nowrap;
}
.mtsp-kv > .v {
  min-width: 0;
}
.mtsp-note {
  margin: 8px 0 0;
  font-size: 8.3pt;
  color: var(--accent);
}
.mtsp-note p {
  margin: 1px 0;
}
.mtsp-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-top: 4px;
}
.mtsp-table th,
.mtsp-table td {
  border: 1px solid var(--rule);
  padding: 1px 2px;
  vertical-align: top;
}
.mtsp-table th {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 7.1pt;
  line-height: 1.08;
  font-weight: 700;
  text-align: center;
}
.mtsp-table td {
  font-size: 7.6pt;
}
.mtsp-table .left {
  text-align: left;
}
.mtsp-table .right {
  text-align: right;
}
.mtsp-table .center {
  text-align: center;
}
.mtsp-table .trait-num {
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 7.3pt;
}
.mtsp-table .wide-title {
  width: 24%;
}
.mtsp-table .dot-col {
  width: 10%;
}
.mtsp-table .ts-col,
.mtsp-table .vq-col,
.mtsp-table .vipr-col,
.mtsp-table .va-col,
.mtsp-table .p-col {
  width: 4%;
}
.mtsp-table .skill-col {
  width: 8%;
}
.mtsp-table.compact td {
  padding: 0.7px 2px;
}
.mtsp-table.compact td.left {
  font-size: 7.1pt;
}
.mtsp-table.compact thead {
  display: table-header-group;
}
.mtsp-table.compact tfoot {
  display: table-footer-group;
}
.mtsp-section-title {
  margin-top: 10px;
  margin-bottom: 4px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9.2pt;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent-deep);
}
.mtsp-summary-table th,
.mtsp-summary-table td {
  font-size: 8pt;
  padding: 2px 3px;
}
.mtsp-summary-table th {
  font-size: 7.8pt;
}
.mtsp-residual th,
.mtsp-residual td {
  color: var(--accent-deep);
  font-weight: 700;
}
.mtsp-footer {
  margin-top: 6px;
  border-top: 1px solid var(--rule);
  padding-top: 2px;
  font-size: 7.7pt;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.mtsp-muted {
  color: #1f4fb3;
}
`;

function formatDateForHeader(value) {
  if (!value) {
    return 'n/a';
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'n/a';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDotCode(dotCode) {
  const digits = String(dotCode || '').replaceAll(/[^0-9]/g, '');
  if (digits.length === 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return String(dotCode || 'n/a');
}

function ensureTraitArray(values) {
  if (!Array.isArray(values) || values.length !== TRAITS.length) {
    return Array.from({ length: TRAITS.length }, () => '');
  }
  return values.map((value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? String(Math.round(numeric)) : '';
  });
}

function parseTraitVector(vector) {
  if (Array.isArray(vector)) {
    return ensureTraitArray(vector);
  }
  const digits = String(vector || '').replaceAll(/[^0-9]/g, '');
  if (!digits.length) {
    return ensureTraitArray([]);
  }
  const values = digits.slice(0, TRAITS.length).split('');
  while (values.length < TRAITS.length) {
    values.push('');
  }
  return values;
}

function percentile(values, ratio) {
  if (!values.length) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.round((sorted.length - 1) * ratio)));
  return sorted[index];
}

function computeResidualPercent(pre, post) {
  const numericPre = Number(pre);
  const numericPost = Number(post);
  if (!Number.isFinite(numericPre) || !Number.isFinite(numericPost)) {
    return null;
  }
  if (numericPre <= 0) {
    return 100;
  }
  return Math.round((numericPost / numericPre) * 100);
}

function formatPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 'n/a';
  }
  return `${Math.round(numeric)}%`;
}

function roundTenths(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.round(numeric * 10) / 10;
}

function resolveTransferTsDisplayMode(vm) {
  const explicit = String(vm?.case_context?.ts_display_mode || '').trim();
  if (explicit) {
    return explicit;
  }
  return 'band_floor_20_steps';
}

function resolveTransferVaDisplayMode(vm) {
  const explicit = String(vm?.case_context?.va_display_mode || '').trim();
  if (explicit) {
    return explicit;
  }
  const evaluationYear = Number(vm?.case_context?.evaluation_year);
  if (Number.isFinite(evaluationYear) && evaluationYear <= 2021) {
    return 'inverted_100_minus_api_va';
  }
  return 'legacy_raw_46_minus_tsunadjusted_raw';
}

function deriveLegacyVaRaw46(row) {
  const tsRaw = pickNumericField(row, ['tsp_raw_0_to_46', 'ts_raw_0_to_46']);
  if (Number.isFinite(tsRaw)) {
    return Math.max(0, Math.min(46, roundTenths(46 - tsRaw)));
  }
  const tsPercent = pickNumericField(row, ['tsp_percent', 'ts_percent']);
  if (Number.isFinite(tsPercent)) {
    return Math.max(0, Math.min(46, roundTenths(46 - (tsPercent / 97) * 46)));
  }
  return null;
}

function deriveLegacyVaRaw46Unadjusted(row) {
  const tsRawUnadjusted = pickNumericField(row, ['tsp_unadjusted_raw_0_to_46']);
  if (Number.isFinite(tsRawUnadjusted)) {
    return Math.max(0, Math.min(46, roundTenths(46 - tsRawUnadjusted)));
  }
  const tsPercentUnadjusted = pickNumericField(row, ['tsp_percent_unadjusted']);
  if (Number.isFinite(tsPercentUnadjusted)) {
    return Math.max(0, Math.min(46, roundTenths(46 - (tsPercentUnadjusted / 97) * 46)));
  }
  return null;
}

function deriveTransferTsDisplayPercent(vm, row) {
  const direct = pickNumericField(row, ['tsp_percent', 'ts_percent']);
  if (!Number.isFinite(direct)) {
    return null;
  }
  const mode = resolveTransferTsDisplayMode(vm);
  if (mode === 'direct_api_ts') {
    return roundTenths(direct);
  }
  if (mode === 'band_floor_20_steps') {
    return Math.max(0, Math.min(80, Math.floor(direct / 20) * 20));
  }
  if (mode === 'band_ceiling_20_steps') {
    return Math.max(0, Math.min(97, Math.ceil(direct / 20) * 20));
  }
  return roundTenths(direct);
}

function deriveTransferVaDisplayPercent(vm, row) {
  const direct = pickNumericField(row, ['va_adjustment_percent', 'va_percent']);
  const raw46 = deriveLegacyVaRaw46(row);
  const raw46Unadjusted = deriveLegacyVaRaw46Unadjusted(row);
  const mode = resolveTransferVaDisplayMode(vm);

  if (mode === 'direct_api_va') {
    return Number.isFinite(direct) ? roundTenths(direct) : null;
  }
  if (mode === 'inverted_100_minus_api_va') {
    return Number.isFinite(direct) ? roundTenths(100 - direct) : null;
  }
  if (mode === 'legacy_pct_46_minus_tsraw') {
    return Number.isFinite(raw46) ? roundTenths((raw46 / 46) * 100) : null;
  }
  if (mode === 'legacy_raw_46_minus_tsraw') {
    return Number.isFinite(raw46) ? raw46 : null;
  }
  if (mode === 'legacy_pct_46_minus_tsunadjusted_raw') {
    return Number.isFinite(raw46Unadjusted) ? roundTenths((raw46Unadjusted / 46) * 100) : null;
  }
  if (mode === 'legacy_raw_46_minus_tsunadjusted_raw') {
    return Number.isFinite(raw46Unadjusted) ? raw46Unadjusted : null;
  }
  return Number.isFinite(raw46Unadjusted)
    ? raw46Unadjusted
    : Number.isFinite(raw46)
      ? raw46
      : Number.isFinite(direct)
        ? roundTenths(direct)
        : null;
}

function deriveJobCategoryCounts(rows) {
  const counts = Object.fromEntries(MTSP_JOB_CATEGORIES.map((_, index) => [index, 0]));
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const dot = String(row?.dot_code || '');
    const firstDigit = Number.parseInt(dot.slice(0, 1), 10);
    if (Number.isInteger(firstDigit) && firstDigit >= 0 && firstDigit <= 9) {
      counts[firstDigit] += 1;
    }
  });
  return counts;
}

function computeVqStats(rows) {
  const values = (Array.isArray(rows) ? rows : [])
    .map((row) => Number(row?.vq))
    .filter((value) => Number.isFinite(value));
  if (!values.length) {
    return {
      max: null,
      avg: null,
      p10: null,
      p25: null,
      p50: null,
      p75: null,
      p90: null
    };
  }
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    max: Math.max(...values),
    avg: average,
    p10: percentile(values, 0.1),
    p25: percentile(values, 0.25),
    p50: percentile(values, 0.5),
    p75: percentile(values, 0.75),
    p90: percentile(values, 0.9)
  };
}

function deriveWorkHistoryProfile(sourceJobs) {
  const profile = Array.from({ length: TRAITS.length }, () => 0);
  let hasValues = false;
  (Array.isArray(sourceJobs) ? sourceJobs : []).forEach((row) => {
    const traitValues = parseTraitVector(row?.trait_vector);
    traitValues.forEach((value, index) => {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) {
        profile[index] = Math.max(profile[index], numeric);
        hasValues = true;
      }
    });
  });
  if (!hasValues) {
    return ensureTraitArray([]);
  }
  return profile.map((value) => String(value));
}

function resolveProfileSet(vm, sourceJobs) {
  const caseProfiles = vm.case_context?.profiles || {};
  const profile1 = ensureTraitArray(caseProfiles.profile1 || deriveWorkHistoryProfile(sourceJobs));
  const defaultEvaluative = ensureTraitArray(vm.report?.profile?.values || []);
  const profile2 = ensureTraitArray(caseProfiles.profile2 || defaultEvaluative);
  const profile3Input = caseProfiles.profile3 || profile1.map((value, index) => {
    const left = Number(value);
    const right = Number(profile2[index]);
    return Number.isFinite(left) || Number.isFinite(right) ? String(Math.max(left || 0, right || 0)) : '';
  });
  const profile3 = ensureTraitArray(profile3Input);
  const profile4 = ensureTraitArray(caseProfiles.profile4 || profile2);
  return {
    profile1,
    profile2,
    profile3,
    profile4,
    vq: caseProfiles.vq_estimates || {}
  };
}

function renderMtspHeader({ reportCode, title, dateLabel, evalueeName, withLogo = true }) {
  const logoHtml = withLogo
    ? `<img class="mtsp-logo" src="${escapeHtml(MTSP_LOGO_SRC)}" alt="MVQS logo" />`
    : '';
  const logoClass = withLogo ? '' : ' no-logo';
  return `
    <header class="mtsp-header${logoClass}">
      ${logoHtml}
      <div class="mtsp-title-block">
        <div class="mtsp-report-code">${escapeHtml(reportCode)}</div>
        <div class="mtsp-heading">${escapeHtml(title)}</div>
        <div class="mtsp-meta">${escapeHtml(dateLabel)}${evalueeName ? ` | Evaluee Name: ${escapeHtml(evalueeName)}` : ''}</div>
      </div>
    </header>
  `;
}

function renderFooter(pageLabel) {
  return `
    <div class="mtsp-footer">
      <span>${escapeHtml(MTSP_COPYRIGHT)}</span>
      <span>${escapeHtml(pageLabel)}</span>
    </div>
  `;
}

function renderViprPersonalityBlock(vm) {
  const personality = vm.enrichment?.vipr_personality;
  if (!personality) return '';
  return `
    <div class="mtsp-section-title" style="margin-top:10px">VIPR Personality Type: ${escapeHtml(personality.personality_type || '')} — ${escapeHtml(personality.personality_name || '')}</div>
    <p style="font-size:9pt;margin:2px 0">${escapeHtml(personality.personality_description || 'No description available.')}</p>
  `;
}

function renderEclrDistributionBlock(vm) {
  const constants = vm.enrichment?.eclr_constants;
  if (!Array.isArray(constants) || !constants.length) return '';
  const defaultRow = constants.find((r) => r.variant === 'default') || constants[0];
  if (!defaultRow) return '';
  return `
    <div class="mtsp-section-title" style="margin-top:10px">ECLR Distribution (Regression Constants)</div>
    <table class="mtsp-table mtsp-summary-table" style="width:auto;margin-top:2px">
      <thead>
        <tr>
          <th>Percentile</th>
          <th>Coefficient 1</th>
          <th>Coefficient 2</th>
        </tr>
      </thead>
      <tbody>
        <tr><td class="left">Mean</td><td class="right">${fmtDecimal(defaultRow.eclr_mean1, 5)}</td><td class="right">${fmtDecimal(defaultRow.eclr_mean2, 4)}</td></tr>
        <tr><td class="left">10th %ile</td><td class="right">${fmtDecimal(defaultRow.eclr_10var1, 5)}</td><td class="right">${fmtDecimal(defaultRow.eclr_10var2, 4)}</td></tr>
        <tr><td class="left">25th %ile</td><td class="right">${fmtDecimal(defaultRow.eclr_25var1, 5)}</td><td class="right">${fmtDecimal(defaultRow.eclr_25var2, 4)}</td></tr>
        <tr><td class="left">Median</td><td class="right">${fmtDecimal(defaultRow.eclr_median1, 5)}</td><td class="right">${fmtDecimal(defaultRow.eclr_median2, 4)}</td></tr>
        <tr><td class="left">75th %ile</td><td class="right">${fmtDecimal(defaultRow.eclr_75var1, 5)}</td><td class="right">${fmtDecimal(defaultRow.eclr_75var2, 4)}</td></tr>
        <tr><td class="left">90th %ile</td><td class="right">${fmtDecimal(defaultRow.eclr_90var1, 5)}</td><td class="right">${fmtDecimal(defaultRow.eclr_90var2, 4)}</td></tr>
      </tbody>
    </table>
  `;
}

function renderPhysicalDemandDetails(traitVector) {
  const values = parseTraitVector(traitVector);
  if (!values.length) return '';
  const pdIndices = [
    { code: 'PD1', index: 11 },
    { code: 'PD2', index: 12 },
    { code: 'PD3', index: 13 },
    { code: 'PD4', index: 14 },
    { code: 'PD5', index: 15 },
    { code: 'PD6', index: 16 }
  ];
  const PD_DETAIL_LABELS = {
    PD1: { 1: 'Sedentary', 2: 'Light', 3: 'Medium', 4: 'Heavy', 5: 'Very Heavy' },
    PD2: { 0: 'Not Required', 1: 'Required' },
    PD3: { 0: 'Not Required', 1: 'Required' },
    PD4: { 0: 'Not Required', 1: 'Required' },
    PD5: { 0: 'Not Required', 1: 'Required' },
    PD6: { 0: 'Not Required', 1: 'Required' }
  };
  const PD_DESC = {
    PD1: 'Strength',
    PD2: 'Climbing/Balancing',
    PD3: 'Stooping/Kneeling/Crouching/Crawling',
    PD4: 'Reaching/Handling/Fingering/Feeling',
    PD5: 'Talking/Hearing',
    PD6: 'Seeing'
  };
  return pdIndices.map(({ code, index }) => {
    const val = Number(values[index]);
    const label = (PD_DETAIL_LABELS[code] || {})[val] || String(val);
    return `${PD_DESC[code]}: ${label}`;
  }).join('; ');
}

function renderTemperamentSummary(temperaments) {
  if (!temperaments) return 'n/a';
  const TEM_SHORT = {
    dir: 'DCP', rep: 'REP', inf: 'INFLU', var: 'VARCH',
    exp: 'DEPL', alo: 'ISOL', str: 'STS', tol: 'MVC',
    und: 'USI', peo: 'PUS', jud: 'SJC'
  };
  const active = Object.entries(temperaments)
    .filter(([, val]) => Number(val) === 1)
    .map(([key]) => TEM_SHORT[key] || key);
  return active.length ? active.join(', ') : 'None';
}

function renderReport1Html(vm, dateLabel, evalueeName) {
  const c = vm.case_context;
  const cityStateZip = [c.city, c.demographic_state_label, c.postal_code].filter(Boolean).join(' ') || 'n/a';
  const jobBank = c.demographic_county_label || c.city || 'n/a';
  const sourceMetadata = vm.report?.mvqs_coverage?.metadata || {};

  return `
    <section class="mtsp-page portrait">
      ${renderMtspHeader({
        reportCode: 'MVQS - Transferrable Skills - Report 1',
        title: 'Client Identification, Labor Market Area, VIPR Type and Reason for Referral',
        dateLabel,
        evalueeName,
        withLogo: true
      })}
      <div class="mtsp-kv-grid">
        <div class="mtsp-kv"><span class="k">Evaluee Name:</span><span class="v">${escapeHtml(evalueeName || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">Address1:</span><span class="v">${escapeHtml(c.address_line1 || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">Address2:</span><span class="v">${escapeHtml(c.address_line2 || '')}</span></div>
        <div class="mtsp-kv"><span class="k">City/State/Zip:</span><span class="v">${escapeHtml(cityStateZip)}</span></div>
        <div class="mtsp-kv"><span class="k">Country Name:</span><span class="v">${escapeHtml(c.country_name || 'USA')}</span></div>
        <div class="mtsp-kv"><span class="k">${escapeHtml(c.labor_market_area_label || 'Labor Market Area')}:</span><span class="v">${escapeHtml(vm.region_label || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">Job Bank Name:</span><span class="v">${escapeHtml(jobBank)}</span></div>
        <div class="mtsp-kv"><span class="k">Evaluation Year:</span><span class="v">${escapeHtml(String(c.evaluation_year || new Date(vm.generated_at_utc || Date.now()).getFullYear()))}</span></div>
        <div class="mtsp-kv"><span class="k">StateParishProvince:</span><span class="v">${escapeHtml(c.demographic_state_label || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">Inflation Rate:</span><span class="v">${escapeHtml(fmtDecimal(sourceMetadata.inflation_rate))}</span></div>
        <div class="mtsp-kv"><span class="k">VIPR Type:</span><span class="v">${escapeHtml(c.vipr_type || vm.report?.summary?.selected_transfer_direction || 'n/a')}${vm.enrichment?.vipr_personality ? ` — ${escapeHtml(vm.enrichment.vipr_personality.personality_name || '')}` : ''}</span></div>
        <div class="mtsp-kv"><span class="k">ECLR Rate:</span><span class="v">${escapeHtml(fmtDecimal(sourceMetadata.eclr_rate))}</span></div>
        <div class="mtsp-kv"><span class="k">Reason for Referral:</span><span class="v">${escapeHtml(c.reason_for_referral || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">Email for Claims:</span><span class="v">${escapeHtml(c.claims_email || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">Case Name:</span><span class="v">${escapeHtml(c.case_name || c.case_reference || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">Case Diagnosis:</span><span class="v">${escapeHtml(c.case_diagnosis || 'n/a')}</span></div>
      </div>
      ${renderViprPersonalityBlock(vm)}
      ${renderEclrDistributionBlock(vm)}
      <p class="mtsp-note"><strong>Case Notes:</strong> ${escapeHtml(c.report_header_notes || 'n/a')}</p>
      ${renderFooter('Page 1 of 1')}
    </section>
  `;
}

function renderTraitHeaderCells() {
  return TRAIT_SHORT_HEADERS.map((label) => `<th>${escapeHtml(label)}</th>`).join('');
}

function renderProfileTraitCells(profile) {
  return ensureTraitArray(profile).map((value) => `<td class="trait-num">${escapeHtml(String(value || ''))}</td>`).join('');
}

function renderReport3Html(vm, dateLabel, evalueeName, sourceJobs) {
  const profiles = resolveProfileSet(vm, sourceJobs);
  const profileRows = [
    { label: 'Profile 1: Work History Profile', values: profiles.profile1, vq: profiles.vq.profile1_vq_est },
    { label: 'Profile 2: Evaluative Profile', values: profiles.profile2, vq: profiles.vq.profile2_vq_est },
    { label: 'Profile 3: Pre Profile', values: profiles.profile3, vq: profiles.vq.profile3_vq_est },
    { label: 'Profile 4: Post Profile', values: profiles.profile4, vq: profiles.vq.profile4_vq_est }
  ];
  const rowsHtml = profileRows
    .map(
      (row) => `
      <tr>
        <td class="left">${escapeHtml(row.label)}</td>
        <td class="right">${fmtDecimal(row.vq, 2)}</td>
        ${renderProfileTraitCells(row.values)}
      </tr>
    `
    )
    .join('');

  return `
    <section class="mtsp-page landscape">
      ${renderMtspHeader({
        reportCode: 'MVQS - Transferrable Skills - Report 3',
        title: 'Worker Trait Profiles',
        dateLabel,
        evalueeName,
        withLogo: true
      })}
      <table class="mtsp-table">
        <thead>
          <tr>
            <th rowspan="2" class="left">Worker Trait Profiles</th>
            <th rowspan="2">VQ</th>
            <th colspan="11">GED / Aptitudes</th>
            <th colspan="6">Physical Demands</th>
            <th colspan="7">Environmental Conditions</th>
          </tr>
          <tr>
            ${renderTraitHeaderCells()}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="mtsp-note">
        <p><strong>Profile 1:</strong> Highest levels of worker trait functioning across past relevant work history.</p>
        <p><strong>Profile 2:</strong> Evaluative profile derived from medical, psychological, social, educational, vocational, and psychometric evidence.</p>
        <p><strong>Profile 3:</strong> Pre profile equals highest level across Profile 1 and Profile 2.</p>
        <p><strong>Profile 4:</strong> Post profile is the final adjusted residual profile used for TSA matching.</p>
        <p class="mtsp-muted"><em>VQ values are computed from recovered legacy basCalculate_VQ coefficients.</em></p>
      </div>
      ${renderFooter('Page 1 of 1')}
    </section>
  `;
}

function renderReport4Html(vm, dateLabel, evalueeName, matches) {
  const summary = vm.summary || {};
  const blocks = vm.case_context?.summary_blocks || {};
  const preRows = Array.isArray(blocks.pre?.matches) ? blocks.pre.matches : matches;
  const postRows = Array.isArray(blocks.post?.matches) ? blocks.post.matches : matches;
  const preCategories = blocks.pre?.job_categories || deriveJobCategoryCounts(preRows);
  const postCategories = blocks.post?.job_categories || deriveJobCategoryCounts(postRows);
  const preTotal = Number(blocks.pre?.total_jobs ?? vm.report?.match_pool_total ?? 0);
  const postTotal = Number(blocks.post?.total_jobs ?? summary.result_count ?? postRows.length ?? 0);
  const preAccess = Number(blocks.pre?.access_index);
  const postAccess = Number(blocks.post?.access_index);
  const bandPre = blocks.pre?.tsp_band_counts || vm.report?.tsp_band_counts || {};
  const bandPost = blocks.post?.tsp_band_counts || vm.report?.tsp_band_counts || {};
  const preVqStats = blocks.pre?.vq_stats || computeVqStats(preRows);
  const postVqStats = blocks.post?.vq_stats || computeVqStats(postRows);
  const preDiagnostics = blocks.pre?.diagnostics || {};
  const postDiagnostics = blocks.post?.diagnostics || vm.report?.transferability_diagnostics || {};

  const jobCategoryRow = (label, values) => `
    <tr>
      <th class="left">${escapeHtml(label)}</th>
      ${MTSP_JOB_CATEGORIES.map((_, index) => `<td class="center">${fmtNumber(values[index] || 0)}</td>`).join('')}
      <td class="center">${fmtNumber(values.total)}</td>
      <td class="center">${values.access === null || values.access === undefined || Number.isNaN(values.access) ? 'n/a' : fmtNumber(values.access)}</td>
    </tr>
  `;

  const residualCategories = Object.fromEntries(
    MTSP_JOB_CATEGORIES.map((_, index) => [index, formatPercent(computeResidualPercent(preCategories[index], postCategories[index]))])
  );
  residualCategories.total = formatPercent(computeResidualPercent(preTotal, postTotal));
  residualCategories.access = formatPercent(computeResidualPercent(preAccess, postAccess));

  const earningsRow = (label, stats) => `
    <tr>
      <th class="left">${escapeHtml(label)}</th>
      <td class="center">${fmtDecimal(stats.max, 2)}</td>
      <td class="center">${fmtDecimal(stats.avg, 2)}</td>
      <td class="center">n/a</td>
      <td class="center">n/a</td>
      <td class="center">n/a</td>
      <td class="center">n/a</td>
      <td class="center">n/a</td>
      <td class="center">${fmtDecimal(stats.p10, 2)}</td>
      <td class="center">${fmtDecimal(stats.p25, 2)}</td>
      <td class="center">${fmtDecimal(stats.p50, 2)}</td>
      <td class="center">${fmtDecimal(stats.p75, 2)}</td>
      <td class="center">${fmtDecimal(stats.p90, 2)}</td>
      <td class="center">n/a</td>
    </tr>
  `;

  return `
    <section class="mtsp-page portrait">
      ${renderMtspHeader({
        reportCode: 'MVQS - Transferrable Skills - Report 4',
        title: 'Pre and Post Comparisons',
        dateLabel,
        evalueeName,
        withLogo: true
      })}

      <div class="mtsp-section-title">Section 5, Part 1: Access to the Labor Market</div>
      <p class="mtsp-subhead">Jobs Searched: ${fmtNumber(vm.report?.match_pool_total)} in this Job Bank</p>
      <table class="mtsp-table mtsp-summary-table">
        <thead>
          <tr>
            <th class="left">Labor Market JobCats*</th>
            ${MTSP_JOB_CATEGORIES.map((label, index) => `<th>${escapeHtml(label)} (${index})</th>`).join('')}
            <th>Total</th>
            <th>Access**</th>
          </tr>
        </thead>
        <tbody>
          ${jobCategoryRow('Pre', { ...preCategories, total: preTotal, access: preAccess })}
          ${jobCategoryRow('Post', { ...postCategories, total: postTotal, access: postAccess })}
          <tr class="mtsp-residual">
            <th class="left">Residual</th>
            ${MTSP_JOB_CATEGORIES.map((_, index) => `<td class="center">${escapeHtml(residualCategories[index])}</td>`).join('')}
            <td class="center">${escapeHtml(residualCategories.total)}</td>
            <td class="center">${escapeHtml(residualCategories.access)}</td>
          </tr>
        </tbody>
      </table>

      <div class="mtsp-section-title">Section 5, Part 2: Earning Capacity and Training Potential</div>
      <p class="mtsp-subhead">Overall Earning Capacity: Mean present value earnings columns are shown as n/a when wage fields are unavailable in current MVQS data.</p>
      <table class="mtsp-table mtsp-summary-table">
        <thead>
          <tr>
            <th class="left">Profile</th>
            <th>Max VQ</th>
            <th>Avg VQ</th>
            <th>Mean</th>
            <th>10th%ile</th>
            <th>25th%ile</th>
            <th>50th%ile</th>
            <th>75th%ile</th>
            <th>90th%ile</th>
            <th>VQ 10th</th>
            <th>VQ 25th</th>
            <th>VQ 50th</th>
            <th>VQ 75th</th>
            <th>VQ 90th</th>
            <th>Training Potential**</th>
          </tr>
        </thead>
        <tbody>
          ${earningsRow('Pre', preVqStats)}
          ${earningsRow('Post', postVqStats)}
          <tr class="mtsp-residual">
            <th class="left">Residual</th>
            <td class="center">${formatPercent(computeResidualPercent(preVqStats.max, postVqStats.max))}</td>
            <td class="center">${formatPercent(computeResidualPercent(preVqStats.avg, postVqStats.avg))}</td>
            <td class="center">n/a</td>
            <td class="center">n/a</td>
            <td class="center">n/a</td>
            <td class="center">n/a</td>
            <td class="center">n/a</td>
            <td class="center">n/a</td>
            <td class="center">${formatPercent(computeResidualPercent(preVqStats.p10, postVqStats.p10))}</td>
            <td class="center">${formatPercent(computeResidualPercent(preVqStats.p25, postVqStats.p25))}</td>
            <td class="center">${formatPercent(computeResidualPercent(preVqStats.p50, postVqStats.p50))}</td>
            <td class="center">${formatPercent(computeResidualPercent(preVqStats.p75, postVqStats.p75))}</td>
            <td class="center">${formatPercent(computeResidualPercent(preVqStats.p90, postVqStats.p90))}</td>
            <td class="center">${formatPercent(computeResidualPercent(preAccess, postAccess))}</td>
          </tr>
        </tbody>
      </table>

      <div class="mtsp-section-title">Section 5, Part 3: Transferable Skills (TS) Availability and Utilization</div>
      <table class="mtsp-table mtsp-summary-table">
        <thead>
          <tr>
            <th class="left">TS Levels*</th>
            <th>No TSkills<br/>0-19%</th>
            <th>Few TSkills<br/>20-39%</th>
            <th>Low TSkills<br/>40-59%</th>
            <th>Moderate TSkills<br/>60-79%</th>
            <th>High TSkills<br/>80-97%</th>
            <th>Utilization**</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th class="left">Pre</th>
            <td class="center">${fmtNumber(bandPre.level_1)}</td>
            <td class="center">${fmtNumber(bandPre.level_2)}</td>
            <td class="center">${fmtNumber(bandPre.level_3)}</td>
            <td class="center">${fmtNumber(bandPre.level_4)}</td>
            <td class="center">${fmtNumber(bandPre.level_5)}</td>
            <td class="center">${fmtNumber(preAccess)}</td>
          </tr>
          <tr>
            <th class="left">Post</th>
            <td class="center">${fmtNumber(bandPost.level_1)}</td>
            <td class="center">${fmtNumber(bandPost.level_2)}</td>
            <td class="center">${fmtNumber(bandPost.level_3)}</td>
            <td class="center">${fmtNumber(bandPost.level_4)}</td>
            <td class="center">${fmtNumber(bandPost.level_5)}</td>
            <td class="center">${fmtNumber(postAccess)}</td>
          </tr>
          <tr class="mtsp-residual">
            <th class="left">Residual</th>
            <td class="center">${formatPercent(computeResidualPercent(bandPre.level_1, bandPost.level_1))}</td>
            <td class="center">${formatPercent(computeResidualPercent(bandPre.level_2, bandPost.level_2))}</td>
            <td class="center">${formatPercent(computeResidualPercent(bandPre.level_3, bandPost.level_3))}</td>
            <td class="center">${formatPercent(computeResidualPercent(bandPre.level_4, bandPost.level_4))}</td>
            <td class="center">${formatPercent(computeResidualPercent(bandPre.level_5, bandPost.level_5))}</td>
            <td class="center">${formatPercent(computeResidualPercent(preAccess, postAccess))}</td>
          </tr>
        </tbody>
      </table>
      <p class="mtsp-note">* See MVQS symbols, codes and scales documentation. ** Mean reference bands shown for compatibility with legacy report style.</p>
      <p class="mtsp-note">Diagnostics: Candidates evaluated (Pre/Post) ${fmtNumber(
        preDiagnostics.candidate_count
      )}/${fmtNumber(postDiagnostics.candidate_count)}; Physical gate exclusions (Pre/Post) ${fmtNumber(
        preDiagnostics.physical_gate_excluded_count
      )}/${fmtNumber(postDiagnostics.physical_gate_excluded_count)}.</p>
      ${renderFooter('Page 1 of 1')}
    </section>
  `;
}

function renderWideTraitGroupCells() {
  return `
    <th colspan="11">GED Aptitudes</th>
    <th colspan="6">Physical Demands</th>
    <th colspan="7">Environmental Conditions</th>
  `;
}

function renderReport5Html(vm, dateLabel, evalueeName, sourceJobs) {
  const rows = sourceJobs.length
    ? sourceJobs
        .map((row) => {
          const traits = parseTraitVector(row.trait_vector)
            .map((value) => `<td class="trait-num">${escapeHtml(String(value || ''))}</td>`)
            .join('');
          const details = row.occupation_details || {};
          const dptLabel = [details.d_function, details.p_function, details.t_function].filter(Boolean).join(' / ') || '';
          const hollandLabel = details.holland_title || '';
          const temLabel = renderTemperamentSummary(row.temperaments);
          const altTitles = Array.isArray(row.alternate_titles) && row.alternate_titles.length
            ? row.alternate_titles.slice(0, 5).join(', ')
            : '';
          return `
            <tr>
              <td class="left dot-col">${escapeHtml(formatDotCode(row.dot_code))}</td>
              <td class="left wide-title">${escapeHtml(row.title || 'Untitled')}${altTitles ? `<br/><span style="font-size:6.5pt;color:#666">${escapeHtml(altTitles)}</span>` : ''}</td>
              <td class="right vq-col">${fmtDecimal(row.vq, 2)}</td>
              <td class="center vipr-col">${escapeHtml(row.vipr_type || vm.case_context?.vipr_type || 'n/a')}</td>
              <td class="center p-col">${escapeHtml(formatPhysicalDemandP(resolveStrengthLevelFromVector(row.trait_vector)))}</td>
              <td class="left skill-col">${escapeHtml(deriveSkillLevelLabel(row.vq, row.svp))}</td>
              ${traits}
            </tr>
            <tr>
              <td colspan="30" style="font-size:6.8pt;padding:1px 4px;border-top:none;color:#333">
                <strong>DPT:</strong> ${escapeHtml(dptLabel || 'n/a')}
                | <strong>Holland:</strong> ${escapeHtml(hollandLabel || 'n/a')}
                | <strong>TEM:</strong> ${escapeHtml(temLabel)}
                | <strong>PD:</strong> ${escapeHtml(renderPhysicalDemandDetails(row.trait_vector))}
              </td>
            </tr>
          `;
        })
        .join('')
    : `
      <tr>
        <td colspan="30" class="center">No source DOT work history loaded.</td>
      </tr>
    `;

  return `
    <section class="mtsp-page landscape">
      ${renderMtspHeader({
        reportCode: 'MTSP - Report 5',
        title: 'Client Work History Job Demands/Worker Trait Requirements',
        dateLabel,
        evalueeName,
        withLogo: false
      })}
      <table class="mtsp-table compact">
        <thead>
          <tr>
            <th class="dot-col" rowspan="2">Dot Code</th>
            <th class="wide-title" rowspan="2">Job Title</th>
            <th class="vq-col" rowspan="2">VQ</th>
            <th class="vipr-col" rowspan="2">VIPR</th>
            <th class="p-col" rowspan="2">P</th>
            <th class="skill-col" rowspan="2">Skill Level</th>
            ${renderWideTraitGroupCells()}
          </tr>
          <tr>
            ${renderTraitHeaderCells()}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="mtsp-note">P = PD1 Strength Demand (1/Sed, 2/Lgt, 3/Med, 4/Hvy, 5/VH). DPT = Data/People/Things functional levels. TEM = Temperament factors. Holland = Holland occupational type.</p>
      ${renderFooter('Page 1 of 1')}
    </section>
  `;
}

function renderReport6Html(vm, dateLabel, evalueeName, sourceJobs) {
  const sorted = sortByVqDescending(sourceJobs);
  const rows = sorted.length
    ? sorted
        .map(
          (row) => `
            <tr>
              <td class="left dot-col">${escapeHtml(formatDotCode(row.dot_code))}</td>
              <td class="left wide-title">${escapeHtml(row.title || 'Untitled')}</td>
              <td class="right vq-col">${fmtDecimal(row.vq, 2)}</td>
              <td class="right">${fmtNumber(row.svp)}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.sic))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.soc))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.cen))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.ind))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.wf1))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.mpsms_primary))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.mtewa_primary))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.onet_group_or_ou || row.onet_ou_code))}</td>
            </tr>
          `
        )
        .join('')
    : `
      <tr>
        <td colspan="12" class="center">No source DOT work history loaded.</td>
      </tr>
    `;

  return `
    <section class="mtsp-page landscape">
      ${renderMtspHeader({
        reportCode: 'MTSP - Report 6',
        title: 'Work History Crosswalk Codes by VQ',
        dateLabel,
        evalueeName,
        withLogo: false
      })}
      <table class="mtsp-table compact">
        <thead>
          <tr>
            <th class="dot-col">Dot Code</th>
            <th class="wide-title">Job Title</th>
            <th class="vq-col">VQ</th>
            <th>SVP</th>
            <th>SIC</th>
            <th>SOC</th>
            <th>CEN</th>
            <th>IND</th>
            <th>WF1</th>
            <th>MPSMS</th>
            <th>MTEWA</th>
            <th>O*NET Group/OU</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${renderFooter('Page 1 of 1')}
    </section>
  `;
}

function resolveBlsWageFromDetails(row) {
  const details = row.occupation_details;
  if (!details || !details.oes_code) return null;
  return { oes_code: details.oes_code, oes_title: details.oes_title || null };
}

function renderReport7Html(vm, dateLabel, evalueeName, sourceJobs) {
  const sorted = sortByVqDescending(sourceJobs);
  const rows = sorted.length
    ? sorted
        .map((row) => {
          const wages = resolveWageFields(row);
          const blsRef = resolveBlsWageFromDetails(row);
          const wageNote = hasAnyWageValue(wages)
            ? (blsRef ? `OES ${escapeHtml(blsRef.oes_code)}` : '')
            : (blsRef ? `BLS ref: OES ${escapeHtml(blsRef.oes_code)}` : 'n/a (wage fields unavailable)');
          return `
            <tr>
              <td class="left dot-col">${escapeHtml(formatDotCode(row.dot_code))}</td>
              <td class="left wide-title">${escapeHtml(row.title || 'Untitled')}</td>
              <td class="right vq-col">${fmtDecimal(row.vq, 2)}</td>
              <td class="right">${fmtNumber(row.svp)}</td>
              <td class="right">${fmtDecimal(wages.hourly, 2)}</td>
              <td class="right">${fmtDecimal(wages.annual, 2)}</td>
              <td class="right">${fmtDecimal(wages.presentValue, 2)}</td>
              <td class="left" style="font-size:7pt">${wageNote || 'n/a'}</td>
            </tr>
          `;
        })
        .join('')
    : `
      <tr>
        <td colspan="8" class="center">No source DOT work history loaded.</td>
      </tr>
    `;

  return `
    <section class="mtsp-page portrait">
      ${renderMtspHeader({
        reportCode: 'MTSP - Report 7',
        title: 'Work History Earning Capacity by VQ',
        dateLabel,
        evalueeName,
        withLogo: false
      })}
      <table class="mtsp-table mtsp-summary-table">
        <thead>
          <tr>
            <th>Dot Code</th>
            <th class="left">Job Title</th>
            <th>VQ</th>
            <th>SVP</th>
            <th>Hourly Wage</th>
            <th>Annual Wage</th>
            <th>Present Value Earnings</th>
            <th class="left">Notes</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="mtsp-note">Wage outputs default to n/a when wage fields are unavailable in current MVQS data.</p>
      ${renderFooter('Page 1 of 1')}
    </section>
  `;
}

function renderReport8Html(vm, dateLabel, evalueeName, matches) {
  const rows = matches.length
    ? matches
        .map((row) => {
          const tsDisplayPercent = deriveTransferTsDisplayPercent(vm, row);
          const vaDisplayPercent = deriveTransferVaDisplayPercent(vm, row);
          const traits = parseTraitVector(row.trait_vector)
            .map((value) => `<td class="trait-num">${escapeHtml(String(value || ''))}</td>`)
            .join('');
          const details = row.occupation_details || {};
          const hollandLabel = details.holland_title || '';
          const dptLabel = [details.d_function, details.p_function, details.t_function].filter(Boolean).join('/') || '';
          return `
            <tr>
              <td class="left dot-col">${escapeHtml(formatDotCode(row.dot_code))}</td>
              <td class="left wide-title">${escapeHtml(row.title || 'Untitled')}${hollandLabel ? `<br/><span style="font-size:6pt;color:#555">${escapeHtml(hollandLabel)}${dptLabel ? ` | ${escapeHtml(dptLabel)}` : ''}</span>` : ''}</td>
              <td class="center ts-col">${fmtDecimal(tsDisplayPercent)}%</td>
              <td class="right vq-col">${fmtDecimal(row.vq, 2)}</td>
              <td class="center vipr-col">${escapeHtml(row.vipr_type || vm.case_context?.vipr_type || 'n/a')}</td>
              <td class="center va-col">${fmtDecimal(vaDisplayPercent)}%</td>
              <td class="center p-col">${escapeHtml(
                formatPhysicalDemandP(row.physical_demand_target_level ?? row.strength_target_level ?? resolveStrengthLevelFromVector(row.trait_vector))
              )}</td>
              <td class="left skill-col">${escapeHtml(deriveSkillLevelLabel(row.vq, row.svp))}</td>
              ${traits}
            </tr>
          `;
        })
        .join('')
    : `
      <tr>
        <td colspan="32" class="center">No transferable matches available.</td>
      </tr>
    `;

  return `
    <section class="mtsp-page landscape">
      ${renderMtspHeader({
        reportCode: 'MTSP - Report 8',
        title: 'Job Matches by Transferable Skills (TS) - Job Demands',
        dateLabel,
        evalueeName,
        withLogo: false
      })}
      <table class="mtsp-table compact">
        <thead>
          <tr>
            <th class="dot-col" rowspan="2">Dot Code</th>
            <th class="wide-title" rowspan="2">Job Title</th>
            <th class="ts-col" rowspan="2">TS</th>
            <th class="vq-col" rowspan="2">VQ</th>
            <th class="vipr-col" rowspan="2">VIPR</th>
            <th class="va-col" rowspan="2">VA</th>
            <th class="p-col" rowspan="2">P</th>
            <th class="skill-col" rowspan="2">Skill Level</th>
            ${renderWideTraitGroupCells()}
          </tr>
          <tr>
            ${renderTraitHeaderCells()}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="mtsp-note">
        P = PD1 Strength Demand (1/Sed, 2/Lgt, 3/Med, 4/Hvy, 5/VH). TSA keeps only jobs that satisfy profile residual demands, including PD1-PD6 physical-demand traits. Holland type and DPT functions shown under title where available.
      </p>
      ${renderFooter('Page auto')}
    </section>
  `;
}

function renderReport9Html(vm, dateLabel, evalueeName, matches) {
  const rows = matches.length
    ? matches
        .map((row, index) => {
          const tsDisplayPercent = deriveTransferTsDisplayPercent(vm, row);
          return `
            <tr>
              <td class="center">${index + 1}</td>
              <td class="left dot-col">${escapeHtml(formatDotCode(row.dot_code))}</td>
              <td class="left wide-title">${escapeHtml(row.title || 'Untitled')}</td>
              <td class="center ts-col">${fmtDecimal(tsDisplayPercent)}%</td>
              <td class="right vq-col">${fmtDecimal(row.vq, 2)}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.sic))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.soc))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.cen))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.ind))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.wf1))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.mpsms_primary))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.mtewa_primary))}</td>
              <td class="center">${escapeHtml(formatCodeValue(row.onet_group_or_ou || row.onet_ou_code))}</td>
            </tr>
          `;
        })
        .join('')
    : `
      <tr>
        <td colspan="13" class="center">No transferable matches available.</td>
      </tr>
    `;

  return `
    <section class="mtsp-page landscape">
      ${renderMtspHeader({
        reportCode: 'MTSP - Report 9',
        title: 'Job Matches Crosswalk Codes by TS',
        dateLabel,
        evalueeName,
        withLogo: false
      })}
      <table class="mtsp-table compact">
        <thead>
          <tr>
            <th>#</th>
            <th class="dot-col">Dot Code</th>
            <th class="wide-title">Job Title</th>
            <th class="ts-col">TS</th>
            <th class="vq-col">VQ</th>
            <th>SIC</th>
            <th>SOC</th>
            <th>CEN</th>
            <th>IND</th>
            <th>WF1</th>
            <th>MPSMS</th>
            <th>MTEWA</th>
            <th>O*NET Group/OU</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${renderFooter('Page auto')}
    </section>
  `;
}

function renderReport10Html(vm, dateLabel, evalueeName, matches) {
  const rows = matches.length
    ? matches
        .map((row, index) => {
          const tsDisplayPercent = deriveTransferTsDisplayPercent(vm, row);
          const vaDisplayPercent = deriveTransferVaDisplayPercent(vm, row);
          const wages = resolveWageFields(row);
          const wageNote = hasAnyWageValue(wages) ? '' : 'n/a (wage fields unavailable)';
          return `
            <tr>
              <td class="center">${index + 1}</td>
              <td class="left dot-col">${escapeHtml(formatDotCode(row.dot_code))}</td>
              <td class="left wide-title">${escapeHtml(row.title || 'Untitled')}</td>
              <td class="center ts-col">${fmtDecimal(tsDisplayPercent)}%</td>
              <td class="right vq-col">${fmtDecimal(row.vq, 2)}</td>
              <td class="right">${fmtNumber(row.svp)}</td>
              <td class="center va-col">${fmtDecimal(vaDisplayPercent)}%</td>
              <td class="center vipr-col">${escapeHtml(row.vipr_type || vm.case_context?.vipr_type || 'n/a')}</td>
              <td class="right">${fmtDecimal(wages.hourly, 2)}</td>
              <td class="right">${fmtDecimal(wages.annual, 2)}</td>
              <td class="right">${fmtDecimal(wages.presentValue, 2)}</td>
              <td class="left">${escapeHtml(wageNote || 'n/a')}</td>
            </tr>
          `;
        })
        .join('')
    : `
      <tr>
        <td colspan="12" class="center">No transferable matches available.</td>
      </tr>
    `;

  return `
    <section class="mtsp-page portrait">
      ${renderMtspHeader({
        reportCode: 'MTSP - Report 10',
        title: 'Job Matches Earning Capacity by TS',
        dateLabel,
        evalueeName,
        withLogo: false
      })}
      <table class="mtsp-table mtsp-summary-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Dot Code</th>
            <th class="left">Job Title</th>
            <th>TS</th>
            <th>VQ</th>
            <th>SVP</th>
            <th>VA</th>
            <th>VIPR</th>
            <th>Hourly Wage</th>
            <th>Annual Wage</th>
            <th>Present Value Earnings</th>
            <th class="left">Notes</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="mtsp-note">Wage outputs default to n/a when wage fields are unavailable in current MVQS data.</p>
      ${renderFooter('Page auto')}
    </section>
  `;
}

function renderEducationTrainingHtml(vm, dateLabel, evalueeName, sourceJobs) {
  const jobsWithEd = sourceJobs.filter((r) => Array.isArray(r.education_programs) && r.education_programs.length > 0);
  if (!jobsWithEd.length) return '';

  const rows = jobsWithEd.flatMap((job) =>
    job.education_programs.map((ed) => `
      <tr>
        <td class="left">${escapeHtml(formatDotCode(job.dot_code))}</td>
        <td class="left">${escapeHtml(job.title || 'Untitled')}</td>
        <td class="left">${escapeHtml(ed.caspar_title || 'n/a')}</td>
        <td class="left">${escapeHtml(ed.cip90_title || 'n/a')}</td>
        <td class="center">${escapeHtml(ed.cip90 || 'n/a')}</td>
      </tr>
    `)
  ).join('');

  return `
    <section class="mtsp-page portrait">
      ${renderMtspHeader({
        reportCode: 'MVQS - Education & Training',
        title: 'Education and Training Programs (CASPAR/CIP)',
        dateLabel,
        evalueeName,
        withLogo: false
      })}
      <table class="mtsp-table mtsp-summary-table">
        <thead>
          <tr>
            <th>DOT Code</th>
            <th class="left">Job Title</th>
            <th class="left">CASPAR Program</th>
            <th class="left">CIP-90 Title</th>
            <th>CIP Code</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="mtsp-note">CASPAR = Classification of Approved Specific Programs and Residencies. CIP = Classification of Instructional Programs (1990 revision).</p>
      ${renderFooter('Page auto')}
    </section>
  `;
}

function renderSelectedJobDetailHtml(vm, dateLabel, evalueeName) {
  const selected = vm.report?.selected_job;
  if (!selected) return '';
  const details = selected.occupation_details || {};
  const tem = selected.temperaments;
  const altTitles = Array.isArray(selected.alternate_titles) ? selected.alternate_titles : [];
  const education = Array.isArray(selected.education_programs) ? selected.education_programs : [];
  const viprDesc = selected.vipr_job_description || '';
  const wages = vm.enrichment?.selected_job_wages || [];

  const temRows = tem ? Object.entries(tem).map(([key, val]) => {
    const TEM_FULL = {
      dir: 'Directing-Control-Planning (DCP)',
      rep: 'Repetitive/Short Cycle (REP)',
      inf: 'Influencing People (INFLU)',
      var: 'Variety and Change (VARCH)',
      exp: 'Expressing Feelings (DEPL)',
      alo: 'Working Alone (ISOL)',
      str: 'Stress (STS)',
      tol: 'Tolerances (MVC)',
      und: 'Under Specific Instructions (USI)',
      peo: 'Dealing with People (PUS)',
      jud: 'Making Judgments (SJC)'
    };
    return `<tr><td class="left">${escapeHtml(TEM_FULL[key] || key)}</td><td class="center">${Number(val) === 1 ? 'Yes' : 'No'}</td></tr>`;
  }).join('') : '<tr><td colspan="2" class="center">No temperament data available.</td></tr>';

  const wageRows = wages.length
    ? wages.map((w) => `
      <tr>
        <td class="left">${escapeHtml(w.area_title || 'n/a')}</td>
        <td class="right">${fmtNumber(w.tot_emp)}</td>
        <td class="right">$${fmtDecimal(w.h_mean, 2)}</td>
        <td class="right">$${fmtNumber(w.a_mean)}</td>
        <td class="right">$${fmtNumber(w.a_median)}</td>
        <td class="right">$${fmtNumber(w.a_pct10)}</td>
        <td class="right">$${fmtNumber(w.a_pct90)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="7" class="center">No BLS wage data available for this occupation crosswalk.</td></tr>';

  return `
    <section class="mtsp-page portrait">
      ${renderMtspHeader({
        reportCode: 'MVQS - Selected Job Detail',
        title: 'Selected Target Job Comprehensive Detail',
        dateLabel,
        evalueeName,
        withLogo: false
      })}
      <div class="mtsp-kv-grid">
        <div class="mtsp-kv"><span class="k">Title:</span><span class="v">${escapeHtml(selected.title || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">DOT Code:</span><span class="v">${escapeHtml(formatDotCode(selected.dot_code))}</span></div>
        <div class="mtsp-kv"><span class="k">VQ:</span><span class="v">${fmtDecimal(selected.vq, 2)}</span></div>
        <div class="mtsp-kv"><span class="k">SVP:</span><span class="v">${fmtNumber(selected.svp)}${details.svp_length ? ` (${escapeHtml(details.svp_length)})` : ''}</span></div>
        <div class="mtsp-kv"><span class="k">Holland Type:</span><span class="v">${escapeHtml(details.holland_title || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">GOE:</span><span class="v">${escapeHtml(details.goe_ia || '')} ${escapeHtml(details.goe_ia_title || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">OES:</span><span class="v">${escapeHtml(details.oes_code || '')} ${escapeHtml(details.oes_title || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">SOC:</span><span class="v">${escapeHtml(details.soc_title || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">Data Function:</span><span class="v">${escapeHtml(details.d_function || 'n/a')} (Level ${escapeHtml(details.data_level || 'n/a')})</span></div>
        <div class="mtsp-kv"><span class="k">People Function:</span><span class="v">${escapeHtml(details.p_function || 'n/a')} (Level ${escapeHtml(details.people_level || 'n/a')})</span></div>
        <div class="mtsp-kv"><span class="k">Things Function:</span><span class="v">${escapeHtml(details.t_function || 'n/a')} (Level ${escapeHtml(details.things_level || 'n/a')})</span></div>
        <div class="mtsp-kv"><span class="k">Strength (PD1):</span><span class="v">${escapeHtml(formatPhysicalDemandP(resolveStrengthLevelFromVector(selected.trait_vector)))}</span></div>
      </div>
      <div class="mtsp-kv" style="margin-top:4px"><span class="k">Physical Demands:</span><span class="v">${escapeHtml(renderPhysicalDemandDetails(selected.trait_vector))}</span></div>
      ${viprDesc ? `<p style="font-size:8.5pt;margin:6px 0 2px"><strong>Job Description:</strong> ${escapeHtml(viprDesc)}</p>` : ''}
      ${altTitles.length ? `<p style="font-size:8pt;margin:2px 0"><strong>Alternate Titles:</strong> ${escapeHtml(altTitles.join(', '))}</p>` : ''}
      ${education.length ? `<p style="font-size:8pt;margin:2px 0"><strong>Education Programs:</strong> ${escapeHtml(education.map((e) => e.cip90_title || e.caspar_title).filter(Boolean).join('; '))}</p>` : ''}

      <div class="mtsp-section-title">Temperament Profile</div>
      <table class="mtsp-table mtsp-summary-table" style="width:auto">
        <thead><tr><th class="left">Temperament Factor</th><th>Required</th></tr></thead>
        <tbody>${temRows}</tbody>
      </table>

      <div class="mtsp-section-title">BLS Wage Data (OES Crosswalk)</div>
      <table class="mtsp-table mtsp-summary-table">
        <thead>
          <tr>
            <th class="left">Area</th>
            <th>Employment</th>
            <th>Hourly Mean</th>
            <th>Annual Mean</th>
            <th>Annual Median</th>
            <th>10th %ile</th>
            <th>90th %ile</th>
          </tr>
        </thead>
        <tbody>${wageRows}</tbody>
      </table>
      <p class="mtsp-note">Wage data sourced from US Bureau of Labor Statistics Occupational Employment and Wage Statistics (OES). OES/SOC code crosswalk via DOT occupation details.</p>
      ${renderFooter('Page auto')}
    </section>
  `;
}

function renderMatchReportHtml(vm) {
  const report = vm.report;
  const selected = report.selected_job;
  const summary = report.summary || {};
  const matchRows = (report.matches || []).slice(0, 40)
    .map(
      (row, index) => `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${escapeHtml(formatDotCode(row.dot_code || 'n/a'))}</td>
        <td>${escapeHtml(row.title || 'Untitled')}</td>
        <td class="right">${fmtDecimal(row.match_score)}%</td>
        <td class="right">${fmtNumber(row.deficit)}</td>
        <td class="right">${fmtNumber(row.job_count)}</td>
        <td class="right">${fmtDecimal(row.vq)}</td>
        <td class="right">${fmtNumber(row.svp)}</td>
      </tr>`
    )
    .join('');

  const selectedHtml = selected
    ? `<p><strong>${escapeHtml(selected.title || '')}</strong> (${escapeHtml(formatDotCode(selected.dot_code || 'n/a'))})</p>
       <p><strong>Match:</strong> ${fmtDecimal(selected.match_score)}% | <strong>Deficit:</strong> ${fmtNumber(selected.deficit)} | <strong>Jobs:</strong> ${fmtNumber(selected.job_count)}</p>
       <p><strong>VQ/SVP:</strong> ${fmtDecimal(selected.vq)} / ${fmtNumber(selected.svp)}</p>
       <p>${escapeHtml(selected.description || '')}</p>`
    : '<p>No selected job.</p>';

  return `
    <section class="mtsp-page portrait">
      ${renderMtspHeader({
        reportCode: 'MVQS - Match Report',
        title: 'Job-Person Match Summary',
        dateLabel: formatDateForHeader(vm.generated_at_utc),
        evalueeName: vm.case_context?.full_name || '',
        withLogo: true
      })}
      <div class="mtsp-kv-grid">
        <div class="mtsp-kv"><span class="k">Generated:</span><span class="v">${escapeHtml(vm.generated_at_utc || 'n/a')}</span></div>
        <div class="mtsp-kv"><span class="k">Region:</span><span class="v">${escapeHtml(vm.region_label)}</span></div>
        <div class="mtsp-kv"><span class="k">Query:</span><span class="v">${escapeHtml(report.filters?.q || 'none')}</span></div>
        <div class="mtsp-kv"><span class="k">Selected Source:</span><span class="v">${escapeHtml(describeSelectedSource(report))}</span></div>
        <div class="mtsp-kv"><span class="k">Average Match:</span><span class="v">${fmtDecimal(summary.average_match_score)}%</span></div>
        <div class="mtsp-kv"><span class="k">Rows:</span><span class="v">${fmtNumber(summary.result_count)}</span></div>
      </div>
      <div class="mtsp-section-title">Selected Job</div>
      ${selectedHtml}
      <div class="mtsp-section-title">Ranked Matches</div>
      <table class="mtsp-table mtsp-summary-table">
        <thead>
          <tr>
            <th>#</th>
            <th>DOT</th>
            <th>Title</th>
            <th>Match %</th>
            <th>Deficit</th>
            <th>Jobs</th>
            <th>VQ</th>
            <th>SVP</th>
          </tr>
        </thead>
        <tbody>${matchRows || '<tr><td colspan="8" class="center">No matches.</td></tr>'}</tbody>
      </table>
      ${renderFooter('Page 1 of 1')}
    </section>
  `;
}

function renderTransferReportHtml(vm) {
  const report = vm.report || {};
  const sourceJobs = Array.isArray(report.source_jobs) ? report.source_jobs : [];
  const matches = (report.matches || []).slice(0, 86);
  const dateLabel = formatDateForHeader(vm.generated_at_utc);
  const evalueeName = vm.case_context?.full_name || `${vm.case_context?.first_name || ''} ${vm.case_context?.last_name || ''}`.trim() || 'n/a';

  return `
    <div class="mtsp-report">
      ${renderReport1Html(vm, dateLabel, evalueeName)}
      ${renderReport3Html(vm, dateLabel, evalueeName, sourceJobs)}
      ${renderReport4Html(vm, dateLabel, evalueeName, matches)}
      ${renderReport5Html(vm, dateLabel, evalueeName, sourceJobs)}
      ${renderReport6Html(vm, dateLabel, evalueeName, sourceJobs)}
      ${renderReport7Html(vm, dateLabel, evalueeName, sourceJobs)}
      ${renderReport8Html(vm, dateLabel, evalueeName, matches)}
      ${renderReport9Html(vm, dateLabel, evalueeName, matches)}
      ${renderReport10Html(vm, dateLabel, evalueeName, matches)}
      ${renderEducationTrainingHtml(vm, dateLabel, evalueeName, sourceJobs)}
      ${renderSelectedJobDetailHtml(vm, dateLabel, evalueeName)}
    </div>
  `;
}

export function buildReportViewModel(report, caseContext = {}) {
  const normalizedCase = normalizeCaseContext(caseContext);
  const safeReport = report || {};
  const tspLevels = Array.isArray(safeReport.tsp_levels) && safeReport.tsp_levels.length
    ? safeReport.tsp_levels
    : DEFAULT_TSP_LEVELS;
  const profileTraits = Array.isArray(safeReport.profile?.traits) && safeReport.profile.traits.length
    ? safeReport.profile.traits
    : TRAITS;
  const profileValues = Array.isArray(safeReport.profile?.values) && safeReport.profile.values.length === profileTraits.length
    ? safeReport.profile.values
    : DEFAULT_PROFILE;

  return {
    report: safeReport,
    report_type: safeReport.report_type || 'mvqs_match_report',
    generated_at_utc: safeReport.generated_at_utc || null,
    source_mode: safeReport.mvqs_coverage?.metadata?.source_mode || null,
    source_path: safeReport.mvqs_coverage?.metadata?.source_main_path || null,
    region_label: getSelectedRegionLabel(safeReport),
    summary: safeReport.summary || {},
    tsp_levels: tspLevels,
    profile_traits: profileTraits,
    profile_values: profileValues,
    case_context: normalizedCase,
    enrichment: safeReport.enrichment || {}
  };
}

export function renderReportHtml(viewModel) {
  const vm = viewModel || buildReportViewModel({});
  const body = vm.report_type === 'mvqs_transferable_skills_report'
    ? renderTransferReportHtml(vm)
    : renderMatchReportHtml(vm);

  const title = vm.report_type === 'mvqs_transferable_skills_report'
    ? 'MVQS Transferable Skills Case Report'
    : 'MVQS Match Report';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/report-print.css" />
  <style>${TRANSFER_REPORT_STYLE}</style>
</head>
<body>
  ${body}
</body>
</html>`;
}

function renderMatchReportMarkdown(vm) {
  const report = vm.report;
  const selected = report.selected_job;
  const lines = [];

  lines.push('# MVQS Match Report');
  lines.push('');
  lines.push(`- Generated (UTC): ${report.generated_at_utc || 'n/a'}`);
  lines.push(`- Source mode: ${report.mvqs_coverage?.metadata?.source_mode || 'n/a'}`);
  lines.push(`- Region: ${getSelectedRegionLabel(report)}`);
  lines.push(`- Query: ${report.filters?.q || 'none'}`);
  lines.push(`- Selected source: ${describeSelectedSource(report)}`);
  lines.push(`- Match pool total: ${report.match_pool_total ?? 'n/a'}`);
  lines.push(`- Included matches: ${report.matches?.length ?? 0}`);
  lines.push('');

  lines.push('## Selected Job');
  lines.push('');
  if (!selected) {
    lines.push('No selected job.');
  } else {
    lines.push(`- Title: ${selected.title}`);
    lines.push(`- DOT: ${selected.dot_code}`);
    lines.push(`- Match: ${fmtDecimal(selected.match_score)}%`);
    lines.push(`- Deficit: ${fmtNumber(selected.deficit)}`);
    lines.push(`- Jobs in region: ${fmtNumber(selected.job_count)}`);
  }
  lines.push('');

  lines.push('## Ranked Matches');
  lines.push('');
  lines.push('| Rank | DOT | Title | Match % | Deficit | Jobs | VQ | SVP |');
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |');
  (report.matches || []).slice(0, 40).forEach((row, index) => {
    lines.push(
      `| ${index + 1} | ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title)} | ${fmtDecimal(row.match_score)} | ${fmtNumber(row.deficit)} | ${fmtNumber(row.job_count)} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} |`
    );
  });

  return `${lines.join('\n')}\n`;
}

function renderTransferReportMarkdown(vm) {
  const report = vm.report;
  const selected = report.selected_job;
  const lines = [];
  const sourceJobs = Array.isArray(report.source_jobs) ? report.source_jobs : [];
  const sourceJobsByVq = sortByVqDescending(sourceJobs);
  const sourceDotList = sourceJobs.map((row) => row.dot_code).filter(Boolean);
  const summary = report.summary || {};
  const bandCounts = report.tsp_band_counts || {};
  const basis = report.analysis_basis || {};
  const matchedRows = (report.matches || []).slice(0, 86);
  const tsMode = resolveTransferTsDisplayMode(vm);
  const vaMode = resolveTransferVaDisplayMode(vm);
  const tsDisplayValues = matchedRows
    .map((row) => deriveTransferTsDisplayPercent(vm, row))
    .filter((value) => Number.isFinite(Number(value)));
  const vaDisplayValues = matchedRows
    .map((row) => deriveTransferVaDisplayPercent(vm, row))
    .filter((value) => Number.isFinite(Number(value)));
  const averageTsDisplay = tsDisplayValues.length
    ? tsDisplayValues.reduce((sum, value) => sum + Number(value), 0) / tsDisplayValues.length
    : null;
  const averageVaDisplay = vaDisplayValues.length
    ? vaDisplayValues.reduce((sum, value) => sum + Number(value), 0) / vaDisplayValues.length
    : null;

  lines.push('# MVQS - Transferable Skills - Case Report');
  lines.push('');
  lines.push('## Report 1: Client Identification, Labor Market Area, and Referral');
  lines.push('');
  lines.push(`- Generated (UTC): ${report.generated_at_utc || 'n/a'}`);
  lines.push(`- Source mode: ${report.mvqs_coverage?.metadata?.source_mode || 'n/a'}`);
  lines.push(`- Source path: ${report.mvqs_coverage?.metadata?.source_main_path || 'n/a'}`);
  lines.push(`- Region: ${getSelectedRegionLabel(report)}`);
  lines.push(`- Query: ${report.filters?.q || 'none'}`);
  lines.push(`- Source DOTs: ${sourceDotList.length ? sourceDotList.join(', ') : 'n/a'}`);
  lines.push('');

  lines.push('## Report 3: Worker Trait Profiles');
  lines.push('');
  lines.push(`- Evaluative profile vector (24 traits): ${formatProfileVector(report.profile?.values || null)}`);
  lines.push('- Trait order: R M L S P Q K F M E C | PD1..PD6 | EC1..EC7');
  lines.push('');

  lines.push('## Report 4: Transferable Skills Availability and Utilization');
  lines.push('');
  lines.push(`- Average TSP (display): ${fmtDecimal(averageTsDisplay)}%`);
  lines.push(`- Average VA (display): ${fmtDecimal(averageVaDisplay)}%`);
  lines.push(`- TS display mode: ${tsMode}`);
  lines.push(`- VA display mode: ${vaMode}`);
  lines.push(
    `- Diagnostics: candidates ${fmtNumber(report.transferability_diagnostics?.candidate_count)}, physical gate exclusions ${fmtNumber(
      report.transferability_diagnostics?.physical_gate_excluded_count
    )}`
  );
  lines.push(
    `- Band totals: L5 ${fmtNumber(bandCounts.level_5)} | L4 ${fmtNumber(bandCounts.level_4)} | L3 ${fmtNumber(bandCounts.level_3)} | L2 ${fmtNumber(bandCounts.level_2)} | L1 ${fmtNumber(bandCounts.level_1)}`
  );
  lines.push('');

  lines.push('## Report 5: Work History Job Demands / Worker Trait Requirements');
  lines.push('');
  lines.push('| DOT | Job Title | VQ | SVP | P (PD1) | Holland | DPT | TEM | Skill Level | Trait Vector |');
  lines.push('| --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- |');
  if (!sourceJobs.length) {
    lines.push('| n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |');
  } else {
    sourceJobs.forEach((row) => {
      const details = row.occupation_details || {};
      const dpt = [details.d_function, details.p_function, details.t_function].filter(Boolean).join('/') || 'n/a';
      const tem = renderTemperamentSummary(row.temperaments);
      lines.push(
        `| ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title || 'Untitled')} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} | ${asMarkdownCell(formatPhysicalDemandP(resolveStrengthLevelFromVector(row.trait_vector)))} | ${asMarkdownCell(details.holland_title || 'n/a')} | ${asMarkdownCell(dpt)} | ${asMarkdownCell(tem)} | ${deriveSkillLevelLabel(row.vq, row.svp)} | ${asMarkdownCell(row.trait_vector || '')} |`
      );
      if (Array.isArray(row.alternate_titles) && row.alternate_titles.length) {
        lines.push(`|  | _Alt: ${asMarkdownCell(row.alternate_titles.slice(0, 5).join(', '))}_ | | | | | | | | |`);
      }
      lines.push(`|  | _PD: ${asMarkdownCell(renderPhysicalDemandDetails(row.trait_vector))}_ | | | | | | | | |`);
    });
  }
  lines.push('');

  lines.push('## Report 6: Work History Crosswalk Codes by VQ');
  lines.push('');
  lines.push('| DOT | Job Title | VQ | SVP | SIC | SOC | CEN | IND | WF1 | MPSMS | MTEWA | O*NET Group/OU |');
  lines.push('| --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- |');
  if (!sourceJobsByVq.length) {
    lines.push('| n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |');
  } else {
    sourceJobsByVq.forEach((row) => {
      lines.push(
        `| ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title || 'Untitled')} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} | ${asMarkdownCell(formatCodeValue(row.sic))} | ${asMarkdownCell(formatCodeValue(row.soc))} | ${asMarkdownCell(formatCodeValue(row.cen))} | ${asMarkdownCell(formatCodeValue(row.ind))} | ${asMarkdownCell(formatCodeValue(row.wf1))} | ${asMarkdownCell(formatCodeValue(row.mpsms_primary))} | ${asMarkdownCell(formatCodeValue(row.mtewa_primary))} | ${asMarkdownCell(formatCodeValue(row.onet_group_or_ou || row.onet_ou_code))} |`
      );
    });
  }
  lines.push('');

  lines.push('## Report 7: Work History Earning Capacity by VQ');
  lines.push('');
  lines.push('| DOT | Job Title | VQ | SVP | Hourly Wage | Annual Wage | Present Value Earnings | Note |');
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |');
  if (!sourceJobsByVq.length) {
    lines.push('| n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |');
  } else {
    sourceJobsByVq.forEach((row) => {
      const wages = resolveWageFields(row);
      const wageNote = hasAnyWageValue(wages) ? 'n/a' : 'n/a (wage fields unavailable)';
      lines.push(
        `| ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title || 'Untitled')} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} | ${fmtDecimal(wages.hourly)} | ${fmtDecimal(wages.annual)} | ${fmtDecimal(wages.presentValue)} | ${asMarkdownCell(wageNote)} |`
      );
    });
  }
  lines.push('');

  lines.push('## Report 8: Job Matches by Transferable Skills (TS) - Job Demands');
  lines.push('');
  lines.push('| Rank | DOT | Job Title | VQ | SVP | P (PD1) | TS % | VA Adj % | Level | Best Source DOT | VIPR | Skill Level |');
  lines.push('| --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- | --- | --- | --- |');
  matchedRows.forEach((row, index) => {
    const tsDisplayPercent = deriveTransferTsDisplayPercent(vm, row);
    const vaDisplayPercent = deriveTransferVaDisplayPercent(vm, row);
    lines.push(
      `| ${index + 1} | ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title)} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} | ${asMarkdownCell(formatPhysicalDemandP(row.physical_demand_target_level ?? row.strength_target_level ?? resolveStrengthLevelFromVector(row.trait_vector)))} | ${fmtDecimal(tsDisplayPercent)} | ${fmtDecimal(vaDisplayPercent)} | ${fmtNumber(row.tsp_level)} ${asMarkdownCell(row.tsp_label || '')} | ${asMarkdownCell(row.best_source_dot_code || '')} | ${asMarkdownCell(row.vipr_type || 'n/a')} | ${deriveSkillLevelLabel(row.vq, row.svp)} |`
    );
  });
  lines.push('');

  lines.push('## Report 9: Job Matches Crosswalk Codes by TS');
  lines.push('');
  lines.push('| Rank | DOT | Job Title | TS % | VQ | SIC | SOC | CEN | IND | WF1 | MPSMS | MTEWA | O*NET Group/OU |');
  lines.push('| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- |');
  matchedRows.forEach((row, index) => {
    const tsDisplayPercent = deriveTransferTsDisplayPercent(vm, row);
    lines.push(
      `| ${index + 1} | ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title)} | ${fmtDecimal(tsDisplayPercent)} | ${fmtDecimal(row.vq)} | ${asMarkdownCell(formatCodeValue(row.sic))} | ${asMarkdownCell(formatCodeValue(row.soc))} | ${asMarkdownCell(formatCodeValue(row.cen))} | ${asMarkdownCell(formatCodeValue(row.ind))} | ${asMarkdownCell(formatCodeValue(row.wf1))} | ${asMarkdownCell(formatCodeValue(row.mpsms_primary))} | ${asMarkdownCell(formatCodeValue(row.mtewa_primary))} | ${asMarkdownCell(formatCodeValue(row.onet_group_or_ou || row.onet_ou_code))} |`
    );
  });
  lines.push('');

  lines.push('## Report 10: Job Matches Earning Capacity by TS');
  lines.push('');
  lines.push('| Rank | DOT | Job Title | TS % | VQ | SVP | VA % | VIPR | Hourly Wage | Annual Wage | Present Value Earnings | Note |');
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |');
  matchedRows.forEach((row, index) => {
    const tsDisplayPercent = deriveTransferTsDisplayPercent(vm, row);
    const vaDisplayPercent = deriveTransferVaDisplayPercent(vm, row);
    const wages = resolveWageFields(row);
    const wageNote = hasAnyWageValue(wages) ? 'n/a' : 'n/a (wage fields unavailable)';
    lines.push(
      `| ${index + 1} | ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title)} | ${fmtDecimal(tsDisplayPercent)} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} | ${fmtDecimal(vaDisplayPercent)} | ${asMarkdownCell(row.vipr_type || 'n/a')} | ${fmtDecimal(wages.hourly)} | ${fmtDecimal(wages.annual)} | ${fmtDecimal(wages.presentValue)} | ${asMarkdownCell(wageNote)} |`
    );
  });
  lines.push('');

  lines.push('## Selected Target Job Detail');
  lines.push('');
  if (!selected) {
    lines.push('No selected job.');
  } else {
    const signals = selected.signal_scores || {};
    const selDetails = selected.occupation_details || {};
    lines.push(`- Title: ${selected.title}`);
    lines.push(`- DOT: ${selected.dot_code}`);
    lines.push(`- TSP (adjusted): ${fmtDecimal(selected.tsp_percent)}%`);
    lines.push(`- TSP (unadjusted): ${fmtDecimal(selected.tsp_percent_unadjusted)}%`);
    lines.push(`- VA adjustment: ${fmtDecimal(selected.va_adjustment_percent)}%`);
    lines.push(`- TSP Level: ${fmtNumber(selected.tsp_level)} (${selected.tsp_label || 'n/a'})`);
    lines.push(`- Holland Type: ${selDetails.holland_title || 'n/a'}`);
    lines.push(`- GOE: ${selDetails.goe_ia || ''} ${selDetails.goe_ia_title || 'n/a'}`);
    lines.push(`- OES: ${selDetails.oes_code || ''} ${selDetails.oes_title || 'n/a'}`);
    lines.push(`- SOC: ${selDetails.soc_title || 'n/a'}`);
    lines.push(`- Data Function: ${selDetails.d_function || 'n/a'} (Level ${selDetails.data_level || 'n/a'})`);
    lines.push(`- People Function: ${selDetails.p_function || 'n/a'} (Level ${selDetails.people_level || 'n/a'})`);
    lines.push(`- Things Function: ${selDetails.t_function || 'n/a'} (Level ${selDetails.things_level || 'n/a'})`);
    lines.push(
      `- Physical demand (PD1): source ${formatPhysicalDemandP(selected.physical_demand_source_level ?? selected.strength_source_level)} -> target ${formatPhysicalDemandP(
        selected.physical_demand_target_level ?? selected.strength_target_level
      )} | profile ${formatPhysicalDemandP(selected.physical_demand_profile_level ?? selected.strength_profile_level)}`
    );
    lines.push(`- Physical Demands Detail: ${renderPhysicalDemandDetails(selected.trait_vector)}`);
    lines.push(
      `- Physical-demand deficits (PD1-PD6): profile deficits ${fmtNumber(
        selected.physical_demand_profile_deficit_count
      )}, source deficits ${fmtNumber(selected.physical_demand_source_deficit_count)}, gate_failed=${Number(selected.physical_demand_gate_failed) === 1 ? 'yes' : 'no'}`
    );
    lines.push(`- Transfer Direction: ${selected.transfer_direction || 'n/a'}`);
    lines.push(`- Best Source DOT: ${selected.best_source_dot_code || 'n/a'}`);
    lines.push(`- Tier rule: ${selected.mtsp_tier_rule || 'n/a'}`);
    lines.push(`- Temperaments: ${renderTemperamentSummary(selected.temperaments)}`);
    lines.push(
      `- Signal scores: DOT ${fmtDecimal(signals.dot_prefix, 3)}, O*NET ${fmtDecimal(signals.onet_prefix, 3)}, VQ ${fmtDecimal(signals.vq_proximity, 3)}, SVP ${fmtDecimal(signals.svp_proximity, 3)}, Core ${fmtDecimal(signals.tier_core_score, 3)}, Progress ${fmtDecimal(signals.in_tier_progress, 3)}`
    );
    if (selected.vipr_job_description) {
      lines.push(`- Job Description: ${selected.vipr_job_description}`);
    }
    if (Array.isArray(selected.alternate_titles) && selected.alternate_titles.length) {
      lines.push(`- Alternate Titles: ${selected.alternate_titles.join(', ')}`);
    }
    if (Array.isArray(selected.education_programs) && selected.education_programs.length) {
      lines.push(`- Education Programs: ${selected.education_programs.map((e) => e.cip90_title || e.caspar_title).filter(Boolean).join('; ')}`);
    }
  }
  lines.push('');

  /* ---- VIPR Personality Type ---- */
  const viprPersonality = vm.enrichment?.vipr_personality;
  if (viprPersonality) {
    lines.push('## VIPR Personality Type');
    lines.push('');
    lines.push(`- Type: ${viprPersonality.personality_type} — ${viprPersonality.personality_name || 'n/a'}`);
    lines.push(`- Description: ${viprPersonality.personality_description || 'n/a'}`);
    lines.push('');
  }

  /* ---- ECLR Distribution ---- */
  const eclrConstants = vm.enrichment?.eclr_constants;
  if (Array.isArray(eclrConstants) && eclrConstants.length) {
    const defaultRow = eclrConstants.find((r) => r.variant === 'default') || eclrConstants[0];
    if (defaultRow) {
      lines.push('## ECLR Distribution (Regression Constants)');
      lines.push('');
      lines.push('| Percentile | Coefficient 1 | Coefficient 2 |');
      lines.push('| --- | ---: | ---: |');
      lines.push(`| Mean | ${fmtDecimal(defaultRow.eclr_mean1, 5)} | ${fmtDecimal(defaultRow.eclr_mean2, 4)} |`);
      lines.push(`| 10th %ile | ${fmtDecimal(defaultRow.eclr_10var1, 5)} | ${fmtDecimal(defaultRow.eclr_10var2, 4)} |`);
      lines.push(`| 25th %ile | ${fmtDecimal(defaultRow.eclr_25var1, 5)} | ${fmtDecimal(defaultRow.eclr_25var2, 4)} |`);
      lines.push(`| Median | ${fmtDecimal(defaultRow.eclr_median1, 5)} | ${fmtDecimal(defaultRow.eclr_median2, 4)} |`);
      lines.push(`| 75th %ile | ${fmtDecimal(defaultRow.eclr_75var1, 5)} | ${fmtDecimal(defaultRow.eclr_75var2, 4)} |`);
      lines.push(`| 90th %ile | ${fmtDecimal(defaultRow.eclr_90var1, 5)} | ${fmtDecimal(defaultRow.eclr_90var2, 4)} |`);
      lines.push('');
    }
  }

  /* ---- BLS Wage Data for Selected Job ---- */
  const selectedJobWages = vm.enrichment?.selected_job_wages;
  if (Array.isArray(selectedJobWages) && selectedJobWages.length) {
    lines.push('## BLS Wage Data (OES Crosswalk)');
    lines.push('');
    lines.push('| Area | Employment | Hourly Mean | Annual Mean | Annual Median | 10th %ile | 90th %ile |');
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
    selectedJobWages.forEach((w) => {
      lines.push(`| ${asMarkdownCell(w.area_title || 'n/a')} | ${fmtNumber(w.tot_emp)} | $${fmtDecimal(w.h_mean, 2)} | $${fmtNumber(w.a_mean)} | $${fmtNumber(w.a_median)} | $${fmtNumber(w.a_pct10)} | $${fmtNumber(w.a_pct90)} |`);
    });
    lines.push('');
  }

  /* ---- Education/Training Programs ---- */
  const jobsWithEd = sourceJobs.filter((r) => Array.isArray(r.education_programs) && r.education_programs.length > 0);
  if (jobsWithEd.length) {
    lines.push('## Education & Training Programs (CASPAR/CIP)');
    lines.push('');
    lines.push('| DOT | Job Title | CASPAR Program | CIP-90 Title | CIP Code |');
    lines.push('| --- | --- | --- | --- | --- |');
    jobsWithEd.forEach((job) => {
      job.education_programs.forEach((ed) => {
        lines.push(`| ${asMarkdownCell(job.dot_code)} | ${asMarkdownCell(job.title || 'Untitled')} | ${asMarkdownCell(ed.caspar_title || 'n/a')} | ${asMarkdownCell(ed.cip90_title || 'n/a')} | ${asMarkdownCell(ed.cip90 || 'n/a')} |`);
      });
    });
    lines.push('');
  }

  lines.push('## Methodology Notes');
  lines.push('');
  lines.push(`- Analysis model: ${basis.model || 'n/a'}`);
  (Array.isArray(basis.factors) ? basis.factors : []).forEach((factor) => lines.push(`- Factor: ${factor}`));
  (Array.isArray(basis.notes) ? basis.notes : []).forEach((note) => lines.push(`- Note: ${note}`));
  lines.push(`- Source selection rule: ${basis.source_selection || 'n/a'}`);

  return `${lines.join('\n')}\n`;
}

export function renderReportMarkdown(viewModel) {
  const vm = viewModel || buildReportViewModel({});
  if (vm.report_type === 'mvqs_transferable_skills_report') {
    return renderTransferReportMarkdown(vm);
  }
  return renderMatchReportMarkdown(vm);
}
