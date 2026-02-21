import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECTION7_JSON_PATH = path.resolve(__dirname, '../../docs/section7_resolution_matrix.json');

function loadSection7Document() {
  const raw = fs.readFileSync(SECTION7_JSON_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  const version = typeof parsed?.version === 'string' && parsed.version.trim() ? parsed.version.trim() : 'unknown';
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  return {
    version,
    title: parsed?.title || 'MVQS Section 7 Resolution Matrix',
    generated_from: parsed?.generated_from || null,
    items
  };
}

const SECTION7_DOCUMENT = loadSection7Document();

function normalizeConfidence(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
    return normalized;
  }
  return 'low';
}

function normalizeStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'resolved' || normalized === 'partial' || normalized === 'unresolved') {
    return normalized;
  }
  return 'unresolved';
}

export function getSection7Resolution() {
  return SECTION7_DOCUMENT;
}

export function getSection7Items() {
  return SECTION7_DOCUMENT.items || [];
}

export function getSection7UnresolvedIds(items = getSection7Items()) {
  return items
    .filter((item) => normalizeStatus(item?.status) !== 'resolved')
    .map((item) => Number(item?.id))
    .filter((id) => Number.isInteger(id))
    .sort((a, b) => a - b);
}

export function getSection7ConfidenceProfile(items = getSection7Items()) {
  const profile = {
    high: 0,
    medium: 0,
    low: 0
  };
  items.forEach((item) => {
    const confidence = normalizeConfidence(item?.confidence);
    profile[confidence] += 1;
  });
  return {
    ...profile,
    total_items: items.length
  };
}

export function getSection7MethodologyMetadata() {
  const items = getSection7Items();
  return {
    section7_resolution_version: SECTION7_DOCUMENT.version,
    section7_unresolved_ids: getSection7UnresolvedIds(items),
    section7_confidence_profile: getSection7ConfidenceProfile(items)
  };
}
