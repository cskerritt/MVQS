import fs from 'fs';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { DatabaseSync } from 'node:sqlite';
import { parse as parseCsv } from 'csv-parse/sync';

const DEFAULT_OUTPUT = 'data/mvqs-modern.db';
const DEFAULT_CANDIDATES = [
  process.env.MVQS_LEGACY_DIR,
  path.join(process.cwd(), 'MVQS_Database 2'),
  path.join(process.env.HOME || '', 'Dropbox/My Mac (chriss-MacBook-Pro.local)/Downloads/MVQS (1)')
].filter(Boolean);

function parseArgs(argv) {
  const args = { out: DEFAULT_OUTPUT, source: 'auto' };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--legacy-dir') {
      args.legacyDir = argv[i + 1];
      i += 1;
    } else if (token === '--out') {
      args.out = argv[i + 1];
      i += 1;
    } else if (token === '--states') {
      args.states = argv[i + 1];
      i += 1;
    } else if (token === '--source') {
      args.source = argv[i + 1];
      i += 1;
    } else if (token === '--legacy-snapshot-id') {
      args.legacySnapshotId = argv[i + 1];
      i += 1;
    } else if (token === '--parity-table-taps-json') {
      args.parityTableTapsJson = argv[i + 1];
      i += 1;
    } else if (token === '--parity-mapping-coverage-json') {
      args.parityMappingCoverageJson = argv[i + 1];
      i += 1;
    } else if (token === '--parity-access-execution-json') {
      args.parityAccessExecutionJson = argv[i + 1];
      i += 1;
    } else if (token === '--parity-strict-json') {
      args.parityStrictJson = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function withTransaction(db, callback) {
  db.exec('BEGIN');
  try {
    callback();
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function resolveLegacyDir(explicitDir) {
  const candidates = explicitDir ? [explicitDir, ...DEFAULT_CANDIDATES] : DEFAULT_CANDIDATES;
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return path.resolve(candidate);
    }
  }

  throw new Error(
    'Could not find legacy MVQS directory. Pass --legacy-dir "<path>" or set MVQS_LEGACY_DIR.'
  );
}

function runCommand(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 1024,
    ...options
  });
}

function requireMdbTools() {
  const requiredTools = ['mdb-export', 'mdb-sql', 'mdb-schema'];
  const missing = requiredTools.filter((tool) => {
    const probe = spawnSync(tool, ['--help'], { encoding: 'utf8' });
    return !!probe.error;
  });
  if (missing.length) {
    throw new Error(
      `Missing required mdb-tools command(s): ${missing.join(', ')}. Install mdb-tools so mdb-export, mdb-sql, and mdb-schema are available in PATH.`
    );
  }
}

function runMdbExport(mdbPath, tableName) {
  if (!fs.existsSync(mdbPath)) {
    throw new Error(`Missing database file: ${mdbPath}`);
  }
  return runCommand('mdb-export', [mdbPath, tableName]);
}

function runMdbSql(mdbPath, sql) {
  if (!fs.existsSync(mdbPath)) {
    throw new Error(`Missing database file: ${mdbPath}`);
  }

  return runCommand(
    'mdb-sql',
    ['-d', ',', '-P', '-H', '-F', mdbPath],
    {
      input: `${sql}\n`
    }
  );
}

function escapeAccessIdentifier(identifier) {
  return `[${String(identifier).replace(/]/g, ']]')}]`;
}

function tryCountRowsFromAccessTable(mdbPath, tableName) {
  const sql = `SELECT COUNT(*) FROM ${escapeAccessIdentifier(tableName)}`;
  try {
    const output = runMdbSql(mdbPath, sql);
    const lines = output
      .split(/\\r?\\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return { rowCount: null, error: 'No output from mdb-sql count query.' };
    }

    const numeric = lines.find((line) => /^-?\d+$/.test(line));
    if (!numeric) {
      return { rowCount: null, error: `Unexpected count output: ${lines[0]}` };
    }

    return { rowCount: Number.parseInt(numeric, 10), error: null };
  } catch (error) {
    return { rowCount: null, error: error.message };
  }
}

function readPrnLines(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
}

function normalizeDot(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const stripped = String(value).replace(/\D/g, '');
  if (!stripped) {
    return null;
  }

  return stripped.padStart(9, '0').slice(0, 9);
}

function toInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toFloat(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function safeTrim(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pickFirstPresent(row, keys) {
  for (const key of keys) {
    if (Object.hasOwn(row, key)) {
      const value = safeTrim(row[key]);
      if (value !== null) {
        return value;
      }
    }
  }
  return null;
}

function normalizeCodeToken(value) {
  const trimmed = safeTrim(value);
  if (trimmed === null) {
    return null;
  }
  return trimmed.toUpperCase().replace(/\s+/g, '');
}

function parseTitleLine(line) {
  const match = line.match(/^(\d{9})\s*(.*)$/);
  if (!match) {
    return { dotCode: null, title: line.trim() };
  }

  return { dotCode: match[1], title: match[2].trim() };
}

function parseSkillsLine(line) {
  const chunks = line.trim().split(/\s+/);
  return {
    skillVq: toFloat(chunks[0]),
    skillAlt: toFloat(chunks[1]),
    svp: toInt(chunks[2]),
    skillBucket: toInt(chunks[3])
  };
}

function parseCsvRows(csvText) {
  return parseCsv(csvText, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    bom: true
  });
}

function pickLatestEclr(row) {
  for (let year = 30; year >= 0; year -= 1) {
    const suffix = String(year).padStart(2, '0');
    const candidates = [`ECLR${suffix}`, `eclr${suffix}`];

    for (const key of candidates) {
      if (row[key] !== undefined && row[key] !== '') {
        const parsed = toFloat(row[key]);
        if (parsed !== null) {
          return parsed;
        }
      }
    }
  }

  return null;
}

function findExistingFile(baseDir, names) {
  for (const name of names) {
    const candidate = path.join(baseDir, name);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function findExistingMdb(baseDir, name) {
  const candidates = [
    path.join(baseDir, name),
    path.join(baseDir, 'Jobbanks', name)
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function safeReadJsonFile(filePath) {
  if (!filePath) {
    return null;
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Parity artifact not found: ${resolved}`);
  }

  const raw = fs.readFileSync(resolved, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse JSON artifact: ${resolved}. ${error.message}`);
  }
}

function detectSourceMode(legacyDir, requested) {
  const hasDc =
    fs.existsSync(path.join(legacyDir, 'MVQS_DC_Data.accdb')) &&
    fs.existsSync(path.join(legacyDir, 'MVQS_DC_Data_JobBank.accdb'));

  const hasClassic =
    !!findExistingMdb(legacyDir, 'MVQS2016.mdb') &&
    !!findExistingMdb(legacyDir, 'jcontrol.mdb') &&
    fs.existsSync(path.join(legacyDir, 'DOTTitle.prn'));

  const normalized = String(requested || 'auto').trim().toLowerCase();
  if (!['auto', 'classic', 'dc'].includes(normalized)) {
    throw new Error('Invalid --source value. Use auto, classic, or dc.');
  }

  if (normalized === 'classic') {
    if (!hasClassic) {
      throw new Error('Classic MVQS source files not found in this folder.');
    }
    return 'classic';
  }

  if (normalized === 'dc') {
    if (!hasDc) {
      throw new Error('MVQS_DC Access source files not found in this folder.');
    }
    return 'dc';
  }

  if (hasDc) {
    return 'dc';
  }
  if (hasClassic) {
    return 'classic';
  }

  throw new Error('No recognized MVQS source found. Expected classic files or MVQS_DC .accdb files.');
}

function setupSchema(db) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE parity_table_tap_evidence (
      table_name TEXT NOT NULL,
      source_keys TEXT NOT NULL,
      missing INTEGER NOT NULL,
      tap_source_key TEXT,
      row_count INTEGER,
      referenced_by_query_count INTEGER NOT NULL DEFAULT 0,
      evidence_json TEXT NOT NULL,
      PRIMARY KEY(table_name, missing)
    );

    CREATE TABLE parity_mapping_evidence (
      object_type TEXT NOT NULL,
      object_name TEXT NOT NULL,
      mapped INTEGER NOT NULL,
      mapping_source TEXT,
      modern_target TEXT,
      error_message TEXT,
      evidence_json TEXT NOT NULL,
      PRIMARY KEY(object_type, object_name)
    );

    CREATE TABLE parity_access_execution_evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      front_end_path TEXT,
      object_type TEXT NOT NULL,
      object_name TEXT NOT NULL,
      status TEXT NOT NULL,
      metric_value INTEGER,
      error_message TEXT,
      evidence_json TEXT NOT NULL
    );

    CREATE TABLE jobs (
      dot_code TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      trait_vector TEXT NOT NULL,
      vq REAL,
      svp INTEGER,
      population INTEGER,
      disability_code TEXT,
      skill_vq REAL,
      skill_alt REAL,
      skill_bucket INTEGER,
      onet_ou_code TEXT,
      sic TEXT,
      soc TEXT,
      cen TEXT,
      ind TEXT,
      wf1 TEXT,
      mpsms_primary TEXT,
      mtewa_primary TEXT,
      onet_group_or_ou TEXT
    );

    CREATE TABLE job_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dot_code TEXT NOT NULL,
      ts INTEGER,
      description TEXT NOT NULL
    );

    CREATE TABLE states (
      state_id INTEGER PRIMARY KEY,
      country_id INTEGER,
      state_number INTEGER,
      state_abbrev TEXT,
      state_name TEXT,
      mdb_name TEXT,
      installed INTEGER
    );

    CREATE TABLE counties (
      county_id INTEGER PRIMARY KEY,
      county_number INTEGER,
      state_id INTEGER,
      country_id INTEGER,
      county_name TEXT,
      state_code TEXT,
      eclr_current REAL
    );

    CREATE TABLE state_job_counts (
      state_id INTEGER,
      dot_code TEXT,
      job_count INTEGER NOT NULL,
      PRIMARY KEY(state_id, dot_code)
    ) WITHOUT ROWID;

    CREATE TABLE county_job_counts (
      state_id INTEGER,
      county_id INTEGER,
      dot_code TEXT,
      job_count INTEGER NOT NULL,
      PRIMARY KEY(state_id, county_id, dot_code)
    ) WITHOUT ROWID;

    CREATE INDEX idx_jobs_title ON jobs(title);
    CREATE INDEX idx_job_tasks_dot_ts ON job_tasks(dot_code, ts);
    CREATE INDEX idx_state_job_counts_state ON state_job_counts(state_id, job_count DESC);
    CREATE INDEX idx_state_job_counts_dot ON state_job_counts(dot_code, job_count DESC);
    CREATE INDEX idx_county_job_counts_state_county ON county_job_counts(state_id, county_id, job_count DESC);
    CREATE INDEX idx_county_job_counts_dot_state ON county_job_counts(dot_code, state_id, job_count DESC);
    CREATE INDEX idx_parity_access_exec_object ON parity_access_execution_evidence(object_type, object_name, status);

    -- ================================================================
    -- Gap-closure tables (reference / lookup / historical / wage data)
    -- ================================================================

    CREATE TABLE occupations_historical (
      id INTEGER,
      title_record_number REAL,
      record REAL,
      doc_no TEXT,
      dot_code TEXT,
      dot_title TEXT,
      job_cat TEXT,
      category TEXT,
      vq REAL,
      svp REAL,
      svp_length TEXT,
      zone INTEGER,
      oes_code TEXT,
      oes_title TEXT,
      onet_cat TEXT,
      onet_code TEXT,
      onet_title TEXT,
      onet_desc TEXT,
      goe_ia TEXT,
      goe_wg TEXT,
      goe06 TEXT,
      vipr_type TEXT,
      sic TEXT,
      soc TEXT,
      cen TEXT,
      mps TEXT,
      wf1 TEXT,
      update_code TEXT,
      ind TEXT,
      gedr1 INTEGER,
      gedm1 INTEGER,
      gedl1 INTEGER,
      svp1 INTEGER,
      aptg1 INTEGER,
      aptv1 INTEGER,
      aptn1 INTEGER,
      apts1 INTEGER,
      aptp1 INTEGER,
      aptq1 INTEGER,
      aptk1 INTEGER,
      aptf1 INTEGER,
      aptm1 INTEGER,
      apte1 INTEGER,
      aptc1 INTEGER,
      strength INTEGER,
      climb_balance INTEGER,
      stoop_kneel INTEGER,
      reach_handle INTEGER,
      talk_hear INTEGER,
      see INTEGER,
      environment_conditions TEXT,
      data INTEGER,
      people INTEGER,
      things INTEGER
    );
    CREATE INDEX idx_occ_hist_dot ON occupations_historical(dot_code);
    CREATE INDEX idx_occ_hist_title ON occupations_historical(dot_title);
    CREATE INDEX idx_occ_hist_onet ON occupations_historical(onet_code);

    CREATE TABLE eclr_constants (
      variant TEXT PRIMARY KEY,
      eclr_mean1 REAL, eclr_mean2 REAL,
      eclr_10var1 REAL, eclr_10var2 REAL,
      eclr_25var1 REAL, eclr_25var2 REAL,
      eclr_median1 REAL, eclr_median2 REAL,
      eclr_75var1 REAL, eclr_75var2 REAL,
      eclr_90var1 REAL, eclr_90var2 REAL
    );

    CREATE TABLE inflation_rates (
      annual_year INTEGER PRIMARY KEY,
      average_inflation_rate REAL
    );

    CREATE TABLE average_worker_profile (
      profile_id INTEGER PRIMARY KEY,
      reasoning REAL, math REAL, language REAL,
      spatial REAL, form REAL, clerical REAL,
      motor REAL, finger REAL, manual REAL,
      eye_hand_foot REAL, color REAL, strength REAL,
      climb_balance REAL, stoop_kneel REAL, reach_handle REAL,
      talk_hear REAL, see REAL, out_in_both REAL,
      cold REAL, heat REAL, wet REAL,
      vibrations REAL, hazards REAL, dust_fumes REAL,
      achievement REAL, working_conditions REAL, recognition REAL,
      relationships REAL, support REAL, independence REAL,
      profile_title TEXT
    );

    CREATE TABLE mcplot_rating_scales (
      rating_id INTEGER PRIMARY KEY,
      trait_category_code TEXT,
      rating_criteria_id INTEGER,
      variable_number TEXT,
      variable_name TEXT,
      sequence REAL,
      level INTEGER,
      level_initials TEXT,
      level_descriptions TEXT,
      examples TEXT,
      percentile_ranges TEXT,
      skill_levels TEXT,
      rating_variable_notes TEXT,
      sort_order INTEGER,
      active INTEGER
    );
    CREATE INDEX idx_mcplot_scales_trait ON mcplot_rating_scales(trait_category_code);
    CREATE INDEX idx_mcplot_scales_var ON mcplot_rating_scales(variable_number);

    CREATE TABLE mcplot_rating_examples (
      example_id INTEGER PRIMARY KEY,
      trait_category_code TEXT,
      variable_number TEXT,
      variable_name TEXT,
      level INTEGER,
      example_no TEXT,
      example_description TEXT,
      sort_order INTEGER,
      active INTEGER
    );
    CREATE INDEX idx_mcplot_examples_trait ON mcplot_rating_examples(trait_category_code);

    CREATE TABLE aptitude_levels (
      apt_level INTEGER PRIMARY KEY,
      apt_description TEXT,
      apt_percentiles TEXT
    );

    CREATE TABLE ged_levels (
      ged_level INTEGER PRIMARY KEY,
      ged_description TEXT,
      ged_percentile TEXT
    );

    CREATE TABLE element_levels (
      element_level INTEGER PRIMARY KEY,
      element_description TEXT
    );

    CREATE TABLE job_categories (
      job_category_id INTEGER PRIMARY KEY,
      job_cat TEXT UNIQUE,
      category TEXT,
      count INTEGER,
      sort_order INTEGER
    );

    CREATE TABLE job_search_websites (
      website_id INTEGER PRIMARY KEY,
      job_search_category TEXT,
      job_search_company TEXT,
      website TEXT,
      sort_order INTEGER
    );

    CREATE TABLE tsp_report_levels (
      id INTEGER PRIMARY KEY,
      level_code TEXT,
      level_label TEXT,
      threshold_low REAL,
      threshold_high REAL
    );

    CREATE TABLE help_text (
      help_code INTEGER PRIMARY KEY,
      help_title TEXT,
      mvqs_category TEXT,
      help_text TEXT,
      help_index TEXT,
      help_form TEXT,
      mvqs_grouping TEXT,
      sort_order INTEGER
    );
    CREATE INDEX idx_help_text_category ON help_text(mvqs_category);

    CREATE TABLE usbls_oes (
      line_id INTEGER PRIMARY KEY,
      area TEXT,
      area_title TEXT,
      area_type INTEGER,
      prim_state TEXT,
      naics TEXT,
      naics_title TEXT,
      i_group TEXT,
      own_code INTEGER,
      occ_code TEXT,
      occ_title TEXT,
      o_group TEXT,
      tot_emp INTEGER,
      emp_prse REAL,
      jobs_1000 REAL,
      loc_quotient REAL,
      pct_total REAL,
      h_mean REAL,
      a_mean REAL,
      mean_prse REAL,
      h_pct10 REAL, h_pct25 REAL, h_median REAL, h_pct75 REAL, h_pct90 REAL,
      a_pct10 REAL, a_pct25 REAL, a_median REAL, a_pct75 REAL, a_pct90 REAL,
      annual TEXT,
      hourly TEXT,
      import_file TEXT,
      import_source TEXT
    );
    CREATE INDEX idx_usbls_oes_occ ON usbls_oes(occ_code);
    CREATE INDEX idx_usbls_oes_area ON usbls_oes(area);
    CREATE INDEX idx_usbls_oes_state ON usbls_oes(prim_state);

    CREATE TABLE usbls_oes_fields (
      field_id INTEGER PRIMARY KEY,
      field_name TEXT,
      field_description TEXT
    );

    -- ================================================================
    -- Gap-closure Phase 2: All remaining Access lookup tables
    -- ================================================================

    -- HIGH PRIORITY: Work Values Assessment System
    CREATE TABLE value_answers (
      value INTEGER PRIMARY KEY,
      label TEXT,
      count INTEGER
    );

    CREATE TABLE value_categories (
      category_id INTEGER PRIMARY KEY,
      category TEXT,
      sort_order INTEGER
    );

    CREATE TABLE value_options (
      option_id INTEGER PRIMARY KEY,
      oc_values TEXT,
      short_label TEXT,
      description TEXT,
      value REAL,
      label TEXT,
      desire TEXT
    );

    CREATE TABLE values_catalog (
      value_id INTEGER PRIMARY KEY,
      category_id INTEGER,
      oc_values TEXT,
      short_label TEXT,
      description TEXT,
      desire TEXT,
      count INTEGER,
      default_value INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER
    );
    CREATE INDEX idx_values_catalog_category ON values_catalog(category_id);

    CREATE TABLE work_history_value_defaults (
      id INTEGER PRIMARY KEY,
      v01 INTEGER, v02 INTEGER, v03 INTEGER, v04 INTEGER, v05 INTEGER,
      v06 INTEGER, v07 INTEGER, v08 INTEGER, v09 INTEGER, v10 INTEGER,
      v11 INTEGER, v12 INTEGER, v13 INTEGER, v14 INTEGER, v15 INTEGER,
      v16 INTEGER, v17 INTEGER, v18 INTEGER, v19 INTEGER, v20 INTEGER,
      v21 INTEGER
    );

    -- HIGH PRIORITY: VIPR Personality Assessment
    CREATE TABLE vipr_test_pairs (
      vipr_test_pair_id INTEGER PRIMARY KEY,
      test_number INTEGER,
      dot_code_1 TEXT,
      title_1 TEXT,
      dot_code_2 TEXT,
      title_2 TEXT,
      selection INTEGER,
      indicator_1 TEXT,
      indicator_2 TEXT,
      e_score TEXT,
      i_score TEXT,
      s_score TEXT,
      n_score TEXT,
      t_score TEXT,
      f_score TEXT,
      j_score TEXT,
      p_score TEXT,
      default_pair INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER
    );
    CREATE INDEX idx_vipr_test_pairs_test ON vipr_test_pairs(test_number);

    -- MEDIUM PRIORITY: Personality Types
    CREATE TABLE personality_types (
      personality_type TEXT PRIMARY KEY,
      personality_name TEXT,
      personality_description TEXT,
      job_descriptions TEXT,
      sort_order INTEGER
    );

    CREATE TABLE personality_type_indicators (
      indicator_id INTEGER PRIMARY KEY,
      indicator TEXT,
      indicator_description TEXT,
      sort_order INTEGER
    );

    -- MEDIUM PRIORITY: Test Score Conversion Tables
    CREATE TABLE score_scales (
      standard REAL PRIMARY KEY,
      percentile REAL,
      ged_effect REAL,
      apt_effect REAL
    );

    CREATE TABLE score_percentiles (
      percentile REAL PRIMARY KEY,
      standard REAL
    );

    -- MEDIUM PRIORITY: VIPR Job Descriptions
    CREATE TABLE vipr_job_descriptions (
      dot_code TEXT PRIMARY KEY,
      job_description TEXT
    );

    -- MEDIUM PRIORITY: Occupation Details (rich narratives)
    CREATE TABLE occupation_details (
      title_record_number INTEGER PRIMARY KEY,
      doc_no TEXT,
      dot_code TEXT,
      dot_code_11 TEXT,
      title TEXT,
      dot_title_2 TEXT,
      oes_code TEXT,
      oes_title TEXT,
      ou_code TEXT,
      ou_title TEXT,
      cat TEXT,
      category TEXT,
      div TEXT,
      division TEXT,
      grp TEXT,
      grp_name TEXT,
      goe_ia TEXT,
      goe_ia_title TEXT,
      holland_title TEXT,
      oap TEXT,
      goe_wg TEXT,
      oap_goe_wg_title TEXT,
      data_oap TEXT,
      gatb_oap TEXT,
      oap2 TEXT,
      data_oap2 TEXT,
      gatb_oap2 TEXT,
      goe_06 TEXT,
      sic TEXT,
      sic_title TEXT,
      soc TEXT,
      soc_title TEXT,
      cen TEXT,
      cen_title TEXT,
      mps TEXT,
      mps_title TEXT,
      mps2 TEXT,
      mps2_title TEXT,
      mps3 TEXT,
      mps3_title TEXT,
      wf1 TEXT,
      wf1_title TEXT,
      wf2 TEXT,
      wf3 TEXT,
      update_gov TEXT,
      update_field TEXT,
      vq REAL,
      data_level TEXT,
      data_vi TEXT,
      d_function TEXT,
      people_level TEXT,
      people_vi TEXT,
      p_function TEXT,
      things_level TEXT,
      things_vi TEXT,
      t_function TEXT,
      svp TEXT,
      svp_length TEXT,
      ptr TEXT
    );
    CREATE INDEX idx_occupation_details_dot ON occupation_details(dot_code);
    CREATE INDEX idx_occupation_details_oes ON occupation_details(oes_code);

    -- MEDIUM PRIORITY: Alternate Titles
    CREATE TABLE occupation_alternate_titles (
      title_record_number INTEGER,
      doc_no TEXT,
      alternate_title TEXT
    );
    CREATE INDEX idx_alt_titles_doc ON occupation_alternate_titles(doc_no);
    CREATE INDEX idx_alt_titles_title ON occupation_alternate_titles(alternate_title);

    -- MEDIUM PRIORITY: TEM/JOLT (Temperament + Labor Market)
    CREATE TABLE occupation_tem_jolt (
      title_record_number INTEGER PRIMARY KEY,
      record_num REAL,
      doc_no REAL,
      stem_rec REAL,
      dot_code TEXT,
      dot_title TEXT,
      dot_code_11 TEXT,
      dot_title_orig TEXT,
      tem_dir REAL,
      tem_rep REAL,
      tem_inf REAL,
      tem_var REAL,
      tem_exp REAL,
      tem_alo REAL,
      tem_str REAL,
      tem_tol REAL,
      tem_und REAL,
      tem_peo REAL,
      tem_jud REAL,
      js99_yearly_open REAL,
      jolt99_yearly_open REAL,
      soc99_cur_emp REAL,
      js05_yearly_open REAL,
      jolt05_yearly_open REAL,
      soc05_cur_emp REAL
    );
    CREATE INDEX idx_tem_jolt_dot ON occupation_tem_jolt(dot_code);

    -- MEDIUM PRIORITY: DOT Education/Training Crosswalk
    CREATE TABLE dot_education (
      dot_id INTEGER PRIMARY KEY,
      title_record_number INTEGER,
      doc_no INTEGER,
      dot_code TEXT,
      dot_title TEXT,
      caspar_adc TEXT,
      caspar_title TEXT,
      cadc_cip90 TEXT,
      cadc_cip_title TEXT,
      cip90 TEXT,
      cip90_title TEXT
    );
    CREATE INDEX idx_dot_education_code ON dot_education(dot_code);

    -- MEDIUM PRIORITY: CASPAR Education Programs
    CREATE TABLE occupation_caspar (
      title_record_number INTEGER,
      doc_no INTEGER,
      dot_code TEXT,
      dot_title TEXT,
      caspar_adc TEXT,
      caspar_title TEXT,
      cadc_cip90 TEXT,
      cadc_cip_title TEXT,
      cip90 TEXT,
      cip90_title TEXT
    );
    CREATE INDEX idx_caspar_dot ON occupation_caspar(dot_code);

    -- MEDIUM PRIORITY: Ratings (trait rating guidelines)
    CREATE TABLE ratings (
      rating_id INTEGER PRIMARY KEY,
      rating_name TEXT,
      variable_number TEXT,
      guidelines TEXT,
      default_rating INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER
    );

    -- LOW PRIORITY: Level Description Lookups
    CREATE TABLE svp_levels (
      svp_level INTEGER PRIMARY KEY,
      svp_description TEXT,
      svp_skill TEXT
    );

    CREATE TABLE strength_levels (
      strength_level INTEGER PRIMARY KEY,
      strength_description TEXT,
      strength_percentile TEXT
    );

    CREATE TABLE weather_levels (
      weather_level INTEGER PRIMARY KEY,
      weather_description TEXT,
      weather_percentile TEXT
    );

    CREATE TABLE physical_environmental_levels (
      physical_level INTEGER PRIMARY KEY,
      physical_description TEXT,
      physical_percentile TEXT
    );

    CREATE TABLE zone_levels (
      zone_level INTEGER PRIMARY KEY,
      zone_description TEXT
    );

    CREATE TABLE onet_codes (
      onet_code TEXT,
      onet_title TEXT,
      onet_category TEXT,
      count INTEGER
    );
    CREATE INDEX idx_onet_codes_code ON onet_codes(onet_code);

    CREATE TABLE countries (
      country_id INTEGER PRIMARY KEY,
      country TEXT
    );

    CREATE TABLE person_job_traits (
      trait_category_code TEXT PRIMARY KEY,
      trait_category TEXT,
      sort_order INTEGER
    );
  `);
}

function importStatesAndCounties(db, statesRows, countiesRows) {
  const insertState = db.prepare(
    'INSERT INTO states (state_id, country_id, state_number, state_abbrev, state_name, mdb_name, installed) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const stateRecords = statesRows.map((row) => ({
    stateId: toInt(row.StateID ?? row.STATEID),
    countryId: toInt(row.CountryID ?? row.COUNTRYID),
    stateNumber: toInt(row.StateNumber ?? row.STATENUMBER),
    stateAbbrev: safeTrim(row.StateAbbrev ?? row.STATE ?? row.State),
    stateName: safeTrim(row.State_Province ?? row.STATE_PROVINCE ?? row.StateName),
    mdbName: safeTrim(row.MDBName ?? row.MDBNAME),
    installed: toInt(row.Installed ?? row.INSTALLED) ?? 1
  }));

  const stateNumberToCanonicalId = new Map();
  for (const state of stateRecords) {
    if (state.stateNumber !== null && state.stateId !== null) {
      stateNumberToCanonicalId.set(state.stateNumber, state.stateId);
    }
  }

  withTransaction(db, () => {
    for (const state of stateRecords) {
      if (state.stateId === null) {
        continue;
      }
      insertState.run(
        state.stateId,
        state.countryId,
        state.stateNumber,
        state.stateAbbrev,
        state.stateName,
        state.mdbName,
        state.installed
      );
    }
  });

  const insertCounty = db.prepare(
    'INSERT INTO counties (county_id, county_number, state_id, country_id, county_name, state_code, eclr_current) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const countyIdByStateAndNumber = new Map();

  withTransaction(db, () => {
    for (const row of countiesRows) {
      const countyId = toInt(row.COUNTYID ?? row.CountyID);
      if (countyId === null) {
        continue;
      }

      const rawStateNumber = toInt(row.STATEID ?? row.StateID);
      const canonicalStateId = stateNumberToCanonicalId.get(rawStateNumber) ?? rawStateNumber;
      const countyNumber = toInt(row.COUNTYNUMBER ?? row.CountyNumber);

      if (rawStateNumber !== null && countyNumber !== null) {
        countyIdByStateAndNumber.set(`${rawStateNumber}|${countyNumber}`, countyId);
      }

      insertCounty.run(
        countyId,
        countyNumber,
        canonicalStateId,
        toInt(row.COUNTRYID ?? row.CountryID),
        safeTrim(row.COUNTYNAME ?? row.CountyName),
        safeTrim(row.STATE ?? row.State),
        pickLatestEclr(row)
      );
    }
  });

  return { stateRecords, countyIdByStateAndNumber, stateNumberToCanonicalId };
}

function getRequestedStatesSet(rawStates) {
  if (!rawStates) {
    return null;
  }

  return new Set(
    String(rawStates)
      .split(',')
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean)
  );
}

function filterStatesToImport(stateRecords, requestedStatesSet) {
  return stateRecords.filter((state) => {
    if (state.installed !== 1 || state.stateId === null) {
      return false;
    }

    if (!requestedStatesSet) {
      return true;
    }

    const abbrev = (state.stateAbbrev || '').toUpperCase();
    const name = (state.stateName || '').toUpperCase();
    const mdb = (state.mdbName || '').replace(/\.mdb$/i, '').toUpperCase();

    return requestedStatesSet.has(abbrev) || requestedStatesSet.has(name) || requestedStatesSet.has(mdb);
  });
}

function prepareCountUpserts(db) {
  const upsertStateCount = db.prepare(`
    INSERT INTO state_job_counts (state_id, dot_code, job_count)
    VALUES (?, ?, ?)
    ON CONFLICT(state_id, dot_code)
    DO UPDATE SET job_count = state_job_counts.job_count + excluded.job_count
  `);

  const upsertCountyCount = db.prepare(`
    INSERT INTO county_job_counts (state_id, county_id, dot_code, job_count)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(state_id, county_id, dot_code)
    DO UPDATE SET job_count = county_job_counts.job_count + excluded.job_count
  `);

  return { upsertStateCount, upsertCountyCount };
}

function importClassic(db, legacyDir, requestedStatesSet) {
  const mvqsMdbPath = findExistingMdb(legacyDir, 'MVQS2016.mdb') || findExistingMdb(legacyDir, 'MVQS2017.mdb');
  if (!mvqsMdbPath) {
    throw new Error('Could not find MVQS2016.mdb or MVQS2017.mdb in legacy directory.');
  }

  console.log('Loading DOT task metadata from classic MVQS database...');
  const dottsRows = parseCsvRows(runMdbExport(mvqsMdbPath, 'DOTTS'));
  const dotMeta = new Map();

  const insertTask = db.prepare('INSERT INTO job_tasks (dot_code, ts, description) VALUES (?, ?, ?)');

  withTransaction(db, () => {
    for (const row of dottsRows) {
      const dotCode = normalizeDot(row.DOTCODE09);
      if (!dotCode) {
        continue;
      }

      if (!dotMeta.has(dotCode)) {
        dotMeta.set(dotCode, {
          vq: toFloat(row.VQ1),
          svp: toInt(row.SVP1),
          onetOuCode: safeTrim(row.ONETOUCODE),
          sic: normalizeCodeToken(pickFirstPresent(row, ['SIC', 'SIC1'])),
          soc: normalizeCodeToken(pickFirstPresent(row, ['SOC', 'SOC1'])),
          cen: normalizeCodeToken(pickFirstPresent(row, ['CEN', 'CEN1'])),
          ind: normalizeCodeToken(pickFirstPresent(row, ['IND', 'IND1'])),
          wf1: normalizeCodeToken(pickFirstPresent(row, ['WF1', 'WF_1'])),
          mpsmsPrimary: normalizeCodeToken(pickFirstPresent(row, ['MPSMS', 'MPSMS1', 'MPSMS_PRIMARY'])),
          mtewaPrimary: normalizeCodeToken(pickFirstPresent(row, ['MTEWA', 'MTEWA1', 'MTEWA_PRIMARY'])),
          onetGroupOrOu: normalizeCodeToken(
            pickFirstPresent(row, ['ONETGROUP', 'ONET_GROUP_OR_OU', 'ONETOUCODE', 'ONET_OU_CODE'])
          )
        });
      }

      const description = safeTrim(row.DESCRIPT);
      if (description) {
        insertTask.run(dotCode, toInt(row.TS), description);
      }
    }
  });

  console.log('Loading classic PRN occupation files...');
  const titleLines = readPrnLines(path.join(legacyDir, 'DOTTitle.prn'));
  const descLines = readPrnLines(path.join(legacyDir, 'DOTDesc.PRN'));
  const varLines = readPrnLines(path.join(legacyDir, 'DOTVar.prn'));
  const skillLines = readPrnLines(path.join(legacyDir, 'DOTSkills.prn'));
  const popLines = readPrnLines(path.join(legacyDir, 'DOTPop.prn'));
  const disLines = readPrnLines(path.join(legacyDir, 'DOTDis.prn'));

  const total = titleLines.length;
  if (
    total !== descLines.length ||
    total !== varLines.length ||
    total !== skillLines.length ||
    total !== popLines.length ||
    total !== disLines.length
  ) {
    throw new Error('Legacy PRN files have mismatched row counts.');
  }

  const insertJob = db.prepare(`
    INSERT INTO jobs (
      dot_code, title, description, trait_vector, vq, svp,
      population, disability_code, skill_vq, skill_alt,
      skill_bucket, onet_ou_code,
      sic, soc, cen, ind, wf1, mpsms_primary, mtewa_primary, onet_group_or_ou
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  withTransaction(db, () => {
    for (let i = 0; i < total; i += 1) {
      const parsedTitle = parseTitleLine(titleLines[i]);
      const dotCode = parsedTitle.dotCode;
      if (!dotCode) {
        continue;
      }

      const traitVector = (varLines[i] || '').trim();
      if (traitVector.length !== 24) {
        continue;
      }

      const skill = parseSkillsLine(skillLines[i]);
      const meta = dotMeta.get(dotCode) || {};

      insertJob.run(
        dotCode,
        parsedTitle.title,
        (descLines[i] || '').trim(),
        traitVector,
        meta.vq ?? skill.skillVq,
        meta.svp ?? skill.svp,
        toInt(popLines[i]),
        (disLines[i] || '').trim() || null,
        skill.skillVq,
        skill.skillAlt,
        skill.skillBucket,
        meta.onetOuCode ?? null,
        meta.sic ?? null,
        meta.soc ?? null,
        meta.cen ?? null,
        meta.ind ?? null,
        meta.wf1 ?? null,
        meta.mpsmsPrimary ?? null,
        meta.mtewaPrimary ?? null,
        meta.onetGroupOrOu ?? meta.onetOuCode ?? null
      );
    }
  });

  console.log('Loading classic state/county lookups from jcontrol.mdb...');
  const jcontrolPath = findExistingMdb(legacyDir, 'jcontrol.mdb');
  if (!jcontrolPath) {
    throw new Error('Could not find jcontrol.mdb in legacy directory.');
  }

  const statesRows = parseCsvRows(runMdbExport(jcontrolPath, 'tlkpStatesProvinces'));
  const countiesRows = parseCsvRows(runMdbExport(jcontrolPath, 'tlkpCounty'));

  const { stateRecords, countyIdByStateAndNumber, stateNumberToCanonicalId } = importStatesAndCounties(
    db,
    statesRows,
    countiesRows
  );
  const statesToImport = filterStatesToImport(stateRecords, requestedStatesSet);
  const { upsertStateCount, upsertCountyCount } = prepareCountUpserts(db);

  console.log(`Importing classic jobbanks for ${statesToImport.length} state/province datasets...`);
  for (const state of statesToImport) {
    if (!state.mdbName) {
      continue;
    }

    const mdbPath = findExistingMdb(legacyDir, state.mdbName);
    if (!mdbPath) {
      console.warn(`Skipping ${state.stateName}: missing ${state.mdbName}`);
      continue;
    }

    const rows = parseCsvRows(runMdbExport(mdbPath, 'tblJobBanks'));
    const stateAggregate = new Map();
    const countyAggregate = new Map();

    for (const row of rows) {
      const dotCode = normalizeDot(row.DOTCODE09 ?? row.DotCode09 ?? row.dotcode09);
      const rawStateNumber = toInt(row.StateID ?? row.STATEID);
      const countyNumber = toInt(row.CountyID ?? row.COUNTYID);
      if (!dotCode || rawStateNumber === null || countyNumber === null) {
        continue;
      }

      const canonicalStateId = stateNumberToCanonicalId.get(rawStateNumber) ?? rawStateNumber;
      if (canonicalStateId === null) {
        continue;
      }

      const countyId = countyIdByStateAndNumber.get(`${rawStateNumber}|${countyNumber}`) ?? countyNumber;

      const stateKey = `${canonicalStateId}|${dotCode}`;
      stateAggregate.set(stateKey, (stateAggregate.get(stateKey) || 0) + 1);

      const countyKey = `${canonicalStateId}|${countyId}|${dotCode}`;
      countyAggregate.set(countyKey, (countyAggregate.get(countyKey) || 0) + 1);
    }

    withTransaction(db, () => {
      for (const [key, count] of stateAggregate.entries()) {
        const [stateIdRaw, dotCode] = key.split('|');
        upsertStateCount.run(Number(stateIdRaw), dotCode, count);
      }

      for (const [key, count] of countyAggregate.entries()) {
        const [stateIdRaw, countyIdRaw, dotCode] = key.split('|');
        upsertCountyCount.run(Number(stateIdRaw), Number(countyIdRaw), dotCode, count);
      }
    });

    console.log(
      `Imported ${state.stateAbbrev} (${state.stateName}): ${stateAggregate.size.toLocaleString()} state-code rows, ${countyAggregate.size.toLocaleString()} county-code rows`
    );
  }

  return {
    sourceMode: 'classic',
    sourceMainPath: mvqsMdbPath
  };
}

function buildTraitVectorFromOccupationRow(row) {
  const orderedValues = [
    row.GEDR1,
    row.GEDM1,
    row.GEDL1,
    row.APTS1,
    row.APTP1,
    row.APTQ1,
    row.APTK1,
    row.APTF1,
    row.APTM1,
    row.APTE1,
    row.APTC1,
    row.PD11,
    row.PD21,
    row.PD31,
    row.PD41,
    row.PD51,
    row.PD61,
    row.EC11,
    row.EC21,
    row.EC31,
    row.EC41,
    row.EC51,
    row.EC61,
    row.EC71
  ];

  const digits = orderedValues.map((value) => {
    const parsed = toInt(value);
    return parsed === null ? 0 : parsed;
  });

  return digits.join('');
}

function importDc(db, legacyDir, requestedStatesSet) {
  const dcDataPath = path.join(legacyDir, 'MVQS_DC_Data.accdb');
  const dcJobBankPath = path.join(legacyDir, 'MVQS_DC_Data_JobBank.accdb');

  if (!fs.existsSync(dcDataPath) || !fs.existsSync(dcJobBankPath)) {
    throw new Error('MVQS_DC_Data.accdb and MVQS_DC_Data_JobBank.accdb are required for DC source import.');
  }

  console.log('Loading transferable-skills task metadata from MVQS_DC data...');
  const taskRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Occupations_Transferrable_Skills'));
  const taskMeta = new Map();
  const insertTask = db.prepare('INSERT INTO job_tasks (dot_code, ts, description) VALUES (?, ?, ?)');

  withTransaction(db, () => {
    for (const row of taskRows) {
      const dotCode = normalizeDot(row.DOTCODE09);
      if (!dotCode) {
        continue;
      }

      if (!taskMeta.has(dotCode)) {
        taskMeta.set(dotCode, {
          vq: toFloat(row.VQ1),
          svp: toInt(row.SVP1),
          onetOuCode: safeTrim(row.ONETOUCODE),
          sic: normalizeCodeToken(pickFirstPresent(row, ['SIC', 'SIC1'])),
          soc: normalizeCodeToken(pickFirstPresent(row, ['SOC', 'SOC1'])),
          cen: normalizeCodeToken(pickFirstPresent(row, ['CEN', 'CEN1'])),
          ind: normalizeCodeToken(pickFirstPresent(row, ['IND', 'IND1'])),
          wf1: normalizeCodeToken(pickFirstPresent(row, ['WF1', 'WF_1'])),
          mpsmsPrimary: normalizeCodeToken(pickFirstPresent(row, ['MPSMS', 'MPSMS1', 'MPSMS_PRIMARY'])),
          mtewaPrimary: normalizeCodeToken(pickFirstPresent(row, ['MTEWA', 'MTEWA1', 'MTEWA_PRIMARY'])),
          onetGroupOrOu: normalizeCodeToken(
            pickFirstPresent(row, ['ONETGROUP', 'ONET_GROUP_OR_OU', 'ONETOUCODE', 'ONET_OU_CODE'])
          )
        });
      }

      const description = safeTrim(row.DESCRIPT);
      if (description) {
        insertTask.run(dotCode, toInt(row.TS), description);
      }
    }
  });

  console.log('Loading occupations from MVQS_DC data...');
  const occupationsRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Occupations'));

  const insertJob = db.prepare(`
    INSERT INTO jobs (
      dot_code, title, description, trait_vector, vq, svp,
      population, disability_code, skill_vq, skill_alt,
      skill_bucket, onet_ou_code,
      sic, soc, cen, ind, wf1, mpsms_primary, mtewa_primary, onet_group_or_ou
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  withTransaction(db, () => {
    for (const row of occupationsRows) {
      const dotCode = normalizeDot(row.Dot_Code ?? row.DOTCODE09);
      if (!dotCode) {
        continue;
      }

      const meta = taskMeta.get(dotCode) || {};
      const traitVector = buildTraitVectorFromOccupationRow(row);
      if (traitVector.length !== 24) {
        continue;
      }

      insertJob.run(
        dotCode,
        safeTrim(row.Title) || 'Untitled',
        safeTrim(row.JobDescription) || '',
        traitVector,
        toFloat(row.VQ) ?? meta.vq ?? null,
        toInt(row.SVP1) ?? meta.svp ?? null,
        toInt(row.Pop_Work_Job_Count),
        null,
        meta.vq ?? toFloat(row.VQ),
        toFloat(row.EQ),
        null,
        safeTrim(row.ONETCODE) ?? meta.onetOuCode ?? null,
        normalizeCodeToken(pickFirstPresent(row, ['SIC', 'SIC1'])) ?? meta.sic ?? null,
        normalizeCodeToken(pickFirstPresent(row, ['SOC', 'SOC1'])) ?? meta.soc ?? null,
        normalizeCodeToken(pickFirstPresent(row, ['CEN', 'CEN1'])) ?? meta.cen ?? null,
        normalizeCodeToken(pickFirstPresent(row, ['IND', 'IND1'])) ?? meta.ind ?? null,
        normalizeCodeToken(pickFirstPresent(row, ['WF1', 'WF_1'])) ?? meta.wf1 ?? null,
        normalizeCodeToken(
          pickFirstPresent(row, ['MPSMS', 'MPSMS1', 'MPSMS_PRIMARY', 'MPSMSPrimary'])
        ) ?? meta.mpsmsPrimary ?? null,
        normalizeCodeToken(
          pickFirstPresent(row, ['MTEWA', 'MTEWA1', 'MTEWA_PRIMARY', 'MTEWAPrimary'])
        ) ?? meta.mtewaPrimary ?? null,
        normalizeCodeToken(
          pickFirstPresent(row, ['ONETGROUP', 'ONET_GROUP_OR_OU', 'ONETCODE', 'ONETOUCODE'])
        ) ?? meta.onetGroupOrOu ?? meta.onetOuCode ?? null
      );
    }
  });

  console.log('Loading state/county lookups from MVQS_DC data...');
  const statesRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_States_Provinces'));
  const countiesRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Counties'));

  const { stateRecords, countyIdByStateAndNumber, stateNumberToCanonicalId } = importStatesAndCounties(
    db,
    statesRows,
    countiesRows
  );
  const statesToImport = filterStatesToImport(stateRecords, requestedStatesSet);
  const { upsertStateCount, upsertCountyCount } = prepareCountUpserts(db);

  console.log(`Importing MVQS_DC jobbank rows for ${statesToImport.length} state/province datasets...`);
  for (const state of statesToImport) {
    const stateNumber = state.stateNumber;
    if (stateNumber === null) {
      continue;
    }

    const sql = `SELECT StateID, CountyNumber, DOTCODE09 FROM tblJob_Bank WHERE StateID = ${stateNumber}`;
    const output = runMdbSql(dcJobBankPath, sql);
    const lines = output.split(/\r?\n/).filter((line) => line.trim().length > 0);

    const stateAggregate = new Map();
    const countyAggregate = new Map();

    for (const line of lines) {
      const [stateRaw, countyRaw, dotRaw] = line.split(',');
      const sNum = toInt(stateRaw);
      const countyNumber = toInt(countyRaw);
      const dotCode = normalizeDot(dotRaw);

      if (sNum === null || countyNumber === null || !dotCode) {
        continue;
      }

      const canonicalStateId = stateNumberToCanonicalId.get(sNum);
      if (canonicalStateId === undefined) {
        continue;
      }

      const countyId = countyIdByStateAndNumber.get(`${sNum}|${countyNumber}`) ?? countyNumber;

      const stateKey = `${canonicalStateId}|${dotCode}`;
      stateAggregate.set(stateKey, (stateAggregate.get(stateKey) || 0) + 1);

      const countyKey = `${canonicalStateId}|${countyId}|${dotCode}`;
      countyAggregate.set(countyKey, (countyAggregate.get(countyKey) || 0) + 1);
    }

    withTransaction(db, () => {
      for (const [key, count] of stateAggregate.entries()) {
        const [stateIdRaw, dotCode] = key.split('|');
        upsertStateCount.run(Number(stateIdRaw), dotCode, count);
      }

      for (const [key, count] of countyAggregate.entries()) {
        const [stateIdRaw, countyIdRaw, dotCode] = key.split('|');
        upsertCountyCount.run(Number(stateIdRaw), Number(countyIdRaw), dotCode, count);
      }
    });

    console.log(
      `Imported ${state.stateAbbrev} (${state.stateName}): ${stateAggregate.size.toLocaleString()} state-code rows, ${countyAggregate.size.toLocaleString()} county-code rows`
    );
  }

  // ------------------------------------------------------------------
  // Gap-closure: import reference/lookup/historical/wage tables
  // ------------------------------------------------------------------

  console.log('Importing gap-closure reference tables from MVQS_DC data...');

  // --- Historical occupations (tblXLU_Occupations_12775PRE) ---
  console.log('  Loading tblXLU_Occupations_12775PRE (historical occupations)...');
  const histOccRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Occupations_12775PRE'));
  const insertHistOcc = db.prepare(`
    INSERT INTO occupations_historical (
      id, title_record_number, record, doc_no, dot_code, dot_title,
      job_cat, category, vq, svp, svp_length, zone,
      oes_code, oes_title, onet_cat, onet_code, onet_title, onet_desc,
      goe_ia, goe_wg, goe06, vipr_type, sic, soc, cen, mps, wf1,
      update_code, ind,
      gedr1, gedm1, gedl1, svp1,
      aptg1, aptv1, aptn1, apts1, aptp1, aptq1, aptk1, aptf1, aptm1, apte1, aptc1,
      strength, climb_balance, stoop_kneel, reach_handle, talk_hear, see,
      environment_conditions, data, people, things
    ) VALUES (${new Array(54).fill('?').join(',')})
  `);
  withTransaction(db, () => {
    for (const row of histOccRows) {
      insertHistOcc.run(
        toInt(row.ID),
        toFloat(row.TitleRecordNumber),
        toFloat(row.Record),
        safeTrim(row['Doc No']),
        normalizeDot(row.DOTCODE09),
        safeTrim(row.DOTTITLE),
        safeTrim(row.JOBCAT),
        safeTrim(row.CATEGORY),
        toFloat(row.VQ1),
        toFloat(row.SVP1),
        safeTrim(row.SVPLENTH),
        toInt(row.ZONE1),
        safeTrim(row.OESCODE),
        safeTrim(row.OESTITLE),
        safeTrim(row.ONETCAT),
        safeTrim(row.ONETCODE),
        safeTrim(row.ONETTITLE),
        safeTrim(row.ONETDESC),
        safeTrim(row.GOEIA),
        safeTrim(row.GOEWG),
        safeTrim(row.GOE06),
        safeTrim(row.VIPRTYPE),
        safeTrim(row.SIC),
        safeTrim(row.SOC),
        safeTrim(row.CEN),
        safeTrim(row.MPS),
        safeTrim(row.WF1),
        safeTrim(row.UPDATE),
        safeTrim(row.IND),
        toInt(row.GEDR1),
        toInt(row.GEDM1),
        toInt(row.GEDL1),
        toInt(row.SVP1),
        toInt(row.APTG1),
        toInt(row.APTV1),
        toInt(row.APTN1),
        toInt(row.APTS1),
        toInt(row.APTP1),
        toInt(row.APTQ1),
        toInt(row.APTK1),
        toInt(row.APTF1),
        toInt(row.APTM1),
        toInt(row.APTE1),
        toInt(row.APTC1),
        toInt(row.STRENGTH),
        toInt(row.CLIMB_BALANCE ?? row['CLIMB BALANCE']),
        toInt(row.STOOP_KNEEL ?? row['STOOP KNEEL']),
        toInt(row.REACH_HANDLE ?? row['REACH HANDLE']),
        toInt(row.TALK_HEAR ?? row['TALK HEAR']),
        toInt(row.SEE),
        safeTrim(row.ENVCON ?? row.ENVIRONMENT_CONDITIONS),
        toInt(row.DATA),
        toInt(row.PEOPLE),
        toInt(row.THINGS)
      );
    }
  });
  console.log(`  Imported ${histOccRows.length} historical occupations.`);

  // --- ECLR Constants ---
  console.log('  Loading ECLR constants...');
  const eclrVariants = [
    { variant: 'default', tableName: 'tblXLU_ECLR_Constants' },
    { variant: '1', tableName: 'tblXLU_ECLR_Constants_1' },
    { variant: '2', tableName: 'tblXLU_ECLR_Constants_2' },
    { variant: '4', tableName: 'tblXLU_ECLR_Constants_4' }
  ];
  const insertEclr = db.prepare(`
    INSERT INTO eclr_constants (
      variant, eclr_mean1, eclr_mean2,
      eclr_10var1, eclr_10var2, eclr_25var1, eclr_25var2,
      eclr_median1, eclr_median2, eclr_75var1, eclr_75var2,
      eclr_90var1, eclr_90var2
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  withTransaction(db, () => {
    for (const { variant, tableName } of eclrVariants) {
      const rows = parseCsvRows(runMdbExport(dcDataPath, tableName));
      for (const row of rows) {
        insertEclr.run(
          variant,
          toFloat(row.ECLRMean1 ?? row.ECLRMEAN1),
          toFloat(row.ECLRMean2 ?? row.ECLRMEAN2),
          toFloat(row.ECLR10Var1 ?? row.ECLR10VAR1),
          toFloat(row.ECLR10Var2 ?? row.ECLR10VAR2),
          toFloat(row.ECLR25Var1 ?? row.ECLR25VAR1),
          toFloat(row.ECLR25Var2 ?? row.ECLR25VAR2),
          toFloat(row.ECLRMedian1 ?? row.ECLRMEDIAN1),
          toFloat(row.ECLRMedian2 ?? row.ECLRMEDIAN2),
          toFloat(row.ECLR75Var1 ?? row.ECLR75VAR1),
          toFloat(row.ECLR75Var2 ?? row.ECLR75VAR2),
          toFloat(row.ECLR90Var1 ?? row.ECLR90VAR1),
          toFloat(row.ECLR90Var2 ?? row.ECLR90VAR2)
        );
      }
    }
  });
  console.log('  Imported 4 ECLR constant variants.');

  // --- Inflation Rates ---
  console.log('  Loading inflation rates...');
  const inflationRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Annual_Inflation_Rates'));
  const insertInflation = db.prepare('INSERT INTO inflation_rates (annual_year, average_inflation_rate) VALUES (?, ?)');
  withTransaction(db, () => {
    for (const row of inflationRows) {
      insertInflation.run(toInt(row.Annual_Year), toFloat(row.AverageInflationRate));
    }
  });
  console.log(`  Imported ${inflationRows.length} inflation rates.`);

  // --- Average Worker Profile ---
  console.log('  Loading average worker profile...');
  const avgProfileRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_AverageWorkerProfile'));
  const insertAvgProfile = db.prepare(`
    INSERT INTO average_worker_profile (
      profile_id, reasoning, math, language, spatial, form, clerical,
      motor, finger, manual, eye_hand_foot, color, strength,
      climb_balance, stoop_kneel, reach_handle, talk_hear, see,
      out_in_both, cold, heat, wet, vibrations, hazards, dust_fumes,
      achievement, working_conditions, recognition, relationships, support, independence,
      profile_title
    ) VALUES (${new Array(32).fill('?').join(',')})
  `);
  withTransaction(db, () => {
    for (const row of avgProfileRows) {
      insertAvgProfile.run(
        toInt(row.Average_Worker_Profile_ID),
        toFloat(row.Reasoning), toFloat(row.Math), toFloat(row.Language),
        toFloat(row.Spatial), toFloat(row.Form), toFloat(row.Clerical),
        toFloat(row.Motor), toFloat(row.Finger), toFloat(row.Manual),
        toFloat(row['Eye-Hand-Foot']), toFloat(row.Color), toFloat(row.Strength),
        toFloat(row.Climb_Balance), toFloat(row.Stoop_Kneel), toFloat(row.Reach_Handle),
        toFloat(row.Talk_Hear), toFloat(row.See), toFloat(row.Out_In_Both),
        toFloat(row.Cold), toFloat(row.Heat), toFloat(row.Wet),
        toFloat(row.Vibrations), toFloat(row.Hazards), toFloat(row.Dust_Fumes),
        toFloat(row.Achievement), toFloat(row.WorkingConditions), toFloat(row.Recognition),
        toFloat(row.Relationships), toFloat(row.Support), toFloat(row.Independence),
        safeTrim(row.ProfileTitle)
      );
    }
  });
  console.log(`  Imported ${avgProfileRows.length} average worker profiles.`);

  // --- McPlot Rating Scales ---
  console.log('  Loading McPlot rating scales...');
  const mcplotScalesRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_McPlotRatingScales'));
  const insertMcplotScale = db.prepare(`
    INSERT INTO mcplot_rating_scales (
      rating_id, trait_category_code, rating_criteria_id, variable_number,
      variable_name, sequence, level, level_initials, level_descriptions,
      examples, percentile_ranges, skill_levels, rating_variable_notes,
      sort_order, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  withTransaction(db, () => {
    for (const row of mcplotScalesRows) {
      insertMcplotScale.run(
        toInt(row.RatingID), safeTrim(row.Trait_Category_Code), toInt(row.RatingCriteriaID),
        safeTrim(row.VariableNumber), safeTrim(row.VariableName), toFloat(row.Sequence),
        toInt(row.Level), safeTrim(row.Level_Initials), safeTrim(row.Level_Descriptions),
        safeTrim(row.Examples), safeTrim(row.Percentile_Ranges), safeTrim(row.Skill_Levels),
        safeTrim(row.Rating_Variable_Notes), toInt(row.Sort_Order), toInt(row.Active)
      );
    }
  });
  console.log(`  Imported ${mcplotScalesRows.length} McPlot rating scales.`);

  // --- McPlot Rating Examples ---
  console.log('  Loading McPlot rating examples...');
  const mcplotExampleRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_McPlotRating_Examples'));
  const insertMcplotExample = db.prepare(`
    INSERT INTO mcplot_rating_examples (
      example_id, trait_category_code, variable_number, variable_name,
      level, example_no, example_description, sort_order, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  withTransaction(db, () => {
    for (const row of mcplotExampleRows) {
      insertMcplotExample.run(
        toInt(row.McPlot_Rating_Example_ID), safeTrim(row.Trait_Category_Code),
        safeTrim(row.VariableNumber), safeTrim(row.VariableName),
        toInt(row.Level), safeTrim(row.Example_No), safeTrim(row.Example_Description),
        toInt(row.Sort_Order), toInt(row.Active)
      );
    }
  });
  console.log(`  Imported ${mcplotExampleRows.length} McPlot rating examples.`);

  // --- Aptitude Levels ---
  console.log('  Loading aptitude levels...');
  const aptRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_AptitudeLevels'));
  const insertApt = db.prepare('INSERT INTO aptitude_levels (apt_level, apt_description, apt_percentiles) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of aptRows) {
      insertApt.run(toInt(row.APTLevel), safeTrim(row.APTDescription), safeTrim(row.APTPercentiles));
    }
  });
  console.log(`  Imported ${aptRows.length} aptitude levels.`);

  // --- GED Levels ---
  console.log('  Loading GED levels...');
  const gedRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_GEDLevels'));
  const insertGed = db.prepare('INSERT INTO ged_levels (ged_level, ged_description, ged_percentile) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of gedRows) {
      insertGed.run(toInt(row.GEDLevel), safeTrim(row.GEDDescription), safeTrim(row.GEDPercentile));
    }
  });
  console.log(`  Imported ${gedRows.length} GED levels.`);

  // --- Element Levels ---
  console.log('  Loading element levels...');
  const elemRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_ElementLevels'));
  const insertElem = db.prepare('INSERT INTO element_levels (element_level, element_description) VALUES (?, ?)');
  withTransaction(db, () => {
    for (const row of elemRows) {
      insertElem.run(toInt(row.ElementLevel), safeTrim(row.ElementDescription));
    }
  });
  console.log(`  Imported ${elemRows.length} element levels.`);

  // --- Job Categories ---
  console.log('  Loading job categories...');
  const jobCatRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Job_Categories'));
  const insertJobCat = db.prepare('INSERT INTO job_categories (job_category_id, job_cat, category, count, sort_order) VALUES (?, ?, ?, ?, ?)');
  withTransaction(db, () => {
    for (const row of jobCatRows) {
      insertJobCat.run(toInt(row.JobCategoryID), safeTrim(row.JOBCAT), safeTrim(row.CATEGORY), toInt(row.Count), toInt(row.Sort_Order));
    }
  });
  console.log(`  Imported ${jobCatRows.length} job categories.`);

  // --- Job Search Websites ---
  console.log('  Loading job search websites...');
  const webRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Job_Search_Websites'));
  const insertWeb = db.prepare('INSERT INTO job_search_websites (website_id, job_search_category, job_search_company, website, sort_order) VALUES (?, ?, ?, ?, ?)');
  withTransaction(db, () => {
    for (const row of webRows) {
      insertWeb.run(toInt(row.WebSiteID), safeTrim(row.Job_Search_Category), safeTrim(row.Job_Search_Company), safeTrim(row.Website), toInt(row.Sort_Order));
    }
  });
  console.log(`  Imported ${webRows.length} job search websites.`);

  // --- TSP Report Levels (from CSV snapshot) ---
  console.log('  Loading TSP report levels...');
  const tspSnapshotPath = path.join(legacyDir, '..', 'data', 'legacy_snapshot', '20260217T182800Z', 'tables', 'data__tblXLU_TSPReportLevels.csv');
  if (fs.existsSync(tspSnapshotPath)) {
    const tspRows = parseCsvRows(fs.readFileSync(tspSnapshotPath, 'utf8'));
    const insertTsp = db.prepare('INSERT INTO tsp_report_levels (id, level_code, level_label, threshold_low, threshold_high) VALUES (?, ?, ?, ?, ?)');
    withTransaction(db, () => {
      let idx = 1;
      for (const row of tspRows) {
        const keys = Object.keys(row);
        insertTsp.run(idx++, safeTrim(row[keys[0]]), safeTrim(row[keys[1]]), toFloat(row[keys[2]]), toFloat(row[keys[3]]));
      }
    });
    console.log(`  Imported ${tspRows.length} TSP report levels.`);
  } else {
    console.log('  TSP report levels snapshot not found, skipping.');
  }

  // --- Help Text (load from data backend first, then overlay v314 front-end) ---
  console.log('  Loading help text from data backend...');
  const helpDataRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Help'));
  const insertHelp = db.prepare(`
    INSERT OR REPLACE INTO help_text (help_code, help_title, mvqs_category, help_text, help_index, help_form, mvqs_grouping, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  withTransaction(db, () => {
    for (const row of helpDataRows) {
      insertHelp.run(
        toInt(row.HelpCode), safeTrim(row.Help_Title) || null, safeTrim(row.MVQS_Category) || null,
        safeTrim(row.HelpText), safeTrim(row.HelpIndex), safeTrim(row.HelpForm),
        safeTrim(row.MVQS_Grouping) || null, toInt(row.Sort_Order)
      );
    }
  });
  console.log(`  Imported ${helpDataRows.length} help text entries from data backend.`);

  const v314FrontEndDir = path.join(legacyDir, '..', 'MVQS_DC_FrontEnds_v314');
  const v314FrontEndPath = path.join(v314FrontEndDir, 'MVQS_DC_FrontEnd_with_Adobe.accdb');
  if (fs.existsSync(v314FrontEndPath)) {
    console.log('  Overlaying help text from v314 front-end...');
    const helpV314Rows = parseCsvRows(runMdbExport(v314FrontEndPath, 'tblXLU_Help'));
    withTransaction(db, () => {
      for (const row of helpV314Rows) {
        insertHelp.run(
          toInt(row.HelpCode), safeTrim(row.Help_Title), safeTrim(row.MVQS_Category),
          safeTrim(row.HelpText), safeTrim(row.HelpIndex), safeTrim(row.HelpForm),
          safeTrim(row.MVQS_Grouping), toInt(row.Sort_Order)
        );
      }
    });
    console.log(`  Overlaid ${helpV314Rows.length} help text entries from v314 front-end.`);

    // --- USBLS OES Wage Data ---
    console.log('  Loading USBLS OES wage data from v314 front-end...');
    const oesRows = parseCsvRows(runMdbExport(v314FrontEndPath, 'tblXLU_USBLS_OES'));
    const insertOes = db.prepare(`
      INSERT INTO usbls_oes (
        line_id, area, area_title, area_type, prim_state, naics, naics_title,
        i_group, own_code, occ_code, occ_title, o_group,
        tot_emp, emp_prse, jobs_1000, loc_quotient, pct_total,
        h_mean, a_mean, mean_prse,
        h_pct10, h_pct25, h_median, h_pct75, h_pct90,
        a_pct10, a_pct25, a_median, a_pct75, a_pct90,
        annual, hourly, import_file, import_source
      ) VALUES (${new Array(34).fill('?').join(',')})
    `);
    withTransaction(db, () => {
      for (const row of oesRows) {
        insertOes.run(
          toInt(row.USBLS_OES_Line_ID),
          safeTrim(row.AREA), safeTrim(row.AREA_TITLE), toInt(row.AREA_TYPE),
          safeTrim(row.PRIM_STATE), safeTrim(row.NAICS), safeTrim(row.NAICS_TITLE),
          safeTrim(row.I_GROUP), toInt(row.OWN_CODE),
          safeTrim(row.OCC_CODE), safeTrim(row.OCC_TITLE), safeTrim(row.O_GROUP),
          toInt(row.TOT_EMP), toFloat(row.EMP_PRSE), toFloat(row.JOBS_1000),
          toFloat(row.LOC_QUOTIENT), toFloat(row.PCT_TOTAL),
          toFloat(row.H_MEAN), toFloat(row.A_MEAN), toFloat(row.MEAN_PRSE),
          toFloat(row.H_PCT10), toFloat(row.H_PCT25), toFloat(row.H_MEDIAN),
          toFloat(row.H_PCT75), toFloat(row.H_PCT90),
          toFloat(row.A_PCT10), toFloat(row.A_PCT25), toFloat(row.A_MEDIAN),
          toFloat(row.A_PCT75), toFloat(row.A_PCT90),
          safeTrim(row.ANNUAL), safeTrim(row.HOURLY),
          safeTrim(row.Import_File), safeTrim(row.Import_Source)
        );
      }
    });
    console.log(`  Imported ${oesRows.length} USBLS OES wage records.`);

    // --- USBLS OES Field Descriptions ---
    const oesFieldRows = parseCsvRows(runMdbExport(v314FrontEndPath, 'tblXLU_USBLS_OES_Field_Descriptions'));
    const insertOesField = db.prepare('INSERT INTO usbls_oes_fields (field_id, field_name, field_description) VALUES (?, ?, ?)');
    withTransaction(db, () => {
      for (const row of oesFieldRows) {
        insertOesField.run(toInt(row.USBLS_OES_Field_ID), safeTrim(row.Field), safeTrim(row.Field_Description));
      }
    });
    console.log(`  Imported ${oesFieldRows.length} USBLS OES field descriptions.`);
  } else {
    console.log('  v314 front-end not found, skipping help text and USBLS OES data.');
  }

  console.log('Gap-closure reference imports complete.');

  // ================================================================
  // Gap-closure Phase 2: All remaining Access lookup tables
  // ================================================================
  console.log('\n--- Phase 2 Gap-Closure: Importing remaining Access lookup tables ---');

  // --- HIGH PRIORITY: Work Values System ---
  console.log('  Loading work values system...');

  const valueAnswerRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Value_Answers'));
  const insertValueAnswer = db.prepare('INSERT INTO value_answers (value, label, count) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of valueAnswerRows) {
      insertValueAnswer.run(toInt(row.VALUE), safeTrim(row.LABEL), toInt(row.Count));
    }
  });
  console.log(`  Imported ${valueAnswerRows.length} value answers.`);

  const valueCatRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Value_Categories'));
  const insertValueCat = db.prepare('INSERT INTO value_categories (category_id, category, sort_order) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of valueCatRows) {
      insertValueCat.run(toInt(row.ValueCategoryID), safeTrim(row.ValueCategory), toInt(row.Sort_Order));
    }
  });
  console.log(`  Imported ${valueCatRows.length} value categories.`);

  const valueOptRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Value_Options'));
  const insertValueOpt = db.prepare('INSERT INTO value_options (option_id, oc_values, short_label, description, value, label, desire) VALUES (?, ?, ?, ?, ?, ?, ?)');
  withTransaction(db, () => {
    for (const row of valueOptRows) {
      insertValueOpt.run(
        toInt(row.OCValueID), safeTrim(row.OCVALUES), safeTrim(row.SHORTLABEL),
        safeTrim(row.DESCRIPT), toFloat(row.VALUE), safeTrim(row.LABEL), safeTrim(row.DESIRE)
      );
    }
  });
  console.log(`  Imported ${valueOptRows.length} value options.`);

  const valuesRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Values'));
  const insertValue = db.prepare('INSERT INTO values_catalog (value_id, category_id, oc_values, short_label, description, desire, count, default_value, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  withTransaction(db, () => {
    for (const row of valuesRows) {
      insertValue.run(
        toInt(row.ValueID), toInt(row.ValueCategoryID), safeTrim(row.OCVALUES),
        safeTrim(row.SHORTLABEL), safeTrim(row.DESCRIPT), safeTrim(row.DESIRE),
        toInt(row.Count), toInt(row.Default_Value) ?? 0, toInt(row.Sort_Order)
      );
    }
  });
  console.log(`  Imported ${valuesRows.length} values catalog entries.`);

  const whvdRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Work_History_Value_Defaults'));
  const insertWhvd = db.prepare(`INSERT INTO work_history_value_defaults (
    id, v01, v02, v03, v04, v05, v06, v07, v08, v09, v10,
    v11, v12, v13, v14, v15, v16, v17, v18, v19, v20, v21
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  withTransaction(db, () => {
    let rowId = 1;
    for (const row of whvdRows) {
      insertWhvd.run(
        rowId++,
        toInt(row.V01en00m), toInt(row.V02en00m), toInt(row.V03en00m), toInt(row.V04en00m),
        toInt(row.V05en00m), toInt(row.V06en00m), toInt(row.V07en00m), toInt(row.V08en00m),
        toInt(row.V09en00m), toInt(row.V10en00m), toInt(row.V11en00m), toInt(row.V12en00m),
        toInt(row.V13en00m), toInt(row.V14en00m), toInt(row.V15en00m), toInt(row.V16en00m),
        toInt(row.V17en00m), toInt(row.V18en00m), toInt(row.V19en00m), toInt(row.V20en00m),
        toInt(row.V21en00m)
      );
    }
  });
  console.log(`  Imported ${whvdRows.length} work history value defaults.`);

  // --- HIGH PRIORITY: VIPR Test Pairs ---
  console.log('  Loading VIPR test pairs...');
  const viprRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_VIPR_Test_Pairs'));
  const insertVipr = db.prepare(`INSERT INTO vipr_test_pairs (
    vipr_test_pair_id, test_number, dot_code_1, title_1, dot_code_2, title_2,
    selection, indicator_1, indicator_2,
    e_score, i_score, s_score, n_score, t_score, f_score, j_score, p_score,
    default_pair, sort_order
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  withTransaction(db, () => {
    for (const row of viprRows) {
      insertVipr.run(
        toInt(row.VIPR_Test_Pair_ID), toInt(row.TestNumber),
        safeTrim(row.DOTCODE1), safeTrim(row.Title1),
        safeTrim(row.DOTCODE2), safeTrim(row.Title2),
        toInt(row.Selection),
        safeTrim(row.Indicator1), safeTrim(row.Indicator2),
        safeTrim(row.EScore), safeTrim(row.IScore),
        safeTrim(row.Sscore), safeTrim(row.NScore),
        safeTrim(row.Tscore), safeTrim(row.FScore),
        safeTrim(row.JScore), safeTrim(row.PScore),
        toInt(row.Default_Pair) ?? 0, toInt(row.Sort_Order)
      );
    }
  });
  console.log(`  Imported ${viprRows.length} VIPR test pairs.`);

  // --- MEDIUM PRIORITY: Personality Types ---
  console.log('  Loading personality types...');
  const ptRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Personality_Types'));
  const insertPt = db.prepare('INSERT INTO personality_types (personality_type, personality_name, personality_description, job_descriptions, sort_order) VALUES (?, ?, ?, ?, ?)');
  withTransaction(db, () => {
    for (const row of ptRows) {
      insertPt.run(
        safeTrim(row.Personality_Type), safeTrim(row.Personality_Name),
        safeTrim(row.Personality_Type_Description), safeTrim(row.JobDescripts),
        toInt(row.Sort_Order)
      );
    }
  });
  console.log(`  Imported ${ptRows.length} personality types.`);

  const ptiRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Personality_Type_Indicators'));
  const insertPti = db.prepare('INSERT INTO personality_type_indicators (indicator_id, indicator, indicator_description, sort_order) VALUES (?, ?, ?, ?)');
  withTransaction(db, () => {
    for (const row of ptiRows) {
      insertPti.run(
        toInt(row.Personality_Type_Indicator_ID), safeTrim(row.Personality_Type_Indicator),
        safeTrim(row.Personality_Type_Indicator_Description), toInt(row.Sort_Order)
      );
    }
  });
  console.log(`  Imported ${ptiRows.length} personality type indicators.`);

  // --- MEDIUM PRIORITY: Test Score Conversion Tables ---
  console.log('  Loading score scales and percentiles...');
  const scaleRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_SCALES'));
  const insertScale = db.prepare('INSERT INTO score_scales (standard, percentile, ged_effect, apt_effect) VALUES (?, ?, ?, ?)');
  withTransaction(db, () => {
    for (const row of scaleRows) {
      insertScale.run(toFloat(row.Standard), toFloat(row.Percentile), toFloat(row.GEDEffect), toFloat(row.APTEffect));
    }
  });
  console.log(`  Imported ${scaleRows.length} score scale entries.`);

  const scoreRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_SCORES'));
  const insertScore = db.prepare('INSERT INTO score_percentiles (percentile, standard) VALUES (?, ?)');
  withTransaction(db, () => {
    for (const row of scoreRows) {
      insertScore.run(toFloat(row.Percentile), toFloat(row.Standard));
    }
  });
  console.log(`  Imported ${scoreRows.length} score percentile entries.`);

  // --- MEDIUM PRIORITY: VIPR Job Descriptions ---
  console.log('  Loading VIPR job descriptions...');
  const viprJdRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_VIPR_Job_Descriptions'));
  const insertViprJd = db.prepare('INSERT INTO vipr_job_descriptions (dot_code, job_description) VALUES (?, ?)');
  withTransaction(db, () => {
    for (const row of viprJdRows) {
      insertViprJd.run(safeTrim(row.DOTCODE09), safeTrim(row.JOBDESC));
    }
  });
  console.log(`  Imported ${viprJdRows.length} VIPR job descriptions.`);

  // --- MEDIUM PRIORITY: Occupation Details ---
  console.log('  Loading occupation details...');
  const occDetRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Occupation_Details'));
  const insertOccDet = db.prepare(`INSERT INTO occupation_details (
    title_record_number, doc_no, dot_code, dot_code_11, title, dot_title_2,
    oes_code, oes_title, ou_code, ou_title, cat, category, div, division,
    grp, grp_name, goe_ia, goe_ia_title, holland_title,
    oap, goe_wg, oap_goe_wg_title, data_oap, gatb_oap,
    oap2, data_oap2, gatb_oap2, goe_06,
    sic, sic_title, soc, soc_title, cen, cen_title,
    mps, mps_title, mps2, mps2_title, mps3, mps3_title,
    wf1, wf1_title, wf2, wf3, update_gov, update_field,
    vq, data_level, data_vi, d_function,
    people_level, people_vi, p_function,
    things_level, things_vi, t_function, svp, svp_length, ptr
  ) VALUES (${new Array(59).fill('?').join(',')})`);
  withTransaction(db, () => {
    for (const row of occDetRows) {
      insertOccDet.run(
        toInt(row.TitleRecordNumber), safeTrim(row['Doc no']), safeTrim(row.Dotcode),
        safeTrim(row.Dotcode11), safeTrim(row.Title), safeTrim(row.Dottitle2),
        safeTrim(row.Oescode), safeTrim(row.Oestitle), safeTrim(row.Oucode),
        safeTrim(row.Outitle), safeTrim(row.Cat), safeTrim(row.Category),
        safeTrim(row.Div), safeTrim(row.Division), safeTrim(row.Grp),
        safeTrim(row.Group), safeTrim(row.Goeia), safeTrim(row.Goeiatitle),
        safeTrim(row.Hollatitle), safeTrim(row.Oap), safeTrim(row.Goewg),
        safeTrim(row.Oapgoewgti), safeTrim(row.Dataoap), safeTrim(row.Gatboap),
        safeTrim(row.Oap2), safeTrim(row.Dataoap2), safeTrim(row.Gatboap2),
        safeTrim(row.Goe06), safeTrim(row.Sic), safeTrim(row.Sictitle),
        safeTrim(row.Soc), safeTrim(row.Soctitle), safeTrim(row.Cen),
        safeTrim(row.Centitle), safeTrim(row.Mps), safeTrim(row.Mpstitle),
        safeTrim(row.Mps2), safeTrim(row.Mps2title), safeTrim(row.Mps3),
        safeTrim(row.Mps3title), safeTrim(row.Wf1), safeTrim(row.Wf1title),
        safeTrim(row.Wf2), safeTrim(row.Wf3), safeTrim(row.Updategov),
        safeTrim(row.Update), toFloat(row.Vq), safeTrim(row.Data),
        safeTrim(row.Datavi), safeTrim(row.Dfunction),
        safeTrim(row.People), safeTrim(row.Peoplevi), safeTrim(row.Pfunction),
        safeTrim(row.Things), safeTrim(row.Thingsvi), safeTrim(row.Tfunction),
        safeTrim(row.Svp), safeTrim(row.Svplenth), safeTrim(row.Ptr)
      );
    }
  });
  console.log(`  Imported ${occDetRows.length} occupation detail records.`);

  // --- MEDIUM PRIORITY: Alternate Titles ---
  console.log('  Loading alternate titles...');
  const altTitleRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Occupations_Alternate_Titles'));
  const insertAltTitle = db.prepare('INSERT INTO occupation_alternate_titles (title_record_number, doc_no, alternate_title) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of altTitleRows) {
      insertAltTitle.run(toInt(row.TitleRecordNumber), safeTrim(row.Doc_No), safeTrim(row.Alternate_Title));
    }
  });
  console.log(`  Imported ${altTitleRows.length} alternate titles.`);

  // --- MEDIUM PRIORITY: TEM/JOLT ---
  console.log('  Loading TEM/JOLT temperament and labor data...');
  const temRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Occupations_TEM_JOLT'));
  const insertTem = db.prepare(`INSERT INTO occupation_tem_jolt (
    title_record_number, record_num, doc_no, stem_rec, dot_code, dot_title,
    dot_code_11, dot_title_orig,
    tem_dir, tem_rep, tem_inf, tem_var, tem_exp, tem_alo,
    tem_str, tem_tol, tem_und, tem_peo, tem_jud,
    js99_yearly_open, jolt99_yearly_open, soc99_cur_emp,
    js05_yearly_open, jolt05_yearly_open, soc05_cur_emp
  ) VALUES (${new Array(25).fill('?').join(',')})`);
  withTransaction(db, () => {
    for (const row of temRows) {
      insertTem.run(
        toInt(row.TitleRecordNumber) ?? toInt(toFloat(row.TitleRecordNumber)),
        toFloat(row.Record), toFloat(row['Doc No']), toFloat(row.StemRec),
        safeTrim(row.DOTCode09), safeTrim(row.DOTTitle2),
        safeTrim(row.DOTCode11), safeTrim(row.DOTTitle),
        toFloat(row.TEMDIR), toFloat(row.TEMREP), toFloat(row.TEMINF),
        toFloat(row.TEMVAR), toFloat(row.TEMEXP), toFloat(row.TEMALO),
        toFloat(row.TEMSTR), toFloat(row.TEMTOL), toFloat(row.TEMUND),
        toFloat(row.TEMPEO), toFloat(row.TEMJUD),
        toFloat(row.JS99YrlyOpen), toFloat(row.JOLT99YrlyOpen), toFloat(row.SOC99CurEmp),
        toFloat(row.JS05YrlyOpen), toFloat(row.JOLT05YrlyOpen), toFloat(row.SOC05CurEmp)
      );
    }
  });
  console.log(`  Imported ${temRows.length} TEM/JOLT records.`);

  // --- MEDIUM PRIORITY: DOT Education Crosswalk ---
  console.log('  Loading DOT education crosswalk...');
  const dotEduRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_DOT'));
  const insertDotEdu = db.prepare(`INSERT INTO dot_education (
    dot_id, title_record_number, doc_no, dot_code, dot_title,
    caspar_adc, caspar_title, cadc_cip90, cadc_cip_title, cip90, cip90_title
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  withTransaction(db, () => {
    for (const row of dotEduRows) {
      insertDotEdu.run(
        toInt(row.DOT_ID), toInt(row.TitleRecordNumber), toInt(row.DOC_NO),
        safeTrim(row.DOTCODE09), safeTrim(row.DOTTITLE),
        safeTrim(row.CASPARADC), safeTrim(row.CASPARTTL),
        safeTrim(row.CADCCIP90), safeTrim(row.CADCCIPTTL),
        safeTrim(row.CIP90), safeTrim(row.CIP90TTL)
      );
    }
  });
  console.log(`  Imported ${dotEduRows.length} DOT education crosswalk entries.`);

  // --- MEDIUM PRIORITY: CASPAR Education Programs ---
  console.log('  Loading CASPAR education programs...');
  const casparRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Occupations_CASPAR'));
  const insertCaspar = db.prepare(`INSERT INTO occupation_caspar (
    title_record_number, doc_no, dot_code, dot_title,
    caspar_adc, caspar_title, cadc_cip90, cadc_cip_title, cip90, cip90_title
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  withTransaction(db, () => {
    for (const row of casparRows) {
      insertCaspar.run(
        toInt(row.TitleRecordNumber), toInt(row.DOC_NO),
        safeTrim(row.DOTCODE09), safeTrim(row.DOTTITLE),
        safeTrim(row.CASPARADC), safeTrim(row.CASPARTTL),
        safeTrim(row.CADCCIP90), safeTrim(row.CADCCIPTTL),
        safeTrim(row.CIP90), safeTrim(row.CIP90TTL)
      );
    }
  });
  console.log(`  Imported ${casparRows.length} CASPAR education records.`);

  // --- MEDIUM PRIORITY: Ratings (trait guidelines) ---
  console.log('  Loading ratings/trait guidelines...');
  const ratingRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Ratings'));
  const insertRating = db.prepare('INSERT INTO ratings (rating_id, rating_name, variable_number, guidelines, default_rating, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
  withTransaction(db, () => {
    for (const row of ratingRows) {
      insertRating.run(
        toInt(row.RatingID), safeTrim(row.RatingName), safeTrim(row.VariableNumber),
        safeTrim(row.Guidelines), toInt(row.Default_Ratings) ?? 0, toInt(row.Sort_Order)
      );
    }
  });
  console.log(`  Imported ${ratingRows.length} rating guidelines.`);

  // --- LOW PRIORITY: Level Description Lookups ---
  console.log('  Loading level description lookups...');

  const svpLevelRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_SVPLevels'));
  const insertSvpLevel = db.prepare('INSERT INTO svp_levels (svp_level, svp_description, svp_skill) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of svpLevelRows) {
      insertSvpLevel.run(toInt(row.SVPLevel), safeTrim(row.SVPDescription), safeTrim(row.SVPSkill));
    }
  });
  console.log(`  Imported ${svpLevelRows.length} SVP levels.`);

  const strengthLevelRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_StrengthLevels'));
  const insertStrengthLevel = db.prepare('INSERT INTO strength_levels (strength_level, strength_description, strength_percentile) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of strengthLevelRows) {
      insertStrengthLevel.run(toInt(row.StrengthLevel), safeTrim(row.StrengthDescription), safeTrim(row.StrengthPercentile));
    }
  });
  console.log(`  Imported ${strengthLevelRows.length} strength levels.`);

  const weatherLevelRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_WeatherLevels'));
  const insertWeatherLevel = db.prepare('INSERT INTO weather_levels (weather_level, weather_description, weather_percentile) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of weatherLevelRows) {
      insertWeatherLevel.run(toInt(row.WeatherLevel), safeTrim(row.WeatherDescription), safeTrim(row.WeatherPercentile));
    }
  });
  console.log(`  Imported ${weatherLevelRows.length} weather levels.`);

  const physEnvRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_PhysicalEnvironmentalLevels'));
  const insertPhysEnv = db.prepare('INSERT INTO physical_environmental_levels (physical_level, physical_description, physical_percentile) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of physEnvRows) {
      insertPhysEnv.run(toInt(row.PhysicalLevel), safeTrim(row.PhysicalDescription), safeTrim(row.PhysicalPercentile));
    }
  });
  console.log(`  Imported ${physEnvRows.length} physical/environmental levels.`);

  const zoneLevelRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_ZoneLevels'));
  const insertZoneLevel = db.prepare('INSERT INTO zone_levels (zone_level, zone_description) VALUES (?, ?)');
  withTransaction(db, () => {
    for (const row of zoneLevelRows) {
      insertZoneLevel.run(toInt(row.ZoneLevel), safeTrim(row.ZoneDescription));
    }
  });
  console.log(`  Imported ${zoneLevelRows.length} zone levels.`);

  const onetCodeRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_ONET_Codes'));
  const insertOnetCode = db.prepare('INSERT INTO onet_codes (onet_code, onet_title, onet_category, count) VALUES (?, ?, ?, ?)');
  withTransaction(db, () => {
    for (const row of onetCodeRows) {
      insertOnetCode.run(safeTrim(row.ONETCODE), safeTrim(row.ONETTITLE), safeTrim(row.ONETCAT), toInt(row.Count));
    }
  });
  console.log(`  Imported ${onetCodeRows.length} O*NET codes.`);

  const countryRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Countries'));
  const insertCountry = db.prepare('INSERT INTO countries (country_id, country) VALUES (?, ?)');
  withTransaction(db, () => {
    for (const row of countryRows) {
      insertCountry.run(toInt(row.CountryID), safeTrim(row.Country));
    }
  });
  console.log(`  Imported ${countryRows.length} countries.`);

  const pjtRows = parseCsvRows(runMdbExport(dcDataPath, 'tblXLU_Person_Job_Traits'));
  const insertPjt = db.prepare('INSERT INTO person_job_traits (trait_category_code, trait_category, sort_order) VALUES (?, ?, ?)');
  withTransaction(db, () => {
    for (const row of pjtRows) {
      insertPjt.run(safeTrim(row.Trait_Category_Code), safeTrim(row.Trait_Category), toInt(row.Sort_Order));
    }
  });
  console.log(`  Imported ${pjtRows.length} person-job trait categories.`);

  console.log('Phase 2 gap-closure imports complete.\n');

  return {
    sourceMode: 'dc',
    sourceMainPath: dcDataPath
  };
}

function persistParityEvidence(db, options = {}) {
  const tableTaps = safeReadJsonFile(options.parityTableTapsJson);
  const mappingCoverage = safeReadJsonFile(options.parityMappingCoverageJson);
  const accessExecution = safeReadJsonFile(options.parityAccessExecutionJson);
  const strictReport = safeReadJsonFile(options.parityStrictJson);

  const insertTableTap = db.prepare(`
    INSERT OR REPLACE INTO parity_table_tap_evidence
      (table_name, source_keys, missing, tap_source_key, row_count, referenced_by_query_count, evidence_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMapping = db.prepare(`
    INSERT OR REPLACE INTO parity_mapping_evidence
      (object_type, object_name, mapped, mapping_source, modern_target, error_message, evidence_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAccessExecution = db.prepare(`
    INSERT INTO parity_access_execution_evidence
      (front_end_path, object_type, object_name, status, metric_value, error_message, evidence_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const paritySummary = {
    missingTableRefs: 0,
    unmappedObjects: 0,
    queryExecutionFailures: 0,
    reportExecutionFailures: 0,
    moduleCompileFailures: 0,
    moduleUninvokedCount: 0,
    strictStepFailures: 0
  };

  if (tableTaps) {
    const requiredTables = Array.isArray(tableTaps.required_base_tables) ? tableTaps.required_base_tables : [];
    const unresolvedTables = Array.isArray(tableTaps.unresolved_table_references)
      ? tableTaps.unresolved_table_references
      : [];
    const sourceDatabases = Array.isArray(tableTaps.source_databases) ? tableTaps.source_databases : [];
    const sourceDbPathByKey = new Map();
    for (const source of sourceDatabases) {
      const sourceKey = safeTrim(source.source_key);
      const sourcePath = safeTrim(source.path);
      if (!sourceKey || !sourcePath || !fs.existsSync(sourcePath)) {
        continue;
      }
      sourceDbPathByKey.set(sourceKey, sourcePath);
    }
    let missingCount = 0;

    withTransaction(db, () => {
      for (const row of requiredTables) {
        const tableName = safeTrim(row.table_name);
        if (!tableName) {
          continue;
        }
        const sourceKeys = Array.isArray(row.source_keys) ? row.source_keys : [];
        let tapSourceKey = null;
        let rowCount = null;
        const tapErrors = [];

        for (const sourceKey of sourceKeys) {
          const resolvedSourceKey = safeTrim(sourceKey);
          if (!resolvedSourceKey) {
            continue;
          }
          const sourcePath = sourceDbPathByKey.get(resolvedSourceKey);
          if (!sourcePath) {
            tapErrors.push(`Missing source path for key ${resolvedSourceKey}`);
            continue;
          }

          const probe = tryCountRowsFromAccessTable(sourcePath, tableName);
          if (probe.error) {
            tapErrors.push(`${resolvedSourceKey}: ${probe.error}`);
            continue;
          }

          tapSourceKey = resolvedSourceKey;
          rowCount = probe.rowCount;
          break;
        }

        const missing = tapSourceKey ? 0 : 1;
        if (missing === 1) {
          missingCount += 1;
        }

        insertTableTap.run(
          tableName,
          JSON.stringify(sourceKeys),
          missing,
          tapSourceKey,
          rowCount,
          0,
          JSON.stringify({
            ...row,
            resolved: missing === 0,
            tap_source_key: tapSourceKey,
            row_count: rowCount,
            tap_errors: tapErrors
          })
        );
      }

      for (const row of unresolvedTables) {
        const tableName = safeTrim(row.table_name);
        if (!tableName) {
          continue;
        }
        const refs = Array.isArray(row.referenced_by_queries) ? row.referenced_by_queries : [];
        missingCount += 1;
        insertTableTap.run(
          tableName,
          JSON.stringify([]),
          1,
          null,
          null,
          refs.length,
          JSON.stringify({ ...row, resolved: false })
        );
      }
    });

    paritySummary.missingTableRefs =
      missingCount;
  }

  if (mappingCoverage) {
    const buckets = [
      { key: 'modules', type: 'module' },
      { key: 'reports', type: 'report' },
      { key: 'queries', type: 'query' }
    ];

    withTransaction(db, () => {
      for (const bucket of buckets) {
        const rows = Array.isArray(mappingCoverage?.coverage?.[bucket.key]) ? mappingCoverage.coverage[bucket.key] : [];
        for (const row of rows) {
          const objectName = safeTrim(row.object_name);
          if (!objectName) {
            continue;
          }
          const mapped = row.mapped === true ? 1 : 0;
          const modernTarget = safeTrim(row?.mapping?.modern_target);
          const mappingSource = safeTrim(row.mapping_source);
          const errors = Array.isArray(row.errors) ? row.errors.join('; ') : null;

          insertMapping.run(
            bucket.type,
            objectName,
            mapped,
            mappingSource,
            modernTarget,
            errors,
            JSON.stringify(row)
          );
        }
      }
    });

    paritySummary.unmappedObjects =
      toInt(mappingCoverage?.gate?.unmapped_total) ??
      toInt(mappingCoverage?.counts?.unmapped_total) ??
      0;
  }

  if (accessExecution) {
    withTransaction(db, () => {
      const fronts = Array.isArray(accessExecution.front_ends) ? accessExecution.front_ends : [];
      for (const front of fronts) {
        const frontPath = safeTrim(front.front_end_path) || null;

        const queries = Array.isArray(front.queries) ? front.queries : [];
        for (const row of queries) {
          insertAccessExecution.run(
            frontPath,
            'query',
            safeTrim(row.query_name) || '<unknown-query>',
            safeTrim(row.status) || 'UNKNOWN',
            toInt(row.row_count ?? row.affected_rows),
            safeTrim(row.error),
            JSON.stringify(row)
          );
        }

        const reports = Array.isArray(front.reports) ? front.reports : [];
        for (const row of reports) {
          insertAccessExecution.run(
            frontPath,
            'report',
            safeTrim(row.report_name) || '<unknown-report>',
            safeTrim(row.status) || 'UNKNOWN',
            null,
            safeTrim(row.error),
            JSON.stringify(row)
          );
        }

        const modules = Array.isArray(front.module_entrypoints) ? front.module_entrypoints : [];
        for (const row of modules) {
          insertAccessExecution.run(
            frontPath,
            'module',
            safeTrim(row.module_name) || '<unknown-module>',
            safeTrim(row.status) || 'UNKNOWN',
            null,
            safeTrim(row.error),
            JSON.stringify(row)
          );
        }
      }
    });

    paritySummary.queryExecutionFailures =
      toInt(accessExecution?.summary?.query_execution_failures) ?? 0;
    paritySummary.reportExecutionFailures =
      toInt(accessExecution?.summary?.report_execution_failures) ?? 0;
    paritySummary.moduleCompileFailures =
      toInt(accessExecution?.summary?.module_compile_failures) ?? 0;
    paritySummary.moduleUninvokedCount =
      toInt(accessExecution?.summary?.module_uninvoked_count) ?? 0;
  }

  if (strictReport) {
    const steps = Array.isArray(strictReport.steps) ? strictReport.steps : [];
    paritySummary.strictStepFailures = steps.filter((step) => step.pass !== true).length;
  }

  paritySummary.unresolvedTotal =
    paritySummary.missingTableRefs +
    paritySummary.unmappedObjects +
    paritySummary.queryExecutionFailures +
    paritySummary.reportExecutionFailures +
    paritySummary.moduleCompileFailures +
    paritySummary.moduleUninvokedCount +
    paritySummary.strictStepFailures;

  paritySummary.status = paritySummary.unresolvedTotal === 0 ? 'PASS' : 'FAIL';
  paritySummary.lastRunUtc = new Date().toISOString();

  return paritySummary;
}

function writeMetadataAndTotals(db, metadata) {
  const setMetadata = db.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)');
  const now = new Date().toISOString();

  setMetadata.run('built_at_utc', now);
  for (const [key, value] of Object.entries(metadata)) {
    setMetadata.run(key, String(value));
  }

  const totals = {
    jobs: db.prepare('SELECT COUNT(*) AS count FROM jobs').get().count,
    tasks: db.prepare('SELECT COUNT(*) AS count FROM job_tasks').get().count,
    states: db.prepare('SELECT COUNT(*) AS count FROM states').get().count,
    counties: db.prepare('SELECT COUNT(*) AS count FROM counties').get().count,
    stateJobCounts: db.prepare('SELECT COUNT(*) AS count FROM state_job_counts').get().count,
    countyJobCounts: db.prepare('SELECT COUNT(*) AS count FROM county_job_counts').get().count,
    jobsCrosswalkCoverage: db
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
      .get().count,
    jobsValueCoverage: db
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM jobs
        WHERE
          COALESCE(mpsms_primary, '') <> ''
          OR COALESCE(mtewa_primary, '') <> ''
        `
      )
      .get().count
  };

  setMetadata.run('jobs_count', String(totals.jobs));
  setMetadata.run('tasks_count', String(totals.tasks));
  setMetadata.run('states_count', String(totals.states));
  setMetadata.run('counties_count', String(totals.counties));
  setMetadata.run('state_job_counts_count', String(totals.stateJobCounts));
  setMetadata.run('county_job_counts_count', String(totals.countyJobCounts));
  setMetadata.run('jobs_crosswalk_coverage_count', String(totals.jobsCrosswalkCoverage));
  setMetadata.run('jobs_value_coverage_count', String(totals.jobsValueCoverage));
  if (!Object.hasOwn(metadata, 'legacy_snapshot_id')) {
    setMetadata.run('legacy_snapshot_id', '');
  }

  return totals;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  requireMdbTools();
  const legacyDir = resolveLegacyDir(args.legacyDir);
  const outputPath = path.resolve(args.out || DEFAULT_OUTPUT);
  const sourceMode = detectSourceMode(legacyDir, args.source);
  const requestedStatesSet = getRequestedStatesSet(args.states);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  console.log(`Using legacy directory: ${legacyDir}`);
  console.log(`Detected source mode: ${sourceMode}`);
  console.log(`Writing SQLite database: ${outputPath}`);

  const db = new DatabaseSync(outputPath);
  setupSchema(db);

  const importMetadata =
    sourceMode === 'dc'
      ? importDc(db, legacyDir, requestedStatesSet)
      : importClassic(db, legacyDir, requestedStatesSet);

  const paritySummary = persistParityEvidence(db, {
    parityTableTapsJson: safeTrim(args.parityTableTapsJson) || null,
    parityMappingCoverageJson: safeTrim(args.parityMappingCoverageJson) || null,
    parityAccessExecutionJson: safeTrim(args.parityAccessExecutionJson) || null,
    parityStrictJson: safeTrim(args.parityStrictJson) || null
  });

  const totals = writeMetadataAndTotals(db, {
    legacy_dir: legacyDir,
    source_mode: importMetadata.sourceMode,
    source_main_path: importMetadata.sourceMainPath,
    legacy_snapshot_id: safeTrim(args.legacySnapshotId) || '',
    parity_last_run_utc: paritySummary.lastRunUtc,
    parity_status: paritySummary.status,
    parity_unresolved_count: paritySummary.unresolvedTotal,
    parity_missing_table_refs: paritySummary.missingTableRefs,
    parity_unmapped_objects: paritySummary.unmappedObjects,
    parity_query_execution_failures: paritySummary.queryExecutionFailures,
    parity_report_execution_failures: paritySummary.reportExecutionFailures,
    parity_module_compile_failures: paritySummary.moduleCompileFailures,
    parity_module_uninvoked_count: paritySummary.moduleUninvokedCount,
    parity_strict_step_failures: paritySummary.strictStepFailures
  });

  db.close();

  console.log('Build complete.');
  console.log(totals);
  console.log('Parity metadata persisted.');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
