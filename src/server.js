import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import archiver from 'archiver';
import { chromium } from 'playwright';
import { TRAITS, DEFAULT_PROFILE, TRAIT_MAX_DEFICIT } from './traits.js';
import { buildReportViewModel, renderReportHtml, renderReportMarkdown } from './report_template.js';
import { getSection7Resolution, getSection7MethodologyMetadata } from './methodology/section7_resolution.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.MVQS_DB_PATH || path.resolve(__dirname, '../data/mvqs-modern.db');
const APP_DB_PATH = process.env.MVQS_APP_DB_PATH || path.resolve(__dirname, '../data/mvqs-app.db');
const PORT = Number.parseInt(process.env.PORT || '4173', 10);
const QUERY_MAX_LENGTH = 200;
const TRANSFERABLE_DEFAULT_LIMIT = 50;
const TRANSFERABLE_MAX_LIMIT = 250;
const REPORT_DEFAULT_MATCH_LIMIT = 25;
const REPORT_MAX_MATCH_LIMIT = 250;
const REPORT_DEFAULT_TASK_LIMIT = 25;
const REPORT_MAX_TASK_LIMIT = 100;
const PSYCHOMETRIC_CATALOG_SEED = [
  {
    test_code: 'WRAT4_READ',
    test_name: 'WRAT-4 Reading',
    domain: 'Academic Achievement',
    scale_min: 40,
    scale_max: 160,
    description: 'Wide Range Achievement Test, Reading score.'
  },
  {
    test_code: 'WRAT4_MATH',
    test_name: 'WRAT-4 Math',
    domain: 'Academic Achievement',
    scale_min: 40,
    scale_max: 160,
    description: 'Wide Range Achievement Test, Math score.'
  },
  {
    test_code: 'WRAT4_SPELL',
    test_name: 'WRAT-4 Spelling',
    domain: 'Academic Achievement',
    scale_min: 40,
    scale_max: 160,
    description: 'Wide Range Achievement Test, Spelling score.'
  },
  {
    test_code: 'WONDERLIC_PT',
    test_name: 'Wonderlic Personnel Test',
    domain: 'General Cognitive',
    scale_min: 0,
    scale_max: 50,
    description: 'Wonderlic Personnel Test raw or scaled score.'
  },
  {
    test_code: 'WBST_VERBAL',
    test_name: 'Wonderlic Basic Skills Test - Verbal',
    domain: 'Academic Skills',
    scale_min: 0,
    scale_max: 100,
    description: 'Wonderlic Basic Skills verbal subtest.'
  },
  {
    test_code: 'WBST_QUANT',
    test_name: 'Wonderlic Basic Skills Test - Quantitative',
    domain: 'Academic Skills',
    scale_min: 0,
    scale_max: 100,
    description: 'Wonderlic Basic Skills quantitative subtest.'
  },
  {
    test_code: 'WAIS_FSIQ',
    test_name: 'WAIS Full Scale IQ',
    domain: 'Cognitive',
    scale_min: 40,
    scale_max: 160,
    description: 'WAIS full-scale IQ.'
  },
  {
    test_code: 'WAIS_VCI',
    test_name: 'WAIS Verbal Comprehension Index',
    domain: 'Cognitive',
    scale_min: 40,
    scale_max: 160,
    description: 'WAIS verbal comprehension index.'
  },
  {
    test_code: 'WAIS_PRI',
    test_name: 'WAIS Perceptual Reasoning Index',
    domain: 'Cognitive',
    scale_min: 40,
    scale_max: 160,
    description: 'WAIS perceptual reasoning index.'
  },
  {
    test_code: 'WAIS_WMI',
    test_name: 'WAIS Working Memory Index',
    domain: 'Cognitive',
    scale_min: 40,
    scale_max: 160,
    description: 'WAIS working memory index.'
  },
  {
    test_code: 'WAIS_PSI',
    test_name: 'WAIS Processing Speed Index',
    domain: 'Cognitive',
    scale_min: 40,
    scale_max: 160,
    description: 'WAIS processing speed index.'
  },
  {
    test_code: 'WJ_COG',
    test_name: 'Woodcock-Johnson Cognitive Composite',
    domain: 'Cognitive',
    scale_min: 40,
    scale_max: 160,
    description: 'Woodcock-Johnson cognitive composite.'
  },
  {
    test_code: 'WJ_ACH',
    test_name: 'Woodcock-Johnson Achievement Composite',
    domain: 'Academic Achievement',
    scale_min: 40,
    scale_max: 160,
    description: 'Woodcock-Johnson achievement composite.'
  },
  {
    test_code: 'MMPI2',
    test_name: 'MMPI-2 Profile',
    domain: 'Personality',
    scale_min: 0,
    scale_max: 120,
    description: 'Minnesota Multiphasic Personality Inventory profile score summary.'
  },
  {
    test_code: 'CUSTOM',
    test_name: 'Custom / Other Test',
    domain: 'Custom',
    scale_min: null,
    scale_max: null,
    description: 'Custom psychometric test entry for case-specific instruments.'
  }
];
const TSP_LEVELS = [
  { level: 5, min: 80, max: 97, label: 'High transferable skills' },
  { level: 4, min: 60, max: 79.9, label: 'Moderate transferable skills' },
  { level: 3, min: 40, max: 59.9, label: 'Low transferable skills' },
  { level: 2, min: 20, max: 39.9, label: 'Few transferable skills' },
  { level: 1, min: 0, max: 19.9, label: 'No significant transferable skills' }
];
const TRANSFER_TS_DISPLAY_MODES = ['direct_api_ts', 'band_floor_20_steps', 'band_ceiling_20_steps'];
const TRANSFER_VA_DISPLAY_MODES = [
  'direct_api_va',
  'inverted_100_minus_api_va',
  'legacy_raw_46_minus_tsraw',
  'legacy_pct_46_minus_tsraw',
  'legacy_raw_46_minus_tsunadjusted_raw',
  'legacy_pct_46_minus_tsunadjusted_raw'
];
const MVQS_TSA_MODEL = String(process.env.MVQS_TSA_MODEL || 'auto')
  .trim()
  .toLowerCase();
const TSA_MODEL_PREF = ['auto', 'v2', 'v3'].includes(MVQS_TSA_MODEL) ? MVQS_TSA_MODEL : 'auto';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const METHODOLOGY_VERSION_V2 = 'mvqs_transferable_skills_v2_mtsp_calibrated';
const METHODOLOGY_VERSION_V3 = 'mvqs_transferable_skills_v3_legacy_sync';
const LEGACY_CROSSWALK_COLUMNS = ['sic', 'soc', 'cen', 'ind', 'onet_group_or_ou'];
const LEGACY_VALUE_COLUMNS = ['mpsms_primary', 'mtewa_primary'];
const LEGACY_SYNC_MIN_CROSSWALK_COVERAGE = 1;
const LEGACY_SYNC_MIN_VALUE_COVERAGE = 1;
const LEGACY_PROFILE_VQ_INTERCEPT = 34.56707;
const LEGACY_PROFILE_VQ_WEIGHTS = Object.freeze([
  5.299567, 2.213121, 1.424168, 2.241977, 1.783972, 1.95779, 1.648707, 1.631036,
  2.126616, 1.403101, 1.431217, 1.84953, 0.774892, -0.165864, 0.776669, 4.542681,
  0.201044, 1.470938, 0.330026, 0.504727, 0.371165, 1.217675, -0.200072, 0.298293
]);
const REPORT_MVQS_FIELDS = {
  jobs: [
    'dot_code',
    'title',
    'description',
    'trait_vector',
    'vq',
    'svp',
    'population',
    'disability_code',
    'skill_vq',
    'skill_alt',
    'skill_bucket',
    'onet_ou_code',
    'sic',
    'soc',
    'cen',
    'ind',
    'wf1',
    'mpsms_primary',
    'mtewa_primary',
    'onet_group_or_ou'
  ],
  job_tasks: ['dot_code', 'ts', 'description'],
  state_job_counts: ['state_id', 'dot_code', 'job_count'],
  county_job_counts: ['state_id', 'county_id', 'dot_code', 'job_count'],
  states: ['state_id', 'state_abbrev', 'state_name', 'installed'],
  counties: ['county_id', 'county_name', 'state_id', 'eclr_current'],
  metadata: [
    'built_at_utc',
    'legacy_dir',
    'source_mode',
    'source_main_path',
    'jobs_count',
    'tasks_count',
    'states_count',
    'counties_count',
    'state_job_counts_count',
    'county_job_counts_count',
    'jobs_crosswalk_coverage_count',
    'jobs_value_coverage_count',
    'legacy_snapshot_id'
  ]
};
const READINESS_REQUIRED_METADATA_KEYS = [
  'built_at_utc',
  'legacy_dir',
  'source_mode',
  'source_main_path',
  'jobs_count',
  'tasks_count',
  'states_count',
  'counties_count',
  'state_job_counts_count',
  'county_job_counts_count'
];

let db;
let appDb;
let jobsColumnSetCache;

function getDb() {
  if (db) {
    return db;
  }

  db = new DatabaseSync(DB_PATH, { readOnly: true });
  db.exec('PRAGMA query_only = ON;');
  jobsColumnSetCache = null;
  return db;
}

function dbReady() {
  try {
    getDb();
    return true;
  } catch {
    return false;
  }
}

