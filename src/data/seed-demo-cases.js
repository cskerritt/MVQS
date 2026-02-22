/**
 * seed-demo-cases.js
 *
 * Seeds the app database (mvqs-app.db) with realistic demo cases that exercise
 * every report type and section. After seeding, the script generates and saves
 * all report types for each case so they can be reviewed in the UI.
 *
 * Usage:   node src/data/seed-demo-cases.js
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { TRAITS, DEFAULT_PROFILE } from '../traits.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DB_PATH = path.resolve(__dirname, '../../data/mvqs-app.db');
const MODERN_DB_PATH = path.resolve(__dirname, '../../data/mvqs-modern.db');

function nowIso() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

/* ------------------------------------------------------------------ */
/*  Demo case definitions                                              */
/* ------------------------------------------------------------------ */

const DEMO_CASES = [
  {
    first_name: 'Thomas',
    last_name: 'McKenna',
    email: 'thomas.mckenna@demo.mvqs',
    case_reference: 'DEMO-001',
    case_name: 'McKenna v. ABC Construction',
    reason_for_referral: 'Workers compensation injury evaluation - back injury sustained during construction work',
    claims_email: 'claims@abcinsurance.demo',
    case_diagnosis: 'L4-L5 herniated disc with radiculopathy; restricted to light duty',
    vipr_type: 'ISTJ',
    evaluation_year: 2024,
    address_line1: '1247 Oak Street',
    city: 'Tampa',
    postal_code: '33602',
    demographic_state_id: 11,  // Florida
    demographic_county_id: 364, // Hillsborough
    country_name: 'USA',
    labor_market_area_label: 'Tampa-St. Petersburg-Clearwater, FL MSA',
    report_header_notes: 'Pre-injury: Heavy construction work. Post-injury: Restricted to light/sedentary work per Dr. Smith.',
    ts_display_mode: 'band_floor_20_steps',
    va_display_mode: 'legacy_raw_46_minus_tsunadjusted_raw',
    // Work history DOTs (pre-injury jobs)
    work_history: [
      { dot_code: '869664014', title: 'Construction Worker I' },
      { dot_code: '382664010', title: 'Janitor' }
    ],
    // Profile vectors [R,M,L,S,P,Q,K,F,M,E,C, PD1..PD6, EC1..EC7]
    profiles: {
      profile1: [3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 2, 4, 1, 1, 1, 0, 1, 3, 0, 0, 0, 1, 1, 1], // work history
      profile2: [3, 2, 2, 2, 3, 2, 3, 2, 3, 2, 2, 2, 0, 0, 1, 0, 1, 2, 0, 0, 0, 1, 0, 0], // evaluative (post-injury, light)
      profile3: [3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 2, 4, 1, 1, 1, 0, 1, 3, 0, 0, 0, 1, 1, 1], // pre = max(p1,p2)
      profile4: [3, 2, 2, 2, 3, 2, 3, 2, 3, 2, 2, 2, 0, 0, 1, 0, 1, 2, 0, 0, 0, 1, 0, 0], // post = evaluative
      vq_estimates: { profile1_vq_est: 112.5, profile2_vq_est: 84.0, profile3_vq_est: 112.5, profile4_vq_est: 84.0 }
    },
    psychometric_results: [
      { test_code: 'WRAT4_READ', raw_score: 45, scaled_score: 95, percentile: 37, stanine: 4, notes: 'Average reading ability' },
      { test_code: 'WRAT4_MATH', raw_score: 38, scaled_score: 88, percentile: 21, stanine: 3, notes: 'Below average math computation' },
      { test_code: 'WRAT4_SPELL', raw_score: 41, scaled_score: 91, percentile: 27, stanine: 4, notes: 'Low average spelling' },
      { test_code: 'WONDERLIC_PT', raw_score: 19, scaled_score: 19, percentile: 30, stanine: 4, notes: 'Low average general cognitive ability' }
    ],
    work_values: [
      // Achievement / Working Conditions
      { value_id: 2, short_label: 'Ability Utilization', category: 'Achievement / Working Conditions', rating: 3 },
      { value_id: 3, short_label: 'Achievement', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 4, short_label: 'Activity', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 5, short_label: 'Independence', category: 'Achievement / Working Conditions', rating: 3 },
      { value_id: 6, short_label: 'Variety', category: 'Achievement / Working Conditions', rating: 3 },
      { value_id: 7, short_label: 'Compensation', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 8, short_label: 'Security', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 9, short_label: 'Working Conditions', category: 'Achievement / Working Conditions', rating: 4 },
      // Recognition / Relationships
      { value_id: 10, short_label: 'Advancement', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 11, short_label: 'Recognition', category: 'Recognition / Relationships', rating: 3 },
      { value_id: 12, short_label: 'Authority', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 13, short_label: 'Social Status', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 14, short_label: 'Co-workers', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 15, short_label: 'Social Service', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 16, short_label: 'Moral Values', category: 'Recognition / Relationships', rating: 4 },
      // Support / Independence
      { value_id: 17, short_label: 'Company Policies and Practices', category: 'Support / Independence', rating: 4 },
      { value_id: 18, short_label: 'Supervision, Human Relations', category: 'Support / Independence', rating: 3 },
      { value_id: 19, short_label: 'Supervision, Technical', category: 'Support / Independence', rating: 3 },
      { value_id: 20, short_label: 'Creativity', category: 'Support / Independence', rating: 2 },
      { value_id: 21, short_label: 'Responsibility', category: 'Support / Independence', rating: 3 },
      { value_id: 22, short_label: 'Autonomy', category: 'Support / Independence', rating: 3 }
    ]
  },
  {
    first_name: 'Maria',
    last_name: 'Rodriguez',
    email: 'maria.rodriguez@demo.mvqs',
    case_reference: 'DEMO-002',
    case_name: 'Rodriguez v. Metro Hospital',
    reason_for_referral: 'Medical malpractice earning capacity evaluation - carpal tunnel from repetitive nursing tasks',
    claims_email: 'legal@metrohealth.demo',
    case_diagnosis: 'Bilateral carpal tunnel syndrome; post-surgical limited grip and fine motor control',
    vipr_type: 'ESFJ',
    evaluation_year: 2025,
    address_line1: '892 Palm Avenue',
    city: 'Miami',
    postal_code: '33130',
    demographic_state_id: 11,
    demographic_county_id: 348,  // Dade (Miami-Dade)
    country_name: 'USA',
    labor_market_area_label: 'Miami-Fort Lauderdale-West Palm Beach, FL MSA',
    report_header_notes: 'Claimant is a bilingual (Spanish/English) LPN with 12 years experience. Post-surgical restrictions on fine motor tasks.',
    ts_display_mode: 'band_floor_20_steps',
    va_display_mode: 'legacy_raw_46_minus_tsunadjusted_raw',
    work_history: [
      { dot_code: '079374014', title: 'Nurse, Licensed Practical' },
      { dot_code: '290477014', title: 'Sales Clerk' }
    ],
    profiles: {
      profile1: [4, 3, 4, 3, 3, 3, 3, 3, 3, 2, 2, 3, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0], // LPN work history
      profile2: [4, 3, 4, 3, 3, 3, 2, 1, 2, 2, 2, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0], // post-surgery, reduced F/M
      profile3: [4, 3, 4, 3, 3, 3, 3, 3, 3, 2, 2, 3, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0], // pre
      profile4: [4, 3, 4, 3, 3, 3, 2, 1, 2, 2, 2, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0], // post
      vq_estimates: { profile1_vq_est: 120.1, profile2_vq_est: 98.5, profile3_vq_est: 120.1, profile4_vq_est: 98.5 }
    },
    psychometric_results: [
      { test_code: 'WAIS_FSIQ', raw_score: null, scaled_score: 105, percentile: 63, stanine: 6, notes: 'Average Full Scale IQ' },
      { test_code: 'WAIS_VCI', raw_score: null, scaled_score: 112, percentile: 79, stanine: 7, notes: 'High average verbal comprehension' },
      { test_code: 'WAIS_PRI', raw_score: null, scaled_score: 98, percentile: 45, stanine: 5, notes: 'Average perceptual reasoning' },
      { test_code: 'WRAT4_READ', raw_score: 52, scaled_score: 108, percentile: 70, stanine: 6, notes: 'Average to high average reading' },
      { test_code: 'WRAT4_MATH', raw_score: 48, scaled_score: 102, percentile: 55, stanine: 5, notes: 'Average math computation' }
    ],
    work_values: [
      { value_id: 2, short_label: 'Ability Utilization', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 3, short_label: 'Achievement', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 4, short_label: 'Activity', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 5, short_label: 'Independence', category: 'Achievement / Working Conditions', rating: 2 },
      { value_id: 6, short_label: 'Variety', category: 'Achievement / Working Conditions', rating: 3 },
      { value_id: 7, short_label: 'Compensation', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 8, short_label: 'Security', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 9, short_label: 'Working Conditions', category: 'Achievement / Working Conditions', rating: 3 },
      { value_id: 10, short_label: 'Advancement', category: 'Recognition / Relationships', rating: 3 },
      { value_id: 11, short_label: 'Recognition', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 12, short_label: 'Authority', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 13, short_label: 'Social Status', category: 'Recognition / Relationships', rating: 3 },
      { value_id: 14, short_label: 'Co-workers', category: 'Recognition / Relationships', rating: 5 },
      { value_id: 15, short_label: 'Social Service', category: 'Recognition / Relationships', rating: 5 },
      { value_id: 16, short_label: 'Moral Values', category: 'Recognition / Relationships', rating: 5 },
      { value_id: 17, short_label: 'Company Policies and Practices', category: 'Support / Independence', rating: 4 },
      { value_id: 18, short_label: 'Supervision, Human Relations', category: 'Support / Independence', rating: 4 },
      { value_id: 19, short_label: 'Supervision, Technical', category: 'Support / Independence', rating: 4 },
      { value_id: 20, short_label: 'Creativity', category: 'Support / Independence', rating: 3 },
      { value_id: 21, short_label: 'Responsibility', category: 'Support / Independence', rating: 4 },
      { value_id: 22, short_label: 'Autonomy', category: 'Support / Independence', rating: 3 }
    ]
  },
  {
    first_name: 'James',
    last_name: 'Wilson',
    email: 'james.wilson@demo.mvqs',
    case_reference: 'DEMO-003',
    case_name: 'Wilson Disability Benefits Review',
    reason_for_referral: 'Social Security disability evaluation - prior auto mechanic with shoulder/back injuries',
    claims_email: 'ssa.claims@demo.gov',
    case_diagnosis: 'Rotator cuff tear (R shoulder); degenerative disc disease L3-S1; limited to sedentary work',
    vipr_type: 'ISTP',
    evaluation_year: 2025,
    address_line1: '3456 Industrial Blvd',
    city: 'Columbus',
    postal_code: '43215',
    demographic_state_id: 37,  // Ohio
    demographic_county_id: 2108, // Franklin
    country_name: 'USA',
    labor_market_area_label: 'Columbus, OH MSA',
    report_header_notes: 'Claimant worked as auto mechanic for 18 years and truck driver for 5 years. Now restricted to sedentary work.',
    ts_display_mode: 'band_floor_20_steps',
    va_display_mode: 'legacy_raw_46_minus_tsunadjusted_raw',
    work_history: [
      { dot_code: '620261010', title: 'Automobile Mechanic' },
      { dot_code: '906683010', title: 'Food-Service Driver' },
      { dot_code: '382664010', title: 'Janitor' }
    ],
    profiles: {
      profile1: [4, 3, 3, 4, 3, 2, 3, 3, 4, 2, 2, 4, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1], // mechanic/driver
      profile2: [3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], // sedentary only
      profile3: [4, 3, 3, 4, 3, 2, 3, 3, 4, 2, 2, 4, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1], // pre
      profile4: [3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], // post sedentary
      vq_estimates: { profile1_vq_est: 118.4, profile2_vq_est: 72.3, profile3_vq_est: 118.4, profile4_vq_est: 72.3 }
    },
    psychometric_results: [
      { test_code: 'WONDERLIC_PT', raw_score: 22, scaled_score: 22, percentile: 42, stanine: 5, notes: 'Average general cognitive ability' },
      { test_code: 'WRAT4_READ', raw_score: 47, scaled_score: 98, percentile: 45, stanine: 5, notes: 'Average reading' },
      { test_code: 'WRAT4_MATH', raw_score: 44, scaled_score: 96, percentile: 39, stanine: 4, notes: 'Average math computation' },
      { test_code: 'WRAT4_SPELL', raw_score: 43, scaled_score: 94, percentile: 34, stanine: 4, notes: 'Average spelling' }
    ],
    work_values: [
      { value_id: 2, short_label: 'Ability Utilization', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 3, short_label: 'Achievement', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 4, short_label: 'Activity', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 5, short_label: 'Independence', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 6, short_label: 'Variety', category: 'Achievement / Working Conditions', rating: 3 },
      { value_id: 7, short_label: 'Compensation', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 8, short_label: 'Security', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 9, short_label: 'Working Conditions', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 10, short_label: 'Advancement', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 11, short_label: 'Recognition', category: 'Recognition / Relationships', rating: 3 },
      { value_id: 12, short_label: 'Authority', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 13, short_label: 'Social Status', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 14, short_label: 'Co-workers', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 15, short_label: 'Social Service', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 16, short_label: 'Moral Values', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 17, short_label: 'Company Policies and Practices', category: 'Support / Independence', rating: 3 },
      { value_id: 18, short_label: 'Supervision, Human Relations', category: 'Support / Independence', rating: 3 },
      { value_id: 19, short_label: 'Supervision, Technical', category: 'Support / Independence', rating: 4 },
      { value_id: 20, short_label: 'Creativity', category: 'Support / Independence', rating: 3 },
      { value_id: 21, short_label: 'Responsibility', category: 'Support / Independence', rating: 4 },
      { value_id: 22, short_label: 'Autonomy', category: 'Support / Independence', rating: 4 }
    ]
  },
  {
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'sarah.chen@demo.mvqs',
    case_reference: 'DEMO-004',
    case_name: 'Chen v. Tech Solutions Inc.',
    reason_for_referral: 'Wrongful termination earning capacity assessment - senior accountant/secretary',
    claims_email: 'hr.legal@techsolutions.demo',
    case_diagnosis: 'No physical impairment; psychological: adjustment disorder with anxiety following termination',
    vipr_type: 'INTJ',
    evaluation_year: 2025,
    address_line1: '567 Market Street',
    city: 'San Francisco',
    postal_code: '94105',
    demographic_state_id: 6,  // California
    demographic_county_id: 235, // San Francisco
    country_name: 'USA',
    labor_market_area_label: 'San Francisco-Oakland-Hayward, CA MSA',
    report_header_notes: 'Claimant has MBA, 15 years accounting experience. Seeking to document earning capacity for wrongful termination claim.',
    ts_display_mode: 'band_floor_20_steps',
    va_display_mode: 'inverted_100_minus_api_va',
    work_history: [
      { dot_code: '160162018', title: 'Accountant' },
      { dot_code: '201362030', title: 'Secretary' },
      { dot_code: '045107010', title: 'Counselor' }
    ],
    profiles: {
      profile1: [5, 5, 5, 2, 2, 4, 4, 4, 3, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], // accountant/secretary
      profile2: [5, 5, 5, 2, 2, 4, 4, 4, 3, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], // no physical restriction
      profile3: [5, 5, 5, 2, 2, 4, 4, 4, 3, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], // pre = post (no physical change)
      profile4: [5, 5, 5, 2, 2, 4, 4, 4, 3, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], // post
      vq_estimates: { profile1_vq_est: 117.6, profile2_vq_est: 117.6, profile3_vq_est: 117.6, profile4_vq_est: 117.6 }
    },
    psychometric_results: [
      { test_code: 'WAIS_FSIQ', raw_score: null, scaled_score: 118, percentile: 88, stanine: 7, notes: 'High average Full Scale IQ' },
      { test_code: 'WAIS_VCI', raw_score: null, scaled_score: 125, percentile: 95, stanine: 8, notes: 'Superior verbal comprehension' },
      { test_code: 'WAIS_WMI', raw_score: null, scaled_score: 115, percentile: 84, stanine: 7, notes: 'High average working memory' },
      { test_code: 'WRAT4_READ', raw_score: 58, scaled_score: 118, percentile: 88, stanine: 7, notes: 'High average reading' },
      { test_code: 'WRAT4_MATH', raw_score: 55, scaled_score: 115, percentile: 84, stanine: 7, notes: 'High average math' }
    ],
    work_values: [
      { value_id: 2, short_label: 'Ability Utilization', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 3, short_label: 'Achievement', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 4, short_label: 'Activity', category: 'Achievement / Working Conditions', rating: 3 },
      { value_id: 5, short_label: 'Independence', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 6, short_label: 'Variety', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 7, short_label: 'Compensation', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 8, short_label: 'Security', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 9, short_label: 'Working Conditions', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 10, short_label: 'Advancement', category: 'Recognition / Relationships', rating: 5 },
      { value_id: 11, short_label: 'Recognition', category: 'Recognition / Relationships', rating: 5 },
      { value_id: 12, short_label: 'Authority', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 13, short_label: 'Social Status', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 14, short_label: 'Co-workers', category: 'Recognition / Relationships', rating: 3 },
      { value_id: 15, short_label: 'Social Service', category: 'Recognition / Relationships', rating: 2 },
      { value_id: 16, short_label: 'Moral Values', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 17, short_label: 'Company Policies and Practices', category: 'Support / Independence', rating: 4 },
      { value_id: 18, short_label: 'Supervision, Human Relations', category: 'Support / Independence', rating: 3 },
      { value_id: 19, short_label: 'Supervision, Technical', category: 'Support / Independence', rating: 3 },
      { value_id: 20, short_label: 'Creativity', category: 'Support / Independence', rating: 5 },
      { value_id: 21, short_label: 'Responsibility', category: 'Support / Independence', rating: 5 },
      { value_id: 22, short_label: 'Autonomy', category: 'Support / Independence', rating: 5 }
    ]
  },
  {
    first_name: 'Robert',
    last_name: 'Davis',
    email: 'robert.davis@demo.mvqs',
    case_reference: 'DEMO-005',
    case_name: 'Davis Personal Injury Evaluation',
    reason_for_referral: 'Auto accident personal injury - former chef/cook with hand and wrist injuries',
    claims_email: 'claims@autoinsure.demo',
    case_diagnosis: 'Comminuted fracture right wrist; reduced grip strength; chronic pain syndrome',
    vipr_type: 'ENFP',
    evaluation_year: 2024,
    address_line1: '234 Magnolia Drive',
    city: 'Houston',
    postal_code: '77002',
    demographic_state_id: 45,  // Texas
    demographic_county_id: 2672, // Harris
    country_name: 'USA',
    labor_market_area_label: 'Houston-The Woodlands-Sugar Land, TX MSA',
    report_header_notes: 'Claimant was head chef at fine dining restaurant for 8 years. Post-accident limited in grip, lifting, fine motor tasks.',
    ts_display_mode: 'band_floor_20_steps',
    va_display_mode: 'legacy_raw_46_minus_tsunadjusted_raw',
    work_history: [
      { dot_code: '313131014', title: 'Chef' },
      { dot_code: '290477014', title: 'Sales Clerk' }
    ],
    profiles: {
      profile1: [4, 3, 3, 2, 3, 3, 3, 2, 3, 1, 2, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], // chef work history
      profile2: [4, 3, 3, 2, 3, 3, 2, 1, 1, 1, 2, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], // post-injury (reduced K,F,M)
      profile3: [4, 3, 3, 2, 3, 3, 3, 2, 3, 1, 2, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      profile4: [4, 3, 3, 2, 3, 3, 2, 1, 1, 1, 2, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      vq_estimates: { profile1_vq_est: 111.9, profile2_vq_est: 94.2, profile3_vq_est: 111.9, profile4_vq_est: 94.2 }
    },
    psychometric_results: [
      { test_code: 'WONDERLIC_PT', raw_score: 24, scaled_score: 24, percentile: 50, stanine: 5, notes: 'Average general cognitive ability' },
      { test_code: 'WBST_VERBAL', raw_score: 68, scaled_score: 68, percentile: 55, stanine: 5, notes: 'Average verbal skills' },
      { test_code: 'WBST_QUANT', raw_score: 72, scaled_score: 72, percentile: 62, stanine: 6, notes: 'Average to high average quantitative skills' }
    ],
    work_values: [
      { value_id: 2, short_label: 'Ability Utilization', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 3, short_label: 'Achievement', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 4, short_label: 'Activity', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 5, short_label: 'Independence', category: 'Achievement / Working Conditions', rating: 3 },
      { value_id: 6, short_label: 'Variety', category: 'Achievement / Working Conditions', rating: 5 },
      { value_id: 7, short_label: 'Compensation', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 8, short_label: 'Security', category: 'Achievement / Working Conditions', rating: 3 },
      { value_id: 9, short_label: 'Working Conditions', category: 'Achievement / Working Conditions', rating: 4 },
      { value_id: 10, short_label: 'Advancement', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 11, short_label: 'Recognition', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 12, short_label: 'Authority', category: 'Recognition / Relationships', rating: 3 },
      { value_id: 13, short_label: 'Social Status', category: 'Recognition / Relationships', rating: 3 },
      { value_id: 14, short_label: 'Co-workers', category: 'Recognition / Relationships', rating: 5 },
      { value_id: 15, short_label: 'Social Service', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 16, short_label: 'Moral Values', category: 'Recognition / Relationships', rating: 4 },
      { value_id: 17, short_label: 'Company Policies and Practices', category: 'Support / Independence', rating: 3 },
      { value_id: 18, short_label: 'Supervision, Human Relations', category: 'Support / Independence', rating: 4 },
      { value_id: 19, short_label: 'Supervision, Technical', category: 'Support / Independence', rating: 3 },
      { value_id: 20, short_label: 'Creativity', category: 'Support / Independence', rating: 5 },
      { value_id: 21, short_label: 'Responsibility', category: 'Support / Independence', rating: 4 },
      { value_id: 22, short_label: 'Autonomy', category: 'Support / Independence', rating: 3 }
    ]
  }
];

/* ------------------------------------------------------------------ */
/*  Seeding logic                                                      */
/* ------------------------------------------------------------------ */

function seedDemoCases() {
  console.log('Opening databases...');
  const appDb = new DatabaseSync(APP_DB_PATH);
  const modernDb = new DatabaseSync(MODERN_DB_PATH);

  appDb.exec('PRAGMA journal_mode = WAL');
  appDb.exec('PRAGMA foreign_keys = ON');

  const insertUser = appDb.prepare(`
    INSERT INTO users (
      first_name, last_name, email, case_reference, case_name, reason_for_referral,
      claims_email, case_diagnosis, vipr_type, evaluation_year,
      address_line1, city, postal_code, demographic_state_id, demographic_county_id,
      country_name, labor_market_area_label, report_header_notes,
      ts_display_mode, va_display_mode, active, created_at_utc, updated_at_utc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  const insertProfile = appDb.prepare(`
    INSERT OR REPLACE INTO case_profile_sets (
      user_id, profile1_work_history_vector, profile2_evaluative_vector,
      profile3_pre_vector, profile4_post_vector,
      profile1_vq_est, profile2_vq_est, profile3_vq_est, profile4_vq_est,
      updated_at_utc, clinical_override_mode, enforce_residual_cap
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
  `);

  const insertWorkHistory = appDb.prepare(`
    INSERT OR IGNORE INTO case_work_history_dots (
      user_id, dot_code, display_order, title_snapshot, created_at_utc, updated_at_utc
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Ensure stanine column exists (migration)
  const psychCols = appDb.prepare('PRAGMA table_info(psychometric_results)').all();
  const psychColNames = new Set(psychCols.map((c) => c.name));
  if (!psychColNames.has('stanine')) {
    appDb.exec('ALTER TABLE psychometric_results ADD COLUMN stanine INTEGER');
  }

  const insertPsychResult = appDb.prepare(`
    INSERT INTO psychometric_results (
      user_id, test_code, test_name, raw_score, scaled_score, percentile, stanine,
      measured_at_utc, interpretation, created_at_utc, updated_at_utc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Ensure case_work_values table exists
  appDb.exec(`
    CREATE TABLE IF NOT EXISTS case_work_values (
      user_id INTEGER NOT NULL,
      value_id INTEGER NOT NULL,
      short_label TEXT NOT NULL,
      category TEXT,
      rating INTEGER NOT NULL DEFAULT 3,
      updated_at_utc TEXT NOT NULL,
      PRIMARY KEY(user_id, value_id),
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);
  appDb.exec('CREATE INDEX IF NOT EXISTS idx_case_work_values_user ON case_work_values(user_id)');

  const insertWorkValue = appDb.prepare(`
    INSERT OR REPLACE INTO case_work_values (
      user_id, value_id, short_label, category, rating, updated_at_utc
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = nowIso();
  const createdUsers = [];

  for (const demoCase of DEMO_CASES) {
    console.log(`\nSeeding case: ${demoCase.first_name} ${demoCase.last_name} (${demoCase.case_reference})...`);

    // Check if already exists
    const existing = appDb.prepare('SELECT user_id FROM users WHERE case_reference = ?').get(demoCase.case_reference);
    if (existing) {
      console.log(`  Already exists as user_id ${existing.user_id}, skipping`);
      createdUsers.push({ ...demoCase, user_id: existing.user_id });
      continue;
    }

    // Insert user
    const result = insertUser.run(
      demoCase.first_name, demoCase.last_name, demoCase.email, demoCase.case_reference,
      demoCase.case_name, demoCase.reason_for_referral, demoCase.claims_email,
      demoCase.case_diagnosis, demoCase.vipr_type, demoCase.evaluation_year,
      demoCase.address_line1, demoCase.city, demoCase.postal_code,
      demoCase.demographic_state_id, demoCase.demographic_county_id,
      demoCase.country_name, demoCase.labor_market_area_label,
      demoCase.report_header_notes, demoCase.ts_display_mode, demoCase.va_display_mode,
      now, now
    );
    const userId = Number(result.lastInsertRowid);
    console.log(`  Created user_id: ${userId}`);

    // Insert profiles
    const p = demoCase.profiles;
    insertProfile.run(
      userId,
      JSON.stringify(p.profile1), JSON.stringify(p.profile2),
      JSON.stringify(p.profile3), JSON.stringify(p.profile4),
      p.vq_estimates.profile1_vq_est, p.vq_estimates.profile2_vq_est,
      p.vq_estimates.profile3_vq_est, p.vq_estimates.profile4_vq_est,
      now
    );
    console.log(`  Inserted profile set (4 profiles + VQ estimates)`);

    // Insert work history
    demoCase.work_history.forEach((wh, index) => {
      insertWorkHistory.run(userId, wh.dot_code, index + 1, wh.title, now, now);
    });
    console.log(`  Inserted ${demoCase.work_history.length} work history DOTs`);

    // Insert psychometric results
    for (const pr of demoCase.psychometric_results) {
      insertPsychResult.run(
        userId, pr.test_code, pr.test_code, pr.raw_score, pr.scaled_score,
        pr.percentile, pr.stanine, `${demoCase.evaluation_year}-01-15`, pr.notes,
        now, now
      );
    }
    console.log(`  Inserted ${demoCase.psychometric_results.length} psychometric results`);

    // Insert work values
    if (Array.isArray(demoCase.work_values)) {
      for (const wv of demoCase.work_values) {
        insertWorkValue.run(userId, wv.value_id, wv.short_label, wv.category, wv.rating, now);
      }
      console.log(`  Inserted ${demoCase.work_values.length} work values`);
    }

    createdUsers.push({ ...demoCase, user_id: userId });
  }

  console.log('\n=== Demo case seeding complete ===');
  console.log(`Created/found ${createdUsers.length} cases:`);
  createdUsers.forEach((u) => {
    console.log(`  user_id=${u.user_id} | ${u.first_name} ${u.last_name} | ${u.case_reference} | VIPR: ${u.vipr_type}`);
    console.log(`    Work history: ${u.work_history.map((w) => w.title).join(', ')}`);
    console.log(`    Diagnosis: ${u.case_diagnosis.substring(0, 60)}...`);
  });

  appDb.close();
  modernDb.close();

  return createdUsers;
}

/* ------------------------------------------------------------------ */
/*  Generate and save reports for each demo case                       */
/* ------------------------------------------------------------------ */

async function generateDemoReports(cases) {
  const BASE_URL = 'http://localhost:4173';

  // Check server is running
  try {
    const healthResp = await fetch(`${BASE_URL}/api/health`);
    const health = await healthResp.json();
    if (!health.ok) throw new Error('Server not healthy');
    console.log('\nServer is healthy, generating reports...');
  } catch {
    console.error('\nERROR: Server not running on port 4173. Start it first with: node src/server.js');
    console.log('After starting the server, run this script again to generate reports.');
    return;
  }

  for (const demoCase of cases) {
    console.log(`\n--- Generating reports for ${demoCase.first_name} ${demoCase.last_name} (user_id=${demoCase.user_id}) ---`);

    const sourceDots = demoCase.work_history.map((w) => w.dot_code);
    const profile = demoCase.profiles.profile4; // post profile for matching

    // 1. Generate and save a Transferable Skills report
    try {
      const tsaResp = await fetch(`${BASE_URL}/api/reports/transferable-skills/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: demoCase.user_id,
          label: `Demo TSA: ${demoCase.first_name} ${demoCase.last_name}`,
          sourceDots,
          profile,
          limit: 25,
          taskLimit: 5,
          stateId: demoCase.demographic_state_id,
          countyId: demoCase.demographic_county_id
        })
      });
      const tsaData = await tsaResp.json();
      if (tsaData.error) {
        console.log(`  TSA REPORT ERROR: ${tsaData.error}`);
      } else {
        const rpt = tsaData.saved_report || tsaData;
        console.log(`  TSA Report saved: ID=${rpt.saved_report_id || 'ok'}, matches=${tsaData.report?.matches?.length || '?'}`);
      }
    } catch (err) {
      console.log(`  TSA REPORT FAILED: ${err.message}`);
    }

    // 2. Generate and save a Match report
    try {
      const matchResp = await fetch(`${BASE_URL}/api/reports/match/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: demoCase.user_id,
          label: `Demo Match: ${demoCase.first_name} ${demoCase.last_name}`,
          profile,
          limit: 25,
          taskLimit: 5,
          stateId: demoCase.demographic_state_id,
          countyId: demoCase.demographic_county_id
        })
      });
      const matchData = await matchResp.json();
      if (matchData.error) {
        console.log(`  MATCH REPORT ERROR: ${matchData.error}`);
      } else {
        const rpt = matchData.saved_report || matchData;
        console.log(`  Match Report saved: ID=${rpt.saved_report_id || 'ok'}, matches=${matchData.report?.matches?.length || '?'}`);
      }
    } catch (err) {
      console.log(`  MATCH REPORT FAILED: ${err.message}`);
    }
  }

  console.log('\n=== All demo reports generated ===');
  console.log('View saved reports at: http://localhost:4173/api/reports/saved');
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

const cases = seedDemoCases();
await generateDemoReports(cases);
