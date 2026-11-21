// Life-table engine. Pure functions with no DOM access, so it runs in the browser and in Node tests.
import { SSA_2023 } from './data/ssa-2023.js';
import { FACTORS, FACTOR_BY_ID } from './factors.js';

export const MAX_AGE = 120;
export const MODEL_VERSION = '1.0.0';
export const DEFAULT_IMPROVEMENT = 0.007; // long-range average annual decline in death rates (SSA Trustees, intermediate)
const OVERLAP_DECAY = 0.8; // weight multiplier for each additional factor in the same pathway group
const OVERLAP_FLOOR = 0.5;
// Soft bounds on the combined hazard multiplier. Even the healthiest insured lives rarely
// show mortality much below ~35% of population rates, and stacking many favorable
// relative risks multiplicatively would otherwise overstate the benefit.
const MIN_MULT = 0.35;
const MAX_MULT = 10;

export function baseQ(sex, age) {
  if (age >= MAX_AGE) return 1;
  const m = SSA_2023.male.q[age];
  const f = SSA_2023.female.q[age];
  if (sex === 'male') return m;
  if (sex === 'female') return f;
  return (m + f) / 2;
}

const meanRRCache = new Map();
function meanRR(factor) {
  if (!meanRRCache.has(factor.id)) {
    const tot = factor.options.reduce((s, o) => s + o.prev, 0);
    meanRRCache.set(factor.id, factor.options.reduce((s, o) => s + o.prev * o.rr, 0) / tot);
  }
  return meanRRCache.get(factor.id);
}

function findOption(factor, id) {
  return factor.options.find((o) => o.id === id) || (factor.scenarioOptions || []).find((o) => o.id === id);
}

// Resolve the questionnaire answers to {factorId: optionId|null}. null = unknown -> population average.
export function resolveAnswers(answers) {
  const out = {};
  for (const f of FACTORS) {
    let v = null;
    if (typeof f.resolve === 'function') v = f.resolve(answers);
    else if (answers[f.id] && f.options.some((o) => o.id === answers[f.id])) v = answers[f.id];
    out[f.id] = v;
  }
  return out;
}

function ageWeight(factor, age) {
  const s = Math.min(1, Math.max(0, (age - 60) / 30));
  return 1 - factor.attenuation * s;
}

// Log relative hazard for one factor at attained age `age`, t years from now.
function factorLog(factor, optionId, age, t) {
  if (optionId == null) return 0;
  const effId = factor.trajectory ? factor.trajectory(optionId, t) : optionId;
  const o = findOption(factor, effId);
  if (!o || o.rr == null) return 0;
  return Math.log(o.rr / meanRR(factor)) * ageWeight(factor, age);
}

// Combine per-factor log hazards. Within a pathway group, same-direction effects are
// combined with diminishing weights (1, 0.8, 0.64, ... floored at 0.5) to avoid
// double-counting overlapping mechanisms (e.g. BMI acting through blood pressure).
function combine(logsByGroup) {
  let total = 0;
  for (const logs of logsByGroup.values()) {
    for (const sign of [1, -1]) {
      const xs = logs.filter((x) => x * sign > 0).sort((a, b) => Math.abs(b) - Math.abs(a));
      xs.forEach((x, i) => { total += x * Math.max(OVERLAP_FLOOR, OVERLAP_DECAY ** i); });
    }
  }
  return total;
}

export function multiplierAt(resolved, age, t, scale = 1) {
  const groups = new Map();
  for (const f of FACTORS) {
    const l = factorLog(f, resolved[f.id], age, t) * scale;
    if (l === 0) continue;
    if (!groups.has(f.group)) groups.set(f.group, []);
    groups.get(f.group).push(l);
  }
  return softBound(combine(groups));
}

// Smoothly saturating map from a log hazard to a multiplier: ~exp(L) for small |L|,
// approaching MIN_MULT / MAX_MULT asymptotically.
export function softBound(L) {
  const c = L < 0 ? Math.log(1 / MIN_MULT) : Math.log(MAX_MULT);
  return Math.exp(c * Math.tanh(L / c));
}

/**
 * Build a personal life table.
 * opts: { age, sex, improvement (annual rate, 0 for a pure period table), currentYear, scale }
 */
export function buildTable(resolved, opts) {
  const age = Math.floor(opts.age);
  const sex = opts.sex;
  const imp = opts.improvement ?? 0;
  const year0 = opts.currentYear ?? new Date().getFullYear();
  const scale = opts.scale ?? 1;
  const rows = [];
  let l = 100000;
  let lBase = 100000;
  for (let x = age; x <= MAX_AGE; x++) {
    const t = x - age;
    const year = year0 + t;
    const impFactor = Math.pow(1 - imp, Math.max(0, year - SSA_2023.baseYear));
    const qb = Math.min(1, baseQ(sex, x) * impFactor);
    const m = multiplierAt(resolved, x, t, scale);
    const q = x >= MAX_AGE ? 1 : 1 - Math.exp(Math.log(1 - Math.min(qb, 0.999999)) * m);
    const qbase = x >= MAX_AGE ? 1 : qb;
    const d = l * q;
    rows.push({ age: x, year, q, qBase: qbase, mult: m, l, d, lBase, S: l / 100000, SBase: lBase / 100000 });
    l -= d;
    lBase -= lBase * qbase;
  }
  // Complete expectation of life, assuming deaths are uniform within each year of age.
  let T = 0;
  let TB = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    const next = rows[i + 1];
    const L = (r.l + (next ? next.l : 0)) / 2;
    const LB = (r.lBase + (next ? next.lBase : 0)) / 2;
    T += L;
    TB += LB;
    r.L = L;
    r.T = T;
    r.e = r.l > 1e-9 ? T / r.l : 0;
    r.eBase = r.lBase > 1e-9 ? TB / r.lBase : 0;
  }
  return rows;
}