function setupAppSchema(database) {
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      case_reference TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      city TEXT,
      postal_code TEXT,
      country_name TEXT DEFAULT 'USA',
      demographic_state_id INTEGER,
      demographic_county_id INTEGER,
      case_name TEXT,
      reason_for_referral TEXT,
      claims_email TEXT,
      case_diagnosis TEXT,
      vipr_type TEXT,
      labor_market_area_label TEXT DEFAULT 'Labor Market Area',
      evaluation_year INTEGER,
      ts_display_mode TEXT,
      va_display_mode TEXT,
      report_header_notes TEXT,
      notes TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at_utc TEXT NOT NULL,
      updated_at_utc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS psychometric_catalog (
      test_code TEXT PRIMARY KEY,
      test_name TEXT NOT NULL,
      domain TEXT,
      scale_min REAL,
      scale_max REAL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS psychometric_results (
      result_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      test_code TEXT,
      test_name TEXT NOT NULL,
      raw_score REAL,
      scaled_score REAL,
      percentile REAL,
      interpretation TEXT,
      measured_at_utc TEXT,
      source_note TEXT,
      created_at_utc TEXT NOT NULL,
      updated_at_utc TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_reports (
      saved_report_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      label TEXT,
      report_type TEXT NOT NULL,
      selected_dot_code TEXT,
      query_text TEXT,
      state_id INTEGER,
      county_id INTEGER,
      profile_json TEXT NOT NULL,
      report_json TEXT NOT NULL,
      report_markdown TEXT NOT NULL,
      report_hash_sha256 TEXT NOT NULL,
      report_html TEXT,
      report_html_hash_sha256 TEXT,
      created_at_utc TEXT NOT NULL,
      updated_at_utc TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS case_work_history_dots (
      case_work_history_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      dot_code TEXT NOT NULL,
      display_order INTEGER NOT NULL,
      title_snapshot TEXT,
      created_at_utc TEXT NOT NULL,
      updated_at_utc TEXT NOT NULL,
      UNIQUE(user_id, dot_code),
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS case_profile_sets (
      user_id INTEGER PRIMARY KEY,
      profile1_work_history_vector TEXT NOT NULL,
      profile2_evaluative_vector TEXT NOT NULL,
      profile3_pre_vector TEXT NOT NULL,
      profile4_post_vector TEXT NOT NULL,
      clinical_override_mode INTEGER NOT NULL DEFAULT 0,
      enforce_residual_cap INTEGER NOT NULL DEFAULT 1,
      profile1_vq_est REAL,
      profile2_vq_est REAL,
      profile3_vq_est REAL,
      profile4_vq_est REAL,
      updated_at_utc TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_name ON users(last_name, first_name, user_id);
    CREATE INDEX IF NOT EXISTS idx_psychometric_results_user ON psychometric_results(user_id, measured_at_utc DESC, result_id DESC);
    CREATE INDEX IF NOT EXISTS idx_saved_reports_user ON saved_reports(user_id, created_at_utc DESC, saved_report_id DESC);
    CREATE INDEX IF NOT EXISTS idx_case_work_history_user ON case_work_history_dots(user_id, display_order, case_work_history_id);
  `);
}

function ensureAppSchemaMigrations(database) {
  const userColumns = database.prepare('PRAGMA table_info(users)').all();
  const existingUser = new Set(userColumns.map((row) => String(row.name)));
  const userAddStatements = [];
  if (!existingUser.has('address_line1')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN address_line1 TEXT');
  }
  if (!existingUser.has('address_line2')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN address_line2 TEXT');
  }
  if (!existingUser.has('city')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN city TEXT');
  }
  if (!existingUser.has('postal_code')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN postal_code TEXT');
  }
  if (!existingUser.has('country_name')) {
    userAddStatements.push("ALTER TABLE users ADD COLUMN country_name TEXT DEFAULT 'USA'");
  }
  if (!existingUser.has('demographic_state_id')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN demographic_state_id INTEGER');
  }
  if (!existingUser.has('demographic_county_id')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN demographic_county_id INTEGER');
  }
  if (!existingUser.has('case_name')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN case_name TEXT');
  }
  if (!existingUser.has('reason_for_referral')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN reason_for_referral TEXT');
  }
  if (!existingUser.has('claims_email')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN claims_email TEXT');
  }
  if (!existingUser.has('case_diagnosis')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN case_diagnosis TEXT');
  }
  if (!existingUser.has('vipr_type')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN vipr_type TEXT');
  }
  if (!existingUser.has('labor_market_area_label')) {
    userAddStatements.push("ALTER TABLE users ADD COLUMN labor_market_area_label TEXT DEFAULT 'Labor Market Area'");
  }
  if (!existingUser.has('evaluation_year')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN evaluation_year INTEGER');
  }
  if (!existingUser.has('ts_display_mode')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN ts_display_mode TEXT');
  }
  if (!existingUser.has('va_display_mode')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN va_display_mode TEXT');
  }
  if (!existingUser.has('report_header_notes')) {
    userAddStatements.push('ALTER TABLE users ADD COLUMN report_header_notes TEXT');
  }

  /* Psychometric results migration - add stanine column */
  const psychColumns = database.prepare('PRAGMA table_info(psychometric_results)').all();
  const existingPsych = new Set(psychColumns.map((row) => String(row.name)));
  if (!existingPsych.has('stanine')) {
    database.exec('ALTER TABLE psychometric_results ADD COLUMN stanine INTEGER');
  }

  const reportColumns = database.prepare('PRAGMA table_info(saved_reports)').all();
  const existingReports = new Set(reportColumns.map((row) => String(row.name)));
  const reportAddStatements = [];
  if (!existingReports.has('report_html')) {
    reportAddStatements.push('ALTER TABLE saved_reports ADD COLUMN report_html TEXT');
  }
  if (!existingReports.has('report_html_hash_sha256')) {
    reportAddStatements.push('ALTER TABLE saved_reports ADD COLUMN report_html_hash_sha256 TEXT');
  }

  database.exec('BEGIN');
  try {
    userAddStatements.forEach((statement) => database.exec(statement));
    reportAddStatements.forEach((statement) => database.exec(statement));
    database.exec(`
      CREATE TABLE IF NOT EXISTS case_work_history_dots (
        case_work_history_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        dot_code TEXT NOT NULL,
        display_order INTEGER NOT NULL,
        title_snapshot TEXT,
        created_at_utc TEXT NOT NULL,
        updated_at_utc TEXT NOT NULL,
        UNIQUE(user_id, dot_code),
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS case_profile_sets (
        user_id INTEGER PRIMARY KEY,
        profile1_work_history_vector TEXT NOT NULL,
        profile2_evaluative_vector TEXT NOT NULL,
        profile3_pre_vector TEXT NOT NULL,
        profile4_post_vector TEXT NOT NULL,
        clinical_override_mode INTEGER NOT NULL DEFAULT 0,
        enforce_residual_cap INTEGER NOT NULL DEFAULT 1,
        profile1_vq_est REAL,
        profile2_vq_est REAL,
        profile3_vq_est REAL,
        profile4_vq_est REAL,
        updated_at_utc TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_case_work_history_user ON case_work_history_dots(user_id, display_order, case_work_history_id);
      CREATE TABLE IF NOT EXISTS case_work_values (
        user_id INTEGER NOT NULL,
        value_id INTEGER NOT NULL,
        short_label TEXT NOT NULL,
        category TEXT,
        rating INTEGER NOT NULL DEFAULT 3,
        updated_at_utc TEXT NOT NULL,
        PRIMARY KEY(user_id, value_id),
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_case_work_values_user ON case_work_values(user_id);
    `);
    const caseProfileColumns = database.prepare('PRAGMA table_info(case_profile_sets)').all();
    const caseProfileExisting = new Set(caseProfileColumns.map((row) => String(row.name)));
    if (!caseProfileExisting.has('clinical_override_mode')) {
      database.exec('ALTER TABLE case_profile_sets ADD COLUMN clinical_override_mode INTEGER NOT NULL DEFAULT 0');
    }
    if (!caseProfileExisting.has('enforce_residual_cap')) {
      database.exec('ALTER TABLE case_profile_sets ADD COLUMN enforce_residual_cap INTEGER NOT NULL DEFAULT 1');
    }
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  const rowsForRendererSync = database
    .prepare(
      `
      SELECT saved_report_id, user_id, report_json, report_html, report_html_hash_sha256
      FROM saved_reports
      `
    )
    .all();
  if (!rowsForRendererSync.length) {
    return;
  }

  const updateStatement = database.prepare(
    `
    UPDATE saved_reports
    SET report_html = ?, report_html_hash_sha256 = ?, updated_at_utc = ?
    WHERE saved_report_id = ?
    `
  );

  database.exec('BEGIN');
  try {
    rowsForRendererSync.forEach((row) => {
      let parsed = {};
      try {
        parsed = JSON.parse(row.report_json || '{}');
      } catch {
        parsed = {};
      }
      const caseRow = row.user_id ? fetchCaseById(database, row.user_id) : null;
      const caseContext = buildCaseCoverContext(caseRow || {});
      const viewModel = buildReportViewModel(parsed, caseContext);
      const reportHtml = renderReportHtml(viewModel);
      const reportHtmlHash = sha256Hex(reportHtml);
      if ((row.report_html || '') !== reportHtml || (row.report_html_hash_sha256 || '') !== reportHtmlHash) {
        updateStatement.run(reportHtml, reportHtmlHash, nowIso(), row.saved_report_id);
      }
    });
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function seedPsychometricCatalog(database) {
  const existing = database.prepare('SELECT COUNT(*) AS count FROM psychometric_catalog').get().count;
  if (existing > 0) {
    return;
  }

  const insert = database.prepare(
    `
    INSERT INTO psychometric_catalog (
      test_code,
      test_name,
      domain,
      scale_min,
      scale_max,
      description
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `
  );

  database.exec('BEGIN');
  try {
    PSYCHOMETRIC_CATALOG_SEED.forEach((row) => {
      insert.run(
        row.test_code,
        row.test_name,
        row.domain,
        row.scale_min,
        row.scale_max,
        row.description
      );
    });
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function getAppDb() {
  if (appDb) {
    return appDb;
  }

  appDb = new DatabaseSync(APP_DB_PATH);
  appDb.exec('PRAGMA journal_mode = WAL;');
  appDb.exec('PRAGMA synchronous = NORMAL;');
  appDb.exec('PRAGMA foreign_keys = ON;');
  setupAppSchema(appDb);
  ensureAppSchemaMigrations(appDb);
  seedPsychometricCatalog(appDb);
  return appDb;
}

function appDbReady() {
  try {
    getAppDb();
    return true;
  } catch {
    return false;
  }
}

function toInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const normalized = String(value).trim();
  if (!/^-?\d+$/.test(normalized)) {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function clampInt(value, min, max, fallback) {
  const parsed = toInt(value);
  if (parsed === null) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function validateRegionFilter(stateId, countyId) {
  if (countyId !== null && stateId === null) {
    return 'countyId requires stateId';
  }
  return null;
}

function parseOptionalInteger(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return { value: null, error: null };
  }

  const parsed = toInt(value);
  if (parsed === null) {
    return { value: null, error: `${fieldName} must be an integer` };
  }
  if (parsed < 0) {
    return { value: null, error: `${fieldName} must be non-negative` };
  }

  return { value: parsed, error: null };
}

function parseRequiredInteger(value, fieldName) {
  const parsed = parseOptionalInteger(value, fieldName);
  if (parsed.error) {
    return parsed;
  }
  if (parsed.value === null) {
    return { value: null, error: `${fieldName} is required` };
  }
  return parsed;
}

function parseClampedInteger(value, fieldName, min, max, fallback) {
  const parsed = parseOptionalInteger(value, fieldName);
  if (parsed.error) {
    return parsed;
  }
  if (parsed.value === null) {
    return { value: fallback, error: null };
  }
  return { value: Math.min(max, Math.max(min, parsed.value)), error: null };
}

function parseOptionalFloat(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return { value: null, error: null };
  }

  const parsed = Number.parseFloat(String(value));
  if (!Number.isFinite(parsed)) {
    return { value: null, error: `${fieldName} must be a number` };
  }

  return { value: parsed, error: null };
}

function parseOptionalBoolean(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return { value: null, error: null };
  }
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return { value: true, error: null };
  }
  if (value === false || value === 0 || value === '0' || value === 'false') {
    return { value: false, error: null };
  }
  return { value: null, error: `${fieldName} must be boolean` };
}

function normalizeOptionalText(value, maxLength = 500) {
  if (value === null || value === undefined) {
    return { value: null, error: null };
  }

  const text = String(value).trim();
  if (!text) {
    return { value: null, error: null };
  }

  if (text.length > maxLength) {
    return { value: null, error: `text exceeds max length ${maxLength}` };
  }

  return { value: text, error: null };
}

function parseOptionalText(value, fieldName, maxLength = 500) {
  const normalized = normalizeOptionalText(value, maxLength);
  if (normalized.error) {
    return { value: null, error: `${fieldName} ${normalized.error}` };
  }
  return normalized;
}

function parseRequiredText(value, fieldName, maxLength = 200) {
  const normalized = parseOptionalText(value, fieldName, maxLength);
  if (normalized.error) {
    return normalized;
  }
  if (!normalized.value) {
    return { value: null, error: `${fieldName} is required` };
  }
  return normalized;
}

function nowIso() {
  return new Date().toISOString();
}

function sha256Hex(value) {
  const hasher = crypto.createHash('sha256');
  hasher.update(value);
  return hasher.digest('hex');
}

function isUniqueConstraintError(error) {
  return String(error?.message || '').toLowerCase().includes('unique constraint failed');
}

function parseRegionFilterInput(input) {
  const stateParsed = parseOptionalInteger(input.stateId, 'stateId');
  if (stateParsed.error) {
    return { stateId: null, countyId: null, error: stateParsed.error };
  }

  const countyParsed = parseOptionalInteger(input.countyId, 'countyId');
  if (countyParsed.error) {
    return { stateId: null, countyId: null, error: countyParsed.error };
  }

  const regionError = validateRegionFilter(stateParsed.value, countyParsed.value);
  if (regionError) {
    return { stateId: null, countyId: null, error: regionError };
  }

  return { stateId: stateParsed.value, countyId: countyParsed.value, error: null };
}

function parseDemographicRegionInput(input) {
  const stateParsed = parseOptionalInteger(input.demographicStateId, 'demographicStateId');
  if (stateParsed.error) {
    return { stateId: null, countyId: null, error: stateParsed.error };
  }
  const countyParsed = parseOptionalInteger(input.demographicCountyId, 'demographicCountyId');
  if (countyParsed.error) {
    return { stateId: null, countyId: null, error: countyParsed.error };
  }
  const relationError = validateRegionFilter(stateParsed.value, countyParsed.value);
  if (relationError) {
    return { stateId: null, countyId: null, error: relationError.replace('countyId', 'demographicCountyId') };
  }
  return { stateId: stateParsed.value, countyId: countyParsed.value, error: null };
}

function normalizeDot(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const stripped = String(value).replace(/\D/g, '');
  if (!stripped) {
    return '';
  }
  return stripped.padStart(9, '0').slice(0, 9);
}

function parseDotCode(value, fieldName, allowEmpty = false) {
  if (value === null || value === undefined || value === '') {
    if (allowEmpty) {
      return { value: '', error: null };
    }
    return { value: '', error: `${fieldName} is required` };
  }

  const raw = String(value).trim();
  if (!raw) {
    if (allowEmpty) {
      return { value: '', error: null };
    }
    return { value: '', error: `${fieldName} is required` };
  }

  if (/[^0-9.\-\s]/.test(raw)) {
    return { value: '', error: `${fieldName} must contain only digits` };
  }

  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    if (allowEmpty) {
      return { value: '', error: null };
    }
    return { value: '', error: `${fieldName} must contain digits` };
  }

  if (digits.length > 9) {
    return { value: '', error: `${fieldName} must be at most 9 digits` };
  }

  return { value: normalizeDot(digits), error: null };
}

function parseSourceDotCodes(input, fieldName = 'sourceDots') {
  const rawValues = [];

  if (Array.isArray(input)) {
    input.forEach((entry) => {
      if (entry === null || entry === undefined) {
        return;
      }
      rawValues.push(String(entry));
    });
  } else if (typeof input === 'string' || typeof input === 'number') {
    String(input)
      .split(/[\s,;]+/)
      .forEach((token) => {
        if (token && token.trim()) {
          rawValues.push(token.trim());
        }
      });
  } else if (input !== null && input !== undefined) {
    rawValues.push(String(input));
  }

  if (!rawValues.length) {
    return { values: [], error: `${fieldName} is required` };
  }

  const normalized = [];
  for (let index = 0; index < rawValues.length; index += 1) {
    const parsed = parseDotCode(rawValues[index], `${fieldName}[${index}]`);
    if (parsed.error) {
      return { values: [], error: parsed.error };
    }
    normalized.push(parsed.value);
  }

  const deduped = [...new Set(normalized)];
  if (!deduped.length) {
    return { values: [], error: `${fieldName} is required` };
  }
  if (deduped.length > 25) {
    return { values: [], error: `${fieldName} cannot include more than 25 DOT codes` };
  }

  return { values: deduped, error: null };
}

function normalizeQuery(value) {
  return String(value || '').trim().slice(0, QUERY_MAX_LENGTH);
}

function parseProfile(inputProfile) {
  const profile = Array.isArray(inputProfile) ? inputProfile : DEFAULT_PROFILE;
  if (profile.length !== TRAITS.length) {
    return [...DEFAULT_PROFILE];
  }

  return profile.map((rawValue, index) => {
    const trait = TRAITS[index];
    return clampInt(rawValue, trait.min, trait.max, DEFAULT_PROFILE[index]);
  });
}

function parseStoredProfileVector(rawValue, fallbackProfile = DEFAULT_PROFILE) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return [...fallbackProfile];
  }

  if (Array.isArray(rawValue)) {
    return parseProfile(rawValue);
  }

  try {
    const parsed = JSON.parse(String(rawValue));
    if (Array.isArray(parsed)) {
      return parseProfile(parsed);
    }
  } catch {
    // Continue with plain-text parsing.
  }

  const text = String(rawValue).trim();
  if (/^\d+$/.test(text) && text.length === TRAITS.length) {
    return parseProfile(text.split('').map((digit) => Number.parseInt(digit, 10)));
  }

  const tokens = text
    .split(/[\s,;]+/)
    .map((token) => Number.parseInt(token, 10))
    .filter((token) => Number.isFinite(token));
  if (tokens.length === TRAITS.length) {
    return parseProfile(tokens);
  }

  return [...fallbackProfile];
}

function serializeProfileVector(profile) {
  return JSON.stringify(parseProfile(profile));
}

function maxProfile(profileA, profileB) {
  return TRAITS.map((trait, index) =>
    Math.max(
      clampInt(profileA[index], trait.min, trait.max, DEFAULT_PROFILE[index]),
      clampInt(profileB[index], trait.min, trait.max, DEFAULT_PROFILE[index])
    )
  );
}

function residualBoundProfile(profile, upperBound) {
  return TRAITS.map((trait, index) => {
    const value = clampInt(profile[index], trait.min, trait.max, DEFAULT_PROFILE[index]);
    const ceiling = clampInt(upperBound[index], trait.min, trait.max, DEFAULT_PROFILE[index]);
    return Math.min(value, ceiling);
  });
}

function computeLegacyProfileVq(profile) {
  const normalized = parseProfile(profile);
  let score = LEGACY_PROFILE_VQ_INTERCEPT;
  for (let index = 0; index < TRAITS.length; index += 1) {
    const weight = LEGACY_PROFILE_VQ_WEIGHTS[index] ?? 0;
    score += normalized[index] * weight;
  }
  return round4(score);
}

function getCaseCoreFieldsSelect(prefix = 'u') {
  return `
    ${prefix}.user_id,
    ${prefix}.external_id,
    ${prefix}.first_name,
    ${prefix}.last_name,
    ${prefix}.email,
    ${prefix}.case_reference,
    ${prefix}.address_line1,
    ${prefix}.address_line2,
    ${prefix}.city,
    ${prefix}.postal_code,
    ${prefix}.country_name,
    ${prefix}.demographic_state_id,
    ${prefix}.demographic_county_id,
    ${prefix}.case_name,
    ${prefix}.reason_for_referral,
    ${prefix}.claims_email,
    ${prefix}.case_diagnosis,
    ${prefix}.vipr_type,
    ${prefix}.labor_market_area_label,
    ${prefix}.evaluation_year,
    ${prefix}.ts_display_mode,
    ${prefix}.va_display_mode,
    ${prefix}.report_header_notes,
    ${prefix}.notes,
    ${prefix}.active,
    ${prefix}.created_at_utc,
    ${prefix}.updated_at_utc
  `;
}

function normalizeCaseFields(body, fallback = {}) {
  const firstParsed = parseRequiredText(
    Object.hasOwn(body, 'firstName') ? body.firstName : fallback.first_name,
    'firstName',
    120
  );
  if (firstParsed.error) {
    return { error: firstParsed.error };
  }
  const lastParsed = parseRequiredText(
    Object.hasOwn(body, 'lastName') ? body.lastName : fallback.last_name,
    'lastName',
    120
  );
  if (lastParsed.error) {
    return { error: lastParsed.error };
  }
  const externalParsed = parseOptionalText(
    Object.hasOwn(body, 'externalId') ? body.externalId : fallback.external_id,
    'externalId',
    120
  );
  if (externalParsed.error) {
    return { error: externalParsed.error };
  }
  const emailParsed = parseOptionalText(
    Object.hasOwn(body, 'email') ? body.email : fallback.email,
    'email',
    320
  );
  if (emailParsed.error) {
    return { error: emailParsed.error };
  }
  const caseReferenceParsed = parseOptionalText(
    Object.hasOwn(body, 'caseReference') ? body.caseReference : fallback.case_reference,
    'caseReference',
    200
  );
  if (caseReferenceParsed.error) {
    return { error: caseReferenceParsed.error };
  }
  const address1Parsed = parseOptionalText(
    Object.hasOwn(body, 'addressLine1') ? body.addressLine1 : fallback.address_line1,
    'addressLine1',
    200
  );
  if (address1Parsed.error) {
    return { error: address1Parsed.error };
  }
  const address2Parsed = parseOptionalText(
    Object.hasOwn(body, 'addressLine2') ? body.addressLine2 : fallback.address_line2,
    'addressLine2',
    200
  );
  if (address2Parsed.error) {
    return { error: address2Parsed.error };
  }
  const cityParsed = parseOptionalText(
    Object.hasOwn(body, 'city') ? body.city : fallback.city,
    'city',
    120
  );
  if (cityParsed.error) {
    return { error: cityParsed.error };
  }
  const postalParsed = parseOptionalText(
    Object.hasOwn(body, 'postalCode') ? body.postalCode : fallback.postal_code,
    'postalCode',
    40
  );
  if (postalParsed.error) {
    return { error: postalParsed.error };
  }
  const countryParsed = parseOptionalText(
    Object.hasOwn(body, 'countryName') ? body.countryName : fallback.country_name,
    'countryName',
    120
  );
  if (countryParsed.error) {
    return { error: countryParsed.error };
  }
  const caseNameParsed = parseOptionalText(
    Object.hasOwn(body, 'caseName') ? body.caseName : fallback.case_name,
    'caseName',
    240
  );
  if (caseNameParsed.error) {
    return { error: caseNameParsed.error };
  }
  const referralParsed = parseOptionalText(
    Object.hasOwn(body, 'reasonForReferral') ? body.reasonForReferral : fallback.reason_for_referral,
    'reasonForReferral',
    4000
  );
  if (referralParsed.error) {
    return { error: referralParsed.error };
  }
  const claimsParsed = parseOptionalText(
    Object.hasOwn(body, 'claimsEmail') ? body.claimsEmail : fallback.claims_email,
    'claimsEmail',
    320
  );
  if (claimsParsed.error) {
    return { error: claimsParsed.error };
  }
  const diagnosisParsed = parseOptionalText(
    Object.hasOwn(body, 'caseDiagnosis') ? body.caseDiagnosis : fallback.case_diagnosis,
    'caseDiagnosis',
    4000
  );
  if (diagnosisParsed.error) {
    return { error: diagnosisParsed.error };
  }
  const viprTypeParsed = parseOptionalText(
    Object.hasOwn(body, 'viprType') ? body.viprType : fallback.vipr_type,
    'viprType',
    120
  );
  if (viprTypeParsed.error) {
    return { error: viprTypeParsed.error };
  }
  const laborParsed = parseOptionalText(
    Object.hasOwn(body, 'laborMarketAreaLabel') ? body.laborMarketAreaLabel : fallback.labor_market_area_label,
    'laborMarketAreaLabel',
    200
  );
  if (laborParsed.error) {
    return { error: laborParsed.error };
  }
  const yearParsed = parseOptionalInteger(
    Object.hasOwn(body, 'evaluationYear') ? body.evaluationYear : fallback.evaluation_year,
    'evaluationYear'
  );
  if (yearParsed.error) {
    return { error: yearParsed.error };
  }
  if (yearParsed.value !== null && (yearParsed.value < 1900 || yearParsed.value > 3000)) {
    return { error: 'evaluationYear must be between 1900 and 3000' };
  }
  const headerNotesParsed = parseOptionalText(
    Object.hasOwn(body, 'reportHeaderNotes') ? body.reportHeaderNotes : fallback.report_header_notes,
    'reportHeaderNotes',
    8000
  );
  if (headerNotesParsed.error) {
    return { error: headerNotesParsed.error };
  }
  const tsDisplayModeParsed = parseOptionalText(
    Object.hasOwn(body, 'tsDisplayMode') ? body.tsDisplayMode : fallback.ts_display_mode,
    'tsDisplayMode',
    64
  );
  if (tsDisplayModeParsed.error) {
    return { error: tsDisplayModeParsed.error };
  }
  if (tsDisplayModeParsed.value !== null && !TRANSFER_TS_DISPLAY_MODES.includes(tsDisplayModeParsed.value)) {
    return { error: `tsDisplayMode must be one of: ${TRANSFER_TS_DISPLAY_MODES.join(', ')}` };
  }
  const vaDisplayModeParsed = parseOptionalText(
    Object.hasOwn(body, 'vaDisplayMode') ? body.vaDisplayMode : fallback.va_display_mode,
    'vaDisplayMode',
    64
  );
  if (vaDisplayModeParsed.error) {
    return { error: vaDisplayModeParsed.error };
  }
  if (vaDisplayModeParsed.value !== null && !TRANSFER_VA_DISPLAY_MODES.includes(vaDisplayModeParsed.value)) {
    return { error: `vaDisplayMode must be one of: ${TRANSFER_VA_DISPLAY_MODES.join(', ')}` };
  }
  const notesParsed = parseOptionalText(
    Object.hasOwn(body, 'notes') ? body.notes : fallback.notes,
    'notes',
    5000
  );
  if (notesParsed.error) {
    return { error: notesParsed.error };
  }

  const demographicParsed = parseDemographicRegionInput({
    demographicStateId: Object.hasOwn(body, 'demographicStateId')
      ? body.demographicStateId
      : fallback.demographic_state_id,
    demographicCountyId: Object.hasOwn(body, 'demographicCountyId')
      ? body.demographicCountyId
      : fallback.demographic_county_id
  });
  if (demographicParsed.error) {
    return { error: demographicParsed.error };
  }

  let activeValue = fallback.active ?? 1;
  if (Object.hasOwn(body, 'active')) {
    const activeRaw = body.active;
    if (activeRaw === true || activeRaw === 1 || activeRaw === '1') {
      activeValue = 1;
    } else if (activeRaw === false || activeRaw === 0 || activeRaw === '0') {
      activeValue = 0;
    } else {
      return { error: 'active must be boolean or 0/1' };
    }
  }

  return {
    error: null,
    values: {
      external_id: externalParsed.value,
      first_name: firstParsed.value,
      last_name: lastParsed.value,
      email: emailParsed.value,
      case_reference: caseReferenceParsed.value,
      address_line1: address1Parsed.value,
      address_line2: address2Parsed.value,
      city: cityParsed.value,
      postal_code: postalParsed.value,
      country_name: countryParsed.value || 'USA',
      demographic_state_id: demographicParsed.stateId,
      demographic_county_id: demographicParsed.countyId,
      case_name: caseNameParsed.value,
      reason_for_referral: referralParsed.value,
      claims_email: claimsParsed.value,
      case_diagnosis: diagnosisParsed.value,
      vipr_type: viprTypeParsed.value,
      labor_market_area_label: laborParsed.value || 'Labor Market Area',
      evaluation_year: yearParsed.value,
      ts_display_mode: tsDisplayModeParsed.value,
      va_display_mode: vaDisplayModeParsed.value,
      report_header_notes: headerNotesParsed.value,
      notes: notesParsed.value,
      active: activeValue
    }
  };
}

function fetchCaseById(database, userId) {
  const baseRow =
    database
      .prepare(
        `
        SELECT
          ${getCaseCoreFieldsSelect('u')}
        FROM users u
        WHERE u.user_id = ?
        `
      )
      .get(userId) || null;
  if (!baseRow) {
    return null;
  }
  return {
    ...baseRow,
    ...resolveDemographicLabels(baseRow.demographic_state_id, baseRow.demographic_county_id)
  };
}

function fetchCaseRows(database, includeInactive = false) {
  const whereSql = includeInactive ? '' : 'WHERE u.active = 1';
  const rows = database
    .prepare(
      `
      SELECT
        ${getCaseCoreFieldsSelect('u')},
        (
          SELECT COUNT(*)
          FROM case_work_history_dots cwd
          WHERE cwd.user_id = u.user_id
        ) AS work_history_dot_count,
        (
          SELECT COUNT(*)
          FROM psychometric_results pr
          WHERE pr.user_id = u.user_id
        ) AS psychometric_count,
        (
          SELECT COUNT(*)
          FROM saved_reports sr
          WHERE sr.user_id = u.user_id
        ) AS saved_report_count
      FROM users u
      ${whereSql}
      ORDER BY u.last_name COLLATE NOCASE, u.first_name COLLATE NOCASE, u.user_id
      `
    )
    .all();
  return rows.map((row) => ({
    ...row,
    ...resolveDemographicLabels(row.demographic_state_id, row.demographic_county_id)
  }));
}

function resolveDemographicLabels(stateId, countyId) {
  if (!dbReady() || stateId === null || stateId === undefined) {
    return {
      demographic_state_abbrev: null,
      demographic_state_name: null,
      demographic_county_name: null
    };
  }

  const sourceDatabase = getDb();
  const stateRow =
    sourceDatabase
      .prepare('SELECT state_abbrev, state_name FROM states WHERE state_id = ?')
      .get(stateId) || null;
  const countyRow =
    countyId === null || countyId === undefined
      ? null
      : sourceDatabase
          .prepare('SELECT county_name FROM counties WHERE state_id = ? AND county_id = ?')
          .get(stateId, countyId) || null;

  return {
    demographic_state_abbrev: stateRow?.state_abbrev || null,
    demographic_state_name: stateRow?.state_name || null,
    demographic_county_name: countyRow?.county_name || null
  };
}

function loadJobsByDots(database, dotCodes) {
  const rows = [];
  const stmt = database.prepare(`
    SELECT
      dot_code,
      title,
      trait_vector,
      vq,
      svp,
      onet_ou_code,
      ${jobColumnProjection('sic', null, database)},
      ${jobColumnProjection('soc', null, database)},
      ${jobColumnProjection('cen', null, database)},
      ${jobColumnProjection('ind', null, database)},
      ${jobColumnProjection('wf1', null, database)},
      ${jobColumnProjection('mpsms_primary', null, database)},
      ${jobColumnProjection('mtewa_primary', null, database)},
      ${jobColumnProjection('onet_group_or_ou', null, database)}
    FROM jobs
    WHERE dot_code = ?
    `
  );
  dotCodes.forEach((dotCode) => {
    const row = stmt.get(dotCode);
    if (row) {
      rows.push(row);
    }
  });
  return rows;
}

function deriveProfile1FromWorkHistory(sourceJobs) {
  if (!Array.isArray(sourceJobs) || !sourceJobs.length) {
    return [...DEFAULT_PROFILE];
  }
  const vectors = sourceJobs
    .map((row) => parseTraitVector(row.trait_vector))
    .filter((vector) => Array.isArray(vector) && vector.length === TRAITS.length);
  if (!vectors.length) {
    return [...DEFAULT_PROFILE];
  }

  return TRAITS.map((trait, index) => {
    let maxValue = trait.min;
    vectors.forEach((vector) => {
      maxValue = Math.max(maxValue, vector[index]);
    });
    return clampInt(maxValue, trait.min, trait.max, DEFAULT_PROFILE[index]);
  });
}

function fetchCaseWorkHistoryRows(appDatabase, userId) {
  return appDatabase
    .prepare(
      `
      SELECT
        case_work_history_id,
        user_id,
        dot_code,
        display_order,
        title_snapshot,
        created_at_utc,
        updated_at_utc
      FROM case_work_history_dots
      WHERE user_id = ?
      ORDER BY display_order ASC, case_work_history_id ASC
      `
    )
    .all(userId);
}

function fetchCaseWorkHistory(appDatabase, sourceDatabase, userId) {
  const rows = fetchCaseWorkHistoryRows(appDatabase, userId);
  if (!sourceDatabase || !rows.length) {
    return rows.map((row) => ({
      ...row,
      title: row.title_snapshot || null,
      vq: null,
      svp: null,
      trait_vector: null,
      onet_ou_code: null
    }));
  }

  const jobMap = new Map(loadJobsByDots(sourceDatabase, rows.map((row) => row.dot_code)).map((row) => [row.dot_code, row]));
  return rows.map((row) => {
    const job = jobMap.get(row.dot_code) || null;
    return {
      ...row,
      title: job?.title || row.title_snapshot || null,
      vq: job?.vq ?? null,
      svp: job?.svp ?? null,
      trait_vector: job?.trait_vector || null,
      onet_ou_code: job?.onet_ou_code || null
    };
  });
}

function fetchCaseProfileSetRow(appDatabase, userId) {
  return (
    appDatabase
      .prepare(
        `
        SELECT
          user_id,
          profile1_work_history_vector,
          profile2_evaluative_vector,
          profile3_pre_vector,
          profile4_post_vector,
          clinical_override_mode,
          enforce_residual_cap,
          profile1_vq_est,
          profile2_vq_est,
          profile3_vq_est,
          profile4_vq_est,
          updated_at_utc
        FROM case_profile_sets
        WHERE user_id = ?
        `
      )
      .get(userId) || null
  );
}

function buildProfilePayload({
  profile1,
  profile2,
  profile3,
  profile4,
  derivedProfile1 = null,
  derivedProfile3 = null,
  clinicalOverrideMode = false,
  enforceResidualCap = true,
  profile1VqEst,
  profile2VqEst,
  profile3VqEst,
  profile4VqEst,
  updatedAtUtc
}) {
  return {
    profile1,
    profile2,
    profile3,
    profile4,
    vq_estimates: {
      profile1_vq_est: profile1VqEst,
      profile2_vq_est: profile2VqEst,
      profile3_vq_est: profile3VqEst,
      profile4_vq_est: profile4VqEst,
      estimated: false,
      method: 'legacy_profile_vq_formula_v1'
    },
    trait_ranges: TRAITS.map((trait) => ({ code: trait.code, min: trait.min, max: trait.max })),
    lock_flags: {
      profile1: !clinicalOverrideMode,
      profile2: false,
      profile3: !clinicalOverrideMode,
      profile4: false
    },
    methodology: {
      mode: clinicalOverrideMode ? 'clinical_override' : 'strict_derived',
      enforce_residual_cap: !!enforceResidualCap,
      notes: [
        'Profile 1 is work-history demand baseline; Profile 2 is evaluative judgment.',
        'Profile 3 is pre-injury reference (derived max in strict mode).',
        'Profile 4 is residual/post profile used for TSA ranking.',
        'Profile VQ values use recovered legacy basCalculate_VQ coefficients from Option Compare Database source.'
      ]
    },
    derived: {
      profile1: derivedProfile1,
      profile3: derivedProfile3
    },
    updated_at_utc: updatedAtUtc
  };
}

function buildCaseCoverContext(caseRow) {
  const userId = caseRow?.user_id || null;
  const context = {
    user_id: userId,
    first_name: caseRow?.first_name || null,
    last_name: caseRow?.last_name || null,
    case_reference: caseRow?.case_reference || null,
    case_name: caseRow?.case_name || null,
    reason_for_referral: caseRow?.reason_for_referral || null,
    claims_email: caseRow?.claims_email || null,
    case_diagnosis: caseRow?.case_diagnosis || null,
    vipr_type: caseRow?.vipr_type || null,
    labor_market_area_label: caseRow?.labor_market_area_label || 'Labor Market Area',
    evaluation_year: caseRow?.evaluation_year || null,
    ts_display_mode: caseRow?.ts_display_mode || null,
    va_display_mode: caseRow?.va_display_mode || null,
    report_header_notes: caseRow?.report_header_notes || null,
    country_name: caseRow?.country_name || 'USA',
    address_line1: caseRow?.address_line1 || null,
    address_line2: caseRow?.address_line2 || null,
    city: caseRow?.city || null,
    postal_code: caseRow?.postal_code || null,
    demographic_state_label: caseRow?.demographic_state_name || null,
    demographic_county_label: caseRow?.demographic_county_name || null
  };

  /* Enrich with psychometric results and profile sets from app DB */
  if (userId && appDbReady()) {
    try {
      const appDatabase = getAppDb();
      context.psychometric_results = appDatabase.prepare(
        `SELECT pr.test_code, COALESCE(pc.test_name, pr.test_name) AS test_name, pc.domain,
                pr.raw_score, pr.scaled_score, pr.percentile, pr.stanine,
                pr.measured_at_utc AS administration_date, pr.interpretation AS notes
         FROM psychometric_results pr
         LEFT JOIN psychometric_catalog pc ON pc.test_code = pr.test_code
         WHERE pr.user_id = ?
         ORDER BY pc.domain, pr.test_code`
      ).all(userId);

      const profileRow = appDatabase.prepare(
        'SELECT * FROM case_profile_sets WHERE user_id = ?'
      ).get(userId);
      if (profileRow) {
        context.profiles = {
          profile1: safeJsonParse(profileRow.profile1_work_history_vector, null),
          profile2: safeJsonParse(profileRow.profile2_evaluative_vector, null),
          profile3: safeJsonParse(profileRow.profile3_pre_vector, null),
          profile4: safeJsonParse(profileRow.profile4_post_vector, null),
          vq_estimates: {
            profile1_vq_est: profileRow.profile1_vq_est,
            profile2_vq_est: profileRow.profile2_vq_est,
            profile3_vq_est: profileRow.profile3_vq_est,
            profile4_vq_est: profileRow.profile4_vq_est
          }
        };
      }
      /* Work values assessment */
      try {
        context.work_values = appDatabase.prepare(
          `SELECT value_id, short_label, category, rating FROM case_work_values
           WHERE user_id = ? ORDER BY value_id`
        ).all(userId);
      } catch {
        /* table may not exist yet */
      }
    } catch {
      /* non-fatal - psychometric/profile enrichment is optional */
    }
  }

  return context;
}

function safeJsonParse(str, fallback) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

function computeResidualPercent(preCount, postCount) {
  const pre = Number(preCount);
  const post = Number(postCount);
  if (!Number.isFinite(pre) || pre <= 0) {
    if (!Number.isFinite(post) || post <= 0) {
      return 100;
    }
    return 100;
  }
  return Math.round((post / pre) * 100);
}

function getCaseIntakeMissingFields(caseRow, sourceDatabase) {
  const missing = [];
  if (!caseRow?.first_name) {
    missing.push('first_name');
  }
  if (!caseRow?.last_name) {
    missing.push('last_name');
  }
  if (!caseRow?.address_line1) {
    missing.push('address_line1');
  }
  if (!caseRow?.city) {
    missing.push('city');
  }
  if (!caseRow?.postal_code) {
    missing.push('postal_code');
  }
  if (caseRow?.demographic_state_id === null || caseRow?.demographic_state_id === undefined) {
    missing.push('demographic_state_id');
  }
  if (sourceDatabase && caseRow?.demographic_state_id !== null && caseRow?.demographic_state_id !== undefined) {
    const countyCount = sourceDatabase
      .prepare('SELECT COUNT(*) AS count FROM counties WHERE state_id = ?')
      .get(caseRow.demographic_state_id).count;
    if (Number(countyCount) > 0 && (caseRow?.demographic_county_id === null || caseRow?.demographic_county_id === undefined)) {
      missing.push('demographic_county_id');
    }
  }
  if (!caseRow?.reason_for_referral) {
    missing.push('reason_for_referral');
  }
  return missing;
}

function upsertCaseProfiles({
  appDatabase,
  sourceDatabase,
  userId,
  regionStateId = null,
  regionCountyId = null,
  profile1Input = null,
  profile2Input = null,
  profile3Input = null,
  profile4Input = null,
  allowClinicalOverrides = null,
  enforceResidualCap = null
}) {
  const workHistoryRows = fetchCaseWorkHistory(appDatabase, sourceDatabase, userId);
  const workHistoryJobs = workHistoryRows
    .filter((row) => row.trait_vector)
    .map((row) => ({
      dot_code: row.dot_code,
      title: row.title,
      trait_vector: row.trait_vector,
      vq: row.vq,
      svp: row.svp,
      onet_ou_code: row.onet_ou_code
    }));
  const derivedProfile1 = deriveProfile1FromWorkHistory(workHistoryJobs);
  const existing = fetchCaseProfileSetRow(appDatabase, userId);
  const persistedClinicalMode = existing ? Number(existing.clinical_override_mode || 0) === 1 : false;
  const persistedResidualCap = existing ? Number(existing.enforce_residual_cap ?? 1) !== 0 : true;
  const clinicalOverrideMode = allowClinicalOverrides === null ? persistedClinicalMode : !!allowClinicalOverrides;
  const residualCapMode = enforceResidualCap === null ? persistedResidualCap : !!enforceResidualCap;

  const existingProfile1 = existing
    ? parseStoredProfileVector(existing.profile1_work_history_vector, derivedProfile1)
    : [...derivedProfile1];
  const existingProfile2 = existing
    ? parseStoredProfileVector(existing.profile2_evaluative_vector, DEFAULT_PROFILE)
    : [...DEFAULT_PROFILE];
  const existingProfile3 = existing
    ? parseStoredProfileVector(existing.profile3_pre_vector, maxProfile(derivedProfile1, existingProfile2))
    : maxProfile(derivedProfile1, existingProfile2);
  const existingProfile4 = existing
    ? parseStoredProfileVector(existing.profile4_post_vector, existingProfile3)
    : [...existingProfile3];

  const profile1 = clinicalOverrideMode
    ? (profile1Input ? parseProfile(profile1Input) : existingProfile1)
    : [...derivedProfile1];
  const profile2 = profile2Input ? parseProfile(profile2Input) : existingProfile2;
  const derivedProfile3 = maxProfile(profile1, profile2);
  const profile3 = clinicalOverrideMode
    ? (profile3Input ? parseProfile(profile3Input) : existingProfile3)
    : [...derivedProfile3];
  const profile4Raw = profile4Input ? parseProfile(profile4Input) : existingProfile4;
  const profile4 = residualCapMode ? residualBoundProfile(profile4Raw, profile3) : parseProfile(profile4Raw);

  const p1Vq = computeLegacyProfileVq(profile1);
  const p2Vq = computeLegacyProfileVq(profile2);
  const p3Vq = computeLegacyProfileVq(profile3);
  const p4Vq = computeLegacyProfileVq(profile4);

  const updatedAt = nowIso();
  appDatabase
    .prepare(
      `
      INSERT INTO case_profile_sets (
        user_id,
        profile1_work_history_vector,
        profile2_evaluative_vector,
        profile3_pre_vector,
        profile4_post_vector,
        clinical_override_mode,
        enforce_residual_cap,
        profile1_vq_est,
        profile2_vq_est,
        profile3_vq_est,
        profile4_vq_est,
        updated_at_utc
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        profile1_work_history_vector = excluded.profile1_work_history_vector,
        profile2_evaluative_vector = excluded.profile2_evaluative_vector,
        profile3_pre_vector = excluded.profile3_pre_vector,
        profile4_post_vector = excluded.profile4_post_vector,
        clinical_override_mode = excluded.clinical_override_mode,
        enforce_residual_cap = excluded.enforce_residual_cap,
        profile1_vq_est = excluded.profile1_vq_est,
        profile2_vq_est = excluded.profile2_vq_est,
        profile3_vq_est = excluded.profile3_vq_est,
        profile4_vq_est = excluded.profile4_vq_est,
        updated_at_utc = excluded.updated_at_utc
      `
    )
    .run(
      userId,
      serializeProfileVector(profile1),
      serializeProfileVector(profile2),
      serializeProfileVector(profile3),
      serializeProfileVector(profile4),
      clinicalOverrideMode ? 1 : 0,
      residualCapMode ? 1 : 0,
      p1Vq,
      p2Vq,
      p3Vq,
      p4Vq,
      updatedAt
    );

  return {
    profile1,
    profile2,
    profile3,
    profile4,
    derivedProfile1,
    derivedProfile3,
    clinicalOverrideMode,
    enforceResidualCap: residualCapMode,
    profile1VqEst: p1Vq,
    profile2VqEst: p2Vq,
    profile3VqEst: p3Vq,
    profile4VqEst: p4Vq,
    updatedAtUtc: updatedAt,
    workHistoryJobs
  };
}

function buildSourceClause(stateId, countyId) {
  if (stateId !== null && countyId !== null) {
    return {
      from: 'county_job_counts src JOIN jobs j ON j.dot_code = src.dot_code',
      where: ['src.state_id = ?', 'src.county_id = ?'],
      params: [stateId, countyId],
      countColumn: 'src.job_count'
    };
  }

  if (stateId !== null) {
    return {
      from: 'state_job_counts src JOIN jobs j ON j.dot_code = src.dot_code',
      where: ['src.state_id = ?'],
      params: [stateId],
      countColumn: 'src.job_count'
    };
  }

  return {
    from: 'jobs j',
    where: [],
    params: [],
    countColumn: 'NULL'
  };
}

function buildSearchPredicate(q) {
  if (!q) {
    return { clause: null, params: [] };
  }
  const like = `%${q.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
  return {
    clause: `(j.dot_code LIKE ? ESCAPE '\\' OR j.title LIKE ? ESCAPE '\\' OR j.description LIKE ? ESCAPE '\\')`,
    params: [like, like, like]
  };
}

function buildWhereClause(source, search) {
  const where = [...source.where];
  const params = [...source.params];

  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }

  return {
    whereSql: where.length > 0 ? `WHERE ${where.join(' AND ')}` : '',
    params
  };
}

function buildMatchExpressions(profile) {
  const deficitTerms = profile.map(
    (value, index) => `MAX(0, CAST(SUBSTR(j.trait_vector, ${index + 1}, 1) AS INTEGER) - ${value})`
  );
  const totalDeficitExpr = deficitTerms.join(' + ');
  const matchScoreExpr = `ROUND((1.0 - ((${totalDeficitExpr}) / ${TRAIT_MAX_DEFICIT}.0)) * 100.0, 1)`;
  return { totalDeficitExpr, matchScoreExpr };
}

function parseTraitVector(rawValue) {
  if (!rawValue) {
    return null;
  }

  const value = String(rawValue).trim();
  if (value.length !== TRAITS.length || /\D/.test(value)) {
    return null;
  }

  return value.split('').map((digit) => Number.parseInt(digit, 10));
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function round3(value) {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 1000) / 1000;
}

function round4(value) {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 10000) / 10000;
}

function normalizeOnetCode(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function sharedPrefixLength(a, b, maxLength = null) {
  const lhs = String(a || '');
  const rhs = String(b || '');
  const max = maxLength === null ? Math.min(lhs.length, rhs.length) : Math.min(maxLength, lhs.length, rhs.length);
  let index = 0;
  while (index < max && lhs[index] === rhs[index]) {
    index += 1;
  }
  return index;
}

function scoreDotPrefix(sourceDot, targetDot) {
  const lhs = normalizeDot(sourceDot);
  const rhs = normalizeDot(targetDot);
  if (!lhs || !rhs) {
    return 0;
  }

  const prefixLength = sharedPrefixLength(lhs, rhs, 3);
  if (prefixLength >= 3) {
    return 1;
  }
  if (prefixLength === 2) {
    return 0.67;
  }
  if (prefixLength === 1) {
    return 0.33;
  }
  return 0;
}

function scoreOnetPrefix(sourceOnet, targetOnet) {
  const lhs = normalizeOnetCode(sourceOnet);
  const rhs = normalizeOnetCode(targetOnet);
  if (!lhs || !rhs) {
    return 0;
  }
  if (lhs === rhs) {
    return 1;
  }

  const prefixLength = sharedPrefixLength(lhs, rhs, 4);
  if (prefixLength >= 4) {
    return 0.75;
  }
  if (prefixLength >= 2) {
    return 0.45;
  }
  return 0;
}

function deriveMtspTier(sourceJob, targetJob, targetVq) {
  const sourceDot = normalizeDot(sourceJob?.dot_code);
  const targetDot = normalizeDot(targetJob?.dot_code);
  const sourceOnet = normalizeOnetCode(sourceJob?.onet_ou_code);
  const targetOnet = normalizeOnetCode(targetJob?.onet_ou_code);

  const dotPrefixLength = sharedPrefixLength(sourceDot, targetDot, 3);
  const onetPrefixLength = sharedPrefixLength(sourceOnet, targetOnet);
  const dot1 = dotPrefixLength >= 1;
  const dot2 = dotPrefixLength >= 2;
  const dot3 = dotPrefixLength >= 3;
  const onet2 = onetPrefixLength >= 2;
  const onet4 = onetPrefixLength >= 4;
  const onetFull = !!sourceOnet && !!targetOnet && sourceOnet === targetOnet;

  if (targetVq !== null && targetVq < 85) {
    return {
      level: 1,
      min: 0,
      max: 19,
      rule: 'target_vq_below_85',
      dot_prefix_length: dotPrefixLength,
      onet_prefix_length: onetPrefixLength
    };
  }
  if (dot3 && onetFull) {
    return {
      level: 5,
      min: 80,
      max: 97,
      rule: 'dot3_and_onet_full',
      dot_prefix_length: dotPrefixLength,
      onet_prefix_length: onetPrefixLength
    };
  }
  if (dot3 || onetFull || (dot2 && onet4)) {
    return {
      level: 4,
      min: 60,
      max: 79,
      rule: 'dot3_or_onet_full_or_dot2_onet4',
      dot_prefix_length: dotPrefixLength,
      onet_prefix_length: onetPrefixLength
    };
  }
  if (dot2 || onet4 || (dot1 && onet2)) {
    return {
      level: 3,
      min: 40,
      max: 59,
      rule: 'dot2_or_onet4_or_dot1_onet2',
      dot_prefix_length: dotPrefixLength,
      onet_prefix_length: onetPrefixLength
    };
  }
  return {
    level: 2,
    min: 20,
    max: 39,
    rule: 'limited_prefix_overlap',
    dot_prefix_length: dotPrefixLength,
    onet_prefix_length: onetPrefixLength
  };
}

function scoreScalarProximity(sourceValue, targetValue, maxDelta, fallback = 0.5) {
  const lhs = Number(sourceValue);
  const rhs = Number(targetValue);
  if (!Number.isFinite(lhs) || !Number.isFinite(rhs)) {
    return fallback;
  }

  return clamp01(1 - Math.abs(lhs - rhs) / maxDelta);
}

function scoreTraitSimilarity(sourceTraitVector, targetTraitVector) {
  const source = parseTraitVector(sourceTraitVector);
  const target = parseTraitVector(targetTraitVector);
  if (!source || !target || source.length !== TRAITS.length || target.length !== TRAITS.length) {
    return 0;
  }

  let total = 0;
  for (let index = 0; index < TRAITS.length; index += 1) {
    const trait = TRAITS[index];
    const range = Math.max(1, trait.max - trait.min);
    const diff = Math.abs(source[index] - target[index]);
    total += clamp01(1 - diff / range);
  }

  return total / TRAITS.length;
}

const STRENGTH_TRAIT_INDEX = TRAITS.findIndex((trait) => trait.code === 'PD1');
const STRENGTH_CAP_BY_PROFILE_DEFICIT = [97, 79, 59, 39, 19];
const PHYSICAL_TRAIT_CODES = new Set(['PD1', 'PD2', 'PD3', 'PD4', 'PD5', 'PD6']);
const PHYSICAL_TRAIT_INDEXES = TRAITS.map((trait, index) => (PHYSICAL_TRAIT_CODES.has(trait.code) ? index : -1)).filter(
  (index) => index >= 0
);
const STRENGTH_LEVEL_LABELS = {
  1: 'Sedentary',
  2: 'Light',
  3: 'Medium',
  4: 'Heavy',
  5: 'Very Heavy'
};

function deriveStrengthDemandLabel(level) {
  const numeric = Number(level);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return STRENGTH_LEVEL_LABELS[Math.round(numeric)] || null;
}

function normalizeProfileTraitValues(profile) {
  if (!Array.isArray(profile) || profile.length !== TRAITS.length) {
    return null;
  }
  return TRAITS.map((trait, index) => clampInt(profile[index], trait.min, trait.max, DEFAULT_PROFILE[index]));
}

function countPhysicalDemandDeficits(candidateValues, targetValues) {
  if (!Array.isArray(candidateValues) || !Array.isArray(targetValues)) {
    return null;
  }
  if (candidateValues.length !== TRAITS.length || targetValues.length !== TRAITS.length) {
    return null;
  }
  return PHYSICAL_TRAIT_INDEXES.reduce((count, index) => {
    const candidate = Number(candidateValues[index]);
    const required = Number(targetValues[index]);
    if (!Number.isFinite(candidate) || !Number.isFinite(required)) {
      return count;
    }
    return count + (required > candidate ? 1 : 0);
  }, 0);
}

function resolveStrengthLevelFromTraitVector(rawTraitVector) {
  if (STRENGTH_TRAIT_INDEX < 0) {
    return null;
  }
  const traitValues = parseTraitVector(rawTraitVector);
  if (!traitValues || traitValues.length <= STRENGTH_TRAIT_INDEX) {
    return null;
  }
  const strength = Number(traitValues[STRENGTH_TRAIT_INDEX]);
  return Number.isFinite(strength) ? strength : null;
}

function resolveStrengthLevelFromProfile(profile) {
  if (!Array.isArray(profile) || profile.length !== TRAITS.length || STRENGTH_TRAIT_INDEX < 0) {
    return null;
  }
  const strengthTrait = TRAITS[STRENGTH_TRAIT_INDEX];
  return clampInt(
    profile[STRENGTH_TRAIT_INDEX],
    strengthTrait.min,
    strengthTrait.max,
    DEFAULT_PROFILE[STRENGTH_TRAIT_INDEX]
  );
}

function computeStrengthSignals(sourceTraitVector, targetTraitVector, profile = null) {
  const sourceTraitValues = parseTraitVector(sourceTraitVector);
  const targetTraitValues = parseTraitVector(targetTraitVector);
  const profileTraitValues = normalizeProfileTraitValues(profile);
  const sourceStrength = resolveStrengthLevelFromTraitVector(sourceTraitVector);
  const targetStrength = resolveStrengthLevelFromTraitVector(targetTraitVector);
  const profileStrength = resolveStrengthLevelFromProfile(profile);

  const sourceToTargetProximity = scoreScalarProximity(sourceStrength, targetStrength, 4, 0.5);
  const sourceDeficitLevels =
    Number.isFinite(sourceStrength) && Number.isFinite(targetStrength)
      ? Math.max(0, targetStrength - sourceStrength)
      : null;
  const sourceFit = sourceDeficitLevels === null ? 0.5 : clamp01(1 - sourceDeficitLevels / 4);
  const sourceMultiplier = 0.45 + sourceFit * 0.55;

  let profileDeficitLevels = null;
  let profileFit = null;
  let profileMultiplier = 1;
  let maxTspCapPercent = 97;
  if (Number.isFinite(profileStrength) && Number.isFinite(targetStrength)) {
    profileDeficitLevels = Math.max(0, targetStrength - profileStrength);
    profileFit = clamp01(1 - profileDeficitLevels / 4);
    profileMultiplier = 0.35 + profileFit * 0.65;
    maxTspCapPercent = STRENGTH_CAP_BY_PROFILE_DEFICIT[Math.min(profileDeficitLevels, 4)];
  }

  const combinedMultiplier = clamp01(sourceMultiplier * profileMultiplier);
  const sourcePhysicalDeficitCount = countPhysicalDemandDeficits(sourceTraitValues, targetTraitValues);
  const profilePhysicalDeficitCount = countPhysicalDemandDeficits(profileTraitValues, targetTraitValues);
  return {
    source_strength_level: sourceStrength,
    target_strength_level: targetStrength,
    profile_strength_level: profileStrength,
    source_strength_label: deriveStrengthDemandLabel(sourceStrength),
    target_strength_label: deriveStrengthDemandLabel(targetStrength),
    profile_strength_label: deriveStrengthDemandLabel(profileStrength),
    source_deficit_levels: sourceDeficitLevels,
    profile_deficit_levels: profileDeficitLevels,
    source_physical_deficit_count: sourcePhysicalDeficitCount,
    profile_physical_deficit_count: profilePhysicalDeficitCount,
    profile_fit: profileFit,
    source_to_target_proximity: sourceToTargetProximity,
    in_tier_multiplier: combinedMultiplier,
    unadjusted_multiplier: combinedMultiplier,
    max_tsp_cap_percent: maxTspCapPercent
  };
}

function scoreTraitCoverage(sourceTraitVector, targetTraitVector) {
  const source = parseTraitVector(sourceTraitVector);
  const target = parseTraitVector(targetTraitVector);
  if (!source || !target || source.length !== TRAITS.length || target.length !== TRAITS.length) {
    return { meets_ratio: 0, deficit_ratio: 1 };
  }

  let meets = 0;
  let totalDeficit = 0;
  for (let index = 0; index < TRAITS.length; index += 1) {
    const trait = TRAITS[index];
    const range = Math.max(1, trait.max - trait.min);
    const deficit = Math.max(0, target[index] - source[index]);
    if (deficit === 0) {
      meets += 1;
    }
    totalDeficit += deficit / range;
  }

  return {
    meets_ratio: meets / TRAITS.length,
    deficit_ratio: totalDeficit / TRAITS.length
  };
}

function scoreProfileCompatibility(profile, targetTraitVector) {
  if (!Array.isArray(profile) || profile.length !== TRAITS.length) {
    return {
      available: false,
      compatibility: 1,
      deficit_ratio: 0,
      meets_ratio: null
    };
  }

  const target = parseTraitVector(targetTraitVector);
  if (!target || target.length !== TRAITS.length) {
    return {
      available: false,
      compatibility: 1,
      deficit_ratio: 0,
      meets_ratio: null
    };
  }

  let meets = 0;
  let totalDeficit = 0;
  for (let index = 0; index < TRAITS.length; index += 1) {
    const trait = TRAITS[index];
    const range = Math.max(1, trait.max - trait.min);
    const profileValue = clampInt(profile[index], trait.min, trait.max, DEFAULT_PROFILE[index]);
    const deficit = Math.max(0, target[index] - profileValue);
    if (deficit === 0) {
      meets += 1;
    }
    totalDeficit += deficit / range;
  }

  const deficitRatio = totalDeficit / TRAITS.length;
  return {
    available: true,
    compatibility: clamp01(1 - deficitRatio),
    deficit_ratio: deficitRatio,
    meets_ratio: meets / TRAITS.length
  };
}

function classifyTspLevel(tspPercent) {
  const numeric = Number(tspPercent);
  const clamped = Number.isFinite(numeric) ? Math.min(97, Math.max(0, numeric)) : 0;
  const matched = TSP_LEVELS.find((row) => clamped >= row.min && clamped <= row.max);
  return matched || TSP_LEVELS[TSP_LEVELS.length - 1];
}

function classifyTransferDirection(sourceVq, targetVq) {
  const lhs = Number(sourceVq);
  const rhs = Number(targetVq);
  if (!Number.isFinite(lhs) || !Number.isFinite(rhs)) {
    return 'unknown';
  }
  const delta = rhs - lhs;
  if (delta >= 5) {
    return 'upward';
  }
  if (delta <= -5) {
    return 'downward';
  }
  return 'lateral';
}

function isUnskilledSourceJob(sourceVq, sourceSvp) {
  const numericVq = Number(sourceVq);
  const numericSvp = Number(sourceSvp);
  if (Number.isFinite(numericVq) && numericVq < 85) {
    return true;
  }
  if (Number.isFinite(numericSvp) && numericSvp <= 2) {
    return true;
  }
  return false;
}

function computeTransferabilitySignalsV2(sourceJob, targetJob, profile = null) {
  const sourceVq = Number.isFinite(Number(sourceJob?.vq)) ? Number(sourceJob.vq) : null;
  const targetVq = Number.isFinite(Number(targetJob?.vq)) ? Number(targetJob.vq) : null;
  const sourceSvp = Number.isFinite(Number(sourceJob?.svp)) ? Number(sourceJob.svp) : null;
  const targetSvp = Number.isFinite(Number(targetJob?.svp)) ? Number(targetJob.svp) : null;

  const traitSimilarity = scoreTraitSimilarity(sourceJob?.trait_vector, targetJob?.trait_vector);
  const traitCoverage = scoreTraitCoverage(sourceJob?.trait_vector, targetJob?.trait_vector);
  const profileCompatibility = scoreProfileCompatibility(profile, targetJob?.trait_vector);
  const dotPrefixScore = scoreDotPrefix(sourceJob?.dot_code, targetJob?.dot_code);
  const onetPrefixScore = scoreOnetPrefix(sourceJob?.onet_ou_code, targetJob?.onet_ou_code);
  const vqProximity = scoreScalarProximity(sourceVq, targetVq, 60, 0.5);
  const svpProximity = scoreScalarProximity(sourceSvp, targetSvp, 8, 0.5);
  const strengthSignals = computeStrengthSignals(sourceJob?.trait_vector, targetJob?.trait_vector, profile);
  const tier = deriveMtspTier(sourceJob, targetJob, targetVq);

  const unadjustedWeightedScore =
    traitSimilarity * 0.3 +
    traitCoverage.meets_ratio * 0.16 +
    dotPrefixScore * 0.14 +
    onetPrefixScore * 0.14 +
    vqProximity * 0.08 +
    svpProximity * 0.06 +
    strengthSignals.source_to_target_proximity * 0.12;

  const tierCoreScore = clamp01(
    dotPrefixScore * 0.38 +
      onetPrefixScore * 0.22 +
      vqProximity * 0.15 +
      svpProximity * 0.1 +
      strengthSignals.source_to_target_proximity * 0.15
  );
  let inTierProgress = tierCoreScore;
  if (tier.level === 5) {
    inTierProgress = clamp01(inTierProgress - 0.1);
  } else if (tier.level >= 2 && tier.level <= 4) {
    inTierProgress = clamp01(inTierProgress - 0.45);
  }
  if (profileCompatibility.available) {
    const profileMultiplier = 0.65 + profileCompatibility.compatibility * 0.35;
    inTierProgress = clamp01(inTierProgress * profileMultiplier);
  }
  inTierProgress = clamp01(inTierProgress * strengthSignals.in_tier_multiplier);
  const strengthAdjustedUnadjusted = clamp01(unadjustedWeightedScore * strengthSignals.unadjusted_multiplier);
  const sourceUnskilledCapApplied = isUnskilledSourceJob(sourceVq, sourceSvp);
  const profileGateFailed = profileCompatibility.available && profileCompatibility.deficit_ratio > 0;
  const physicalDemandGateFailed = Number(strengthSignals.profile_physical_deficit_count) > 0;

  let tspPercent = round1(tier.min + inTierProgress * (tier.max - tier.min));
  let tspUnadjustedPercent = round1(tier.min + strengthAdjustedUnadjusted * (tier.max - tier.min));
  if (tier.level === 1) {
    const unskilledScore =
      dotPrefixScore * 0.5 +
      onetPrefixScore * 0.25 +
      vqProximity * 0.15 +
      svpProximity * 0.1;
    const unskilledPercent = round1(Math.min(19, Math.max(0, unskilledScore * 19)));
    tspPercent = unskilledPercent;
    tspUnadjustedPercent = unskilledPercent;
  }

  const maxTspCap = Number(strengthSignals.max_tsp_cap_percent);
  if (Number.isFinite(maxTspCap)) {
    tspPercent = round1(Math.min(tspPercent, maxTspCap));
    tspUnadjustedPercent = round1(Math.min(tspUnadjustedPercent, maxTspCap));
  }
  if (sourceUnskilledCapApplied) {
    tspPercent = round1(Math.min(tspPercent, 19));
    tspUnadjustedPercent = round1(Math.min(tspUnadjustedPercent, 19));
  }
  if (profileGateFailed) {
    tspPercent = 0;
    tspUnadjustedPercent = 0;
  }

  const sameDot = sourceJob?.dot_code && targetJob?.dot_code && sourceJob.dot_code === targetJob.dot_code;
  const sameDotPerfectMatchAllowed =
    sameDot &&
    !sourceUnskilledCapApplied &&
    !profileGateFailed &&
    (!profileCompatibility.available || profileCompatibility.deficit_ratio === 0) &&
    (strengthSignals.profile_deficit_levels === null || strengthSignals.profile_deficit_levels === 0);
  if (sameDotPerfectMatchAllowed) {
    tspPercent = 97;
    tspUnadjustedPercent = 97;
  }

  const adjustmentGap = Math.max(0, Number(tspUnadjustedPercent) - Number(tspPercent));
  let vaAdjustmentPercent = round1(Math.max(0, Math.min(39, adjustmentGap * 1.1 - 1)));
  if (sameDotPerfectMatchAllowed) {
    vaAdjustmentPercent = 0;
  }

  const tsp = classifyTspLevel(tspPercent);
  const tspRaw = round1((tspPercent / 97) * 46);
  const tspUnadjustedRaw = round1((tspUnadjustedPercent / 97) * 46);
  return {
    tsp_percent: tspPercent,
    tsp_percent_unadjusted: tspUnadjustedPercent,
    va_adjustment_percent: vaAdjustmentPercent,
    tsp_level: tsp.level,
    tsp_label: tsp.label,
    tsp_raw_0_to_46: tspRaw,
    tsp_unadjusted_raw_0_to_46: tspUnadjustedRaw,
    strength_source_level: strengthSignals.source_strength_level,
    strength_target_level: strengthSignals.target_strength_level,
    strength_profile_level: strengthSignals.profile_strength_level,
    physical_demand_source_level: strengthSignals.source_strength_level,
    physical_demand_target_level: strengthSignals.target_strength_level,
    physical_demand_profile_level: strengthSignals.profile_strength_level,
    physical_demand_source_label: strengthSignals.source_strength_label,
    physical_demand_target_label: strengthSignals.target_strength_label,
    physical_demand_profile_label: strengthSignals.profile_strength_label,
    physical_demand_source_deficit_count: strengthSignals.source_physical_deficit_count,
    physical_demand_profile_deficit_count: strengthSignals.profile_physical_deficit_count,
    physical_demand_gate_failed: physicalDemandGateFailed ? 1 : 0,
    strength_profile_deficit_levels: strengthSignals.profile_deficit_levels,
    mtsp_tier_rule: tier.rule,
    transfer_direction: classifyTransferDirection(sourceVq, targetVq),
    signal_scores: {
      trait_similarity: round3(traitSimilarity),
      trait_coverage: round3(traitCoverage.meets_ratio),
      trait_deficit_ratio: round3(traitCoverage.deficit_ratio),
      profile_compatibility: profileCompatibility.available ? round3(profileCompatibility.compatibility) : null,
      profile_deficit_ratio: profileCompatibility.available ? round3(profileCompatibility.deficit_ratio) : null,
      dot_prefix: round3(dotPrefixScore),
      onet_prefix: round3(onetPrefixScore),
      vq_proximity: round3(vqProximity),
      svp_proximity: round3(svpProximity),
      strength_source_to_target: round3(strengthSignals.source_to_target_proximity),
      strength_source_level: strengthSignals.source_strength_level,
      strength_target_level: strengthSignals.target_strength_level,
      strength_profile_level: strengthSignals.profile_strength_level,
      strength_source_deficit_levels: strengthSignals.source_deficit_levels,
      strength_profile_deficit_levels: strengthSignals.profile_deficit_levels,
      strength_profile_fit: strengthSignals.profile_fit === null ? null : round3(strengthSignals.profile_fit),
      strength_in_tier_multiplier: round3(strengthSignals.in_tier_multiplier),
      strength_unadjusted_multiplier: round3(strengthSignals.unadjusted_multiplier),
      strength_tsp_cap_percent: strengthSignals.max_tsp_cap_percent,
      profile_gate_failed: profileGateFailed ? 1 : 0,
      source_unskilled_cap_applied: sourceUnskilledCapApplied ? 1 : 0,
      tier_core_score: round3(tierCoreScore),
      in_tier_progress: round3(inTierProgress),
      dot_prefix_length: tier.dot_prefix_length,
      onet_prefix_length: tier.onet_prefix_length
    }
  };
}

function normalizeLegacyCode(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function scoreExactCode(sourceValue, targetValue) {
  const lhs = normalizeLegacyCode(sourceValue);
  const rhs = normalizeLegacyCode(targetValue);
  if (!lhs || !rhs) {
    return null;
  }
  return lhs === rhs ? 1 : 0;
}

function scoreNumericAgreement(sourceValue, targetValue, maxDelta = 8) {
  const lhs = Number(sourceValue);
  const rhs = Number(targetValue);
  if (!Number.isFinite(lhs) || !Number.isFinite(rhs)) {
    return null;
  }
  const delta = Math.abs(lhs - rhs);
  if (delta >= maxDelta) {
    return 0;
  }
  return round3(1 - delta / maxDelta);
}

function buildLegacyComponentMatches(sourceJob, targetJob) {
  const components = {
    dot_prefix: scoreDotPrefix(sourceJob?.dot_code, targetJob?.dot_code),
    onet_prefix: scoreOnetPrefix(sourceJob?.onet_group_or_ou || sourceJob?.onet_ou_code, targetJob?.onet_group_or_ou || targetJob?.onet_ou_code),
    sic: scoreExactCode(sourceJob?.sic, targetJob?.sic),
    soc: scoreExactCode(sourceJob?.soc, targetJob?.soc),
    cen: scoreExactCode(sourceJob?.cen, targetJob?.cen),
    ind: scoreExactCode(sourceJob?.ind, targetJob?.ind),
    wf1: scoreExactCode(sourceJob?.wf1, targetJob?.wf1),
    mpsms_primary: scoreExactCode(sourceJob?.mpsms_primary, targetJob?.mpsms_primary),
    mtewa_primary: scoreNumericAgreement(sourceJob?.mtewa_primary, targetJob?.mtewa_primary, 6)
  };

  const weightedEntries = [
    ['dot_prefix', 0.17],
    ['onet_prefix', 0.13],
    ['sic', 0.1],
    ['soc', 0.1],
    ['cen', 0.08],
    ['ind', 0.08],
    ['wf1', 0.12],
    ['mpsms_primary', 0.12],
    ['mtewa_primary', 0.1]
  ];

  let weightedSum = 0;
  let weightUsed = 0;
  weightedEntries.forEach(([key, weight]) => {
    const value = components[key];
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      return;
    }
    weightedSum += Number(value) * weight;
    weightUsed += weight;
  });

  return {
    components,
    composite_score: weightUsed > 0 ? clamp01(weightedSum / weightUsed) : 0,
    coverage_ratio: round3(weightUsed)
  };
}

function computeTransferabilitySignals(sourceJob, targetJob, profile = null, methodologyContext = {}) {
  const modelVersion =
    methodologyContext?.methodology_version || methodologyContext?.selected_model || METHODOLOGY_VERSION_V2;
  const baseline = computeTransferabilitySignalsV2(sourceJob, targetJob, profile);
  const baselineComponentMatches = {
    dot_prefix: baseline.signal_scores?.dot_prefix ?? null,
    onet_prefix: baseline.signal_scores?.onet_prefix ?? null,
    vq_proximity: baseline.signal_scores?.vq_proximity ?? null,
    svp_proximity: baseline.signal_scores?.svp_proximity ?? null
  };

  if (modelVersion !== METHODOLOGY_VERSION_V3) {
    return {
      ...baseline,
      methodology_version: METHODOLOGY_VERSION_V2,
      ts_percent: baseline.tsp_percent,
      ts_raw_0_to_46: baseline.tsp_raw_0_to_46,
      va_percent: baseline.va_adjustment_percent,
      component_matches: baselineComponentMatches,
      legacy_trace: {
        mode: 'v2_fallback',
        reason: methodologyContext?.reason || 'legacy_sync_not_ready',
        ts_raw_cap: 46,
        tsp_transform: 'tsp_percent = round((ts_raw_0_to_46 / 46) * 97, 1)'
      }
    };
  }

  const legacyMatches = buildLegacyComponentMatches(sourceJob, targetJob);
  const crosswalkBonusPercent = round1(legacyMatches.composite_score * 8);

  let tspPercent = Number(baseline.tsp_percent);
  if (!Number.isFinite(tspPercent)) {
    tspPercent = 0;
  }
  let adjustedTspPercent = round1(Math.min(97, Math.max(0, tspPercent + crosswalkBonusPercent)));

  const profileGateFailed = Number(baseline.signal_scores?.profile_gate_failed) === 1;
  if (profileGateFailed) {
    adjustedTspPercent = 0;
  } else {
    const strengthCap = Number(baseline.signal_scores?.strength_tsp_cap_percent);
    if (Number.isFinite(strengthCap)) {
      adjustedTspPercent = round1(Math.min(adjustedTspPercent, strengthCap));
    }
    const unskilledCapApplied = Number(baseline.signal_scores?.source_unskilled_cap_applied) === 1;
    if (unskilledCapApplied) {
      adjustedTspPercent = round1(Math.min(adjustedTspPercent, 19));
    }
  }

  const adjustedLevel = classifyTspLevel(adjustedTspPercent);
  const adjustedRaw = round1((adjustedTspPercent / 97) * 46);
  let adjustedVa = Number(baseline.va_adjustment_percent);
  if (!Number.isFinite(adjustedVa)) {
    adjustedVa = 0;
  }
  adjustedVa = round1(Math.max(0, Math.min(39, adjustedVa - legacyMatches.composite_score * 6)));

  return {
    ...baseline,
    tsp_percent: adjustedTspPercent,
    va_adjustment_percent: adjustedVa,
    tsp_level: adjustedLevel.level,
    tsp_label: adjustedLevel.label,
    tsp_raw_0_to_46: adjustedRaw,
    methodology_version: METHODOLOGY_VERSION_V3,
    ts_percent: adjustedTspPercent,
    ts_raw_0_to_46: adjustedRaw,
    va_percent: adjustedVa,
    component_matches: {
      ...baselineComponentMatches,
      ...legacyMatches.components,
      legacy_crosswalk_composite: round3(legacyMatches.composite_score),
      legacy_crosswalk_coverage_ratio: legacyMatches.coverage_ratio
    },
    legacy_trace: {
      mode: 'legacy_sync_crosswalk_v1',
      ts_raw_cap: 46,
      baseline_tsp_percent: baseline.tsp_percent,
      baseline_va_percent: baseline.va_adjustment_percent,
      crosswalk_bonus_percent: crosswalkBonusPercent,
      adjusted_tsp_percent: adjustedTspPercent,
      adjusted_va_percent: adjustedVa,
      profile_gate_failed: profileGateFailed,
      methodology_reason: methodologyContext?.reason || 'v3_selected'
    },
    signal_scores: {
      ...baseline.signal_scores,
      legacy_crosswalk_composite: round3(legacyMatches.composite_score),
      legacy_crosswalk_bonus_percent: crosswalkBonusPercent
    }
  };
}

function buildTraitGaps(profile, rawTraitVector) {
  const traitVector = parseTraitVector(rawTraitVector);
  if (!traitVector) {
    return [];
  }

  return TRAITS.map((trait, index) => {
    const required = traitVector[index];
    const profileValue = profile[index];
    const deficit = Math.max(0, required - profileValue);
    return {
      index,
      code: trait.code,
      label: trait.label,
      profile_value: profileValue,
      required_value: required,
      deficit,
      within_profile: deficit === 0
    };
  });
}

function round1(value) {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 10) / 10;
}

function readMetadata(database) {
  if (!tableExists(database, 'metadata')) {
    return {};
  }

  const rows = database.prepare('SELECT key, value FROM metadata').all();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

function tableExists(database, tableName) {
  const table = database
    .prepare(
      `
      SELECT 1 AS present
      FROM sqlite_master
      WHERE type = 'table' AND name = ?
      LIMIT 1
      `
    )
    .get(tableName);
  return !!table;
}

function quoteShellPath(pathValue) {
  return `"${String(pathValue || '').replace(/"/g, '\\"')}"`;
}

function parseIntegerOrNull(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function tableColumnSet(database, tableName) {
  if (!tableExists(database, tableName)) {
    return new Set();
  }
  const rows = database.prepare(`PRAGMA table_info(${tableName})`).all();
  return new Set(rows.map((row) => String(row.name)));
}

function getJobsColumnSet(database = null) {
  if (jobsColumnSetCache) {
    return jobsColumnSetCache;
  }
  const sourceDatabase = database || getDb();
  jobsColumnSetCache = tableColumnSet(sourceDatabase, 'jobs');
  return jobsColumnSetCache;
}

function jobColumnProjection(columnName, tableAlias = null, database = null) {
  const columnSet = getJobsColumnSet(database);
  const reference = tableAlias ? `${tableAlias}.${columnName}` : columnName;
  return columnSet.has(columnName) ? `${reference} AS ${columnName}` : `NULL AS ${columnName}`;
}

function computeLegacySyncCoverage(database, metadata = {}) {
  const jobColumns = tableColumnSet(database, 'jobs');
  const missingCrosswalkColumns = LEGACY_CROSSWALK_COLUMNS.filter((name) => !jobColumns.has(name));
  const missingValueColumns = LEGACY_VALUE_COLUMNS.filter((name) => !jobColumns.has(name));
  const columnsPresent = missingCrosswalkColumns.length === 0 && missingValueColumns.length === 0;

  let crosswalkCoverageCount = null;
  let valueCoverageCount = null;
  if (columnsPresent) {
    crosswalkCoverageCount = database
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM jobs
        WHERE
          COALESCE(sic, '') <> ''
          OR COALESCE(soc, '') <> ''
          OR COALESCE(cen, '') <> ''
          OR COALESCE(ind, '') <> ''
          OR COALESCE(onet_group_or_ou, '') <> ''
        `
      )
      .get().count;
    valueCoverageCount = database
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM jobs
        WHERE
          COALESCE(mpsms_primary, '') <> ''
          OR COALESCE(mtewa_primary, '') <> ''
        `
      )
      .get().count;
  }

  const metadataCrosswalkCoverage = parseIntegerOrNull(metadata.jobs_crosswalk_coverage_count);
  const metadataValueCoverage = parseIntegerOrNull(metadata.jobs_value_coverage_count);
  const snapshotId =
    typeof metadata.legacy_snapshot_id === 'string' && metadata.legacy_snapshot_id.trim()
      ? metadata.legacy_snapshot_id.trim()
      : null;
  const ready =
    columnsPresent &&
    Number(crosswalkCoverageCount) >= LEGACY_SYNC_MIN_CROSSWALK_COVERAGE &&
    Number(valueCoverageCount) >= LEGACY_SYNC_MIN_VALUE_COVERAGE &&
    metadataCrosswalkCoverage === Number(crosswalkCoverageCount) &&
    metadataValueCoverage === Number(valueCoverageCount);

  return {
    ready,
    columns_present: columnsPresent,
    missing_columns: [...missingCrosswalkColumns, ...missingValueColumns],
    crosswalk_coverage_count: crosswalkCoverageCount,
    value_coverage_count: valueCoverageCount,
    metadata_crosswalk_coverage_count: metadataCrosswalkCoverage,
    metadata_value_coverage_count: metadataValueCoverage,
    snapshot_id: snapshotId
  };
}

function resolveMethodologyContext(readinessPayload = null) {
  const readiness = readinessPayload || runReadinessChecks();
  const legacySyncReady = readiness?.core?.legacy_sync?.ready === true;
  let selectedModel = METHODOLOGY_VERSION_V2;
  let reason = 'auto_v2_fallback';

  if (TSA_MODEL_PREF === 'v2') {
    selectedModel = METHODOLOGY_VERSION_V2;
    reason = 'forced_v2';
  } else if (TSA_MODEL_PREF === 'v3') {
    selectedModel = METHODOLOGY_VERSION_V3;
    reason = legacySyncReady ? 'forced_v3' : 'forced_v3_without_readiness';
  } else if (legacySyncReady) {
    selectedModel = METHODOLOGY_VERSION_V3;
    reason = 'auto_v3';
  }

  return {
    env_preference: TSA_MODEL_PREF,
    selected_model: selectedModel,
    methodology_version: selectedModel,
    reason,
    legacy_sync_ready: legacySyncReady,
    legacy_snapshot_id: readiness?.core?.legacy_sync?.snapshot_id || null,
    parity_profile: selectedModel === METHODOLOGY_VERSION_V3 ? 'legacy_sync' : 'mtsp_calibrated_fallback',
    layout_version: 'mtsp-canonical-html-v1'
  };
}

function buildReadinessRemediation(metadata = {}) {
  const legacyDir =
    typeof metadata.legacy_dir === 'string' && metadata.legacy_dir.trim()
      ? metadata.legacy_dir.trim()
      : '<path to MVQS source>';
  const sourceMode =
    typeof metadata.source_mode === 'string' && metadata.source_mode.trim()
      ? metadata.source_mode.trim()
      : 'dc';
  const frontEndPath = path.join(legacyDir, 'MVQS_DC_FrontEnd_with_Adobe.accdb');
  const dataPath = path.join(legacyDir, 'MVQS_DC_Data.accdb');
  const jobBankPath = path.join(legacyDir, 'MVQS_DC_Data_JobBank.accdb');
  const snapshotIdExpr = '$(date -u +%Y%m%dT%H%M%SZ)';
  const extractCommand =
    `python3 scripts/extract_legacy_access_snapshot.py ` +
    `--snapshot-id ${snapshotIdExpr} ` +
    `--front-end-path ${quoteShellPath(frontEndPath)} ` +
    `--data-path ${quoteShellPath(dataPath)} ` +
    `--jobbank-path ${quoteShellPath(jobBankPath)} --allow-missing`;
  const buildCommand =
    `npm run build:data -- --legacy-dir ${quoteShellPath(legacyDir)} --source ${sourceMode} ` +
    `--legacy-snapshot-id ${snapshotIdExpr}`;
  return ['python3 scripts/check_mdb_tools.py', extractCommand, buildCommand, 'npm run dev', 'npm run smoke:api'];
}

function chromiumExecutableReady() {
  try {
    const executable = chromium.executablePath();
    return !!executable;
  } catch {
    return false;
  }
}

function runReadinessChecks() {
  const checks = [];
  const core = {
    dbReady: false,
    appDbReady: false,
    metadata: {},
    counts: {
      jobs: null,
      job_tasks: null,
      states: null,
      counties: null,
      state_job_counts: null,
      county_job_counts: null,
      psychometric_catalog: null,
      jobs_crosswalk_coverage: null,
      jobs_value_coverage: null
    },
    legacy_sync: {
      ready: false,
      columns_present: false,
      missing_columns: [...LEGACY_CROSSWALK_COLUMNS, ...LEGACY_VALUE_COLUMNS],
      crosswalk_coverage_count: null,
      value_coverage_count: null,
      metadata_crosswalk_coverage_count: null,
      metadata_value_coverage_count: null,
      snapshot_id: null
    }
  };

  const pushCheck = (id, condition, severity, passMessage, failMessage) => {
    checks.push({
      id,
      status: condition ? 'pass' : 'fail',
      severity,
      message: condition ? passMessage : failMessage
    });
  };

  let database = null;
  try {
    database = getDb();
    core.dbReady = true;
    pushCheck('core.db.ready', true, 'blocker', 'Main SQLite database opened.', 'Main SQLite database not ready.');
  } catch {
    pushCheck(
      'core.db.ready',
      false,
      'blocker',
      'Main SQLite database opened.',
      'Main SQLite database not ready.'
    );
  }

  let appDatabase = null;
  try {
    appDatabase = getAppDb();
    core.appDbReady = true;
    pushCheck('core.app_db.ready', true, 'blocker', 'App SQLite database opened.', 'App SQLite database not ready.');
  } catch {
    pushCheck(
      'core.app_db.ready',
      false,
      'blocker',
      'App SQLite database opened.',
      'App SQLite database not ready.'
    );
  }

  if (database) {
    const metadataTablePresent = tableExists(database, 'metadata');
    pushCheck(
      'core.metadata.table',
      metadataTablePresent,
      'blocker',
      'Metadata table is present.',
      'Metadata table is missing.'
    );

    core.metadata = metadataTablePresent ? readMetadata(database) : {};
    const missingMetadataKeys = READINESS_REQUIRED_METADATA_KEYS.filter((key) => {
      const value = core.metadata[key];
      return value === null || value === undefined || String(value).trim() === '';
    });
    pushCheck(
      'core.metadata.required_keys',
      missingMetadataKeys.length === 0,
      'blocker',
      'All required metadata keys are present.',
      `Missing metadata keys: ${missingMetadataKeys.join(', ') || 'unknown'}.`
    );

    const queryCount = (tableName) => database.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count;
    core.counts.jobs = queryCount('jobs');
    core.counts.job_tasks = queryCount('job_tasks');
    core.counts.states = queryCount('states');
    core.counts.counties = queryCount('counties');
    core.counts.state_job_counts = queryCount('state_job_counts');
    core.counts.county_job_counts = queryCount('county_job_counts');

    const requiredPositiveCounts = [
      ['jobs', core.counts.jobs],
      ['job_tasks', core.counts.job_tasks],
      ['states', core.counts.states],
      ['counties', core.counts.counties],
      ['state_job_counts', core.counts.state_job_counts],
      ['county_job_counts', core.counts.county_job_counts]
    ];
    const zeroCountTables = requiredPositiveCounts
      .filter(([, value]) => Number(value) <= 0)
      .map(([name]) => name);
    pushCheck(
      'core.tables.nonempty',
      zeroCountTables.length === 0,
      'blocker',
      'All required tables contain rows.',
      `Zero-row required tables: ${zeroCountTables.join(', ') || 'unknown'}.`
    );

    const metadataCountMap = [
      ['jobs_count', core.counts.jobs],
      ['tasks_count', core.counts.job_tasks],
      ['states_count', core.counts.states],
      ['counties_count', core.counts.counties],
      ['state_job_counts_count', core.counts.state_job_counts],
      ['county_job_counts_count', core.counts.county_job_counts]
    ];
    const metadataMismatches = [];
    metadataCountMap.forEach(([key, liveCount]) => {
      const expected = parseIntegerOrNull(core.metadata[key]);
      if (expected === null || expected !== Number(liveCount)) {
        metadataMismatches.push(`${key} expected=${expected ?? 'n/a'} live=${liveCount}`);
      }
    });
    pushCheck(
      'core.metadata.totals_match',
      metadataMismatches.length === 0,
      'blocker',
      'Metadata totals match live table counts.',
      `Metadata totals mismatch: ${metadataMismatches.join('; ') || 'unknown'}.`
    );

    const installedStates = database.prepare('SELECT COUNT(*) AS count FROM states WHERE installed = 1').get().count;
    pushCheck(
      'core.states.installed',
      installedStates > 0,
      'blocker',
      'At least one installed state/province is available.',
      'No installed states/provinces are available.'
    );

    const legacySyncCoverage = computeLegacySyncCoverage(database, core.metadata);
    core.legacy_sync = legacySyncCoverage;
    core.counts.jobs_crosswalk_coverage = legacySyncCoverage.crosswalk_coverage_count;
    core.counts.jobs_value_coverage = legacySyncCoverage.value_coverage_count;

    pushCheck(
      'legacy_sync.columns.present',
      legacySyncCoverage.columns_present,
      'warning',
      'Legacy-sync crosswalk/value columns are present in jobs table.',
      `Legacy-sync columns missing in jobs table: ${legacySyncCoverage.missing_columns.join(', ') || 'unknown'}.`
    );
    pushCheck(
      'legacy_sync.crosswalk.coverage',
      Number(legacySyncCoverage.crosswalk_coverage_count) >= LEGACY_SYNC_MIN_CROSSWALK_COVERAGE,
      'warning',
      `Crosswalk coverage is loaded (${legacySyncCoverage.crosswalk_coverage_count}).`,
      `Crosswalk coverage is incomplete (count=${legacySyncCoverage.crosswalk_coverage_count ?? 'n/a'}).`
    );
    pushCheck(
      'legacy_sync.values.coverage',
      Number(legacySyncCoverage.value_coverage_count) >= LEGACY_SYNC_MIN_VALUE_COVERAGE,
      'warning',
      `Value-reinforcer coverage is loaded (${legacySyncCoverage.value_coverage_count}).`,
      `Value-reinforcer coverage is incomplete (count=${legacySyncCoverage.value_coverage_count ?? 'n/a'}).`
    );
    const legacyMetadataMatch =
      legacySyncCoverage.metadata_crosswalk_coverage_count === Number(legacySyncCoverage.crosswalk_coverage_count) &&
      legacySyncCoverage.metadata_value_coverage_count === Number(legacySyncCoverage.value_coverage_count);
    pushCheck(
      'legacy_sync.metadata.coverage_match',
      legacyMetadataMatch,
      'warning',
      'Legacy-sync metadata coverage totals match live totals.',
      `Legacy-sync metadata coverage mismatch: metadata_crosswalk=${legacySyncCoverage.metadata_crosswalk_coverage_count ?? 'n/a'} live_crosswalk=${legacySyncCoverage.crosswalk_coverage_count ?? 'n/a'}; metadata_values=${legacySyncCoverage.metadata_value_coverage_count ?? 'n/a'} live_values=${legacySyncCoverage.value_coverage_count ?? 'n/a'}.`
    );
    pushCheck(
      'legacy_sync.snapshot.present',
      !!legacySyncCoverage.snapshot_id,
      'warning',
      'Legacy snapshot id is recorded.',
      'Legacy snapshot id is not recorded in metadata.'
    );
  } else {
    pushCheck(
      'core.metadata.table',
      false,
      'blocker',
      'Metadata table is present.',
      'Metadata table cannot be checked while main database is unavailable.'
    );
    pushCheck(
      'core.metadata.required_keys',
      false,
      'blocker',
      'All required metadata keys are present.',
      'Metadata keys cannot be checked while main database is unavailable.'
    );
    pushCheck(
      'core.tables.nonempty',
      false,
      'blocker',
      'All required tables contain rows.',
      'Table row counts cannot be checked while main database is unavailable.'
    );
    pushCheck(
      'core.metadata.totals_match',
      false,
      'blocker',
      'Metadata totals match live table counts.',
      'Metadata/live totals cannot be checked while main database is unavailable.'
    );
    pushCheck(
      'core.states.installed',
      false,
      'blocker',
      'At least one installed state/province is available.',
      'Installed states cannot be checked while main database is unavailable.'
    );
    pushCheck(
      'legacy_sync.columns.present',
      false,
      'warning',
      'Legacy-sync crosswalk/value columns are present in jobs table.',
      'Legacy-sync columns cannot be checked while main database is unavailable.'
    );
    pushCheck(
      'legacy_sync.crosswalk.coverage',
      false,
      'warning',
      'Crosswalk coverage is loaded.',
      'Crosswalk coverage cannot be checked while main database is unavailable.'
    );
    pushCheck(
      'legacy_sync.values.coverage',
      false,
      'warning',
      'Value-reinforcer coverage is loaded.',
      'Value-reinforcer coverage cannot be checked while main database is unavailable.'
    );
    pushCheck(
      'legacy_sync.metadata.coverage_match',
      false,
      'warning',
      'Legacy-sync metadata coverage totals match live totals.',
      'Legacy-sync metadata coverage cannot be checked while main database is unavailable.'
    );
    pushCheck(
      'legacy_sync.snapshot.present',
      false,
      'warning',
      'Legacy snapshot id is recorded.',
      'Legacy snapshot id cannot be checked while main database is unavailable.'
    );
  }

  if (appDatabase) {
    core.counts.psychometric_catalog = appDatabase
      .prepare('SELECT COUNT(*) AS count FROM psychometric_catalog')
      .get().count;
    pushCheck(
      'core.psychometric_catalog.nonempty',
      Number(core.counts.psychometric_catalog) > 0,
      'blocker',
      'Psychometric catalog is loaded.',
      'Psychometric catalog is empty.'
    );
  } else {
    pushCheck(
      'core.psychometric_catalog.nonempty',
      false,
      'blocker',
      'Psychometric catalog is loaded.',
      'Psychometric catalog cannot be checked while app database is unavailable.'
    );
  }

  const chromiumReady = chromiumExecutableReady();
  pushCheck(
    'core.playwright.chromium',
    chromiumReady,
    'warning',
    'Playwright Chromium is available for canonical PDF exports.',
    'Playwright Chromium is not available. Run `npx playwright install chromium`.'
  );

  const hasBlockers = checks.some((check) => check.severity === 'blocker' && check.status === 'fail');
  let activeModel = METHODOLOGY_VERSION_V2;
  if (TSA_MODEL_PREF === 'v3') {
    activeModel = METHODOLOGY_VERSION_V3;
  } else if (TSA_MODEL_PREF === 'auto' && core.legacy_sync.ready) {
    activeModel = METHODOLOGY_VERSION_V3;
  }
  return {
    overall_status: hasBlockers ? 'fail' : 'pass',
    blocking: hasBlockers,
    checked_at_utc: nowIso(),
    core,
    checks,
    methodology: {
      env_preference: TSA_MODEL_PREF,
      active_model: activeModel,
      legacy_sync_ready: core.legacy_sync.ready,
      fallback_active: activeModel !== METHODOLOGY_VERSION_V3
    },
    remediation: buildReadinessRemediation(core.metadata)
  };
}

function resolveRegionContext(database, stateId, countyId) {
  const relationError = validateRegionFilter(stateId, countyId);
  if (relationError) {
    return { state: null, county: null, error: relationError };
  }

  let state = null;
  let county = null;

  if (stateId !== null) {
    state =
      database
        .prepare(
          `
          SELECT state_id, state_abbrev, state_name
          FROM states
          WHERE state_id = ?
          `
        )
        .get(stateId) || null;

    if (!state) {
      return { state: null, county: null, error: 'Unknown stateId' };
    }
  }

  if (stateId !== null && countyId !== null) {
    county =
      database
        .prepare(
          `
          SELECT county_id, county_name, state_id, eclr_current
          FROM counties
          WHERE state_id = ? AND county_id = ?
          `
        )
        .get(stateId, countyId) || null;

    if (!county) {
      return { state, county: null, error: 'Unknown countyId for stateId' };
    }
  }

  return { state, county, error: null };
}

function querySearchJobs(database, { q, stateId, countyId, limit, offset }) {
  const source = buildSourceClause(stateId, countyId);
  const search = buildSearchPredicate(q);
  const { whereSql, params } = buildWhereClause(source, search);
  const orderSql = source.countColumn === 'NULL' ? 'j.title ASC' : `${source.countColumn} DESC, j.title ASC`;

  const sql = `
    SELECT
      j.dot_code,
      j.title,
      j.description,
      j.vq,
      j.svp,
      j.population,
      j.disability_code,
      j.skill_vq,
      j.skill_alt,
      j.skill_bucket,
      j.onet_ou_code,
      ${source.countColumn} AS job_count
    FROM ${source.from}
    ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM ${source.from}
    ${whereSql}
  `;

  const total = database.prepare(countSql).get(...params).total;
  const jobs = database.prepare(sql).all(...params, limit, offset);
  return { total, jobs };
}

function queryRankedMatches(database, { q, stateId, countyId, profile, limit, offset = 0 }) {
  const source = buildSourceClause(stateId, countyId);
  const search = buildSearchPredicate(q);
  const { whereSql, params } = buildWhereClause(source, search);
  const { totalDeficitExpr, matchScoreExpr } = buildMatchExpressions(profile);
  const orderSql =
    source.countColumn === 'NULL'
      ? 'deficit ASC, j.title ASC'
      : `deficit ASC, ${source.countColumn} DESC, j.title ASC`;

  const sql = `
    SELECT
      j.dot_code,
      j.title,
      j.description,
      j.trait_vector,
      j.vq,
      j.svp,
      j.population,
      j.disability_code,
      j.skill_vq,
      j.skill_alt,
      j.skill_bucket,
      j.onet_ou_code,
      ${source.countColumn} AS job_count,
      (${totalDeficitExpr}) AS deficit,
      ${matchScoreExpr} AS match_score
    FROM ${source.from}
    ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM ${source.from}
    ${whereSql}
  `;

  const total = database.prepare(countSql).get(...params).total;
  const results = database.prepare(sql).all(...params, limit, offset);
  return { total, results };
}

function queryRankedMatchForDot(database, { q, stateId, countyId, profile, dotCode }) {
  const source = buildSourceClause(stateId, countyId);
  const search = buildSearchPredicate(q);
  const { totalDeficitExpr, matchScoreExpr } = buildMatchExpressions(profile);
  const where = [...source.where];
  const params = [...source.params];

  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }

  where.push('j.dot_code = ?');
  params.push(dotCode);

  const sql = `
    SELECT
      j.dot_code,
      j.title,
      j.description,
      j.trait_vector,
      j.vq,
      j.svp,
      j.population,
      j.disability_code,
      j.skill_vq,
      j.skill_alt,
      j.skill_bucket,
      j.onet_ou_code,
      ${source.countColumn} AS job_count,
      (${totalDeficitExpr}) AS deficit,
      ${matchScoreExpr} AS match_score
    FROM ${source.from}
    WHERE ${where.join(' AND ')}
    LIMIT 1
  `;

  return database.prepare(sql).get(...params) || null;
}

function queryJobForAnalysis(database, dotCode) {
  return (
    database
      .prepare(
        `
        SELECT
          dot_code,
          title,
          description,
          trait_vector,
          vq,
          svp,
          population,
          disability_code,
          skill_vq,
          skill_alt,
          skill_bucket,
          onet_ou_code,
          ${jobColumnProjection('sic', null, database)},
          ${jobColumnProjection('soc', null, database)},
          ${jobColumnProjection('cen', null, database)},
          ${jobColumnProjection('ind', null, database)},
          ${jobColumnProjection('wf1', null, database)},
          ${jobColumnProjection('mpsms_primary', null, database)},
          ${jobColumnProjection('mtewa_primary', null, database)},
          ${jobColumnProjection('onet_group_or_ou', null, database)}
        FROM jobs
        WHERE dot_code = ?
        `
      )
      .get(dotCode) || null
  );
}

function buildTspBandCounts(rows) {
  const counts = Object.fromEntries(TSP_LEVELS.map((row) => [`level_${row.level}`, 0]));
  rows.forEach((row) => {
    const key = `level_${row.tsp_level}`;
    if (Object.hasOwn(counts, key)) {
      counts[key] += 1;
    }
  });

  return {
    total: rows.length,
    ...counts
  };
}

function buildTransferableAggregate(rows) {
  const tspScores = rows
    .map((row) => Number(row.tsp_percent))
    .filter((value) => Number.isFinite(value));
  const vaAdjustments = rows
    .map((row) => Number(row.va_adjustment_percent))
    .filter((value) => Number.isFinite(value));
  const avgTsp = tspScores.length > 0 ? round1(tspScores.reduce((sum, value) => sum + value, 0) / tspScores.length) : null;
  const avgVa =
    vaAdjustments.length > 0 ? round1(vaAdjustments.reduce((sum, value) => sum + value, 0) / vaAdjustments.length) : null;
  return {
    result_count: rows.length,
    average_tsp_percent: avgTsp,
    average_va_adjustment_percent: avgVa
  };
}

function buildMethodologyPayload(methodologyContext = null) {
  const context = methodologyContext || resolveMethodologyContext();
  return {
    ...context,
    ...getSection7MethodologyMetadata()
  };
}

function buildTransferableAnalysisBasis(methodologyContext = null) {
  const context = methodologyContext || resolveMethodologyContext();
  const section7Metadata = getSection7MethodologyMetadata();
  const usingV3 = context.methodology_version === METHODOLOGY_VERSION_V3;
  return {
    model: context.methodology_version,
    env_preference: context.env_preference,
    selection_reason: context.reason,
    legacy_sync_ready: context.legacy_sync_ready,
    legacy_snapshot_id: context.legacy_snapshot_id,
    parity_profile: context.parity_profile,
    ...section7Metadata,
    tsp_percent_range: '0-97',
    ts_raw_range: '0-46',
    va_adjustment_percent_range: '0-39',
    factors: [
      'MTSP tier gate from VQ threshold and DOT/O*NET prefix overlap',
      'Tier progress weighting: DOT prefix (38%), O*NET prefix (22%), VQ proximity (15%), SVP proximity (10%), Strength compatibility (15%)',
      'Explicit physical-demand scoring: PD1 strength-level compatibility plus PD1-PD6 physical-demand deficit tracking',
      'Strict profile gate: jobs with any profile deficit are assigned TS=0 (not transferable under current profile)',
      'Unskilled-source cap: when source VQ<85 or SVP<=2, TS is capped to 0-19',
      usingV3
        ? 'Legacy-sync crosswalk/value contribution overlay using exact SIC/SOC/CEN/IND/WF1/MPSMS matches plus MTEWA/O*NET support when available'
        : 'Legacy-sync crosswalk/value contribution disabled; using calibrated fallback path'
    ],
    notes: [
      'Tier ranges follow legacy MTSP bins: 0-19, 20-39, 40-59, 60-79, 80-97.',
      'TS transform uses round((raw_0_to_46 / 46) * 97, 1) to map to the 0-97 MTSP scale.',
      'Strength mismatch caps are applied when profile strength is below target strength (deficit 1=>79, 2=>59, 3=>39, 4=>19).',
      'Physical-demand deficits are evaluated across PD1-PD6 and surfaced in each TSA result row for auditability.',
      usingV3
        ? 'v3 legacy-sync is active: payload includes component_matches and legacy_trace for auditability.'
        : 'v2 fallback is active: crosswalk/value fields are incomplete or model preference is set to v2.',
      'Target jobs with VQ < 85 are constrained to the Level 1 TSP range (0-19%).'
    ],
    source_selection: 'For each target job, the selected source DOT is the one with the highest computed TSP percent.'
  };
}

function pickBestTransferabilityScore(sourceJobs, targetRow, profile = null, methodologyContext = null) {
  let bestSourceJob = null;
  let bestSignals = null;

  sourceJobs.forEach((sourceJob) => {
    const signals = computeTransferabilitySignals(sourceJob, targetRow, profile, methodologyContext || {});
    if (!bestSignals) {
      bestSignals = signals;
      bestSourceJob = sourceJob;
      return;
    }

    if (signals.tsp_percent > bestSignals.tsp_percent) {
      bestSignals = signals;
      bestSourceJob = sourceJob;
      return;
    }

    if (signals.tsp_percent === bestSignals.tsp_percent) {
      const signalWeight = Object.values(signals.signal_scores || {}).reduce(
        (sum, value) => sum + (Number.isFinite(Number(value)) ? Number(value) : 0),
        0
      );
      const bestSignalWeight = Object.values(bestSignals.signal_scores || {}).reduce(
        (sum, value) => sum + (Number.isFinite(Number(value)) ? Number(value) : 0),
        0
      );
      if (signalWeight > bestSignalWeight) {
        bestSignals = signals;
        bestSourceJob = sourceJob;
      }
    }
  });

  if (!bestSignals || !bestSourceJob) {
    return null;
  }

  return {
    ...bestSignals,
    best_source_dot_code: bestSourceJob.dot_code,
    best_source_title: bestSourceJob.title
  };
}

function queryTransferableSkillCandidates(database, { q, stateId, countyId, dotCode = null }) {
  const source = buildSourceClause(stateId, countyId);
  const search = buildSearchPredicate(q);
  const where = [...source.where];
  const params = [...source.params];

  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }
  if (dotCode) {
    where.push('j.dot_code = ?');
    params.push(dotCode);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `
    SELECT
      j.dot_code,
      j.title,
      j.description,
      j.trait_vector,
      j.vq,
      j.svp,
      j.population,
      j.disability_code,
      j.skill_vq,
      j.skill_alt,
      j.skill_bucket,
      j.onet_ou_code,
      ${jobColumnProjection('sic', 'j', database)},
      ${jobColumnProjection('soc', 'j', database)},
      ${jobColumnProjection('cen', 'j', database)},
      ${jobColumnProjection('ind', 'j', database)},
      ${jobColumnProjection('wf1', 'j', database)},
      ${jobColumnProjection('mpsms_primary', 'j', database)},
      ${jobColumnProjection('mtewa_primary', 'j', database)},
      ${jobColumnProjection('onet_group_or_ou', 'j', database)},
      ${source.countColumn} AS job_count
    FROM ${source.from}
    ${whereSql}
  `;
  return database.prepare(sql).all(...params);
}

function queryTransferableSkillsForSources(database, { sourceDots, q, stateId, countyId, limit, offset = 0, profile = null }) {
  const methodologyContext = resolveMethodologyContext();
  const sourceJobs = sourceDots.map((dotCode) => queryJobForAnalysis(database, dotCode)).filter(Boolean);
  const foundSourceDots = new Set(sourceJobs.map((row) => row.dot_code));
  const missingSourceDots = sourceDots.filter((dotCode) => !foundSourceDots.has(dotCode));

  if (!sourceJobs.length) {
    return {
      sourceJobs: [],
      missingSourceDots,
      methodology: methodologyContext,
      total: 0,
      results: [],
      aggregate: buildTransferableAggregate([]),
      diagnostics: {
        candidate_count: 0,
        profile_gate_excluded_count: 0,
        physical_gate_excluded_count: 0,
        unskilled_cap_applied_count: 0,
        strength_capped_survivors_count: 0
      },
      tsp_band_counts: buildTspBandCounts([])
    };
  }

  const candidateRows = queryTransferableSkillCandidates(database, { q, stateId, countyId });
  const scoredRows = candidateRows
    .map((row) => {
      const best = pickBestTransferabilityScore(sourceJobs, row, profile, methodologyContext);
      if (!best) {
        return null;
      }
      return {
        ...row,
        ...best
      };
    })
    .filter(Boolean);
  const diagnostics = scoredRows.reduce(
    (acc, row) => {
      acc.candidate_count += 1;
      if (Number(row.signal_scores?.profile_gate_failed) === 1) {
        acc.profile_gate_excluded_count += 1;
      }
      if (Number(row.physical_demand_gate_failed) === 1) {
        acc.physical_gate_excluded_count += 1;
      }
      if (Number(row.signal_scores?.source_unskilled_cap_applied) === 1) {
        acc.unskilled_cap_applied_count += 1;
      }
      if (
        Number.isFinite(Number(row.strength_profile_deficit_levels)) &&
        Number(row.strength_profile_deficit_levels) > 0 &&
        Number(row.tsp_percent) > 0
      ) {
        acc.strength_capped_survivors_count += 1;
      }
      return acc;
    },
    {
      candidate_count: 0,
      profile_gate_excluded_count: 0,
      physical_gate_excluded_count: 0,
      unskilled_cap_applied_count: 0,
      strength_capped_survivors_count: 0
    }
  );
  const matchedRows = scoredRows.filter((row) => Number(row.tsp_percent) > 0);

  matchedRows.sort((lhs, rhs) => {
    if (rhs.tsp_percent !== lhs.tsp_percent) {
      return rhs.tsp_percent - lhs.tsp_percent;
    }

    const lhsCount = Number.isFinite(Number(lhs.job_count)) ? Number(lhs.job_count) : -1;
    const rhsCount = Number.isFinite(Number(rhs.job_count)) ? Number(rhs.job_count) : -1;
    if (rhsCount !== lhsCount) {
      return rhsCount - lhsCount;
    }

    return String(lhs.title || '').localeCompare(String(rhs.title || ''));
  });

  const total = matchedRows.length;
  const paged = matchedRows.slice(offset, offset + limit);
  return {
    sourceJobs,
    missingSourceDots,
    methodology: methodologyContext,
    total,
    results: paged,
    aggregate: buildTransferableAggregate(matchedRows),
    diagnostics,
    tsp_band_counts: buildTspBandCounts(matchedRows)
  };
}

function queryTransferableSkillsForDot(database, { sourceJobs, q, stateId, countyId, dotCode, profile = null, methodologyContext = null }) {
  const resolvedMethodology = methodologyContext || resolveMethodologyContext();
  const candidates = queryTransferableSkillCandidates(database, { q, stateId, countyId, dotCode });
  if (!candidates.length) {
    return null;
  }
  const best = pickBestTransferabilityScore(sourceJobs, candidates[0], profile, resolvedMethodology);
  if (!best) {
    return null;
  }
  if (!(Number(best.tsp_percent) > 0)) {
    return null;
  }
  return {
    ...candidates[0],
    ...best
  };
}

function queryTransferableSkills(database, { sourceDot, q, stateId, countyId, limit, offset = 0, profile = null }) {
  const analysis = queryTransferableSkillsForSources(database, {
    sourceDots: [sourceDot],
    q,
    stateId,
    countyId,
    limit,
    offset,
    profile
  });
  return {
    sourceJob: analysis.sourceJobs[0] || null,
    total: analysis.total,
    results: analysis.results,
    tsp_band_counts: analysis.tsp_band_counts
  };
}

function queryTasksForDot(database, dotCode, limit = 50) {
  return database
    .prepare(
      `
      SELECT ts, description
      FROM job_tasks
      WHERE dot_code = ?
      ORDER BY ts ASC
      LIMIT ?
      `
    )
    .all(dotCode, limit);
}

function queryTopStatesForDot(database, dotCode, limit = 12) {
  return database
    .prepare(
      `
      SELECT s.state_abbrev, s.state_name, sjc.job_count
      FROM state_job_counts sjc
      JOIN states s ON s.state_id = sjc.state_id
      WHERE sjc.dot_code = ?
      ORDER BY sjc.job_count DESC
      LIMIT ?
      `
    )
    .all(dotCode, limit);
}

function queryTopCountiesForDot(database, dotCode, stateId, countyId = null, limit = 12) {
  if (stateId === null) {
    return [];
  }

  if (countyId !== null) {
    return database
      .prepare(
        `
        SELECT
          c.county_id,
          c.county_name,
          c.state_id,
          cjc.job_count
        FROM county_job_counts cjc
        JOIN counties c ON c.state_id = cjc.state_id AND c.county_id = cjc.county_id
        WHERE cjc.dot_code = ? AND cjc.state_id = ? AND cjc.county_id = ?
        ORDER BY c.county_name ASC
        LIMIT ?
        `
      )
      .all(dotCode, stateId, countyId, limit);
  }

  return database
    .prepare(
      `
      SELECT
        c.county_id,
        c.county_name,
        c.state_id,
        cjc.job_count
      FROM county_job_counts cjc
      JOIN counties c ON c.state_id = cjc.state_id AND c.county_id = cjc.county_id
      WHERE cjc.dot_code = ? AND cjc.state_id = ?
      ORDER BY cjc.job_count DESC, c.county_name ASC
      LIMIT ?
      `
    )
      .all(dotCode, stateId, limit);
}

/* ------------------------------------------------------------------ */
/*  Report enrichment helpers – query supplementary occupation data    */
/* ------------------------------------------------------------------ */

function queryOccupationDetails(database, dotCode) {
  if (!tableExists(database, 'occupation_details')) return null;
  return database.prepare('SELECT * FROM occupation_details WHERE dot_code = ?').get(dotCode) || null;
}

function queryOccupationDetailsBatch(database, dotCodes) {
  if (!tableExists(database, 'occupation_details') || !dotCodes.length) return {};
  const placeholders = dotCodes.map(() => '?').join(',');
  const rows = database.prepare(`SELECT * FROM occupation_details WHERE dot_code IN (${placeholders})`).all(...dotCodes);
  return Object.fromEntries(rows.map((r) => [r.dot_code, r]));
}

function queryTemperaments(database, dotCode) {
  if (!tableExists(database, 'occupation_tem_jolt')) return null;
  return database.prepare('SELECT * FROM occupation_tem_jolt WHERE dot_code = ?').get(dotCode) || null;
}

function queryTemperamentsBatch(database, dotCodes) {
  if (!tableExists(database, 'occupation_tem_jolt') || !dotCodes.length) return {};
  const placeholders = dotCodes.map(() => '?').join(',');
  const rows = database.prepare(`SELECT * FROM occupation_tem_jolt WHERE dot_code IN (${placeholders})`).all(...dotCodes);
  return Object.fromEntries(rows.map((r) => [r.dot_code, r]));
}

function queryAlternateTitles(database, dotCode) {
  if (!tableExists(database, 'occupation_alternate_titles')) return [];
  const details = queryOccupationDetails(database, dotCode);
  if (!details || !details.doc_no) return [];
  return database.prepare('SELECT alternate_title FROM occupation_alternate_titles WHERE doc_no = ?').all(String(details.doc_no));
}

function queryAlternateTitlesBatch(database, docNos) {
  if (!tableExists(database, 'occupation_alternate_titles') || !docNos.length) return {};
  const placeholders = docNos.map(() => '?').join(',');
  const rows = database.prepare(`SELECT doc_no, alternate_title FROM occupation_alternate_titles WHERE doc_no IN (${placeholders})`).all(...docNos);
  const result = {};
  for (const row of rows) {
    if (!result[row.doc_no]) result[row.doc_no] = [];
    result[row.doc_no].push(row.alternate_title);
  }
  return result;
}

function queryEducationPrograms(database, dotCode) {
  if (!tableExists(database, 'dot_education')) return [];
  return database.prepare('SELECT caspar_title, cip90_title, cip90 FROM dot_education WHERE dot_code = ?').all(dotCode);
}

function queryEducationProgramsBatch(database, dotCodes) {
  if (!tableExists(database, 'dot_education') || !dotCodes.length) return {};
  const placeholders = dotCodes.map(() => '?').join(',');
  const rows = database.prepare(`SELECT dot_code, caspar_title, cip90_title, cip90 FROM dot_education WHERE dot_code IN (${placeholders})`).all(...dotCodes);
  const result = {};
  for (const row of rows) {
    if (!result[row.dot_code]) result[row.dot_code] = [];
    result[row.dot_code].push({ caspar_title: row.caspar_title, cip90_title: row.cip90_title, cip90: row.cip90 });
  }
  return result;
}

function queryViprJobDescription(database, dotCode) {
  if (!tableExists(database, 'vipr_job_descriptions')) return null;
  const row = database.prepare('SELECT job_description FROM vipr_job_descriptions WHERE dot_code = ?').get(dotCode);
  return row ? row.job_description : null;
}

function queryPersonalityType(database, typeCode) {
  if (!tableExists(database, 'personality_types') || !typeCode) return null;
  return database.prepare('SELECT * FROM personality_types WHERE personality_type = ?').get(typeCode) || null;
}

function queryEclrConstants(database) {
  if (!tableExists(database, 'eclr_constants')) return [];
  return database.prepare('SELECT * FROM eclr_constants').all();
}

function queryWagesByOccCode(database, occCode, stateAbbrev = null) {
  if (!tableExists(database, 'usbls_oes') || !occCode) return [];
  const normalizedOcc = String(occCode).trim();
  const WAGE_COLS = `area_title, occ_title, tot_emp, h_mean, a_mean, h_median, a_median,
              h_pct10, h_pct25, h_pct75, h_pct90, a_pct10, a_pct25, a_pct75, a_pct90`;
  if (stateAbbrev) {
    const stateRows = database.prepare(
      `SELECT ${WAGE_COLS} FROM usbls_oes WHERE occ_code = ? AND prim_state = ? AND area_type = 2
       ORDER BY tot_emp DESC LIMIT 5`
    ).all(normalizedOcc, stateAbbrev);
    if (stateRows.length) return stateRows;
  }
  const nationalRows = database.prepare(
    `SELECT ${WAGE_COLS} FROM usbls_oes WHERE occ_code = ? AND area_type = 3
     ORDER BY tot_emp DESC LIMIT 3`
  ).all(normalizedOcc);
  if (nationalRows.length) return nationalRows;
  return database.prepare(
    `SELECT ${WAGE_COLS} FROM usbls_oes WHERE occ_code = ? AND area_type = 2
     ORDER BY tot_emp DESC LIMIT 5`
  ).all(normalizedOcc);
}

function queryWagesByTitle(database, titleKeywords, stateAbbrev = null) {
  if (!tableExists(database, 'usbls_oes') || !titleKeywords) return [];
  const WAGE_COLS = `area_title, occ_title, tot_emp, h_mean, a_mean, h_median, a_median,
              h_pct10, h_pct25, h_pct75, h_pct90, a_pct10, a_pct25, a_pct75, a_pct90`;
  const stopWords = new Set(['and', 'the', 'for', 'with', 'not', 'all', 'other', 'n.e.c.', 'except']);
  const words = String(titleKeywords).toLowerCase().split(/[\s,]+/)
    .filter((w) => w.length > 2 && !stopWords.has(w)).slice(0, 3);
  if (!words.length) return [];
  /* Try each word individually for broader matching */
  for (const word of words) {
    const pattern = `%${word}%`;
    if (stateAbbrev) {
      const rows = database.prepare(
        `SELECT ${WAGE_COLS} FROM usbls_oes WHERE LOWER(occ_title) LIKE ? AND prim_state = ? AND area_type = 2
         ORDER BY tot_emp DESC LIMIT 3`
      ).all(pattern, stateAbbrev);
      if (rows.length) return rows;
    }
    const natRows = database.prepare(
      `SELECT ${WAGE_COLS} FROM usbls_oes WHERE LOWER(occ_title) LIKE ? AND area_type = 3
       ORDER BY tot_emp DESC LIMIT 3`
    ).all(pattern);
    if (natRows.length) return natRows;
  }
  return [];
}

function queryStrengthLevels(database) {
  if (!tableExists(database, 'strength_levels')) return {};
  const rows = database.prepare('SELECT * FROM strength_levels').all();
  return Object.fromEntries(rows.map((r) => [r.strength_level, r]));
}

function querySvpLevels(database) {
  if (!tableExists(database, 'svp_levels')) return {};
  const rows = database.prepare('SELECT * FROM svp_levels').all();
  return Object.fromEntries(rows.map((r) => [r.svp_level, r]));
}

const TEM_LABELS = {
  tem_dir: 'Directing-Control-Planning (DCP)',
  tem_rep: 'Repetitive/Short Cycle (REP)',
  tem_inf: 'Influencing People (INFLU)',
  tem_var: 'Variety and Change (VARCH)',
  tem_exp: 'Expressing Feelings (DEPL)',
  tem_alo: 'Working Alone (ISOL)',
  tem_str: 'Stress (STS)',
  tem_tol: 'Tolerances (MVC)',
  tem_und: 'Under Specific Instructions (USI)',
  tem_peo: 'Dealing with People (PUS)',
  tem_jud: 'Making Judgments (SJC)'
};

const PD_LABELS = {
  PD1: { 1: 'Sedentary', 2: 'Light', 3: 'Medium', 4: 'Heavy', 5: 'Very Heavy' },
  PD2: { 0: 'Not Present', 1: 'Present' },
  PD3: { 0: 'Not Present', 1: 'Present' },
  PD4: { 0: 'Not Present', 1: 'Present' },
  PD5: { 0: 'Not Present', 1: 'Present' },
  PD6: { 0: 'Not Present', 1: 'Present' }
};

const PD_DESCRIPTIONS = {
  PD1: 'Strength',
  PD2: 'Climbing and/or Balancing',
  PD3: 'Stooping, Kneeling, Crouching, and/or Crawling',
  PD4: 'Reaching, Handling, Fingering, and/or Feeling',
  PD5: 'Talking and/or Hearing',
  PD6: 'Seeing'
};

function enrichJobWithDetails(job, detailsMap, temMap, altTitlesMap, educationMap) {
  const dot = job.dot_code;
  const details = detailsMap[dot] || null;
  const tem = temMap[dot] || null;
  const docNo = details ? String(details.doc_no) : null;
  const altTitles = docNo ? (altTitlesMap[docNo] || []) : [];
  const education = educationMap[dot] || [];

  return {
    ...job,
    occupation_details: details ? {
      holland_title: details.holland_title || null,
      goe_ia: details.goe_ia || null,
      goe_ia_title: details.goe_ia_title || null,
      d_function: details.d_function || null,
      p_function: details.p_function || null,
      t_function: details.t_function || null,
      data_level: details.data_level || null,
      people_level: details.people_level || null,
      things_level: details.things_level || null,
      oes_code: details.oes_code || null,
      oes_title: details.oes_title || null,
      soc_title: details.soc_title || null,
      category: details.category || null,
      division: details.division || null,
      grp_name: details.grp_name || null,
      svp_length: details.svp_length || null
    } : null,
    temperaments: tem ? {
      dir: tem.tem_dir, rep: tem.tem_rep, inf: tem.tem_inf, var: tem.tem_var,
      exp: tem.tem_exp, alo: tem.tem_alo, str: tem.tem_str, tol: tem.tem_tol,
      und: tem.tem_und, peo: tem.tem_peo, jud: tem.tem_jud
    } : null,
    alternate_titles: altTitles,
    education_programs: education
  };
}

function buildReportSummary(results, selectedJob, traitGaps, selectionContext = {}) {
  const requestedDotCode = selectionContext.requestedDotCode || null;
  const selectedIncludedInResults = !!selectionContext.selectedIncludedInResults;
  const scores = results
    .map((row) => Number(row.match_score))
    .filter((value) => Number.isFinite(value));

  const avgScore = scores.length > 0 ? round1(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
  const highestDemand = [...results]
    .filter((row) => row.job_count !== null && row.job_count !== undefined)
    .sort((a, b) => b.job_count - a.job_count)[0];
  const primaryGaps = traitGaps
    .filter((row) => row.deficit > 0)
    .sort((a, b) => b.deficit - a.deficit)
    .slice(0, 5)
    .map((row) => ({
      code: row.code,
      label: row.label,
      deficit: row.deficit
    }));

  return {
    result_count: results.length,
    average_match_score: avgScore,
    best_match: results[0] || null,
    lowest_match: results.length > 0 ? results[results.length - 1] : null,
    highest_demand_in_results: highestDemand || null,
    selected_requested_dot_code: requestedDotCode,
    selected_included_in_results: selectedIncludedInResults,
    selected_dot_code: selectedJob?.dot_code || null,
    selected_match_score: selectedJob?.match_score ?? null,
    selected_deficit: selectedJob?.deficit ?? null,
    selected_primary_gaps: primaryGaps
  };
}

function buildTransferableReportSummary(results, selectedJob, tspBandCounts, selectionContext = {}, aggregate = null) {
  const requestedDotCode = selectionContext.requestedDotCode || null;
  const selectedIncludedInResults = !!selectionContext.selectedIncludedInResults;
  const tspScores = results
    .map((row) => Number(row.tsp_percent))
    .filter((value) => Number.isFinite(value));
  const vaAdjustments = results
    .map((row) => Number(row.va_adjustment_percent))
    .filter((value) => Number.isFinite(value));
  const pagedAvgTsp = tspScores.length > 0 ? round1(tspScores.reduce((sum, value) => sum + value, 0) / tspScores.length) : null;
  const pagedAvgVaAdjustment =
    vaAdjustments.length > 0 ? round1(vaAdjustments.reduce((sum, value) => sum + value, 0) / vaAdjustments.length) : null;
  const avgTsp =
    aggregate && Number.isFinite(Number(aggregate.average_tsp_percent))
      ? Number(aggregate.average_tsp_percent)
      : pagedAvgTsp;
  const avgVaAdjustment =
    aggregate && Number.isFinite(Number(aggregate.average_va_adjustment_percent))
      ? Number(aggregate.average_va_adjustment_percent)
      : pagedAvgVaAdjustment;
  const resultCount =
    aggregate && Number.isFinite(Number(aggregate.result_count)) ? Number(aggregate.result_count) : results.length;
  const highestDemand = [...results]
    .filter((row) => row.job_count !== null && row.job_count !== undefined)
    .sort((a, b) => b.job_count - a.job_count)[0];

  return {
    result_count: resultCount,
    average_tsp_percent: avgTsp,
    average_va_adjustment_percent: avgVaAdjustment,
    highest_tsp: results[0] || null,
    lowest_tsp: results.length > 0 ? results[results.length - 1] : null,
    highest_demand_in_results: highestDemand || null,
    selected_requested_dot_code: requestedDotCode,
    selected_included_in_results: selectedIncludedInResults,
    selected_dot_code: selectedJob?.dot_code || null,
    selected_tsp_percent: selectedJob?.tsp_percent ?? null,
    selected_tsp_percent_unadjusted: selectedJob?.tsp_percent_unadjusted ?? null,
    selected_va_adjustment_percent: selectedJob?.va_adjustment_percent ?? null,
    selected_tsp_level: selectedJob?.tsp_level ?? null,
    selected_transfer_direction: selectedJob?.transfer_direction ?? null,
    selected_best_source_dot_code: selectedJob?.best_source_dot_code ?? null,
    selected_best_source_title: selectedJob?.best_source_title ?? null,
    source_dot_codes: selectionContext.sourceDots || [],
    source_dot_count: Array.isArray(selectionContext.sourceDots) ? selectionContext.sourceDots.length : 0,
    tsp_band_counts: tspBandCounts || buildTspBandCounts([])
  };
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 'n/a';
  }
  return numeric.toLocaleString();
}

function formatDecimal(value, digits = 1) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 'n/a';
  }
  return numeric.toFixed(digits);
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

function formatProfileVector(profileValues) {
  if (!Array.isArray(profileValues) || profileValues.length !== TRAITS.length) {
    return 'n/a';
  }
  return profileValues.map((value) => formatNumber(value)).join('');
}

function buildMatchReportMarkdown(report) {
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

  lines.push('## Client Profile');
  lines.push('');
  const traits = report.profile?.traits || [];
  const values = report.profile?.values || [];
  traits.forEach((trait, index) => {
    lines.push(`- ${trait.code} (${trait.label}): ${values[index] ?? 'n/a'}`);
  });
  lines.push('');

  lines.push('## Selected Job');
  lines.push('');
  if (!selected) {
    lines.push('No selected job.');
    lines.push('');
  } else {
    lines.push(`- Title: ${selected.title}`);
    lines.push(`- DOT: ${selected.dot_code}`);
    lines.push(`- Match: ${formatDecimal(selected.match_score)}%`);
    lines.push(`- Deficit: ${formatNumber(selected.deficit)}`);
    lines.push(`- Jobs in region: ${formatNumber(selected.job_count)}`);
    lines.push(`- VQ/SVP: ${formatDecimal(selected.vq)} / ${formatNumber(selected.svp)}`);
    lines.push(`- Population: ${formatNumber(selected.population)}`);
    lines.push(
      `- Skill VQ/Alt/Bucket: ${formatDecimal(selected.skill_vq, 2)} / ${formatDecimal(selected.skill_alt, 2)} / ${formatNumber(selected.skill_bucket)}`
    );
    lines.push(`- ONET: ${selected.onet_ou_code || 'n/a'}`);
    lines.push(`- Disability Code: ${selected.disability_code || 'n/a'}`);
    lines.push('');

    lines.push('### Trait Gaps');
    lines.push('');
    const traitGaps = selected.trait_gaps || [];
    if (!traitGaps.length) {
      lines.push('- No trait gap data.');
    } else {
      traitGaps
        .filter((row) => row.deficit > 0)
        .sort((a, b) => b.deficit - a.deficit)
        .forEach((row) => {
          lines.push(`- ${row.code} (${row.label}): profile ${row.profile_value}, requires ${row.required_value}, deficit ${row.deficit}`);
        });
      if (!traitGaps.some((row) => row.deficit > 0)) {
        lines.push('- No deficits.');
      }
    }
    lines.push('');

    lines.push('### Task Statements');
    lines.push('');
    const tasks = selected.tasks || [];
    if (!tasks.length) {
      lines.push('- No tasks available.');
    } else {
      tasks.slice(0, 20).forEach((task, index) => {
        lines.push(`${index + 1}. ${task.description}`);
      });
    }
    lines.push('');

    lines.push('### Top State Counts');
    lines.push('');
    const topStates = selected.top_states || [];
    if (!topStates.length) {
      lines.push('- No state counts available.');
    } else {
      topStates.forEach((row) => {
        lines.push(`- ${row.state_abbrev} (${row.state_name}): ${row.job_count}`);
      });
    }
    lines.push('');

    lines.push('### Top County Counts (Selected State)');
    lines.push('');
    const topCounties = selected.top_counties || [];
    if (!topCounties.length) {
      lines.push('- No county counts available.');
    } else {
      topCounties.forEach((row) => {
        lines.push(`- ${row.county_name}: ${row.job_count}`);
      });
    }
    lines.push('');
  }

  lines.push('## Ranked Matches');
  lines.push('');
  lines.push('| Rank | DOT | Title | Match % | Deficit | Jobs | VQ | SVP |');
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |');
  (report.matches || []).slice(0, 40).forEach((row, index) => {
    lines.push(
      `| ${index + 1} | ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title)} | ${formatDecimal(row.match_score)} | ${formatNumber(row.deficit)} | ${formatNumber(row.job_count)} | ${formatDecimal(row.vq)} | ${formatNumber(row.svp)} |`
    );
  });

  return `${lines.join('\n')}\n`;
}

function buildTransferableReportMarkdown(report) {
  const selected = report.selected_job;
  const lines = [];
  const sourceJobs = Array.isArray(report.source_jobs) ? report.source_jobs : [];
  const sourceDotList = sourceJobs.map((row) => row.dot_code).filter(Boolean);
  const summary = report.summary || {};
  const bandCounts = report.tsp_band_counts || {};
  const profileValues = report.profile?.values || null;
  const basis = report.analysis_basis || {};
  const basisNotes = Array.isArray(basis.notes) ? basis.notes : [];
  const basisFactors = Array.isArray(basis.factors) ? basis.factors : [];

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
  lines.push(`- Match pool total: ${report.match_pool_total ?? 'n/a'}`);
  lines.push(`- Included matches in report: ${report.matches?.length ?? 0}`);
  lines.push('');

  lines.push('## Report 3: Worker Trait Profiles');
  lines.push('');
  lines.push(`- Evaluative profile vector (24 traits): ${formatProfileVector(profileValues)}`);
  lines.push('- Trait order: R M L S P Q K F M E C | PD1..PD6 | EC1..EC7');
  lines.push('');
  lines.push('| Source DOT | Title | VQ | SVP | Trait Vector |');
  lines.push('| --- | --- | ---: | ---: | --- |');
  if (!sourceJobs.length) {
    lines.push('| n/a | n/a | n/a | n/a | n/a |');
  } else {
    sourceJobs.forEach((row) => {
      lines.push(
        `| ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title || 'Untitled')} | ${formatDecimal(row.vq)} | ${formatNumber(row.svp)} | ${asMarkdownCell(row.trait_vector || '')} |`
      );
    });
  }
  lines.push('');

  lines.push('## Report 4: Transferable Skills Availability and Utilization');
  lines.push('');
  lines.push(
    `- Average TSP: ${summary.average_tsp_percent === null || summary.average_tsp_percent === undefined ? 'n/a' : `${formatDecimal(summary.average_tsp_percent)}%`}`
  );
  lines.push(
    `- Average VA adjustment: ${summary.average_va_adjustment_percent === null || summary.average_va_adjustment_percent === undefined ? 'n/a' : `${formatDecimal(summary.average_va_adjustment_percent)}%`}`
  );
  lines.push(
    `- Band totals: L5 ${formatNumber(bandCounts.level_5)} | L4 ${formatNumber(bandCounts.level_4)} | L3 ${formatNumber(bandCounts.level_3)} | L2 ${formatNumber(bandCounts.level_2)} | L1 ${formatNumber(bandCounts.level_1)}`
  );
  lines.push('');
  lines.push('| TS Level | Range | Count |');
  lines.push('| --- | --- | ---: |');
  TSP_LEVELS.forEach((levelRow) => {
    lines.push(
      `| ${levelRow.level} (${levelRow.label}) | ${levelRow.min}-${Math.floor(levelRow.max)} | ${formatNumber(
        bandCounts[`level_${levelRow.level}`] || 0
      )} |`
    );
  });
  lines.push('');

  lines.push('## Report 5: Work History Job Demands / Worker Trait Requirements');
  lines.push('');
  lines.push('| DOT | Job Title | VQ | SVP | O*NET | Skill Level | Trait Vector |');
  lines.push('| --- | --- | ---: | ---: | --- | --- | --- |');
  if (!sourceJobs.length) {
    lines.push('| n/a | n/a | n/a | n/a | n/a | n/a | n/a |');
  } else {
    sourceJobs.forEach((row) => {
      lines.push(
        `| ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title || 'Untitled')} | ${formatDecimal(row.vq)} | ${formatNumber(row.svp)} | ${asMarkdownCell(row.onet_ou_code || '')} | ${deriveSkillLevelLabel(row.vq, row.svp)} | ${asMarkdownCell(row.trait_vector || '')} |`
      );
    });
  }
  lines.push('');

  lines.push('## Report 8: Job Matches by Transferable Skills (TS) - Job Demands');
  lines.push('');
  lines.push('| Rank | DOT | Job Title | VQ | SVP | TS % | VA Adj % | Level | Best Source DOT | VIPR | Skill Level |');
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |');
  (report.matches || []).slice(0, 86).forEach((row, index) => {
    lines.push(
      `| ${index + 1} | ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title)} | ${formatDecimal(row.vq)} | ${formatNumber(row.svp)} | ${formatDecimal(row.tsp_percent)} | ${formatDecimal(row.va_adjustment_percent)} | ${formatNumber(row.tsp_level)} ${asMarkdownCell(row.tsp_label || '')} | ${asMarkdownCell(row.best_source_dot_code || '')} | ${asMarkdownCell(row.vipr_type || 'n/a')} | ${deriveSkillLevelLabel(row.vq, row.svp)} |`
    );
  });
  lines.push('');

  lines.push('## Selected Target Job Detail');
  lines.push('');
  if (!selected) {
    lines.push('No selected job.');
  } else {
    const signals = selected.signal_scores || {};
    lines.push(`- Title: ${selected.title}`);
    lines.push(`- DOT: ${selected.dot_code}`);
    lines.push(`- TSP (adjusted): ${formatDecimal(selected.tsp_percent)}%`);
    lines.push(`- TSP (unadjusted): ${formatDecimal(selected.tsp_percent_unadjusted)}%`);
    lines.push(`- VA adjustment: ${formatDecimal(selected.va_adjustment_percent)}%`);
    lines.push(`- TSP Level: ${formatNumber(selected.tsp_level)} (${selected.tsp_label || 'n/a'})`);
    lines.push(`- Transfer Direction: ${selected.transfer_direction || 'n/a'}`);
    lines.push(`- Best Source DOT: ${selected.best_source_dot_code || 'n/a'}`);
    lines.push(`- Best Source Title: ${selected.best_source_title || 'n/a'}`);
    lines.push(`- Jobs in region: ${formatNumber(selected.job_count)}`);
    lines.push(`- Tier rule: ${selected.mtsp_tier_rule || 'n/a'}`);
    lines.push(
      `- Signal scores: DOT ${formatDecimal(signals.dot_prefix, 3)}, O*NET ${formatDecimal(signals.onet_prefix, 3)}, VQ ${formatDecimal(signals.vq_proximity, 3)}, SVP ${formatDecimal(signals.svp_proximity, 3)}, Core ${formatDecimal(signals.tier_core_score, 3)}, Progress ${formatDecimal(signals.in_tier_progress, 3)}`
    );
    lines.push('');
    lines.push('### Task Statements');
    const tasks = selected.tasks || [];
    if (!tasks.length) {
      lines.push('- No tasks available.');
    } else {
      tasks.slice(0, 20).forEach((task, index) => {
        lines.push(`${index + 1}. ${task.description}`);
      });
    }
  }
  lines.push('');

  lines.push('## Methodology Notes');
  lines.push('');
  lines.push(`- Analysis model: ${basis.model || 'n/a'}`);
  basisFactors.forEach((factor) => lines.push(`- Factor: ${factor}`));
  basisNotes.forEach((note) => lines.push(`- Note: ${note}`));
  lines.push(`- Source selection rule: ${basis.source_selection || 'n/a'}`);

  return `${lines.join('\n')}\n`;
}

function buildReportMarkdown(report, caseContext = {}) {
  const viewModel = buildReportViewModel(report, caseContext);
  return renderReportMarkdown(viewModel);
}

function buildReportHtml(report, caseContext = {}) {
  const viewModel = buildReportViewModel(report, caseContext);
  return renderReportHtml(viewModel);
}

function buildReportSections(report) {
  if (report?.report_type === 'mvqs_transferable_skills_report') {
    return [
      { id: 'report1', title: 'Report 1: Client Identification, Labor Market Area, and Referral' },
      { id: 'report3', title: 'Report 3: Worker Trait Profiles' },
      { id: 'report4', title: 'Report 4: Transferable Skills Availability and Utilization' },
      { id: 'report5', title: 'Report 5: Work History Job Demands / Worker Trait Requirements' },
      { id: 'report6', title: 'Report 6: Work History Crosswalk Codes by VQ' },
      { id: 'report7', title: 'Report 7: Work History Earning Capacity by VQ' },
      { id: 'report8', title: 'Report 8: Job Matches by Transferable Skills (TS) - Job Demands' },
      { id: 'report9', title: 'Report 9: Job Matches Crosswalk Codes by TS' },
      { id: 'report10', title: 'Report 10: Job Matches Earning Capacity by TS' }
    ];
  }
  return [
    { id: 'summary', title: 'Match Summary' },
    { id: 'selected_job', title: 'Selected Job' },
    { id: 'ranked_matches', title: 'Ranked Matches' }
  ];
}

function buildReportResponsePayload(report, caseContext = {}) {
  const reportHtml = buildReportHtml(report, caseContext);
  return {
    report,
    render_html: reportHtml,
    render_html_hash_sha256: sha256Hex(reportHtml),
    report_sections: buildReportSections(report)
  };
}

function sanitizeFileToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function buildSavedReportBaseName(savedReport) {
  const timestamp = String(savedReport.created_at_utc || nowIso()).replace(/[:.]/g, '-');
  const dot = sanitizeFileToken(savedReport.selected_dot_code || 'none');
  return `mvqs-saved-report-${savedReport.saved_report_id}-${dot}-${timestamp}`;
}

function buildCasePacketBaseName(savedReportId) {
  const timestamp = nowIso().replace(/[:.]/g, '-');
  return `mvqs-case-packet-${savedReportId}-${timestamp}`;
}

function buildCaseReportBundleBaseName(caseId) {
  const timestamp = nowIso().replace(/[:.]/g, '-');
  return `mvqs-case-report-bundle-${caseId}-${timestamp}`;
}

function getOpenAiConfig() {
  const apiKey = String(process.env.OPENAI_API_KEY || process.env.MVQS_OPENAI_API_KEY || '').trim();
  const model =
    String(process.env.MVQS_OPENAI_MODEL || process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL).trim() ||
    DEFAULT_OPENAI_MODEL;
  const keySource = process.env.OPENAI_API_KEY
    ? 'OPENAI_API_KEY'
    : process.env.MVQS_OPENAI_API_KEY
      ? 'MVQS_OPENAI_API_KEY'
      : null;
  return {
    enabled: !!apiKey,
    apiKey,
    model,
    keySource
  };
}

function extractOpenAiOutputText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text;
  }
  const output = Array.isArray(payload?.output) ? payload.output : [];
  const segments = [];
  output.forEach((item) => {
    const content = Array.isArray(item?.content) ? item.content : [];
    content.forEach((part) => {
      if (typeof part?.text === 'string' && part.text.trim()) {
        segments.push(part.text.trim());
      } else if (typeof part?.output_text === 'string' && part.output_text.trim()) {
        segments.push(part.output_text.trim());
      }
    });
  });
  return segments.join('\n\n').trim();
}

function buildAiNarrativePrompt(report, caseContext = {}, maxMatches = 25) {
  const summary = report?.summary || {};
  const selected = report?.selected_job || null;
  const sourceJobs = Array.isArray(report?.source_jobs) ? report.source_jobs.slice(0, 12) : [];
  const matches = Array.isArray(report?.matches) ? report.matches.slice(0, maxMatches) : [];
  const promptPayload = {
    case: {
      user_id: caseContext.user_id || null,
      first_name: caseContext.first_name || null,
      last_name: caseContext.last_name || null,
      case_reference: caseContext.case_reference || null,
      case_name: caseContext.case_name || null,
      city: caseContext.city || null,
      demographic_state_id: caseContext.demographic_state_id || null,
      demographic_county_id: caseContext.demographic_county_id || null,
      reason_for_referral: caseContext.reason_for_referral || null
    },
    report_meta: {
      report_type: report?.report_type || null,
      generated_at_utc: report?.generated_at_utc || null,
      methodology_version: report?.methodology_version || null,
      layout_version: report?.layout_version || null,
      parity_profile: report?.parity_profile || null
    },
    filters: report?.filters || {},
    report4_summary: summary?.report4 || null,
    source_jobs: sourceJobs.map((row) => ({
      dot_code: row?.dot_code || null,
      title: row?.title || null,
      vq: row?.vq ?? null,
      svp: row?.svp ?? null
    })),
    selected_job: selected
      ? {
          dot_code: selected.dot_code || null,
          title: selected.title || null,
          tsp_percent: selected.tsp_percent ?? null,
          tsp_level: selected.tsp_level ?? null,
          va_adjustment_percent: selected.va_adjustment_percent ?? null,
          job_count: selected.job_count ?? null,
          best_source_dot_code: selected.best_source_dot_code || null,
          transfer_direction: selected.transfer_direction || null
        }
      : null,
    top_matches: matches.map((row, index) => ({
      rank: index + 1,
      dot_code: row?.dot_code || null,
      title: row?.title || null,
      tsp_percent: row?.tsp_percent ?? null,
      tsp_level: row?.tsp_level ?? null,
      va_adjustment_percent: row?.va_adjustment_percent ?? null,
      best_source_dot_code: row?.best_source_dot_code || null,
      job_count: row?.job_count ?? null
    }))
  };

  return [
    'You are preparing a vocational expert narrative for an MVQS transferable-skills report.',
    'Use only the provided JSON data. Do not invent numbers, DOT codes, diagnoses, or legal conclusions.',
    'Return Markdown with these exact section headings:',
    '1) Referral Context',
    '2) Work History Basis',
    '3) Profile And Adjustment Method',
    '4) Transferable Skills Findings',
    '5) Reliability, Limits, And Replicability',
    'Rules:',
    '- Keep writing professional and court-ready.',
    '- Cite key values directly from the JSON when available.',
    '- If a field is missing, explicitly say "Not provided in dataset".',
    '- Include a short bullet list of top 5 matches with TS%, VA%, and DOT in section 4.',
    '- Do not include any markup besides Markdown.',
    '',
    'JSON data:',
    JSON.stringify(promptPayload, null, 2)
  ].join('\n');
}

async function generateAiNarrativeFromReport(report, caseContext = {}, options = {}) {
  const config = getOpenAiConfig();
  if (!config.enabled) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY (or MVQS_OPENAI_API_KEY).');
  }

  const maxMatches = Math.max(5, Math.min(40, Number(options.maxMatches) || 25));
  const prompt = buildAiNarrativePrompt(report, caseContext, maxMatches);
  const requestBody = {
    model: config.model,
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: 'Produce a concise, factual vocational narrative in Markdown.' }]
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: prompt }]
      }
    ],
    temperature: 0.2,
    max_output_tokens: 1400
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  let response;
  try {
    response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('OpenAI request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const raw = await response.text();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const message =
      (typeof payload?.error?.message === 'string' && payload.error.message) ||
      `OpenAI request failed (${response.status}).`;
    throw new Error(message);
  }

  const narrativeMarkdown = extractOpenAiOutputText(payload);
  if (!narrativeMarkdown) {
    throw new Error('OpenAI returned an empty narrative.');
  }

  return {
    narrativeMarkdown,
    model: payload?.model || config.model,
    usage: payload?.usage || null,
    responseId: payload?.id || null
  };
}

function parseMatchReportRequestInput(body) {
  const q = normalizeQuery(body.q);
  const regionInput = parseRegionFilterInput(body);
  if (regionInput.error) {
    return { error: regionInput.error };
  }
  const { stateId, countyId } = regionInput;

  const profile = parseProfile(body.profile);
  const limitParsed = parseClampedInteger(
    body.limit,
    'limit',
    1,
    REPORT_MAX_MATCH_LIMIT,
    REPORT_DEFAULT_MATCH_LIMIT
  );
  if (limitParsed.error) {
    return { error: limitParsed.error };
  }
  const taskLimitParsed = parseClampedInteger(
    body.taskLimit,
    'taskLimit',
    1,
    REPORT_MAX_TASK_LIMIT,
    REPORT_DEFAULT_TASK_LIMIT
  );
  if (taskLimitParsed.error) {
    return { error: taskLimitParsed.error };
  }
  const selectedDotParsed = parseDotCode(body.selectedDot, 'selectedDot', true);
  if (selectedDotParsed.error) {
    return { error: selectedDotParsed.error };
  }

  return {
    error: null,
    q,
    stateId,
    countyId,
    profile,
    limit: limitParsed.value,
    taskLimit: taskLimitParsed.value,
    selectedDotCode: selectedDotParsed.value
  };
}

function parseTransferableReportRequestInput(body) {
  const q = normalizeQuery(body.q);
  const regionInput = parseRegionFilterInput(body);
  if (regionInput.error) {
    return { error: regionInput.error };
  }
  const { stateId, countyId } = regionInput;
  const profile = parseProfile(body.profile);

  const sourceInput = body.sourceDots ?? body.sourceDot;
  const sourceDotsParsed = parseSourceDotCodes(sourceInput, 'sourceDots');
  if (sourceDotsParsed.error) {
    return { error: sourceDotsParsed.error };
  }

  const limitParsed = parseClampedInteger(
    body.limit,
    'limit',
    1,
    REPORT_MAX_MATCH_LIMIT,
    REPORT_DEFAULT_MATCH_LIMIT
  );
  if (limitParsed.error) {
    return { error: limitParsed.error };
  }
  const taskLimitParsed = parseClampedInteger(
    body.taskLimit,
    'taskLimit',
    1,
    REPORT_MAX_TASK_LIMIT,
    REPORT_DEFAULT_TASK_LIMIT
  );
  if (taskLimitParsed.error) {
    return { error: taskLimitParsed.error };
  }
  const selectedDotParsed = parseDotCode(body.selectedDot, 'selectedDot', true);
  if (selectedDotParsed.error) {
    return { error: selectedDotParsed.error };
  }

  return {
    error: null,
    q,
    stateId,
    countyId,
    profile,
    sourceDots: sourceDotsParsed.values,
    limit: limitParsed.value,
    taskLimit: taskLimitParsed.value,
    selectedDotCode: selectedDotParsed.value
  };
}

function buildMatchReport(database, { q, stateId, countyId, profile, limit, taskLimit, selectedDotCode }) {
  const region = resolveRegionContext(database, stateId, countyId);
  if (region.error) {
    return { error: region.error, report: null };
  }

  const { state, county } = region;
  const metadata = readMetadata(database);
  const ranked = queryRankedMatches(database, {
    q,
    stateId,
    countyId,
    profile,
    limit
  });

  const selectedFromRanked = selectedDotCode
    ? ranked.results.find((row) => row.dot_code === selectedDotCode) || null
    : null;
  const selectedByRequestedDot =
    selectedDotCode && !selectedFromRanked
      ? queryRankedMatchForDot(database, {
          q,
          stateId,
          countyId,
          profile,
          dotCode: selectedDotCode
        })
      : null;
  const selectedJob = selectedFromRanked || selectedByRequestedDot || ranked.results[0] || null;

  let selectedDetail = null;
  if (selectedJob) {
    selectedDetail = {
      ...selectedJob,
      trait_gaps: buildTraitGaps(profile, selectedJob.trait_vector),
      tasks: queryTasksForDot(database, selectedJob.dot_code, taskLimit),
      top_states: queryTopStatesForDot(database, selectedJob.dot_code, 12),
      top_counties: queryTopCountiesForDot(database, selectedJob.dot_code, stateId, countyId, 12)
    };
  }

  const selectedIncludedInResults =
    !!selectedDetail && ranked.results.some((row) => row.dot_code === selectedDetail.dot_code);
  const summary = buildReportSummary(
    ranked.results,
    selectedDetail,
    selectedDetail?.trait_gaps || [],
    {
      requestedDotCode: selectedDotCode || null,
      selectedIncludedInResults
    }
  );

  const report = {
    generated_at_utc: nowIso(),
    report_type: 'mvqs_match_report',
    layout_version: 'mtsp-canonical-html-v1',
    legacy_snapshot_id: metadata.legacy_snapshot_id || null,
    parity_profile: 'match_non_tsa',
    filters: {
      q,
      state_id: stateId,
      county_id: countyId,
      region: { state, county },
      requested_match_limit: limit,
      requested_task_limit: taskLimit
    },
    profile: {
      values: profile,
      traits: TRAITS
    },
    mvqs_coverage: {
      fields_used: REPORT_MVQS_FIELDS,
      metadata
    },
    match_pool_total: ranked.total,
    matches: ranked.results,
    selected_job: selectedDetail,
    summary
  };

  return { error: null, report };
}

function buildTransferableSkillsReport(
  database,
  { q, stateId, countyId, profile, sourceDots, limit, taskLimit, selectedDotCode, viprType }
) {
  const region = resolveRegionContext(database, stateId, countyId);
  if (region.error) {
    return { error: region.error, report: null };
  }

  const analysis = queryTransferableSkillsForSources(database, {
    sourceDots,
    q,
    stateId,
    countyId,
    limit,
    offset: 0,
    profile
  });
  if (!analysis.sourceJobs.length) {
    return { error: 'Source job not found', report: null };
  }
  if (analysis.missingSourceDots.length) {
    return { error: `Source DOTs not found: ${analysis.missingSourceDots.join(', ')}`, report: null };
  }
  const methodologyContext = analysis.methodology || resolveMethodologyContext();

  const selectedFromRanked = selectedDotCode
    ? analysis.results.find((row) => row.dot_code === selectedDotCode) || null
    : null;
  const selectedByRequestedDot =
    selectedDotCode && !selectedFromRanked
      ? queryTransferableSkillsForDot(database, {
          sourceJobs: analysis.sourceJobs,
          q,
          stateId,
          countyId,
          dotCode: selectedDotCode,
          profile,
          methodologyContext
        })
      : null;
  const selectedJob = selectedFromRanked || selectedByRequestedDot || analysis.results[0] || null;

  let selectedDetail = null;
  if (selectedJob) {
    selectedDetail = {
      ...selectedJob,
      tasks: queryTasksForDot(database, selectedJob.dot_code, taskLimit),
      top_states: queryTopStatesForDot(database, selectedJob.dot_code, 12),
      top_counties: queryTopCountiesForDot(database, selectedJob.dot_code, stateId, countyId, 12)
    };
  }

  const selectedIncludedInResults =
    !!selectedDetail && analysis.results.some((row) => row.dot_code === selectedDetail.dot_code);
  const summary = buildTransferableReportSummary(
    analysis.results,
    selectedDetail,
    analysis.tsp_band_counts,
    {
      requestedDotCode: selectedDotCode || null,
      selectedIncludedInResults,
      sourceDots: analysis.sourceJobs.map((row) => row.dot_code)
    },
    analysis.aggregate
  );
  const metadata = readMetadata(database);
  const section7Metadata = getSection7MethodologyMetadata();
  const { state, county } = region;

  /* ---- Enrich source jobs and matches with supplementary data ---- */
  const allDotCodes = [
    ...new Set([
      ...analysis.sourceJobs.map((r) => r.dot_code),
      ...analysis.results.map((r) => r.dot_code),
      ...(selectedDetail ? [selectedDetail.dot_code] : [])
    ])
  ].filter(Boolean);

  const detailsMap = queryOccupationDetailsBatch(database, allDotCodes);
  const temMap = queryTemperamentsBatch(database, allDotCodes);
  const docNos = [...new Set(Object.values(detailsMap).map((d) => String(d.doc_no)).filter(Boolean))];
  const altTitlesMap = queryAlternateTitlesBatch(database, docNos);
  const educationMap = queryEducationProgramsBatch(database, allDotCodes);

  const enrichedSourceJobs = analysis.sourceJobs.map((job) =>
    enrichJobWithDetails(job, detailsMap, temMap, altTitlesMap, educationMap)
  );
  const enrichedMatches = analysis.results.map((job) =>
    enrichJobWithDetails(job, detailsMap, temMap, altTitlesMap, educationMap)
  );
  let enrichedSelectedDetail = selectedDetail;
  if (selectedDetail) {
    enrichedSelectedDetail = enrichJobWithDetails(selectedDetail, detailsMap, temMap, altTitlesMap, educationMap);
    enrichedSelectedDetail.tasks = selectedDetail.tasks;
    enrichedSelectedDetail.top_states = selectedDetail.top_states;
    enrichedSelectedDetail.top_counties = selectedDetail.top_counties;
    enrichedSelectedDetail.vipr_job_description = queryViprJobDescription(database, selectedDetail.dot_code);
  }

  /* ---- ECLR distribution from eclr_constants ---- */
  const eclrConstants = queryEclrConstants(database);

  /* ---- VIPR personality type description ---- */
  const viprTypeCode = viprType || selectedDetail?.vipr_type || null;
  const viprPersonality = queryPersonalityType(database, viprTypeCode);

  /* ---- BLS wage data crosswalk for selected job ---- */
  let selectedJobWages = [];
  if (enrichedSelectedDetail?.occupation_details?.oes_code) {
    const oesCode = enrichedSelectedDetail.occupation_details.oes_code;
    const socFormatted = oesCode.length >= 5
      ? `${oesCode.slice(0, 2)}-${oesCode.slice(2)}`
      : oesCode;
    const stateAbbrev = state?.state_abbrev || null;
    selectedJobWages = queryWagesByOccCode(database, socFormatted, stateAbbrev);
    if (!selectedJobWages.length) {
      selectedJobWages = queryWagesByOccCode(database, socFormatted, null);
    }
  }
  /* Fallback: try title-based search if OES code didn't match */
  if (!selectedJobWages.length && enrichedSelectedDetail) {
    const oesTitle = enrichedSelectedDetail.occupation_details?.oes_title
      || enrichedSelectedDetail.occupation_details?.soc_title
      || enrichedSelectedDetail.title;
    if (oesTitle) {
      const stateAbbrev = state?.state_abbrev || null;
      selectedJobWages = queryWagesByTitle(database, oesTitle, stateAbbrev);
    }
  }

  /* ---- Reference lookups ---- */
  const strengthLevels = queryStrengthLevels(database);
  const svpLevels = querySvpLevels(database);

  const report = {
    generated_at_utc: nowIso(),
    report_type: 'mvqs_transferable_skills_report',
    methodology_version: methodologyContext.methodology_version,
    layout_version: methodologyContext.layout_version,
    legacy_snapshot_id: methodologyContext.legacy_snapshot_id || metadata.legacy_snapshot_id || null,
    parity_profile: methodologyContext.parity_profile,
    filters: {
      q,
      state_id: stateId,
      county_id: countyId,
      region: { state, county },
      requested_match_limit: limit,
      requested_task_limit: taskLimit,
      requested_source_dots: enrichedSourceJobs.map((row) => row.dot_code)
    },
    profile: {
      values: profile,
      traits: TRAITS
    },
    ...section7Metadata,
    analysis_basis: buildTransferableAnalysisBasis(methodologyContext),
    transferability_diagnostics: analysis.diagnostics || null,
    mvqs_coverage: {
      fields_used: REPORT_MVQS_FIELDS,
      metadata
    },
    match_pool_total: analysis.total,
    matches: enrichedMatches,
    source_jobs: enrichedSourceJobs,
    selected_job: enrichedSelectedDetail,
    tsp_levels: TSP_LEVELS,
    tsp_band_counts: analysis.tsp_band_counts,
    summary,
    enrichment: {
      eclr_constants: eclrConstants,
      vipr_personality: viprPersonality,
      selected_job_wages: selectedJobWages,
      strength_levels: strengthLevels,
      svp_levels: svpLevels,
      tem_labels: TEM_LABELS,
      pd_labels: PD_LABELS,
      pd_descriptions: PD_DESCRIPTIONS
    }
  };

  return { error: null, report };
}

async function buildPdfFromHtml(html, title) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' },
      displayHeaderFooter: false,
      preferCSSPageSize: false
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

function ensureSavedReportHtmlFields(row, caseContext = {}) {
  const reportObject = JSON.parse(row.report_json || '{}');
  const reportMarkdown = row.report_markdown || buildReportMarkdown(reportObject, caseContext);
  const reportMarkdownHash = row.report_hash_sha256 || sha256Hex(reportMarkdown);
  const reportHtml = row.report_html || buildReportHtml(reportObject, caseContext);
  const reportHtmlHash = row.report_html_hash_sha256 || sha256Hex(reportHtml);

  return {
    reportObject,
    reportMarkdown,
    reportMarkdownHash,
    reportHtml,
    reportHtmlHash
  };
}

function persistSavedReportDerivedFields(database, savedReportId, fields) {
  database
    .prepare(
      `
      UPDATE saved_reports
      SET
        report_markdown = ?,
        report_hash_sha256 = ?,
        report_html = ?,
        report_html_hash_sha256 = ?,
        updated_at_utc = ?
      WHERE saved_report_id = ?
      `
    )
    .run(
      fields.reportMarkdown,
      fields.reportMarkdownHash,
      fields.reportHtml,
      fields.reportHtmlHash,
      nowIso(),
      savedReportId
    );
}

function userExists(database, userId) {
  const row = database.prepare('SELECT user_id FROM users WHERE user_id = ?').get(userId);
  return !!row;
}

function parseSavedReportRow(row) {
  if (!row) {
    return null;
  }

  const reportObject = JSON.parse(row.report_json || '{}');
  const reportHtml = row.report_html || buildReportHtml(reportObject, {});
  const reportHtmlHash = row.report_html_hash_sha256 || sha256Hex(reportHtml);

  return {
    saved_report_id: row.saved_report_id,
    user_id: row.user_id,
    first_name: row.first_name || null,
    last_name: row.last_name || null,
    label: row.label || null,
    report_type: row.report_type,
    selected_dot_code: row.selected_dot_code,
    query_text: row.query_text,
    state_id: row.state_id,
    county_id: row.county_id,
    profile: JSON.parse(row.profile_json || '[]'),
    report: reportObject,
    report_hash_sha256: row.report_hash_sha256,
    report_html: reportHtml,
    report_html_hash_sha256: reportHtmlHash,
    created_at_utc: row.created_at_utc,
    updated_at_utc: row.updated_at_utc
  };
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(express.static(path.resolve(__dirname, '../public')));

app.get('/api/health', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({
      ok: false,
      dbReady: false,
      message:
        'Database not found. Run: npm run build:data -- --legacy-dir "<path to MVQS (1)>"'
    });
  }

  const database = getDb();
  const jobs = database.prepare('SELECT COUNT(*) AS count FROM jobs').get().count;
  const states = database.prepare('SELECT COUNT(*) AS count FROM states').get().count;
  const payload = { ok: true, dbReady: true, jobs, states };
  payload.appDbReady = appDbReady();
  if (payload.appDbReady) {
    const appDatabase = getAppDb();
    payload.users = appDatabase.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    payload.savedReports = appDatabase.prepare('SELECT COUNT(*) AS count FROM saved_reports').get().count;
    payload.psychometricResults = appDatabase.prepare('SELECT COUNT(*) AS count FROM psychometric_results').get().count;
  }
  if (process.env.NODE_ENV !== 'production') {
    payload.dbPath = DB_PATH;
    payload.appDbPath = APP_DB_PATH;
  }

  return res.json(payload);
});

