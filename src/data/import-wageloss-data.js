/**
 * import-wageloss-data.js
 *
 * Imports WageLoss .prn data files into the MVQS app database (mvqs-app.db).
 * This includes:
 *   - SOC wage data (SOCData.prn + SOCTitle.prn) — 732 SOC-level wage records
 *   - DOT→SOC crosswalk (TS.prn) — 12,972 DOT-to-SOC mappings
 *   - County wage adjustment factors (County1.prn) — 3,292 geographic wage adjustments
 *   - Additional crosswalk data (SIC.prn, NAICS.prn, Census.prn) — per-DOT industry codes
 *
 * Usage:
 *   node src/data/import-wageloss-data.js --wageloss-dir /path/to/prn/files --db data/mvqs-modern.db
 */

import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_DB = 'data/mvqs-modern.db';
const DEFAULT_WAGELOSS_DIR = '/tmp/wageloss/all';

function parseArgs(argv) {
  const args = { db: DEFAULT_DB, wagelossDir: DEFAULT_WAGELOSS_DIR };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--db') {
      args.db = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--wageloss-dir') {
      args.wagelossDir = argv[i + 1];
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

function readPrnLines(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
}

function toFloat(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function toInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function tableExists(db, tableName) {
  const row = db
    .prepare("SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' AND name=?")
    .get(tableName);
  return row.cnt > 0;
}

/**
 * Parse SOCTitle.prn: "XX-XXXX Title text"
 */
function parseSOCTitleLine(line) {
  const match = line.match(/^(\d{2}-\d{4})\s+(.*)$/);
  if (!match) return null;
  return { socCode: match[1], title: match[2].trim() };
}

/**
 * Parse SOCData.prn: 15 whitespace-delimited numeric fields per line.
 * Fields: employment, unemp_rate, hourly_mean, annual_mean, wage_rse,
 *         h_pct10, h_pct25, h_median, h_pct75, h_pct90,
 *         a_pct10, a_pct25, a_median, a_pct75, a_pct90
 */
function parseSOCDataLine(line) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 15) return null;
  return {
    employment: toInt(parts[0]),
    unemp_rate: toFloat(parts[1]),
    hourly_mean: toFloat(parts[2]),
    annual_mean: toFloat(parts[3]),
    wage_rse: toFloat(parts[4]),
    h_pct10: toFloat(parts[5]),
    h_pct25: toFloat(parts[6]),
    h_median: toFloat(parts[7]),
    h_pct75: toFloat(parts[8]),
    h_pct90: toFloat(parts[9]),
    a_pct10: toInt(parts[10]),
    a_pct25: toInt(parts[11]),
    a_median: toInt(parts[12]),
    a_pct75: toInt(parts[13]),
    a_pct90: toInt(parts[14])
  };
}

/**
 * Parse TS.prn crosswalk line: DOT code at chars 0-8, SOC code at chars 47-53 (XX-XXXX format).
 */
function parseTSLine(line) {
  if (line.length < 54) return null;
  const dotCode = line.slice(0, 9).trim();
  const socRaw = line.slice(47, 54).trim();
  // Validate DOT code (9 digits)
  if (!/^\d{9}$/.test(dotCode)) return null;
  // Validate SOC code (XX-XXXX format)
  if (!/^\d{2}-\d{4}$/.test(socRaw)) return null;
  return { dotCode, socCode: socRaw };
}

/**
 * Parse County1.prn: "CountyOrState    adjustmentFactor    population"
 * Fields are whitespace-delimited but county name can contain spaces.
 * Format: name (left-justified, variable width), then adjustment factor, then population.
 */
function parseCountyLine(line) {
  // The format has the county name left-justified, followed by the numeric fields right-justified
  const match = line.match(/^(.+?)\s{2,}(\d+\.?\d*)\s+(\d+)\s*$/);
  if (!match) return null;
  return {
    name: match[1].trim(),
    adjustmentFactor: toFloat(match[2]),
    population: toInt(match[3])
  };
}

/**
 * Parse SIC.prn: "XXXX    Description"
 */
function parseSICLine(line) {
  const match = line.match(/^(\d{4})\s+(.*)$/);
  if (!match) return null;
  return { code: match[1], description: match[2].trim() };
}

/**
 * Parse NAICS.prn: "XXXXX   Description"
 */
