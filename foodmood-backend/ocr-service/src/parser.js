// Domain-specific parser for grocery receipts.
// Input: raw OCR text + per-word confidence (Tesseract result).
// Output: ScannedItem[] aligned with frontend Scanner.tsx shape:
//   { name: string, price: string, expiryDate: string, confidence: number }
//
// Heuristics:
//   - A "line item" is a line that ends with a money-like token (e.g. 2.99, 4,50, $3.49).
//   - Strip leading/trailing non-letters from the name.
//   - Skip noise lines (totals, taxes, dates, store header).
//   - Estimate expiry: 7 days from "today" by default, with category-aware overrides.

const NOISE = [
  /total/i,
  /subtotal/i,
  /tax\b/i,
  /vat\b/i,
  /change/i,
  /cash/i,
  /card/i,
  /receipt/i,
  /thank you/i,
  /balance/i,
  /tender/i,
  /tel\b/i,
  /tel:/i,
  /www\./i,
  /^\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}/, // dates
  /\b\d{4,}\b\s*$/, // pure barcode-like trailing numbers
];

// Approx shelf life from purchase, in days, for common categories.
const DEFAULT_SHELF_LIFE = {
  Dairy: 7,
  Meat: 3,
  Veggies: 5,
  Fruits: 5,
  Bakery: 4,
  Grains: 180,
  Pantry: 365,
  Frozen: 90,
  Beverages: 30,
  Other: 7,
};

// Tiny keyword→category classifier — good enough for receipts.
const CATEGORY_KEYWORDS = {
  Dairy: ['milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'kefir'],
  Meat: ['chicken', 'beef', 'pork', 'turkey', 'sausage', 'ham', 'bacon', 'mince', 'lamb'],
  Veggies: ['tomato', 'cucumber', 'spinach', 'lettuce', 'carrot', 'onion', 'potato', 'pepper', 'broccoli', 'cabbage'],
  Fruits: ['apple', 'banana', 'orange', 'grape', 'berry', 'lemon', 'pear', 'peach'],
  Bakery: ['bread', 'bun', 'roll', 'baguette', 'pastry', 'croissant'],
  Grains: ['rice', 'pasta', 'noodle', 'oat', 'flour', 'quinoa'],
  Pantry: ['oil', 'vinegar', 'sugar', 'salt', 'sauce', 'spice', 'beans', 'canned'],
  Frozen: ['frozen', 'ice cream'],
  Beverages: ['juice', 'cola', 'water', 'tea', 'coffee', 'soda'],
};

function classifyCategory(name) {
  const lower = name.toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((kw) => lower.includes(kw))) return cat;
  }
  return 'Other';
}

const MONEY_RE = /([0-9]{1,4}[.,][0-9]{2})\s*\$?\s*$/;

function isNoise(line) {
  return NOISE.some((re) => re.test(line));
}

function cleanName(raw) {
  return raw
    .replace(MONEY_RE, '')
    .replace(/[*#@~|]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[^a-zA-Z]+/, '')
    .replace(/[^a-zA-Z0-9 ]+$/, '')
    .trim();
}

function defaultExpiryFor(category, baseDate = new Date()) {
  const days = DEFAULT_SHELF_LIFE[category] ?? 7;
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Tesseract gives us per-line confidence. We blend line confidence with
// "structure confidence" (does the line look like an item?) to produce
// a single 0–100 score matching the frontend's `confidence` field.
function structureConfidence(name, priceMatched) {
  let score = 0;
  if (priceMatched) score += 40;
  if (name.length >= 3) score += 20;
  if (/[a-zA-Z]/.test(name)) score += 20;
  if (/\s/.test(name)) score += 10;
  if (name.length < 30) score += 10;
  return score;
}

export function parseReceipt(ocrResult, opts = {}) {
  const { defaultExpiryOffsetDays = 7 } = opts;
  const text = ocrResult.data?.text || '';
  const lines = text.split(/\r?\n/);

  // Build a line→avgConfidence map from word-level data when available.
  const lineConfidence = {};
  for (const w of ocrResult.data?.words || []) {
    const ln = w.line?.text || '';
    if (!lineConfidence[ln]) lineConfidence[ln] = { sum: 0, count: 0 };
    lineConfidence[ln].sum += w.confidence || 0;
    lineConfidence[ln].count += 1;
  }

  const items = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.length < 3) continue;
    if (isNoise(line)) continue;

    const priceMatch = line.match(MONEY_RE);
    if (!priceMatch) continue;
    const price = priceMatch[1].replace(',', '.');

    const name = cleanName(line);
    if (!name || name.length < 2) continue;

    const lineConfData = lineConfidence[rawLine] || lineConfidence[line];
    const ocrConf = lineConfData ? lineConfData.sum / lineConfData.count : 75;
    const structConf = structureConfidence(name, true);
    const confidence = Math.round(0.5 * ocrConf + 0.5 * structConf);

    const category = classifyCategory(name);
    const expiryDate = defaultExpiryFor(category);

    items.push({
      name,
      price,
      expiryDate,
      confidence: Math.min(99, Math.max(40, confidence)),
      // Hints for backend — frontend ignores extra fields safely.
      category,
      quantity: 1,
      unit: 'pcs',
    });
  }
  return items;
}