app.get('/api/traits', (req, res) => {
  res.json({ traits: TRAITS, defaultProfile: DEFAULT_PROFILE });
});

app.get('/api/metadata', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const metadata = readMetadata(getDb());
  return res.json({ metadata });
});

app.get('/api/readiness', (req, res) => {
  const readiness = runReadinessChecks();
  return res.json(readiness);
});

app.get('/api/methodology/section7', (req, res) => {
  const section7 = getSection7Resolution();
  return res.json({
    ...section7,
    item_count: Array.isArray(section7.items) ? section7.items.length : 0,
    ...getSection7MethodologyMetadata()
  });
});

app.get('/api/ai/status', (req, res) => {
  const config = getOpenAiConfig();
  return res.json({
    enabled: config.enabled,
    model: config.model,
    configured_via: config.keySource,
    message: config.enabled
      ? 'AI narrative generation is enabled.'
      : 'OpenAI API key not configured. Set OPENAI_API_KEY (or MVQS_OPENAI_API_KEY) and restart.'
  });
});

app.get('/api/psychometrics/catalog', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const rows = getAppDb()
    .prepare(
      `
      SELECT test_code, test_name, domain, scale_min, scale_max, description
      FROM psychometric_catalog
      ORDER BY domain COLLATE NOCASE, test_name COLLATE NOCASE
      `
    )
    .all();

  return res.json({ tests: rows });
});

