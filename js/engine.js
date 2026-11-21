// Life-table engine. Pure functions with no DOM access, so it runs in the browser and in Node tests.
import { SSA_2023 } from './data/ssa-2023.js';
import { FACTORS } from './factors.js';

export const MAX_AGE = 120;
export const MODEL_VERSION = '1.1.0';
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

const isExcess = (f) => f.kind === 'excess';
const RR_FACTORS = FACTORS.filter((f) => !isExcess(f));
const EXCESS_FACTORS = FACTORS.filter(isExcess);

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
    if (typeof f.resolve === 'function') v = f.resolve(answers) ?? null;
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
  for (const f of RR_FACTORS) {
    const l = factorLog(f, resolved[f.id], age, t) * scale;
    if (l === 0) continue;
    if (!groups.has(f.group)) groups.set(f.group, []);
    groups.get(f.group).push(l);
  }
  return softBound(combine(groups));
}

// Additive (excess) annual hazard from accident exposures and cancer, which do not scale
// with background mortality the way chronic risk factors do.
export function excessAt(resolved, age, t, baseMu, scale = 1) {
  let x = 0;
  for (const f of EXCESS_FACTORS) {
    const v = resolved[f.id];
    if (v == null) continue;
    x += f.excessAt(v, { age, t, baseMu }) * scale;
  }
  return x;
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
    const mu = -Math.log(1 - Math.min(qb, 0.999999));
    const ex = excessAt(resolved, x, t, mu, scale);
    const hazard = Math.max(mu * m * 0.25, mu * m + ex);
    const q = x >= MAX_AGE ? 1 : 1 - Math.exp(-hazard);
    const qbase = x >= MAX_AGE ? 1 : qb;
    const d = l * q;
    rows.push({ age: x, year, q, qBase: qbase, mult: x >= MAX_AGE ? m : -Math.log(1 - q) / mu, l, d, lBase, S: l / 100000, SBase: lBase / 100000 });
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
  if (pct > 500) return { label: 'Beyond Table 16: postpone or decline (illustrative)', tier: 6 };
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
  const improvements = {};
  for (const f of FACTORS) {
    const val = resolved[f.id];
    if (val == null) continue;
    const without = { ...resolved, [f.id]: null };
    const eWithout = lifeExpectancy(without, opts);
    let gain = 0;
    let target = null;
    let answer;
    let rr = null;
    let relative = null;
    let improved = null;
    if (isExcess(f)) {
      answer = f.describe(val);
      if (f.modifiable && f.improve) {
        improved = f.improve(val);
        if (improved) target = f.targetLabel;
      }
    } else {
      const o = findOption(f, val);
      answer = o.label;
      rr = o.rr;
      relative = o.rr / meanRR(f);
      if (f.modifiable && o.improvesTo) {
        improved = o.improvesTo;
        target = findOption(f, o.improvesTo).label;
      }
    }
    if (improved != null) {
      improvements[f.id] = improved;
      gain = lifeExpectancy({ ...resolved, [f.id]: improved }, opts) - e;
    }
    contributions.push({
      id: f.id,
      label: f.label,
      answer,
      rr,
      relative,
      excess: isExcess(f),
      vsAverage: e - eWithout,
      modifiable: !!f.modifiable,
      gain,
      target,
      advice: f.advice || '',
      cite: f.cite,
    });
  }
  const detriments = contributions
    .filter((c) => c.modifiable && c.gain > 0.05)
    .sort((a, b) => b.gain - a.gain);

  const allImproved = { ...resolved };
  for (const c of detriments) allImproved[c.id] = improvements[c.id];
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