function parseNAICSLine(line) {
  const match = line.match(/^(\d{5})\s+(.*)$/);
  if (!match) return null;
  return { code: match[1], description: match[2].trim() };
}

/**
 * Parse Census.prn: "XXXXXXDescription" (census code + title, no separator)
 */
function parseCensusLine(line) {
  const match = line.match(/^(\d{6})(.*)$/);
  if (!match) return null;
  return { code: match[1], title: match[2].trim() };
}

function ensureWageLossSchema(db) {
  // Create tables if they don't exist
  if (!tableExists(db, 'wageloss_soc_wages')) {
    db.exec(`
      CREATE TABLE wageloss_soc_wages (
        soc_code TEXT PRIMARY KEY,
        soc_title TEXT,
        employment INTEGER,
        unemp_rate REAL,
        hourly_mean REAL,
        annual_mean REAL,
        wage_rse REAL,
        h_pct10 REAL,
        h_pct25 REAL,
        h_median REAL,
        h_pct75 REAL,
        h_pct90 REAL,
        a_pct10 INTEGER,
        a_pct25 INTEGER,
        a_median INTEGER,
        a_pct75 INTEGER,
        a_pct90 INTEGER
      );
    `);
    console.log('Created table: wageloss_soc_wages');
  }

  if (!tableExists(db, 'wageloss_dot_soc_crosswalk')) {
    db.exec(`
      CREATE TABLE wageloss_dot_soc_crosswalk (
        dot_code TEXT PRIMARY KEY,
        soc_code TEXT NOT NULL
      );
      CREATE INDEX idx_wl_crosswalk_soc ON wageloss_dot_soc_crosswalk(soc_code);
    `);
    console.log('Created table: wageloss_dot_soc_crosswalk');
  }

  if (!tableExists(db, 'wageloss_county_adjustments')) {
    db.exec(`
      CREATE TABLE wageloss_county_adjustments (
        county_name TEXT PRIMARY KEY,
        adjustment_factor REAL,
        population INTEGER
      );
    `);
    console.log('Created table: wageloss_county_adjustments');
  }

  if (!tableExists(db, 'wageloss_dot_industry_codes')) {
    db.exec(`
      CREATE TABLE wageloss_dot_industry_codes (
        dot_code TEXT PRIMARY KEY,
        sic_code TEXT,
        sic_description TEXT,
        naics_code TEXT,
        naics_description TEXT,
        census_code TEXT,
        census_title TEXT
      );
    `);
    console.log('Created table: wageloss_dot_industry_codes');
  }
}