app.post('/api/psychometrics/catalog', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const body = req.body || {};
  const codeParsed = parseRequiredText(body.testCode, 'testCode', 64);
  if (codeParsed.error) {
    return res.status(400).json({ error: codeParsed.error });
  }
  const nameParsed = parseRequiredText(body.testName, 'testName', 200);
  if (nameParsed.error) {
    return res.status(400).json({ error: nameParsed.error });
  }
  const domainParsed = parseOptionalText(body.domain, 'domain', 120);
  if (domainParsed.error) {
    return res.status(400).json({ error: domainParsed.error });
  }
  const minParsed = parseOptionalFloat(body.scaleMin, 'scaleMin');
  if (minParsed.error) {
    return res.status(400).json({ error: minParsed.error });
  }
  const maxParsed = parseOptionalFloat(body.scaleMax, 'scaleMax');
  if (maxParsed.error) {
    return res.status(400).json({ error: maxParsed.error });
  }
  const descParsed = parseOptionalText(body.description, 'description', 1500);
  if (descParsed.error) {
    return res.status(400).json({ error: descParsed.error });
  }

  const code = codeParsed.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  if (!code) {
    return res.status(400).json({ error: 'testCode must contain at least one alphanumeric character' });
  }

  try {
    getAppDb()
      .prepare(
        `
        INSERT INTO psychometric_catalog (test_code, test_name, domain, scale_min, scale_max, description)
        VALUES (?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        code,
        nameParsed.value,
        domainParsed.value,
        minParsed.value,
        maxParsed.value,
        descParsed.value
      );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: 'testCode already exists' });
    }
    throw error;
  }

  return res.status(201).json({
    test: {
      test_code: code,
      test_name: nameParsed.value,
      domain: domainParsed.value,
      scale_min: minParsed.value,
      scale_max: maxParsed.value,
      description: descParsed.value
    }
  });
});

app.get('/api/users', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const includeInactive = String(req.query.includeInactive || '').trim() === '1';
  const whereSql = includeInactive ? '' : 'WHERE u.active = 1';
  const rows = getAppDb()
    .prepare(
      `
      SELECT
        u.user_id,
        u.external_id,
        u.first_name,
        u.last_name,
        u.email,
        u.case_reference,
        u.address_line1,
        u.address_line2,
        u.city,
        u.postal_code,
        u.country_name,
        u.demographic_state_id,
        u.demographic_county_id,
        u.case_name,
        u.reason_for_referral,
        u.claims_email,
        u.case_diagnosis,
        u.vipr_type,
        u.labor_market_area_label,
        u.evaluation_year,
        u.ts_display_mode,
        u.va_display_mode,
        u.report_header_notes,
        u.notes,
        u.active,
        u.created_at_utc,
        u.updated_at_utc,
        (
          SELECT COUNT(*)
          FROM psychometric_results pr
          WHERE pr.user_id = u.user_id
        ) AS psychometric_count,
        (
          SELECT COUNT(*)
          FROM saved_reports sr
          WHERE sr.user_id = u.user_id
        ) AS saved_report_count
      FROM users u
      ${whereSql}
      ORDER BY u.last_name COLLATE NOCASE, u.first_name COLLATE NOCASE, u.user_id
      `
    )
    .all();

  return res.json({ users: rows });
});

app.get('/api/cases', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  const includeInactive = String(req.query.includeInactive || '').trim() === '1';
  const cases = fetchCaseRows(getAppDb(), includeInactive);
  return res.json({ cases });
});

app.get('/api/cases/:caseId', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseRow = fetchCaseById(getAppDb(), caseParsed.value);
  if (!caseRow) {
    return res.status(404).json({ error: 'Case not found' });
  }
  return res.json({ case: caseRow });
});

app.post('/api/cases', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const normalized = normalizeCaseFields(req.body || {}, {});
  if (normalized.error) {
    return res.status(400).json({ error: normalized.error });
  }
  const values = normalized.values;

  if (values.demographic_state_id !== null || values.demographic_county_id !== null) {
    if (!dbReady()) {
      return res.status(503).json({ error: 'Database not ready for demographic region validation' });
    }
    const demographicRegion = resolveRegionContext(getDb(), values.demographic_state_id, values.demographic_county_id);
    if (demographicRegion.error) {
      return res.status(400).json({ error: demographicRegion.error.replace('stateId', 'demographicStateId').replace('countyId', 'demographicCountyId') });
    }
  }

  const timestamp = nowIso();
  let caseId;
  try {
    const result = getAppDb()
      .prepare(
        `
        INSERT INTO users (
          external_id,
          first_name,
          last_name,
          email,
          case_reference,
          address_line1,
          address_line2,
          city,
          postal_code,
          country_name,
          demographic_state_id,
          demographic_county_id,
          case_name,
          reason_for_referral,
          claims_email,
          case_diagnosis,
          vipr_type,
          labor_market_area_label,
          evaluation_year,
          ts_display_mode,
          va_display_mode,
          report_header_notes,
          notes,
          active,
          created_at_utc,
          updated_at_utc
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        values.external_id,
        values.first_name,
        values.last_name,
        values.email,
        values.case_reference,
        values.address_line1,
        values.address_line2,
        values.city,
        values.postal_code,
        values.country_name,
        values.demographic_state_id,
        values.demographic_county_id,
        values.case_name,
        values.reason_for_referral,
        values.claims_email,
        values.case_diagnosis,
        values.vipr_type,
        values.labor_market_area_label,
        values.evaluation_year,
        values.ts_display_mode,
        values.va_display_mode,
        values.report_header_notes,
        values.notes,
        values.active,
        timestamp,
        timestamp
      );
    caseId = Number(result.lastInsertRowid);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: 'externalId already exists' });
    }
    throw error;
  }

  const caseRow = fetchCaseById(getAppDb(), caseId);
  return res.status(201).json({ case: caseRow });
});