// Age at which survival from the current age falls to `p` (linear interpolation).
export function survivalQuantile(rows, p, key = 'S') {
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i][key];
    const b = rows[i + 1][key];
    if (a >= p && b < p) return rows[i].age + (a - p) / (a - b);
  }
  return rows[rows.length - 1].age;
}

export function probAlive(rows, targetAge, key = 'S') {
  const r = rows.find((x) => x.age === targetAge);
  if (!r) return targetAge < rows[0].age ? 1 : 0;
  return r[key];
}

// Insurer-style mortality rating: ratio of personal to standard mortality, mapped to a
// conventional class label. Substandard tables are +25% each (Table 1 = 125%, Table 2 = 150%...).
export function ratingClass(ratio) {
  const pct = ratio * 100;
  if (pct <= 75) return { label: 'Preferred Plus (illustrative)', tier: 1 };
  if (pct <= 90) return { label: 'Preferred (illustrative)', tier: 2 };
  if (pct <= 110) return { label: 'Standard Plus (illustrative)', tier: 3 };
  if (pct <= 135) return { label: 'Standard (illustrative)', tier: 4 };
  const table = Math.min(16, Math.ceil((pct - 100) / 25));
  return { label: `Substandard, Table ${table} (illustrative)`, tier: 5 };
}

function lifeExpectancy(resolved, opts) {
  return buildTable(resolved, opts)[0].e;
}

export function evaluate(answers, { currentYear } = {}) {
  const person = answers.person || {};
  const age = Math.floor(Number(person.age));
  if (!(age >= 18 && age <= 110)) throw new Error('Please enter an age between 18 and 110.');
  const sex = ['male', 'female'].includes(person.sex) ? person.sex : 'unspecified';
  const improvement = answers.settings && answers.settings.improvement === false ? 0 : DEFAULT_IMPROVEMENT;
  const opts = { age, sex, improvement, currentYear: currentYear ?? new Date().getFullYear() };

  const resolved = resolveAnswers(answers);
  const rows = buildTable(resolved, opts);
  const e = rows[0].e;
  const eBase = rows[0].eBase;

  // 10-year average mortality ratio (deaths-weighted), the figure an underwriter would quote.
  let dP = 0;
  let dB = 0;
  for (const r of rows.slice(0, 10)) { dP += r.l * r.q; dB += r.l * r.qBase; }
  const ratio = dB > 0 ? dP / dB : 1;

  // Factor contributions relative to the population-average respondent.
  const contributions = [];
  for (const f of FACTORS) {
    const optId = resolved[f.id];
    if (optId == null) continue;
    const without = { ...resolved, [f.id]: null };
    const eWithout = lifeExpectancy(without, opts);
    const o = findOption(f, optId);
    let gain = 0;
    let target = null;
    if (f.modifiable && o.improvesTo) {
      target = findOption(f, o.improvesTo);
      gain = lifeExpectancy({ ...resolved, [f.id]: o.improvesTo }, opts) - e;
    }
    contributions.push({
      id: f.id,
      label: f.label,
      answer: o.label,
      rr: o.rr,
      relative: o.rr / meanRR(f),
      vsAverage: e - eWithout,
      modifiable: !!f.modifiable,
      gain,
      target: target ? target.label : null,
      advice: f.advice || '',
      cite: f.cite,
    });
  }
  const detriments = contributions
    .filter((c) => c.modifiable && c.gain > 0.05)
    .sort((a, b) => b.gain - a.gain);

  const allImproved = { ...resolved };
  for (const c of detriments) allImproved[c.id] = findOption(FACTOR_BY_ID[c.id], resolved[c.id]).improvesTo;
  const eAllImproved = detriments.length ? lifeExpectancy(allImproved, opts) : e;

  const sensitivity = {
    low: lifeExpectancy(resolved, { ...opts, scale: 1.3 }),
    high: lifeExpectancy(resolved, { ...opts, scale: 0.7 }),
  };
  // Make sure low <= high regardless of the direction of the person's net risk.
  if (sensitivity.low > sensitivity.high) [sensitivity.low, sensitivity.high] = [sensitivity.high, sensitivity.low];

  const unanswered = FACTORS.filter((f) => resolved[f.id] == null).map((f) => f.label);
  const milestones = [65, 70, 75, 80, 85, 90, 95, 100].filter((a) => a > age).map((a) => ({
    age: a, p: probAlive(rows, a), pBase: probAlive(rows, a, 'SBase'),
  }));

  return {
    modelVersion: MODEL_VERSION,
    generatedAt: new Date().toISOString(),
    person: { name: person.name || '', age, sex },
    improvement,
    rows,
    e,
    eBase,
    expectedAge: age + e,
    expectedAgeBase: age + eBase,
    median: survivalQuantile(rows, 0.5),
    medianBase: survivalQuantile(rows, 0.5, 'SBase'),
    quantiles: { p25: survivalQuantile(rows, 0.75), p75: survivalQuantile(rows, 0.25), p90: survivalQuantile(rows, 0.1) },
    ratio,
    rating: ratingClass(ratio),
    contributions,
    detriments,
    eAllImproved,
    sensitivity,
    unanswered,
    milestones,
  };
}