function importSOCWages(db, wagelossDir) {
  const titleLines = readPrnLines(path.join(wagelossDir, 'SOCTitle.prn'));
  const dataLines = readPrnLines(path.join(wagelossDir, 'SOCData.prn'));

  if (!titleLines.length || !dataLines.length) {
    console.warn('SOCTitle.prn or SOCData.prn not found or empty. Skipping SOC wage import.');
    return 0;
  }

  if (titleLines.length !== dataLines.length) {
    console.warn(
      `SOCTitle.prn (${titleLines.length} lines) and SOCData.prn (${dataLines.length} lines) have mismatched row counts.`
    );
  }

  const count = Math.min(titleLines.length, dataLines.length);
  const insert = db.prepare(`
    INSERT OR REPLACE INTO wageloss_soc_wages (
      soc_code, soc_title, employment, unemp_rate, hourly_mean, annual_mean, wage_rse,
      h_pct10, h_pct25, h_median, h_pct75, h_pct90,
      a_pct10, a_pct25, a_median, a_pct75, a_pct90
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let imported = 0;
  withTransaction(db, () => {
    for (let i = 0; i < count; i++) {
      const title = parseSOCTitleLine(titleLines[i]);
      const data = parseSOCDataLine(dataLines[i]);
      if (!title || !data) continue;

      insert.run(
        title.socCode,
        title.title,
        data.employment,
        data.unemp_rate,
        data.hourly_mean,
        data.annual_mean,
        data.wage_rse,
        data.h_pct10,
        data.h_pct25,
        data.h_median,
        data.h_pct75,
        data.h_pct90,
        data.a_pct10,
        data.a_pct25,
        data.a_median,
        data.a_pct75,
        data.a_pct90
      );
      imported++;
    }
  });

  console.log(`Imported ${imported} SOC wage records.`);
  return imported;
}

function importDotSocCrosswalk(db, wagelossDir) {
  const tsLines = readPrnLines(path.join(wagelossDir, 'TS.prn'));
  if (!tsLines.length) {
    console.warn('TS.prn not found or empty. Skipping DOT→SOC crosswalk import.');
    return 0;
  }

  const insert = db.prepare(`
    INSERT OR REPLACE INTO wageloss_dot_soc_crosswalk (dot_code, soc_code)
    VALUES (?, ?)
  `);

  let imported = 0;
  const seen = new Set();

  withTransaction(db, () => {
    for (const line of tsLines) {
      const parsed = parseTSLine(line);
      if (!parsed) continue;
      // Only keep first mapping per DOT code (primary SOC assignment)
      if (seen.has(parsed.dotCode)) continue;
      seen.add(parsed.dotCode);

      insert.run(parsed.dotCode, parsed.socCode);
      imported++;
    }
  });

  console.log(`Imported ${imported} DOT→SOC crosswalk mappings.`);
  return imported;
}

function importCountyAdjustments(db, wagelossDir) {
  const lines = readPrnLines(path.join(wagelossDir, 'County1.prn'));
  if (!lines.length) {
    console.warn('County1.prn not found or empty. Skipping county adjustment import.');
    return 0;
  }

  const insert = db.prepare(`
    INSERT OR REPLACE INTO wageloss_county_adjustments (county_name, adjustment_factor, population)
    VALUES (?, ?, ?)
  `);

  let imported = 0;
  withTransaction(db, () => {
    for (const line of lines) {
      const parsed = parseCountyLine(line);
      if (!parsed) continue;

      insert.run(parsed.name, parsed.adjustmentFactor, parsed.population);
      imported++;
    }
  });

  console.log(`Imported ${imported} county wage adjustment records.`);
  return imported;
}

function importDotIndustryCodes(db, wagelossDir) {
  const sicLines = readPrnLines(path.join(wagelossDir, 'SIC.prn'));
  const naicsLines = readPrnLines(path.join(wagelossDir, 'NAICS.prn'));
  const censusLines = readPrnLines(path.join(wagelossDir, 'Census.prn'));
  const titleLines = readPrnLines(path.join(wagelossDir, 'DOTTitle.prn'));

  if (!titleLines.length) {
    console.warn('DOTTitle.prn not found or empty. Skipping industry code import.');
    return 0;
  }

  const count = titleLines.length;
  const insert = db.prepare(`
    INSERT OR REPLACE INTO wageloss_dot_industry_codes (
      dot_code, sic_code, sic_description, naics_code, naics_description,
      census_code, census_title
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let imported = 0;
  withTransaction(db, () => {
    for (let i = 0; i < count; i++) {
      const titleMatch = titleLines[i].match(/^(\d{9})/);
      if (!titleMatch) continue;
      const dotCode = titleMatch[1];

      const sic = i < sicLines.length ? parseSICLine(sicLines[i]) : null;
      const naics = i < naicsLines.length ? parseNAICSLine(naicsLines[i]) : null;
      const census = i < censusLines.length ? parseCensusLine(censusLines[i]) : null;

      insert.run(
        dotCode,
        sic?.code || null,
        sic?.description || null,
        naics?.code || null,
        naics?.description || null,
        census?.code || null,
        census?.title || null
      );
      imported++;
    }
  });

  console.log(`Imported ${imported} DOT industry code records.`);
  return imported;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dbPath = path.resolve(args.db);
  const wagelossDir = path.resolve(args.wagelossDir);

  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(wagelossDir)) {
    console.error(`WageLoss directory not found: ${wagelossDir}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Database: ${dbPath}`);
  console.log(`WageLoss directory: ${wagelossDir}`);

  const db = new DatabaseSync(dbPath);
  ensureWageLossSchema(db);

  const socCount = importSOCWages(db, wagelossDir);
  const crosswalkCount = importDotSocCrosswalk(db, wagelossDir);
  const countyCount = importCountyAdjustments(db, wagelossDir);
  const industryCount = importDotIndustryCodes(db, wagelossDir);

  db.close();

  console.log('\nWageLoss import complete:');
  console.log(`  SOC wage records: ${socCount}`);
  console.log(`  DOT→SOC crosswalk: ${crosswalkCount}`);
  console.log(`  County adjustments: ${countyCount}`);
  console.log(`  Industry codes: ${industryCount}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