app.patch('/api/cases/:caseId', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseId = caseParsed.value;
  const database = getAppDb();
  const existing = fetchCaseById(database, caseId);
  if (!existing) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const normalized = normalizeCaseFields(req.body || {}, existing);
  if (normalized.error) {
    return res.status(400).json({ error: normalized.error });
  }
  const values = normalized.values;

  if (values.demographic_state_id !== null || values.demographic_county_id !== null) {
    if (!dbReady()) {
      return res.status(503).json({ error: 'Database not ready for demographic region validation' });
    }
    const demographicRegion = resolveRegionContext(getDb(), values.demographic_state_id, values.demographic_county_id);
    if (demographicRegion.error) {
      return res.status(400).json({ error: demographicRegion.error.replace('stateId', 'demographicStateId').replace('countyId', 'demographicCountyId') });
    }
  }

  try {
    database
      .prepare(
        `
        UPDATE users
        SET
          external_id = ?,
          first_name = ?,
          last_name = ?,
          email = ?,
          case_reference = ?,
          address_line1 = ?,
          address_line2 = ?,
          city = ?,
          postal_code = ?,
          country_name = ?,
          demographic_state_id = ?,
          demographic_county_id = ?,
          case_name = ?,
          reason_for_referral = ?,
          claims_email = ?,
          case_diagnosis = ?,
          vipr_type = ?,
          labor_market_area_label = ?,
          evaluation_year = ?,
          ts_display_mode = ?,
          va_display_mode = ?,
          report_header_notes = ?,
          notes = ?,
          active = ?,
          updated_at_utc = ?
        WHERE user_id = ?
        `
      )
      .run(
        values.external_id,
        values.first_name,
        values.last_name,
        values.email,
        values.case_reference,
        values.address_line1,
        values.address_line2,
        values.city,
        values.postal_code,
        values.country_name,
        values.demographic_state_id,
        values.demographic_county_id,
        values.case_name,
        values.reason_for_referral,
        values.claims_email,
        values.case_diagnosis,
        values.vipr_type,
        values.labor_market_area_label,
        values.evaluation_year,
        values.ts_display_mode,
        values.va_display_mode,
        values.report_header_notes,
        values.notes,
        values.active,
        nowIso(),
        caseId
      );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: 'externalId already exists' });
    }
    throw error;
  }

  const caseRow = fetchCaseById(database, caseId);
  return res.json({ case: caseRow });
});

app.delete('/api/cases/:caseId', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseId = caseParsed.value;
  const result = getAppDb().prepare('DELETE FROM users WHERE user_id = ?').run(caseId);
  if (result.changes < 1) {
    return res.status(404).json({ error: 'Case not found' });
  }
  return res.json({ ok: true, deletedCaseId: caseId });
});

app.get('/api/cases/:caseId/work-history-dots', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseId = caseParsed.value;
  const appDatabase = getAppDb();
  if (!userExists(appDatabase, caseId)) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const sourceDatabase = dbReady() ? getDb() : null;
  const rows = fetchCaseWorkHistory(appDatabase, sourceDatabase, caseId);
  return res.json({ caseId, rows });
});

app.put('/api/cases/:caseId/work-history-dots', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseId = caseParsed.value;
  const appDatabase = getAppDb();
  const sourceDatabase = getDb();
  if (!userExists(appDatabase, caseId)) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const sourceDotsInput = Array.isArray(req.body?.sourceDots) ? req.body.sourceDots : null;
  if (!sourceDotsInput) {
    return res.status(400).json({ error: 'sourceDots must be an array' });
  }
  const normalizedDots = [];
  for (let index = 0; index < sourceDotsInput.length; index += 1) {
    const entry = sourceDotsInput[index];
    const raw = typeof entry === 'object' && entry !== null ? entry.dotCode : entry;
    const parsed = parseDotCode(raw, `sourceDots[${index}]`);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }
    if (!normalizedDots.includes(parsed.value)) {
      normalizedDots.push(parsed.value);
    }
  }

  const jobsByDot = new Map(loadJobsByDots(sourceDatabase, normalizedDots).map((row) => [row.dot_code, row]));
  const missing = normalizedDots.filter((dotCode) => !jobsByDot.has(dotCode));
  if (missing.length) {
    return res.status(404).json({ error: `Source DOTs not found: ${missing.join(', ')}` });
  }

  const insert = appDatabase.prepare(
    `
    INSERT INTO case_work_history_dots (
      user_id,
      dot_code,
      display_order,
      title_snapshot,
      created_at_utc,
      updated_at_utc
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `
  );

  appDatabase.exec('BEGIN');
  try {
    appDatabase.prepare('DELETE FROM case_work_history_dots WHERE user_id = ?').run(caseId);
    normalizedDots.forEach((dotCode, index) => {
      const timestamp = nowIso();
      const job = jobsByDot.get(dotCode);
      insert.run(caseId, dotCode, index + 1, job?.title || null, timestamp, timestamp);
    });
    appDatabase.exec('COMMIT');
  } catch (error) {
    appDatabase.exec('ROLLBACK');
    throw error;
  }

  const rows = fetchCaseWorkHistory(appDatabase, sourceDatabase, caseId);
  return res.json({ caseId, rows });
});

app.post('/api/cases/:caseId/work-history-dots', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseId = caseParsed.value;
  const appDatabase = getAppDb();
  const sourceDatabase = getDb();
  if (!userExists(appDatabase, caseId)) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const dotParsed = parseDotCode(req.body?.dotCode, 'dotCode');
  if (dotParsed.error) {
    return res.status(400).json({ error: dotParsed.error });
  }
  const dotCode = dotParsed.value;

  const job = queryJobForAnalysis(sourceDatabase, dotCode);
  if (!job) {
    return res.status(404).json({ error: 'DOT not found' });
  }

  const maxOrder = appDatabase
    .prepare('SELECT COALESCE(MAX(display_order), 0) AS max_order FROM case_work_history_dots WHERE user_id = ?')
    .get(caseId).max_order;
  const timestamp = nowIso();
  try {
    appDatabase
      .prepare(
        `
        INSERT INTO case_work_history_dots (
          user_id,
          dot_code,
          display_order,
          title_snapshot,
          created_at_utc,
          updated_at_utc
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `
      )
      .run(caseId, dotCode, Number(maxOrder) + 1, job.title || null, timestamp, timestamp);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: 'DOT already exists in work history' });
    }
    throw error;
  }

  const rows = fetchCaseWorkHistory(appDatabase, sourceDatabase, caseId);
  return res.status(201).json({ caseId, rows });
});

app.delete('/api/cases/:caseId/work-history-dots/:dotCode', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const dotParsed = parseDotCode(req.params.dotCode, 'dotCode');
  if (dotParsed.error) {
    return res.status(400).json({ error: dotParsed.error });
  }
  const caseId = caseParsed.value;
  const dotCode = dotParsed.value;
  const appDatabase = getAppDb();
  if (!userExists(appDatabase, caseId)) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const deletion = appDatabase
    .prepare('DELETE FROM case_work_history_dots WHERE user_id = ? AND dot_code = ?')
    .run(caseId, dotCode);
  if (deletion.changes < 1) {
    return res.status(404).json({ error: 'Work history DOT not found' });
  }

  const reordered = fetchCaseWorkHistoryRows(appDatabase, caseId);
  const reorderStatement = appDatabase.prepare(
    'UPDATE case_work_history_dots SET display_order = ?, updated_at_utc = ? WHERE case_work_history_id = ?'
  );
  appDatabase.exec('BEGIN');
  try {
    reordered.forEach((row, index) => {
      reorderStatement.run(index + 1, nowIso(), row.case_work_history_id);
    });
    appDatabase.exec('COMMIT');
  } catch (error) {
    appDatabase.exec('ROLLBACK');
    throw error;
  }

  const rows = fetchCaseWorkHistory(appDatabase, dbReady() ? getDb() : null, caseId);
  return res.json({ caseId, rows });
});

app.get('/api/cases/:caseId/profiles', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseId = caseParsed.value;
  const appDatabase = getAppDb();
  const sourceDatabase = getDb();
  const caseRow = fetchCaseById(appDatabase, caseId);
  if (!caseRow) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const regionInput = parseRegionFilterInput(req.query);
  if (regionInput.error) {
    return res.status(400).json({ error: regionInput.error });
  }
  const clinicalModeParsed = parseOptionalBoolean(req.query.clinicalOverrideMode, 'clinicalOverrideMode');
  if (clinicalModeParsed.error) {
    return res.status(400).json({ error: clinicalModeParsed.error });
  }
  const residualCapParsed = parseOptionalBoolean(req.query.enforceResidualCap, 'enforceResidualCap');
  if (residualCapParsed.error) {
    return res.status(400).json({ error: residualCapParsed.error });
  }
  const regionStateId = regionInput.stateId ?? caseRow.demographic_state_id ?? null;
  const regionCountyId = regionInput.countyId ?? caseRow.demographic_county_id ?? null;

  const profileSet = upsertCaseProfiles({
    appDatabase,
    sourceDatabase,
    userId: caseId,
    regionStateId,
    regionCountyId,
    allowClinicalOverrides: clinicalModeParsed.value,
    enforceResidualCap: residualCapParsed.value
  });

  return res.json({
    caseId,
    profiles: buildProfilePayload(profileSet),
    source_jobs: profileSet.workHistoryJobs
  });
});

app.put('/api/cases/:caseId/profiles', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseId = caseParsed.value;
  const appDatabase = getAppDb();
  const sourceDatabase = getDb();
  const caseRow = fetchCaseById(appDatabase, caseId);
  if (!caseRow) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const regionInput = parseRegionFilterInput(req.body || {});
  if (regionInput.error) {
    return res.status(400).json({ error: regionInput.error });
  }
  const clinicalModeParsed = parseOptionalBoolean(req.body?.clinicalOverrideMode, 'clinicalOverrideMode');
  if (clinicalModeParsed.error) {
    return res.status(400).json({ error: clinicalModeParsed.error });
  }
  const residualCapParsed = parseOptionalBoolean(req.body?.enforceResidualCap, 'enforceResidualCap');
  if (residualCapParsed.error) {
    return res.status(400).json({ error: residualCapParsed.error });
  }
  const profile1Input = Array.isArray(req.body?.profile1) ? req.body.profile1 : null;
  const profile2Input = Array.isArray(req.body?.profile2) ? req.body.profile2 : null;
  const profile3Input = Array.isArray(req.body?.profile3) ? req.body.profile3 : null;
  const profile4Input = Array.isArray(req.body?.profile4) ? req.body.profile4 : null;
  if (profile1Input && profile1Input.length !== TRAITS.length) {
    return res.status(400).json({ error: `profile1 must include ${TRAITS.length} values` });
  }
  if (profile2Input && profile2Input.length !== TRAITS.length) {
    return res.status(400).json({ error: `profile2 must include ${TRAITS.length} values` });
  }
  if (profile3Input && profile3Input.length !== TRAITS.length) {
    return res.status(400).json({ error: `profile3 must include ${TRAITS.length} values` });
  }
  if (profile4Input && profile4Input.length !== TRAITS.length) {
    return res.status(400).json({ error: `profile4 must include ${TRAITS.length} values` });
  }

  const profileSet = upsertCaseProfiles({
    appDatabase,
    sourceDatabase,
    userId: caseId,
    regionStateId: regionInput.stateId ?? caseRow.demographic_state_id ?? null,
    regionCountyId: regionInput.countyId ?? caseRow.demographic_county_id ?? null,
    profile1Input,
    profile2Input,
    profile3Input,
    profile4Input,
    allowClinicalOverrides: clinicalModeParsed.value,
    enforceResidualCap: residualCapParsed.value
  });

  return res.json({
    caseId,
    profiles: buildProfilePayload(profileSet),
    source_jobs: profileSet.workHistoryJobs
  });
});

app.post('/api/cases/:caseId/analysis/transferable', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseId = caseParsed.value;
  const appDatabase = getAppDb();
  const sourceDatabase = getDb();
  const caseRow = fetchCaseById(appDatabase, caseId);
  if (!caseRow) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const missingFields = getCaseIntakeMissingFields(caseRow, sourceDatabase);
  if (missingFields.length) {
    return res.status(400).json({
      error: 'Case intake is incomplete. Complete required core fields before analysis.',
      missing_fields: missingFields
    });
  }

  const workHistory = fetchCaseWorkHistory(appDatabase, sourceDatabase, caseId);
  const sourceDots = workHistory.map((row) => row.dot_code);
  if (!sourceDots.length) {
    return res.status(400).json({ error: 'Add at least one work-history DOT before running analysis.' });
  }

  const regionInput = parseRegionFilterInput(req.body || {});
  if (regionInput.error) {
    return res.status(400).json({ error: regionInput.error });
  }
  const stateId = regionInput.stateId ?? caseRow.demographic_state_id ?? null;
  const countyId = regionInput.countyId ?? caseRow.demographic_county_id ?? null;
  const region = resolveRegionContext(sourceDatabase, stateId, countyId);
  if (region.error) {
    return res.status(400).json({ error: region.error });
  }

  const q = normalizeQuery(req.body?.q);
  const limitParsed = parseClampedInteger(
    req.body?.limit,
    'limit',
    1,
    TRANSFERABLE_MAX_LIMIT,
    TRANSFERABLE_DEFAULT_LIMIT
  );
  if (limitParsed.error) {
    return res.status(400).json({ error: limitParsed.error });
  }
  const offsetParsed = parseClampedInteger(req.body?.offset, 'offset', 0, 1_000_000, 0);
  if (offsetParsed.error) {
    return res.status(400).json({ error: offsetParsed.error });
  }

  const profileSet = upsertCaseProfiles({
    appDatabase,
    sourceDatabase,
    userId: caseId,
    regionStateId: stateId,
    regionCountyId: countyId
  });

  const pre = queryTransferableSkillsForSources(sourceDatabase, {
    sourceDots,
    q,
    stateId,
    countyId,
    limit: limitParsed.value,
    offset: offsetParsed.value,
    profile: profileSet.profile3
  });
  const post = queryTransferableSkillsForSources(sourceDatabase, {
    sourceDots,
    q,
    stateId,
    countyId,
    limit: limitParsed.value,
    offset: offsetParsed.value,
    profile: profileSet.profile4
  });
  if (!post.sourceJobs.length) {
    return res.status(404).json({ error: 'Source job not found' });
  }
  if (post.missingSourceDots.length) {
    return res.status(404).json({ error: `Source DOTs not found: ${post.missingSourceDots.join(', ')}` });
  }

  const residualPercent = computeResidualPercent(pre.total, post.total);
  const methodology = post.methodology || pre.methodology || resolveMethodologyContext();
  const report3Summary = {
    profile1: profileSet.profile1,
    profile2: profileSet.profile2,
    profile3: profileSet.profile3,
    profile4: profileSet.profile4,
    vq_estimates: {
      profile1_vq_est: profileSet.profile1VqEst,
      profile2_vq_est: profileSet.profile2VqEst,
      profile3_vq_est: profileSet.profile3VqEst,
      profile4_vq_est: profileSet.profile4VqEst,
      estimated: false,
      method: 'legacy_profile_vq_formula_v1'
    }
  };
  const report4Summary = {
    pre: {
      total_jobs: pre.total,
      avg_tsp_percent: buildTransferableReportSummary(
        pre.results,
        pre.results[0] || null,
        pre.tsp_band_counts,
        {},
        pre.aggregate
      ).average_tsp_percent,
      diagnostics: pre.diagnostics
    },
    post: {
      total_jobs: post.total,
      avg_tsp_percent: buildTransferableReportSummary(
        post.results,
        post.results[0] || null,
        post.tsp_band_counts,
        {},
        post.aggregate
      ).average_tsp_percent,
      diagnostics: post.diagnostics
    },
    residual_percent: residualPercent
  };

  return res.json({
    caseId,
    region: { state: region.state, county: region.county },
    source_dots: sourceDots,
    source_jobs: post.sourceJobs,
    methodology: buildMethodologyPayload(methodology),
    analysis_basis: buildTransferableAnalysisBasis(methodology),
    profiles: buildProfilePayload(profileSet),
    report3_summary: report3Summary,
    report4_summary: report4Summary,
    tsp_levels: TSP_LEVELS,
    tsp_band_counts: post.tsp_band_counts,
    total: post.total,
    results: post.results,
    limit: limitParsed.value,
    offset: offsetParsed.value
  });
});

app.get('/api/users/:userId', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const userParsed = parseRequiredInteger(req.params.userId, 'userId');
  if (userParsed.error) {
    return res.status(400).json({ error: userParsed.error });
  }
  const userId = userParsed.value;

  const user = getAppDb()
    .prepare(
      `
      SELECT
        user_id,
        external_id,
        first_name,
        last_name,
        email,
        case_reference,
        address_line1,
        address_line2,
        city,
        postal_code,
        country_name,
        demographic_state_id,
        demographic_county_id,
        case_name,
        reason_for_referral,
        claims_email,
        case_diagnosis,
        vipr_type,
        labor_market_area_label,
        evaluation_year,
        ts_display_mode,
        va_display_mode,
        report_header_notes,
        notes,
        active,
        created_at_utc,
        updated_at_utc
      FROM users
      WHERE user_id = ?
      `
    )
    .get(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user });
});

app.post('/api/users', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const body = req.body || {};
  const normalized = normalizeCaseFields(body, {});
  if (normalized.error) {
    return res.status(400).json({ error: normalized.error });
  }
  const values = normalized.values;

  if (values.demographic_state_id !== null || values.demographic_county_id !== null) {
    if (!dbReady()) {
      return res.status(503).json({ error: 'Database not ready for demographic region validation' });
    }
    const demographicRegion = resolveRegionContext(getDb(), values.demographic_state_id, values.demographic_county_id);
    if (demographicRegion.error) {
      return res.status(400).json({ error: demographicRegion.error.replace('stateId', 'demographicStateId').replace('countyId', 'demographicCountyId') });
    }
  }

  const timestamp = nowIso();
  let userId;
  try {
    const result = getAppDb()
      .prepare(
        `
        INSERT INTO users (
          external_id,
          first_name,
          last_name,
          email,
          case_reference,
          address_line1,
          address_line2,
          city,
          postal_code,
          country_name,
          demographic_state_id,
          demographic_county_id,
          case_name,
          reason_for_referral,
          claims_email,
          case_diagnosis,
          vipr_type,
          labor_market_area_label,
          evaluation_year,
          ts_display_mode,
          va_display_mode,
          report_header_notes,
          notes,
          active,
          created_at_utc,
          updated_at_utc
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        values.external_id,
        values.first_name,
        values.last_name,
        values.email,
        values.case_reference,
        values.address_line1,
        values.address_line2,
        values.city,
        values.postal_code,
        values.country_name,
        values.demographic_state_id,
        values.demographic_county_id,
        values.case_name,
        values.reason_for_referral,
        values.claims_email,
        values.case_diagnosis,
        values.vipr_type,
        values.labor_market_area_label,
        values.evaluation_year,
        values.ts_display_mode,
        values.va_display_mode,
        values.report_header_notes,
        values.notes,
        values.active,
        timestamp,
        timestamp
      );
    userId = Number(result.lastInsertRowid);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: 'externalId already exists' });
    }
    throw error;
  }

  const user = getAppDb()
    .prepare(
      `
      SELECT
        user_id,
        external_id,
        first_name,
        last_name,
        email,
        case_reference,
        address_line1,
        address_line2,
        city,
        postal_code,
        country_name,
        demographic_state_id,
        demographic_county_id,
        case_name,
        reason_for_referral,
        claims_email,
        case_diagnosis,
        vipr_type,
        labor_market_area_label,
        evaluation_year,
        ts_display_mode,
        va_display_mode,
        report_header_notes,
        notes,
        active,
        created_at_utc,
        updated_at_utc
      FROM users
      WHERE user_id = ?
      `
    )
    .get(userId);

  return res.status(201).json({ user });
});

app.patch('/api/users/:userId', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const userParsed = parseRequiredInteger(req.params.userId, 'userId');
  if (userParsed.error) {
    return res.status(400).json({ error: userParsed.error });
  }
  const userId = userParsed.value;
  const database = getAppDb();
  const existing = database
    .prepare(
      `
      SELECT
        user_id,
        external_id,
        first_name,
        last_name,
        email,
        case_reference,
        address_line1,
        address_line2,
        city,
        postal_code,
        country_name,
        demographic_state_id,
        demographic_county_id,
        case_name,
        reason_for_referral,
        claims_email,
        case_diagnosis,
        vipr_type,
        labor_market_area_label,
        evaluation_year,
        ts_display_mode,
        va_display_mode,
        report_header_notes,
        notes,
        active,
        created_at_utc,
        updated_at_utc
      FROM users
      WHERE user_id = ?
      `
    )
    .get(userId);
  if (!existing) {
    return res.status(404).json({ error: 'User not found' });
  }

  const body = req.body || {};
  const normalized = normalizeCaseFields(body, existing);
  if (normalized.error) {
    return res.status(400).json({ error: normalized.error });
  }
  const values = normalized.values;
  if (values.demographic_state_id !== null || values.demographic_county_id !== null) {
    if (!dbReady()) {
      return res.status(503).json({ error: 'Database not ready for demographic region validation' });
    }
    const demographicRegion = resolveRegionContext(getDb(), values.demographic_state_id, values.demographic_county_id);
    if (demographicRegion.error) {
      return res.status(400).json({ error: demographicRegion.error.replace('stateId', 'demographicStateId').replace('countyId', 'demographicCountyId') });
    }
  }

  try {
    database
      .prepare(
        `
        UPDATE users
        SET
          external_id = ?,
          first_name = ?,
          last_name = ?,
          email = ?,
          case_reference = ?,
          address_line1 = ?,
          address_line2 = ?,
          city = ?,
          postal_code = ?,
          country_name = ?,
          demographic_state_id = ?,
          demographic_county_id = ?,
          case_name = ?,
          reason_for_referral = ?,
          claims_email = ?,
          case_diagnosis = ?,
          vipr_type = ?,
          labor_market_area_label = ?,
          evaluation_year = ?,
          ts_display_mode = ?,
          va_display_mode = ?,
          report_header_notes = ?,
          notes = ?,
          active = ?,
          updated_at_utc = ?
        WHERE user_id = ?
        `
      )
      .run(
        values.external_id,
        values.first_name,
        values.last_name,
        values.email,
        values.case_reference,
        values.address_line1,
        values.address_line2,
        values.city,
        values.postal_code,
        values.country_name,
        values.demographic_state_id,
        values.demographic_county_id,
        values.case_name,
        values.reason_for_referral,
        values.claims_email,
        values.case_diagnosis,
        values.vipr_type,
        values.labor_market_area_label,
        values.evaluation_year,
        values.ts_display_mode,
        values.va_display_mode,
        values.report_header_notes,
        values.notes,
        values.active,
        nowIso(),
        userId
      );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: 'externalId already exists' });
    }
    throw error;
  }

  const user = database
    .prepare(
      `
      SELECT
        user_id,
        external_id,
        first_name,
        last_name,
        email,
        case_reference,
        address_line1,
        address_line2,
        city,
        postal_code,
        country_name,
        demographic_state_id,
        demographic_county_id,
        case_name,
        reason_for_referral,
        claims_email,
        case_diagnosis,
        vipr_type,
        labor_market_area_label,
        evaluation_year,
        ts_display_mode,
        va_display_mode,
        report_header_notes,
        notes,
        active,
        created_at_utc,
        updated_at_utc
      FROM users
      WHERE user_id = ?
      `
    )
    .get(userId);

  return res.json({ user });
});

app.delete('/api/users/:userId', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const userParsed = parseRequiredInteger(req.params.userId, 'userId');
  if (userParsed.error) {
    return res.status(400).json({ error: userParsed.error });
  }
  const userId = userParsed.value;

  const result = getAppDb().prepare('DELETE FROM users WHERE user_id = ?').run(userId);
  if (result.changes < 1) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ ok: true, deletedUserId: userId });
});

app.get('/api/users/:userId/psychometrics', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const userParsed = parseRequiredInteger(req.params.userId, 'userId');
  if (userParsed.error) {
    return res.status(400).json({ error: userParsed.error });
  }
  const userId = userParsed.value;
  const database = getAppDb();
  if (!userExists(database, userId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const results = database
    .prepare(
      `
      SELECT
        result_id,
        user_id,
        test_code,
        test_name,
        raw_score,
        scaled_score,
        percentile,
        interpretation,
        measured_at_utc,
        source_note,
        created_at_utc,
        updated_at_utc
      FROM psychometric_results
      WHERE user_id = ?
      ORDER BY measured_at_utc DESC, created_at_utc DESC, result_id DESC
      `
    )
    .all(userId);

  return res.json({ userId, results });
});

app.post('/api/users/:userId/psychometrics', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const userParsed = parseRequiredInteger(req.params.userId, 'userId');
  if (userParsed.error) {
    return res.status(400).json({ error: userParsed.error });
  }
  const userId = userParsed.value;
  const database = getAppDb();
  if (!userExists(database, userId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const body = req.body || {};
  const testCodeParsed = parseOptionalText(body.testCode, 'testCode', 64);
  if (testCodeParsed.error) {
    return res.status(400).json({ error: testCodeParsed.error });
  }

  let resolvedTestCode = testCodeParsed.value ? testCodeParsed.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') : null;
  let resolvedTestName = null;
  if (resolvedTestCode) {
    const catalogRow = database
      .prepare(
        `
        SELECT test_code, test_name
        FROM psychometric_catalog
        WHERE test_code = ?
        `
      )
      .get(resolvedTestCode);
    if (catalogRow) {
      resolvedTestName = catalogRow.test_name;
    }
  }

  if (!resolvedTestName) {
    const testNameParsed = parseRequiredText(body.testName, 'testName', 200);
    if (testNameParsed.error) {
      return res.status(400).json({ error: testNameParsed.error });
    }
    resolvedTestName = testNameParsed.value;
  }

  const rawParsed = parseOptionalFloat(body.rawScore, 'rawScore');
  if (rawParsed.error) {
    return res.status(400).json({ error: rawParsed.error });
  }
  const scaledParsed = parseOptionalFloat(body.scaledScore, 'scaledScore');
  if (scaledParsed.error) {
    return res.status(400).json({ error: scaledParsed.error });
  }
  const percentileParsed = parseOptionalFloat(body.percentile, 'percentile');
  if (percentileParsed.error) {
    return res.status(400).json({ error: percentileParsed.error });
  }
  if (percentileParsed.value !== null && (percentileParsed.value < 0 || percentileParsed.value > 100)) {
    return res.status(400).json({ error: 'percentile must be between 0 and 100' });
  }
  const interpretationParsed = parseOptionalText(body.interpretation, 'interpretation', 5000);
  if (interpretationParsed.error) {
    return res.status(400).json({ error: interpretationParsed.error });
  }
  const sourceParsed = parseOptionalText(body.sourceNote, 'sourceNote', 1500);
  if (sourceParsed.error) {
    return res.status(400).json({ error: sourceParsed.error });
  }
  const measuredParsed = parseOptionalText(body.measuredAtUtc, 'measuredAtUtc', 40);
  if (measuredParsed.error) {
    return res.status(400).json({ error: measuredParsed.error });
  }
  let measuredAtUtc = measuredParsed.value;
  if (measuredAtUtc) {
    const timestamp = Date.parse(measuredAtUtc);
    if (!Number.isFinite(timestamp)) {
      return res.status(400).json({ error: 'measuredAtUtc must be an ISO date/time string' });
    }
    measuredAtUtc = new Date(timestamp).toISOString();
  } else {
    measuredAtUtc = nowIso();
  }

  const createdAt = nowIso();
  const runResult = database
    .prepare(
      `
      INSERT INTO psychometric_results (
        user_id,
        test_code,
        test_name,
        raw_score,
        scaled_score,
        percentile,
        interpretation,
        measured_at_utc,
        source_note,
        created_at_utc,
        updated_at_utc
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      userId,
      resolvedTestCode,
      resolvedTestName,
      rawParsed.value,
      scaledParsed.value,
      percentileParsed.value,
      interpretationParsed.value,
      measuredAtUtc,
      sourceParsed.value,
      createdAt,
      createdAt
    );

  const resultRow = database
    .prepare(
      `
      SELECT
        result_id,
        user_id,
        test_code,
        test_name,
        raw_score,
        scaled_score,
        percentile,
        interpretation,
        measured_at_utc,
        source_note,
        created_at_utc,
        updated_at_utc
      FROM psychometric_results
      WHERE result_id = ?
      `
    )
    .get(Number(runResult.lastInsertRowid));

  return res.status(201).json({ result: resultRow });
});

app.delete('/api/users/:userId/psychometrics/:resultId', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const userParsed = parseRequiredInteger(req.params.userId, 'userId');
  if (userParsed.error) {
    return res.status(400).json({ error: userParsed.error });
  }
  const resultParsed = parseRequiredInteger(req.params.resultId, 'resultId');
  if (resultParsed.error) {
    return res.status(400).json({ error: resultParsed.error });
  }
  const userId = userParsed.value;
  const resultId = resultParsed.value;
  const database = getAppDb();

  if (!userExists(database, userId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const result = database
    .prepare('DELETE FROM psychometric_results WHERE user_id = ? AND result_id = ?')
    .run(userId, resultId);
  if (result.changes < 1) {
    return res.status(404).json({ error: 'Psychometric result not found' });
  }

  return res.json({ ok: true, deletedResultId: resultId });
});

app.get('/api/states', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const rows = getDb()
    .prepare(
      `
      SELECT state_id, state_abbrev, state_name, mdb_name
      FROM states
      WHERE installed = 1
      ORDER BY state_name
      `
    )
    .all();

  return res.json({ states: rows });
});

app.get('/api/counties', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const stateParsed = parseRequiredInteger(req.query.stateId, 'stateId');
  if (stateParsed.error) {
    return res.status(400).json({ error: stateParsed.error });
  }
  const stateId = stateParsed.value;

  const database = getDb();
  const region = resolveRegionContext(database, stateId, null);
  if (region.error) {
    return res.status(400).json({ error: region.error });
  }

  const rows = database
    .prepare(
      `
      SELECT county_id, county_name, state_id, eclr_current
      FROM counties
      WHERE state_id = ?
      ORDER BY county_name
      `
    )
    .all(stateId);

  return res.json({ counties: rows });
});

app.get('/api/jobs/search', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const q = normalizeQuery(req.query.q);
  const regionInput = parseRegionFilterInput(req.query);
  if (regionInput.error) {
    return res.status(400).json({ error: regionInput.error });
  }
  const { stateId, countyId } = regionInput;
  const limitParsed = parseClampedInteger(req.query.limit, 'limit', 1, 250, 50);
  if (limitParsed.error) {
    return res.status(400).json({ error: limitParsed.error });
  }
  const offsetParsed = parseClampedInteger(req.query.offset, 'offset', 0, 1_000_000, 0);
  if (offsetParsed.error) {
    return res.status(400).json({ error: offsetParsed.error });
  }
  const limit = limitParsed.value;
  const offset = offsetParsed.value;

  const database = getDb();
  const region = resolveRegionContext(database, stateId, countyId);
  if (region.error) {
    return res.status(400).json({ error: region.error });
  }

  const { total, jobs } = querySearchJobs(database, {
    q,
    stateId,
    countyId,
    limit,
    offset
  });

  return res.json({ total, jobs, limit, offset });
});

app.get('/api/jobs/:dotCode', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const dotCodeParsed = parseDotCode(req.params.dotCode, 'dotCode');
  if (dotCodeParsed.error) {
    return res.status(400).json({ error: dotCodeParsed.error });
  }
  const dotCode = dotCodeParsed.value;

  const database = getDb();
  const regionInput = parseRegionFilterInput(req.query);
  if (regionInput.error) {
    return res.status(400).json({ error: regionInput.error });
  }
  const { stateId, countyId } = regionInput;

  const region = resolveRegionContext(database, stateId, countyId);
  if (region.error) {
    return res.status(400).json({ error: region.error });
  }

  const job = database
    .prepare(
      `
      SELECT
        dot_code,
        title,
        description,
        trait_vector,
        vq,
        svp,
        population,
        disability_code,
        skill_vq,
        skill_alt,
        skill_bucket,
        onet_ou_code
      FROM jobs
      WHERE dot_code = ?
    `
    )
    .get(dotCode);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const tasks = queryTasksForDot(database, dotCode, 50);
  const topStates = queryTopStatesForDot(database, dotCode, 12);
  const topCounties = queryTopCountiesForDot(database, dotCode, stateId, countyId, 12);

  return res.json({ job, tasks, topStates, topCounties });
});

app.post('/api/match', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const body = req.body || {};
  const q = normalizeQuery(body.q);
  const regionInput = parseRegionFilterInput(body);
  if (regionInput.error) {
    return res.status(400).json({ error: regionInput.error });
  }
  const { stateId, countyId } = regionInput;
  const limitParsed = parseClampedInteger(body.limit, 'limit', 1, 250, 50);
  if (limitParsed.error) {
    return res.status(400).json({ error: limitParsed.error });
  }
  const offsetParsed = parseClampedInteger(body.offset, 'offset', 0, 1_000_000, 0);
  if (offsetParsed.error) {
    return res.status(400).json({ error: offsetParsed.error });
  }
  const limit = limitParsed.value;
  const offset = offsetParsed.value;
  const profile = parseProfile(body.profile);

  const database = getDb();
  const region = resolveRegionContext(database, stateId, countyId);
  if (region.error) {
    return res.status(400).json({ error: region.error });
  }

  const { total, results } = queryRankedMatches(database, {
    q,
    stateId,
    countyId,
    profile,
    limit,
    offset
  });
  return res.json({ profile, total, results, limit, offset });
});

app.post('/api/transferable-skills/analyze', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const body = req.body || {};
  const q = normalizeQuery(body.q);
  const profile = parseProfile(body.profile);
  const sourceInput = body.sourceDots ?? body.sourceDot;
  const sourceDotsParsed = parseSourceDotCodes(sourceInput, 'sourceDots');
  if (sourceDotsParsed.error) {
    return res.status(400).json({ error: sourceDotsParsed.error });
  }
  const sourceDots = sourceDotsParsed.values;
  const regionInput = parseRegionFilterInput(body);
  if (regionInput.error) {
    return res.status(400).json({ error: regionInput.error });
  }
  const { stateId, countyId } = regionInput;
  const limitParsed = parseClampedInteger(
    body.limit,
    'limit',
    1,
    TRANSFERABLE_MAX_LIMIT,
    TRANSFERABLE_DEFAULT_LIMIT
  );
  if (limitParsed.error) {
    return res.status(400).json({ error: limitParsed.error });
  }
  const offsetParsed = parseClampedInteger(body.offset, 'offset', 0, 1_000_000, 0);
  if (offsetParsed.error) {
    return res.status(400).json({ error: offsetParsed.error });
  }
  const limit = limitParsed.value;
  const offset = offsetParsed.value;

  const database = getDb();
  const region = resolveRegionContext(database, stateId, countyId);
  if (region.error) {
    return res.status(400).json({ error: region.error });
  }

  const analysis = queryTransferableSkillsForSources(database, {
    sourceDots,
    q,
    stateId,
    countyId,
    limit,
    offset,
    profile
  });

  if (!analysis.sourceJobs.length) {
    return res.status(404).json({ error: 'Source job not found' });
  }
  if (analysis.missingSourceDots.length) {
    return res.status(404).json({ error: `Source DOTs not found: ${analysis.missingSourceDots.join(', ')}` });
  }
  const methodology = analysis.methodology || resolveMethodologyContext();

  return res.json({
    profile,
    source_dots_requested: sourceDots,
    source_jobs: analysis.sourceJobs,
    source_job: analysis.sourceJobs[0] || null,
    methodology: buildMethodologyPayload(methodology),
    analysis_basis: buildTransferableAnalysisBasis(methodology),
    diagnostics: analysis.diagnostics,
    tsp_levels: TSP_LEVELS,
    tsp_band_counts: analysis.tsp_band_counts,
    aggregate: analysis.aggregate,
    total: analysis.total,
    results: analysis.results,
    limit,
    offset
  });
});

app.post('/api/reports/match', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const body = req.body || {};
  const parsed = parseMatchReportRequestInput(body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const reportResult = buildMatchReport(getDb(), parsed);
  if (reportResult.error) {
    return res.status(400).json({ error: reportResult.error });
  }

  let caseContext = {};
  const userParsed = parseOptionalInteger(body.userId, 'userId');
  if (!userParsed.error && userParsed.value !== null && appDbReady()) {
    caseContext = fetchCaseById(getAppDb(), userParsed.value) || {};
  }

  return res.json(buildReportResponsePayload(reportResult.report, caseContext));
});

app.post('/api/reports/transferable-skills', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }

  const body = req.body || {};
  const parsed = parseTransferableReportRequestInput(body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  /* Look up user VIPR type if userId provided */
  let caseContext = {};
  const userParsed = parseOptionalInteger(body.userId, 'userId');
  if (!userParsed.error && userParsed.value !== null && appDbReady()) {
    caseContext = fetchCaseById(getAppDb(), userParsed.value) || {};
    if (caseContext.vipr_type) {
      parsed.viprType = caseContext.vipr_type;
    }
  }

  const reportResult = buildTransferableSkillsReport(getDb(), parsed);
  if (reportResult.error) {
    if (reportResult.error === 'Source job not found' || reportResult.error.startsWith('Source DOTs not found:')) {
      return res.status(404).json({ error: reportResult.error });
    }
    return res.status(400).json({ error: reportResult.error });
  }

  return res.json(buildReportResponsePayload(reportResult.report, caseContext));
});

app.post('/api/reports/match/save', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const body = req.body || {};
  const userParsed = parseRequiredInteger(body.userId, 'userId');
  if (userParsed.error) {
    return res.status(400).json({ error: userParsed.error });
  }
  const userId = userParsed.value;
  const appDatabase = getAppDb();
  if (!userExists(appDatabase, userId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const labelParsed = parseOptionalText(body.label, 'label', 240);
  if (labelParsed.error) {
    return res.status(400).json({ error: labelParsed.error });
  }

  const parsed = parseMatchReportRequestInput(body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const reportResult = buildMatchReport(getDb(), parsed);
  if (reportResult.error) {
    return res.status(400).json({ error: reportResult.error });
  }
  const caseRow = fetchCaseById(appDatabase, userId) || {};
  const caseContext = buildCaseCoverContext(caseRow);
  const report = reportResult.report;
  const reportMarkdown = buildReportMarkdown(report, caseContext);
  const reportHash = sha256Hex(reportMarkdown);
  const reportHtml = buildReportHtml(report, caseContext);
  const reportHtmlHash = sha256Hex(reportHtml);
  const createdAt = nowIso();

  const insertResult = appDatabase
    .prepare(
      `
      INSERT INTO saved_reports (
        user_id,
        label,
        report_type,
        selected_dot_code,
        query_text,
        state_id,
        county_id,
        profile_json,
        report_json,
        report_markdown,
        report_hash_sha256,
        report_html,
        report_html_hash_sha256,
        created_at_utc,
        updated_at_utc
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      userId,
      labelParsed.value,
      report.report_type || 'mvqs_match_report',
      report.selected_job?.dot_code || null,
      parsed.q,
      parsed.stateId,
      parsed.countyId,
      JSON.stringify(parsed.profile),
      JSON.stringify(report),
      reportMarkdown,
      reportHash,
      reportHtml,
      reportHtmlHash,
      createdAt,
      createdAt
    );

  const savedReportId = Number(insertResult.lastInsertRowid);
  const savedRow = appDatabase
    .prepare(
      `
      SELECT
        sr.saved_report_id,
        sr.user_id,
        sr.label,
        sr.report_type,
        sr.selected_dot_code,
        sr.query_text,
        sr.state_id,
        sr.county_id,
        sr.profile_json,
        sr.report_json,
        sr.report_html,
        sr.report_html_hash_sha256,
        sr.report_hash_sha256,
        sr.created_at_utc,
        sr.updated_at_utc,
        u.first_name,
        u.last_name
      FROM saved_reports sr
      JOIN users u ON u.user_id = sr.user_id
      WHERE sr.saved_report_id = ?
      `
    )
    .get(savedReportId);

  return res.status(201).json({
    saved_report: parseSavedReportRow(savedRow),
    report_markdown_hash_sha256: reportHash,
    render_html_hash_sha256: reportHtmlHash
  });
});

app.post('/api/reports/transferable-skills/save', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const body = req.body || {};
  const userParsed = parseRequiredInteger(body.userId, 'userId');
  if (userParsed.error) {
    return res.status(400).json({ error: userParsed.error });
  }
  const userId = userParsed.value;
  const appDatabase = getAppDb();
  if (!userExists(appDatabase, userId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const labelParsed = parseOptionalText(body.label, 'label', 240);
  if (labelParsed.error) {
    return res.status(400).json({ error: labelParsed.error });
  }

  const parsed = parseTransferableReportRequestInput(body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  /* Look up user VIPR type so the report builder can enrich with personality description */
  const caseRow = fetchCaseById(appDatabase, userId) || {};
  if (caseRow.vipr_type) {
    parsed.viprType = caseRow.vipr_type;
  }

  const reportResult = buildTransferableSkillsReport(getDb(), parsed);
  if (reportResult.error) {
    if (reportResult.error === 'Source job not found' || reportResult.error.startsWith('Source DOTs not found:')) {
      return res.status(404).json({ error: reportResult.error });
    }
    return res.status(400).json({ error: reportResult.error });
  }
  const report = reportResult.report;
  const caseContext = buildCaseCoverContext(caseRow);
  const reportMarkdown = buildReportMarkdown(report, caseContext);
  const reportHash = sha256Hex(reportMarkdown);
  const reportHtml = buildReportHtml(report, caseContext);
  const reportHtmlHash = sha256Hex(reportHtml);
  const createdAt = nowIso();

  const insertResult = appDatabase
    .prepare(
      `
      INSERT INTO saved_reports (
        user_id,
        label,
        report_type,
        selected_dot_code,
        query_text,
        state_id,
        county_id,
        profile_json,
        report_json,
        report_markdown,
        report_hash_sha256,
        report_html,
        report_html_hash_sha256,
        created_at_utc,
        updated_at_utc
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      userId,
      labelParsed.value,
      report.report_type || 'mvqs_transferable_skills_report',
      report.selected_job?.dot_code || null,
      parsed.q,
      parsed.stateId,
      parsed.countyId,
      JSON.stringify(parsed.profile),
      JSON.stringify(report),
      reportMarkdown,
      reportHash,
      reportHtml,
      reportHtmlHash,
      createdAt,
      createdAt
    );

  const savedReportId = Number(insertResult.lastInsertRowid);
  const savedRow = appDatabase
    .prepare(
      `
      SELECT
        sr.saved_report_id,
        sr.user_id,
        sr.label,
        sr.report_type,
        sr.selected_dot_code,
        sr.query_text,
        sr.state_id,
        sr.county_id,
        sr.profile_json,
        sr.report_json,
        sr.report_html,
        sr.report_html_hash_sha256,
        sr.report_hash_sha256,
        sr.created_at_utc,
        sr.updated_at_utc,
        u.first_name,
        u.last_name
      FROM saved_reports sr
      JOIN users u ON u.user_id = sr.user_id
      WHERE sr.saved_report_id = ?
      `
    )
    .get(savedReportId);

  return res.status(201).json({
    saved_report: parseSavedReportRow(savedRow),
    report_markdown_hash_sha256: reportHash,
    render_html_hash_sha256: reportHtmlHash
  });
});

app.get('/api/reports/saved', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const userParsed = parseOptionalInteger(req.query.userId, 'userId');
  if (userParsed.error) {
    return res.status(400).json({ error: userParsed.error });
  }
  const limitParsed = parseClampedInteger(req.query.limit, 'limit', 1, 500, 100);
  if (limitParsed.error) {
    return res.status(400).json({ error: limitParsed.error });
  }
  const offsetParsed = parseClampedInteger(req.query.offset, 'offset', 0, 1_000_000, 0);
  if (offsetParsed.error) {
    return res.status(400).json({ error: offsetParsed.error });
  }

  const userId = userParsed.value;
  const whereSql = userId === null ? '' : 'WHERE sr.user_id = ?';
  const params = userId === null ? [] : [userId];
  const database = getAppDb();

  const total = database
    .prepare(
      `
      SELECT COUNT(*) AS total
      FROM saved_reports sr
      ${whereSql}
      `
    )
    .get(...params).total;

  const rows = database
    .prepare(
      `
      SELECT
        sr.saved_report_id,
        sr.user_id,
        sr.label,
        sr.report_type,
        sr.selected_dot_code,
        sr.query_text,
        sr.state_id,
        sr.county_id,
        sr.report_html_hash_sha256,
        sr.report_hash_sha256,
        sr.created_at_utc,
        sr.updated_at_utc,
        u.first_name,
        u.last_name
      FROM saved_reports sr
      JOIN users u ON u.user_id = sr.user_id
      ${whereSql}
      ORDER BY sr.created_at_utc DESC, sr.saved_report_id DESC
      LIMIT ? OFFSET ?
      `
    )
    .all(...params, limitParsed.value, offsetParsed.value);

  return res.json({ total, reports: rows, limit: limitParsed.value, offset: offsetParsed.value });
});

app.get('/api/reports/saved/:savedReportId', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const reportParsed = parseRequiredInteger(req.params.savedReportId, 'savedReportId');
  if (reportParsed.error) {
    return res.status(400).json({ error: reportParsed.error });
  }
  const savedReportId = reportParsed.value;
  const row = getAppDb()
    .prepare(
      `
      SELECT
        sr.saved_report_id,
        sr.user_id,
        sr.label,
        sr.report_type,
        sr.selected_dot_code,
        sr.query_text,
        sr.state_id,
        sr.county_id,
        sr.profile_json,
        sr.report_json,
        sr.report_html,
        sr.report_html_hash_sha256,
        sr.report_hash_sha256,
        sr.created_at_utc,
        sr.updated_at_utc,
        u.first_name,
        u.last_name
      FROM saved_reports sr
      JOIN users u ON u.user_id = sr.user_id
      WHERE sr.saved_report_id = ?
      `
    )
    .get(savedReportId);

  if (!row) {
    return res.status(404).json({ error: 'Saved report not found' });
  }

  return res.json({ saved_report: parseSavedReportRow(row) });
});

app.post('/api/ai/reports/narrative', async (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const config = getOpenAiConfig();
  if (!config.enabled) {
    return res
      .status(503)
      .json({ error: 'OpenAI API key not configured. Set OPENAI_API_KEY (or MVQS_OPENAI_API_KEY).' });
  }

  const body = req.body || {};
  const reportParsed = parseRequiredInteger(body.savedReportId, 'savedReportId');
  if (reportParsed.error) {
    return res.status(400).json({ error: reportParsed.error });
  }
  const maxMatchesParsed = parseClampedInteger(body.maxMatches, 'maxMatches', 5, 40, 25);
  if (maxMatchesParsed.error) {
    return res.status(400).json({ error: maxMatchesParsed.error });
  }

  const savedReportId = reportParsed.value;
  const row = getAppDb()
    .prepare(
      `
      SELECT
        sr.saved_report_id,
        sr.report_json,
        u.user_id,
        u.first_name,
        u.last_name,
        u.case_reference,
        u.case_name,
        u.city,
        u.demographic_state_id,
        u.demographic_county_id,
        u.reason_for_referral
      FROM saved_reports sr
      LEFT JOIN users u ON u.user_id = sr.user_id
      WHERE sr.saved_report_id = ?
      `
    )
    .get(savedReportId);

  if (!row) {
    return res.status(404).json({ error: 'Saved report not found' });
  }

  let reportObject = {};
  try {
    reportObject = JSON.parse(row.report_json || '{}');
  } catch {
    return res.status(400).json({ error: 'Saved report JSON is invalid and cannot be summarized.' });
  }

  try {
    const caseContext = {
      user_id: row.user_id || null,
      first_name: row.first_name || null,
      last_name: row.last_name || null,
      case_reference: row.case_reference || null,
      case_name: row.case_name || null,
      city: row.city || null,
      demographic_state_id: row.demographic_state_id || null,
      demographic_county_id: row.demographic_county_id || null,
      reason_for_referral: row.reason_for_referral || null
    };
    const aiResult = await generateAiNarrativeFromReport(reportObject, caseContext, {
      maxMatches: maxMatchesParsed.value
    });
    return res.json({
      saved_report_id: savedReportId,
      generated_at_utc: nowIso(),
      max_matches: maxMatchesParsed.value,
      narrative_markdown: aiResult.narrativeMarkdown,
      model: aiResult.model,
      usage: aiResult.usage,
      response_id: aiResult.responseId
    });
  } catch (error) {
    return res.status(502).json({ error: error?.message || 'AI narrative generation failed.' });
  }
});

app.delete('/api/reports/saved/:savedReportId', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const reportParsed = parseRequiredInteger(req.params.savedReportId, 'savedReportId');
  if (reportParsed.error) {
    return res.status(400).json({ error: reportParsed.error });
  }
  const savedReportId = reportParsed.value;
  const result = getAppDb().prepare('DELETE FROM saved_reports WHERE saved_report_id = ?').run(savedReportId);
  if (result.changes < 1) {
    return res.status(404).json({ error: 'Saved report not found' });
  }

  return res.json({ ok: true, deletedSavedReportId: savedReportId });
});

app.get('/api/reports/saved/:savedReportId/export/json', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const reportParsed = parseRequiredInteger(req.params.savedReportId, 'savedReportId');
  if (reportParsed.error) {
    return res.status(400).json({ error: reportParsed.error });
  }
  const savedReportId = reportParsed.value;
  const appDatabase = getAppDb();
  const row = appDatabase
    .prepare(
      `
      SELECT saved_report_id, selected_dot_code, report_json, report_markdown, report_hash_sha256, report_html, report_html_hash_sha256, created_at_utc
      FROM saved_reports
      WHERE saved_report_id = ?
      `
    )
    .get(savedReportId);

  if (!row) {
    return res.status(404).json({ error: 'Saved report not found' });
  }

  const derived = ensureSavedReportHtmlFields(row, {});
  if (
    row.report_markdown !== derived.reportMarkdown ||
    row.report_hash_sha256 !== derived.reportMarkdownHash ||
    row.report_html !== derived.reportHtml ||
    row.report_html_hash_sha256 !== derived.reportHtmlHash
  ) {
    persistSavedReportDerivedFields(appDatabase, savedReportId, derived);
  }

  const baseName = buildSavedReportBaseName(row);
  res.set('Content-Type', 'application/json; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${baseName}.json"`);
  res.set('X-MVQS-Markdown-SHA256', derived.reportMarkdownHash);
  res.set('X-MVQS-HTML-SHA256', derived.reportHtmlHash);
  return res.send(JSON.stringify(derived.reportObject, null, 2));
});

app.get('/api/reports/saved/:savedReportId/export/markdown', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const reportParsed = parseRequiredInteger(req.params.savedReportId, 'savedReportId');
  if (reportParsed.error) {
    return res.status(400).json({ error: reportParsed.error });
  }
  const savedReportId = reportParsed.value;
  const appDatabase = getAppDb();
  const row = appDatabase
    .prepare(
      `
      SELECT saved_report_id, selected_dot_code, report_json, report_markdown, report_hash_sha256, report_html, report_html_hash_sha256, created_at_utc
      FROM saved_reports
      WHERE saved_report_id = ?
      `
    )
    .get(savedReportId);

  if (!row) {
    return res.status(404).json({ error: 'Saved report not found' });
  }

  const derived = ensureSavedReportHtmlFields(row, {});
  if (
    row.report_markdown !== derived.reportMarkdown ||
    row.report_hash_sha256 !== derived.reportMarkdownHash ||
    row.report_html !== derived.reportHtml ||
    row.report_html_hash_sha256 !== derived.reportHtmlHash
  ) {
    persistSavedReportDerivedFields(appDatabase, savedReportId, derived);
  }

  const baseName = buildSavedReportBaseName(row);
  res.set('Content-Type', 'text/markdown; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${baseName}.md"`);
  res.set('X-MVQS-Markdown-SHA256', derived.reportMarkdownHash);
  res.set('X-MVQS-HTML-SHA256', derived.reportHtmlHash);
  return res.send(derived.reportMarkdown);
});

app.get('/api/reports/saved/:savedReportId/export/html', (req, res) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const reportParsed = parseRequiredInteger(req.params.savedReportId, 'savedReportId');
  if (reportParsed.error) {
    return res.status(400).json({ error: reportParsed.error });
  }
  const savedReportId = reportParsed.value;
  const appDatabase = getAppDb();
  const row = appDatabase
    .prepare(
      `
      SELECT saved_report_id, selected_dot_code, report_json, report_markdown, report_hash_sha256, report_html, report_html_hash_sha256, created_at_utc
      FROM saved_reports
      WHERE saved_report_id = ?
      `
    )
    .get(savedReportId);

  if (!row) {
    return res.status(404).json({ error: 'Saved report not found' });
  }

  const derived = ensureSavedReportHtmlFields(row, {});
  if (
    row.report_markdown !== derived.reportMarkdown ||
    row.report_hash_sha256 !== derived.reportMarkdownHash ||
    row.report_html !== derived.reportHtml ||
    row.report_html_hash_sha256 !== derived.reportHtmlHash
  ) {
    persistSavedReportDerivedFields(appDatabase, savedReportId, derived);
  }

  const baseName = buildSavedReportBaseName(row);
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${baseName}.html"`);
  res.set('X-MVQS-Markdown-SHA256', derived.reportMarkdownHash);
  res.set('X-MVQS-HTML-SHA256', derived.reportHtmlHash);
  return res.send(derived.reportHtml);
});

app.get('/api/reports/saved/:savedReportId/export/pdf', async (req, res, next) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const reportParsed = parseRequiredInteger(req.params.savedReportId, 'savedReportId');
  if (reportParsed.error) {
    return res.status(400).json({ error: reportParsed.error });
  }
  const savedReportId = reportParsed.value;
  const appDatabase = getAppDb();
  const row = appDatabase
    .prepare(
      `
      SELECT saved_report_id, selected_dot_code, report_json, report_markdown, report_hash_sha256, report_html, report_html_hash_sha256, created_at_utc
      FROM saved_reports
      WHERE saved_report_id = ?
      `
    )
    .get(savedReportId);

  if (!row) {
    return res.status(404).json({ error: 'Saved report not found' });
  }

  try {
    const derived = ensureSavedReportHtmlFields(row, {});
    if (
      row.report_markdown !== derived.reportMarkdown ||
      row.report_hash_sha256 !== derived.reportMarkdownHash ||
      row.report_html !== derived.reportHtml ||
      row.report_html_hash_sha256 !== derived.reportHtmlHash
    ) {
      persistSavedReportDerivedFields(appDatabase, savedReportId, derived);
    }

    const baseName = buildSavedReportBaseName(row);
    const pdfBuffer = await buildPdfFromHtml(derived.reportHtml, `MVQS Saved Report ${row.saved_report_id}`);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${baseName}.pdf"`);
    res.set('X-MVQS-Markdown-SHA256', derived.reportMarkdownHash);
    res.set('X-MVQS-HTML-SHA256', derived.reportHtmlHash);
    res.set('X-MVQS-PDF-SHA256', sha256Hex(pdfBuffer));
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
});

app.get('/api/reports/saved/:savedReportId/export/case-packet', async (req, res, next) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const reportParsed = parseRequiredInteger(req.params.savedReportId, 'savedReportId');
  if (reportParsed.error) {
    return res.status(400).json({ error: reportParsed.error });
  }
  const savedReportId = reportParsed.value;
  const appDatabase = getAppDb();
  const row = appDatabase
    .prepare(
      `
      SELECT
        sr.saved_report_id,
        sr.user_id,
        sr.selected_dot_code,
        sr.report_json,
        sr.report_markdown,
        sr.report_hash_sha256,
        sr.report_html,
        sr.report_html_hash_sha256,
        sr.created_at_utc,
        u.first_name,
        u.last_name,
        u.case_reference,
        u.case_name
      FROM saved_reports sr
      LEFT JOIN users u ON u.user_id = sr.user_id
      WHERE sr.saved_report_id = ?
      `
    )
    .get(savedReportId);

  if (!row) {
    return res.status(404).json({ error: 'Saved report not found' });
  }

  try {
    const caseContext = {
      user_id: row.user_id || null,
      first_name: row.first_name || null,
      last_name: row.last_name || null,
      case_reference: row.case_reference || null,
      case_name: row.case_name || null
    };
    const derived = ensureSavedReportHtmlFields(row, caseContext);
    if (
      row.report_markdown !== derived.reportMarkdown ||
      row.report_hash_sha256 !== derived.reportMarkdownHash ||
      row.report_html !== derived.reportHtml ||
      row.report_html_hash_sha256 !== derived.reportHtmlHash
    ) {
      persistSavedReportDerivedFields(appDatabase, savedReportId, derived);
    }

    const reportObject = derived.reportObject;
    const reportJsonPretty = JSON.stringify(reportObject, null, 2);
    const reportMarkdown = derived.reportMarkdown;
    const reportHtml = derived.reportHtml;
    const pdfBuffer = await buildPdfFromHtml(reportHtml, `MVQS Saved Report ${row.saved_report_id}`);
    const computedMarkdownHash = derived.reportMarkdownHash;
    const computedHtmlHash = derived.reportHtmlHash;
    const reportJsonHash = sha256Hex(reportJsonPretty);
    const reportPdfHash = sha256Hex(pdfBuffer);
    const exportedAt = nowIso();
    const userDisplay = [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || null;

    const manifest = {
      manifest_version: 1,
      exported_at_utc: exportedAt,
      saved_report_id: row.saved_report_id,
      created_at_utc: row.created_at_utc || null,
      selected_dot_code: row.selected_dot_code || null,
      methodology_version: reportObject?.methodology_version || null,
      layout_version: reportObject?.layout_version || null,
      parity_profile: reportObject?.parity_profile || null,
      user: {
        first_name: row.first_name || null,
        last_name: row.last_name || null,
        display_name: userDisplay
      },
      hashes: {
        stored_markdown_hash_sha256: row.report_hash_sha256 || null,
        stored_html_hash_sha256: row.report_html_hash_sha256 || null,
        computed_markdown_hash_sha256: computedMarkdownHash,
        computed_html_hash_sha256: computedHtmlHash,
        report_json_hash_sha256: reportJsonHash,
        report_pdf_hash_sha256: reportPdfHash
      },
      consistency: {
        markdown_hash_matches_stored: row.report_hash_sha256 === computedMarkdownHash,
        html_hash_matches_stored: row.report_html_hash_sha256 === computedHtmlHash,
        pdf_export_uses_same_markdown_source: true,
        pdf_export_uses_same_html_source: true
      },
      files: [
        { name: 'report.json', sha256: reportJsonHash },
        { name: 'report.md', sha256: computedMarkdownHash },
        { name: 'report.html', sha256: computedHtmlHash },
        { name: 'report.pdf', sha256: reportPdfHash },
        { name: 'manifest.json', sha256: null }
      ]
    };
    const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    const manifestHash = sha256Hex(manifestText);
    manifest.hashes.manifest_json_hash_sha256 = manifestHash;
    manifest.files = manifest.files.map((file) =>
      file.name === 'manifest.json' ? { ...file, sha256: manifestHash } : file
    );
    const finalManifestText = `${JSON.stringify(manifest, null, 2)}\n`;

    const baseName = buildCasePacketBaseName(row.saved_report_id);
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${baseName}.zip"`);
    res.set('X-MVQS-Markdown-SHA256', computedMarkdownHash);
    res.set('X-MVQS-HTML-SHA256', computedHtmlHash);
    res.set('X-MVQS-PDF-SHA256', reportPdfHash);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (error) => {
      next(error);
    });
    archive.pipe(res);
    archive.append(reportJsonPretty, { name: 'report.json' });
    archive.append(reportMarkdown, { name: 'report.md' });
    archive.append(reportHtml, { name: 'report.html' });
    archive.append(pdfBuffer, { name: 'report.pdf' });
    archive.append(finalManifestText, { name: 'manifest.json' });
    const finalized = archive.finalize();
    if (finalized && typeof finalized.then === 'function') {
      await finalized;
    }
    return undefined;
  } catch (error) {
    return next(error);
  }
});

app.get('/api/cases/:caseId/export/report-bundle', async (req, res, next) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const caseParsed = parseRequiredInteger(req.params.caseId, 'caseId');
  if (caseParsed.error) {
    return res.status(400).json({ error: caseParsed.error });
  }
  const caseId = caseParsed.value;
  const appDatabase = getAppDb();
  const caseRow = fetchCaseById(appDatabase, caseId);
  if (!caseRow) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const reportRows = appDatabase
    .prepare(
      `
      SELECT
        saved_report_id,
        user_id,
        selected_dot_code,
        report_json,
        report_markdown,
        report_hash_sha256,
        report_html,
        report_html_hash_sha256,
        created_at_utc
      FROM saved_reports
      WHERE user_id = ?
      ORDER BY created_at_utc ASC, saved_report_id ASC
      `
    )
    .all(caseId);
  if (!reportRows.length) {
    return res.status(404).json({ error: 'No saved reports found for case' });
  }

  try {
    const caseContext = buildCaseCoverContext(caseRow);
    const exportedAt = nowIso();
    const manifest = {
      manifest_version: 1,
      case_id: caseId,
      exported_at_utc: exportedAt,
      methodology_preference: TSA_MODEL_PREF,
      report_count: reportRows.length,
      case: {
        first_name: caseRow.first_name || null,
        last_name: caseRow.last_name || null,
        case_reference: caseRow.case_reference || null,
        case_name: caseRow.case_name || null
      },
      reports: [],
      files: [{ name: 'manifest.json', sha256: null }]
    };

    const baseName = buildCaseReportBundleBaseName(caseId);
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${baseName}.zip"`);
    res.set('X-MVQS-Case-Id', String(caseId));
    res.set('X-MVQS-Report-Count', String(reportRows.length));

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (error) => {
      next(error);
    });
    archive.pipe(res);

    for (const row of reportRows) {
      const derived = ensureSavedReportHtmlFields(row, caseContext);
      if (
        row.report_markdown !== derived.reportMarkdown ||
        row.report_hash_sha256 !== derived.reportMarkdownHash ||
        row.report_html !== derived.reportHtml ||
        row.report_html_hash_sha256 !== derived.reportHtmlHash
      ) {
        persistSavedReportDerivedFields(appDatabase, row.saved_report_id, derived);
      }

      const reportJsonPretty = JSON.stringify(derived.reportObject, null, 2);
      const reportJsonHash = sha256Hex(reportJsonPretty);
      const reportPdf = await buildPdfFromHtml(derived.reportHtml, `MVQS Saved Report ${row.saved_report_id}`);
      const reportPdfHash = sha256Hex(reportPdf);
      const validatePayload = {
        saved_report_id: row.saved_report_id,
        stored_markdown_hash_sha256: row.report_hash_sha256 || null,
        stored_html_hash_sha256: row.report_html_hash_sha256 || null,
        computed_markdown_hash_sha256: derived.reportMarkdownHash,
        computed_html_hash_sha256: derived.reportHtmlHash,
        markdown_hash_matches: row.report_hash_sha256 === derived.reportMarkdownHash,
        html_hash_matches: row.report_html_hash_sha256 === derived.reportHtmlHash,
        pdf_binary_hash_sha256: reportPdfHash,
        pdf_export_uses_same_markdown_source: true,
        pdf_export_uses_same_html_source: true,
        validated_at_utc: nowIso()
      };
      const validateText = `${JSON.stringify(validatePayload, null, 2)}\n`;
      const validateHash = sha256Hex(validateText);
      const folder = `reports/${row.saved_report_id}`;

      archive.append(reportJsonPretty, { name: `${folder}/report.json` });
      archive.append(derived.reportMarkdown, { name: `${folder}/report.md` });
      archive.append(derived.reportHtml, { name: `${folder}/report.html` });
      archive.append(reportPdf, { name: `${folder}/report.pdf` });
      archive.append(validateText, { name: `${folder}/validate.json` });

      manifest.reports.push({
        saved_report_id: row.saved_report_id,
        created_at_utc: row.created_at_utc || null,
        selected_dot_code: row.selected_dot_code || null,
        hashes: {
          report_json_hash_sha256: reportJsonHash,
          report_markdown_hash_sha256: derived.reportMarkdownHash,
          report_html_hash_sha256: derived.reportHtmlHash,
          report_pdf_hash_sha256: reportPdfHash,
          validate_json_hash_sha256: validateHash
        },
        consistency: {
          markdown_hash_matches_stored: row.report_hash_sha256 === derived.reportMarkdownHash,
          html_hash_matches_stored: row.report_html_hash_sha256 === derived.reportHtmlHash
        }
      });
      manifest.files.push(
        { name: `${folder}/report.json`, sha256: reportJsonHash },
        { name: `${folder}/report.md`, sha256: derived.reportMarkdownHash },
        { name: `${folder}/report.html`, sha256: derived.reportHtmlHash },
        { name: `${folder}/report.pdf`, sha256: reportPdfHash },
        { name: `${folder}/validate.json`, sha256: validateHash }
      );
    }

    const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    const manifestHash = sha256Hex(manifestText);
    manifest.files = manifest.files.map((file) =>
      file.name === 'manifest.json' ? { ...file, sha256: manifestHash } : file
    );
    const finalManifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    archive.append(finalManifestText, { name: 'manifest.json' });

    const finalized = archive.finalize();
    if (finalized && typeof finalized.then === 'function') {
      await finalized;
    }
    return undefined;
  } catch (error) {
    return next(error);
  }
});

app.get('/api/reports/saved/:savedReportId/export/validate', async (req, res, next) => {
  if (!appDbReady()) {
    return res.status(503).json({ error: 'App database not ready' });
  }

  const reportParsed = parseRequiredInteger(req.params.savedReportId, 'savedReportId');
  if (reportParsed.error) {
    return res.status(400).json({ error: reportParsed.error });
  }
  const savedReportId = reportParsed.value;
  const appDatabase = getAppDb();
  const row = appDatabase
    .prepare(
      `
      SELECT saved_report_id, report_json, report_markdown, report_hash_sha256, report_html, report_html_hash_sha256
      FROM saved_reports
      WHERE saved_report_id = ?
      `
    )
    .get(savedReportId);

  if (!row) {
    return res.status(404).json({ error: 'Saved report not found' });
  }

  try {
    const derived = ensureSavedReportHtmlFields(row, {});
    if (
      row.report_markdown !== derived.reportMarkdown ||
      row.report_hash_sha256 !== derived.reportMarkdownHash ||
      row.report_html !== derived.reportHtml ||
      row.report_html_hash_sha256 !== derived.reportHtmlHash
    ) {
      persistSavedReportDerivedFields(appDatabase, savedReportId, derived);
    }

    const computedMarkdownHash = derived.reportMarkdownHash;
    const computedHtmlHash = derived.reportHtmlHash;
    const pdfBuffer = await buildPdfFromHtml(
      derived.reportHtml,
      `MVQS Saved Report ${row.saved_report_id}`
    );
    const computedPdfHash = sha256Hex(pdfBuffer);
    return res.json({
      saved_report_id: savedReportId,
      stored_markdown_hash_sha256: row.report_hash_sha256,
      stored_html_hash_sha256: row.report_html_hash_sha256 || null,
      computed_markdown_hash_sha256: computedMarkdownHash,
      computed_html_hash_sha256: computedHtmlHash,
      markdown_hash_matches: row.report_hash_sha256 === computedMarkdownHash,
      html_hash_matches: row.report_html_hash_sha256 === computedHtmlHash,
      pdf_binary_hash_sha256: computedPdfHash,
      pdf_export_uses_same_markdown_source: true,
      pdf_export_uses_same_html_source: true,
      validated_at_utc: nowIso()
    });
  } catch (error) {
    return next(error);
  }
});

// ===================================================================
// Gap-closure reference / lookup / historical / wage data endpoints
// ===================================================================

app.get('/api/occupations/historical', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const query = (req.query.q || '').trim();
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 500);
  const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);

  let sql = 'SELECT * FROM occupations_historical';
  const params = [];
  if (query) {
    sql += ' WHERE dot_title LIKE ? OR dot_code LIKE ? OR onet_code LIKE ?';
    const pattern = `%${query}%`;
    params.push(pattern, pattern, pattern);
  }
  sql += ' ORDER BY dot_code LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = getDb().prepare(sql).all(...params);
  const total = getDb()
    .prepare(query
      ? 'SELECT COUNT(*) AS count FROM occupations_historical WHERE dot_title LIKE ? OR dot_code LIKE ? OR onet_code LIKE ?'
      : 'SELECT COUNT(*) AS count FROM occupations_historical')
    .get(...(query ? [`%${query}%`, `%${query}%`, `%${query}%`] : []));

  return res.json({ occupations: rows, total: total.count, limit, offset });
});

app.get('/api/occupations/historical/:dotCode', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const row = getDb().prepare('SELECT * FROM occupations_historical WHERE dot_code = ?').get(req.params.dotCode);
  if (!row) {
    return res.status(404).json({ error: 'Historical occupation not found' });
  }
  return res.json({ occupation: row });
});

app.get('/api/reference/eclr-constants', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM eclr_constants ORDER BY variant').all();
  return res.json({ eclr_constants: rows });
});

app.get('/api/reference/inflation-rates', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM inflation_rates ORDER BY annual_year').all();
  return res.json({ inflation_rates: rows });
});

app.get('/api/reference/average-worker-profile', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM average_worker_profile').all();
  return res.json({ profiles: rows });
});

app.get('/api/reference/aptitude-levels', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM aptitude_levels ORDER BY apt_level').all();
  return res.json({ aptitude_levels: rows });
});

app.get('/api/reference/ged-levels', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM ged_levels ORDER BY ged_level').all();
  return res.json({ ged_levels: rows });
});

app.get('/api/reference/element-levels', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM element_levels ORDER BY element_level').all();
  return res.json({ element_levels: rows });
});

app.get('/api/reference/job-categories', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM job_categories ORDER BY sort_order').all();
  return res.json({ job_categories: rows });
});

app.get('/api/reference/job-search-websites', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM job_search_websites ORDER BY sort_order').all();
  return res.json({ websites: rows });
});

app.get('/api/reference/tsp-report-levels', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM tsp_report_levels ORDER BY id').all();
  return res.json({ tsp_report_levels: rows });
});

app.get('/api/reference/help', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const category = (req.query.category || '').trim();
  let sql = 'SELECT * FROM help_text';
  const params = [];
  if (category) {
    sql += ' WHERE mvqs_category = ?';
    params.push(category);
  }
  sql += ' ORDER BY sort_order';
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ help: rows });
});

app.get('/api/reference/mcplot-scales', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const trait = (req.query.trait || '').trim();
  let sql = 'SELECT * FROM mcplot_rating_scales WHERE active = 1';
  const params = [];
  if (trait) {
    sql += ' AND trait_category_code = ?';
    params.push(trait);
  }
  sql += ' ORDER BY sort_order';
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ scales: rows });
});

app.get('/api/reference/mcplot-examples', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const trait = (req.query.trait || '').trim();
  let sql = 'SELECT * FROM mcplot_rating_examples WHERE active = 1';
  const params = [];
  if (trait) {
    sql += ' AND trait_category_code = ?';
    params.push(trait);
  }
  sql += ' ORDER BY sort_order';
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ examples: rows });
});

app.get('/api/wages/search', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const occCode = (req.query.occ_code || '').trim();
  const state = (req.query.state || '').trim();
  const area = (req.query.area || '').trim();
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 500);
  const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);

  const conditions = [];
  const params = [];

  if (occCode) {
    conditions.push('occ_code LIKE ?');
    params.push(`${occCode}%`);
  }
  if (state) {
    conditions.push('prim_state = ?');
    params.push(state.toUpperCase());
  }
  if (area) {
    conditions.push('area_title LIKE ?');
    params.push(`%${area}%`);
  }

  let sql = 'SELECT * FROM usbls_oes';
  if (conditions.length) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  sql += ' ORDER BY occ_code, prim_state LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = getDb().prepare(sql).all(...params);

  let countSql = 'SELECT COUNT(*) AS count FROM usbls_oes';
  if (conditions.length) {
    countSql += ` WHERE ${conditions.join(' AND ')}`;
  }
  const total = getDb().prepare(countSql).get(...params.slice(0, -2));

  return res.json({ wages: rows, total: total.count, limit, offset });
});

app.get('/api/wages/fields', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM usbls_oes_fields ORDER BY field_id').all();
  return res.json({ fields: rows });
});

// ================================================================
// Phase 2 Gap-Closure Endpoints
// ================================================================

// --- Work Values System ---
app.get('/api/reference/values', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM values_catalog ORDER BY sort_order').all();
  return res.json({ values: rows });
});

app.get('/api/reference/value-categories', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM value_categories ORDER BY sort_order').all();
  return res.json({ categories: rows });
});

app.get('/api/reference/value-options', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM value_options ORDER BY option_id').all();
  return res.json({ options: rows });
});

app.get('/api/reference/value-answers', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM value_answers ORDER BY value').all();
  return res.json({ answers: rows });
});

app.get('/api/reference/work-history-value-defaults', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM work_history_value_defaults').all();
  return res.json({ defaults: rows });
});

// --- VIPR Personality System ---
app.get('/api/reference/vipr-test-pairs', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM vipr_test_pairs ORDER BY sort_order').all();
  return res.json({ pairs: rows });
});

app.get('/api/reference/personality-types', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM personality_types ORDER BY sort_order').all();
  return res.json({ types: rows });
});

app.get('/api/reference/personality-types/:type', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const row = getDb().prepare('SELECT * FROM personality_types WHERE personality_type = ?').get(req.params.type.toUpperCase());
  if (!row) {
    return res.status(404).json({ error: 'Personality type not found' });
  }
  return res.json({ type: row });
});

app.get('/api/reference/personality-type-indicators', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM personality_type_indicators ORDER BY sort_order').all();
  return res.json({ indicators: rows });
});

// --- Test Score Conversion ---
app.get('/api/reference/score-scales', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM score_scales ORDER BY standard').all();
  return res.json({ scales: rows });
});

app.get('/api/reference/score-percentiles', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM score_percentiles ORDER BY percentile').all();
  return res.json({ percentiles: rows });
});

// --- VIPR Job Descriptions ---
app.get('/api/reference/vipr-job-descriptions', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const { dotCode, limit: rawLimit, offset: rawOffset } = req.query;
  let sql = 'SELECT * FROM vipr_job_descriptions';
  const params = [];
  if (dotCode) {
    sql += ' WHERE dot_code = ?';
    params.push(dotCode);
  }
  const limit = Math.min(Math.max(Number.parseInt(rawLimit, 10) || 100, 1), 500);
  const offset = Math.max(Number.parseInt(rawOffset, 10) || 0, 0);
  sql += ` LIMIT ${limit} OFFSET ${offset}`;
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ descriptions: rows, limit, offset });
});

// --- Occupation Details ---
app.get('/api/occupations/details', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const { dotCode, search, limit: rawLimit, offset: rawOffset } = req.query;
  let sql = 'SELECT * FROM occupation_details';
  const params = [];
  if (dotCode) {
    sql += ' WHERE dot_code = ?';
    params.push(dotCode);
  } else if (search) {
    sql += ' WHERE title LIKE ? OR dot_code LIKE ? OR oes_title LIKE ? OR holland_title LIKE ?';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  const limit = Math.min(Math.max(Number.parseInt(rawLimit, 10) || 50, 1), 500);
  const offset = Math.max(Number.parseInt(rawOffset, 10) || 0, 0);
  sql += ` LIMIT ${limit} OFFSET ${offset}`;
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ details: rows, limit, offset });
});

app.get('/api/occupations/details/:dotCode', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const row = getDb().prepare('SELECT * FROM occupation_details WHERE dot_code = ?').get(req.params.dotCode);
  if (!row) {
    return res.status(404).json({ error: 'Occupation details not found' });
  }
  return res.json({ detail: row });
});

// --- Alternate Titles ---
app.get('/api/occupations/alternate-titles', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const { search, docNo, limit: rawLimit, offset: rawOffset } = req.query;
  let sql = 'SELECT * FROM occupation_alternate_titles';
  const params = [];
  if (docNo) {
    sql += ' WHERE doc_no = ?';
    params.push(docNo);
  } else if (search) {
    sql += ' WHERE alternate_title LIKE ?';
    params.push(`%${search}%`);
  }
  const limit = Math.min(Math.max(Number.parseInt(rawLimit, 10) || 50, 1), 500);
  const offset = Math.max(Number.parseInt(rawOffset, 10) || 0, 0);
  sql += ` LIMIT ${limit} OFFSET ${offset}`;
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ titles: rows, limit, offset });
});

// --- TEM/JOLT (Temperament + Labor Market) ---
app.get('/api/occupations/tem-jolt', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const { dotCode, search, limit: rawLimit, offset: rawOffset } = req.query;
  let sql = 'SELECT * FROM occupation_tem_jolt';
  const params = [];
  if (dotCode) {
    sql += ' WHERE dot_code = ?';
    params.push(dotCode);
  } else if (search) {
    sql += ' WHERE dot_title LIKE ? OR dot_code LIKE ?';
    const term = `%${search}%`;
    params.push(term, term);
  }
  const limit = Math.min(Math.max(Number.parseInt(rawLimit, 10) || 50, 1), 500);
  const offset = Math.max(Number.parseInt(rawOffset, 10) || 0, 0);
  sql += ` LIMIT ${limit} OFFSET ${offset}`;
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ records: rows, limit, offset });
});

// --- DOT Education Crosswalk ---
app.get('/api/occupations/education', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const { dotCode, search, limit: rawLimit, offset: rawOffset } = req.query;
  let sql = 'SELECT * FROM dot_education';
  const params = [];
  if (dotCode) {
    sql += ' WHERE dot_code = ?';
    params.push(dotCode);
  } else if (search) {
    sql += ' WHERE dot_title LIKE ? OR dot_code LIKE ? OR caspar_title LIKE ? OR cip90_title LIKE ?';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  const limit = Math.min(Math.max(Number.parseInt(rawLimit, 10) || 50, 1), 500);
  const offset = Math.max(Number.parseInt(rawOffset, 10) || 0, 0);
  sql += ` LIMIT ${limit} OFFSET ${offset}`;
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ education: rows, limit, offset });
});

// --- CASPAR Education Programs ---
app.get('/api/occupations/caspar', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const { dotCode, limit: rawLimit, offset: rawOffset } = req.query;
  let sql = 'SELECT * FROM occupation_caspar';
  const params = [];
  if (dotCode) {
    sql += ' WHERE dot_code = ?';
    params.push(dotCode);
  }
  const limit = Math.min(Math.max(Number.parseInt(rawLimit, 10) || 50, 1), 500);
  const offset = Math.max(Number.parseInt(rawOffset, 10) || 0, 0);
  sql += ` LIMIT ${limit} OFFSET ${offset}`;
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ caspar: rows, limit, offset });
});

// --- Ratings (trait guidelines) ---
app.get('/api/reference/ratings', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM ratings ORDER BY sort_order').all();
  return res.json({ ratings: rows });
});

// --- Level Description Lookups ---
app.get('/api/reference/svp-levels', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM svp_levels ORDER BY svp_level').all();
  return res.json({ levels: rows });
});

app.get('/api/reference/strength-levels', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM strength_levels ORDER BY strength_level').all();
  return res.json({ levels: rows });
});

app.get('/api/reference/weather-levels', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM weather_levels ORDER BY weather_level').all();
  return res.json({ levels: rows });
});

app.get('/api/reference/physical-environmental-levels', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM physical_environmental_levels ORDER BY physical_level').all();
  return res.json({ levels: rows });
});

app.get('/api/reference/zone-levels', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM zone_levels ORDER BY zone_level').all();
  return res.json({ levels: rows });
});

app.get('/api/reference/onet-codes', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const { search, limit: rawLimit, offset: rawOffset } = req.query;
  let sql = 'SELECT * FROM onet_codes';
  const params = [];
  if (search) {
    sql += ' WHERE onet_title LIKE ? OR onet_code LIKE ?';
    const term = `%${search}%`;
    params.push(term, term);
  }
  const limit = Math.min(Math.max(Number.parseInt(rawLimit, 10) || 50, 1), 500);
  const offset = Math.max(Number.parseInt(rawOffset, 10) || 0, 0);
  sql += ` LIMIT ${limit} OFFSET ${offset}`;
  const rows = getDb().prepare(sql).all(...params);
  return res.json({ codes: rows, limit, offset });
});

app.get('/api/reference/countries', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM countries ORDER BY country_id').all();
  return res.json({ countries: rows });
});

app.get('/api/reference/person-job-traits', (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  const rows = getDb().prepare('SELECT * FROM person_job_traits ORDER BY sort_order').all();
  return res.json({ traits: rows });
});

app.all('/api', (req, res) => {
  return res.status(404).json({ error: 'API route not found' });
});

app.all('/api/*', (req, res) => {
  return res.status(404).json({ error: 'API route not found' });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MVQS Modern running at http://localhost:${PORT}`);
  console.log(`Database path: ${DB_PATH}`);
});
