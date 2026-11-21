// Comprehensive medical history: own conditions by organ system, sleep apnea, and
// family history by relative, condition, number of relatives and age at diagnosis.
// Imported by factors.js; kept free of imports to avoid cycles.

const DECAY = 0.8;
const FLOOR = 0.5;

/* ---------- Own conditions (organ-system checklist) ---------- */
// hr: all-cause mortality hazard / standardized mortality ratio from the cited study.
// excess: annual excess mortality (used where survival is reported directly).
// prev: approximate prevalence among U.S. adults around age 50 (for normalization).
export const CONDITION_SYSTEMS = [
  { id: 'resp', title: 'Lungs and breathing' },
  { id: 'neuro', title: 'Brain and nervous system' },
  { id: 'vasc', title: 'Blood vessels' },
  { id: 'kidney', title: 'Kidneys' },
  { id: 'gi', title: 'Digestive system' },
  { id: 'immune', title: 'Joints, skin and immune system' },
  { id: 'bone', title: 'Bones and injuries' },
  { id: 'mental', title: 'Mental health' },
];

export const CONDITIONS = [
  { id: 'ipf', system: 'resp', label: 'Pulmonary fibrosis (IPF or other interstitial lung disease)', excess: 0.12, prev: 0.0005, cite: 'ley2011' },
  { id: 'epilepsy', system: 'neuro', label: 'Epilepsy or a seizure disorder', hr: 2.0, prev: 0.01, cite: 'thurman2017' },
  { id: 'parkinsons', system: 'neuro', label: 'Parkinson’s disease', hr: 1.5, prev: 0.003, cite: 'macleod2014' },
  { id: 'ms', system: 'neuro', label: 'Multiple sclerosis', hr: 1.7, prev: 0.003, cite: 'lunde2017' },
  { id: 'pad', system: 'vasc', label: 'Peripheral artery disease (leg artery blockage, low ankle-brachial index)', hr: 2.0, prev: 0.03, cite: 'abic2008' },
  { id: 'dialysis', system: 'kidney', label: 'Kidney failure on dialysis', excess: 0.17, prev: 0.0015, cite: 'usrds' },
  { id: 'ktx', system: 'kidney', label: 'Kidney transplant recipient', excess: 0.03, prev: 0.0008, cite: 'usrds' },
  { id: 'crohns', system: 'gi', label: 'Crohn’s disease', hr: 1.38, prev: 0.003, cite: 'bewtra2013' },
  { id: 'uc', system: 'gi', label: 'Ulcerative colitis', hr: 1.1, prev: 0.004, cite: 'bewtra2013' },
  { id: 'celiac', system: 'gi', label: 'Celiac disease (biopsy-confirmed)', hr: 1.21, prev: 0.007, cite: 'lebwohl2020' },
  { id: 'ra', system: 'immune', label: 'Rheumatoid arthritis', hr: 1.5, prev: 0.01, cite: 'dadoun2013' },
  { id: 'sle', system: 'immune', label: 'Systemic lupus erythematosus', hr: 2.6, prev: 0.001, cite: 'yurkovich2014' },
  { id: 'psoriasis', system: 'immune', label: 'Severe psoriasis (needs pills, injections or light therapy)', hr: 1.5, prev: 0.005, cite: 'gelfand2007' },
  { id: 'hipRecent', system: 'bone', label: 'Hip fracture within the last 2 years', hr: 2.5, prev: 0.003, cite: 'haentjens2010' },
  { id: 'hipPast', system: 'bone', label: 'Hip fracture more than 2 years ago', hr: 1.3, prev: 0.005, cite: 'haentjens2010' },
  { id: 'oaWalk', system: 'bone', label: 'Hip or knee osteoarthritis that makes walking difficult', hr: 1.55, prev: 0.05, cite: 'nuesch2011' },
  { id: 'smi', system: 'mental', label: 'Schizophrenia or bipolar disorder', hr: 2.2, prev: 0.02, cite: 'walker2015' },
  { id: 'anorexia', system: 'mental', label: 'Anorexia nervosa (current or past)', hr: 5.86, prev: 0.004, cite: 'arcelus2011' },
  { id: 'adhd', system: 'mental', label: 'ADHD', hr: 2.07, prev: 0.04, cite: 'dalsgaard2015' },
];

// Chronic-disease prevalence rises steeply with age; scale the reference prevalence so the
// normalization credit for "none of these" stays small for young adults.
function prevalenceScale(age) {
  return Math.min(2, Math.max(0.3, Math.exp((age - 50) / 25)));
}

function decayed(logs) {
  const xs = logs.filter((x) => x > 0).sort((a, b) => b - a);
  return xs.reduce((s, x, i) => s + x * Math.max(FLOOR, DECAY ** i), 0);
}

function conditionLogs(v, { age }) {
  const sel = CONDITIONS.filter((c) => v.items && v.items[c.id]);
  const own = decayed(sel.filter((c) => c.hr).map((c) => Math.log(c.hr)));
  // Normalize by the population-average hazard from these conditions.
  const k = prevalenceScale(age);
  const norm = CONDITIONS.filter((c) => c.hr).reduce((s, c) => s + Math.log(1 + Math.min(0.5, c.prev * k) * (c.hr - 1)), 0);
  return [own - norm];
}

function conditionExcess(v) {
  return CONDITIONS.filter((c) => c.excess && v.items && v.items[c.id]).reduce((s, c) => s + c.excess, 0);
}

export const conditionsFactor = {
  id: 'conditions',
  section: 'history',
  kind: 'custom',
  label: 'Other diagnosed conditions',
  group: 'conditions',
  modifiable: false,
  cite: [...new Set(CONDITIONS.map((c) => c.cite))],
  resolve(a) { return a.conditions && a.conditions.answered ? a.conditions : null; },
  logsAt: conditionLogs,
  excessAt: conditionExcess,
  describe(v) {
    const on = CONDITIONS.filter((c) => v.items && v.items[c.id]).map((c) => c.label.split(' (')[0]);
    return on.length ? on.join('; ') : 'None of the listed conditions';
  },
};

/* ---------- Sleep apnea ---------- */
export const sleepApneaFactor = {
  id: 'apnea',
  section: 'history',
  label: 'Sleep apnea',
  question: 'Have you been diagnosed with obstructive sleep apnea?',
  help: 'Severity is measured by the apnea-hypopnea index (AHI) on a sleep study: mild 5–14, moderate 15–29, severe 30 or more events per hour.',
  group: 'cardiometabolic',
  attenuation: 0.5,
  modifiable: true,
  cite: ['punjabi2009', 'marin2005'],
  options: [
    { id: 'no', label: 'No', rr: 1.0, prev: 0.86 },
    { id: 'treated', label: 'Yes, and I use CPAP (or another treatment) most nights', rr: 1.05, prev: 0.04 },
    { id: 'mild', label: 'Yes, mild, not treated', rr: 1.0, prev: 0.04 },
    { id: 'moderate', label: 'Yes, moderate, not treated', rr: 1.17, prev: 0.03, improvesTo: 'treated' },
    { id: 'severe', label: 'Yes, severe, not treated', rr: 1.46, prev: 0.02, improvesTo: 'treated' },
    { id: 'unknownSev', label: 'Yes, not treated, severity unknown', rr: 1.17, prev: 0.01, improvesTo: 'treated' },
  ],
  advice: 'Severe untreated sleep apnea was associated with 46% higher mortality in the Sleep Heart Health Study (Punjabi 2009); in Marin 2005, men treated with CPAP had cardiovascular outcomes similar to people without apnea. Regular CPAP use is the target.',
};

/* ---------- Family history ---------- */
// Method (documented on the Methodology page):
// 1. Each family-history entry raises the incidence of one disease by a published relative
//    risk RR for an affected first-degree relative (parent, sibling or child).
// 2. Second-degree relatives (grandparents, aunts, uncles) carry half the excess:
//    RR2 = 1 + (RR - 1) / 2, consistent with halved genetic sharing and with published
//    second-degree estimates for prostate and colorectal cancer.
// 3. Early onset in the relative (before the condition's early-age cutoff) raises the RR to
//    RR^1.4; two or more affected first-degree relatives raise it to RR^1.7. Both exponents
//    reproduce published multi-relative and early-onset estimates for breast and colorectal
//    cancer within about 10%.
// 4. Assuming case fatality is unchanged, cause-specific mortality rises by the same RR, so
//    the all-cause hazard ratio is 1 + s (RR - 1), where s is that cause's share of U.S.
//    deaths at the person's age and sex (CDC WONDER, approximate).
// 5. The result is divided by the population-average effect of the same condition's
//    family history, so a typical family history leaves the baseline unchanged. Conditions
//    the person did not list are left at the average unless they confirm the list is complete.
export const RELATIVES = [
  { id: 'mother', label: 'Mother', degree: 1, parent: true },
  { id: 'father', label: 'Father', degree: 1, parent: true },
  { id: 'sibling', label: 'Brother or sister', degree: 1 },
  { id: 'child', label: 'Son or daughter', degree: 1 },
  { id: 'grandparent', label: 'Grandparent', degree: 2 },
  { id: 'auntuncle', label: 'Aunt or uncle', degree: 2 },
];

export const AGE_BANDS = [
  { id: 'lt50', label: 'Before 50', mid: 42 },
  { id: '50s', label: '50–59', mid: 55 },
  { id: '60s', label: '60–69', mid: 65 },
  { id: '70p', label: '70 or older', mid: 75 },
  { id: 'unk', label: 'Not sure', mid: null },
];

// share: [under 65, 65 and over] fraction of all deaths, by sex {m, f}.
// fdrPrev: approximate share of adults with an affected first-degree relative (normalization).
export const FAMILY_CONDITIONS = [
  { id: 'heart', label: 'Heart attack or coronary heart disease', rr: 1.5, early: 55, share: { m: [0.21, 0.22], f: [0.15, 0.21] }, fdrPrev: 0.25, cite: ['lloydjones2004', 'murabito2005'] },
  { id: 'scd', label: 'Sudden cardiac death', rr: 1.57, early: 50, share: { m: [0.06, 0.04], f: [0.04, 0.03] }, fdrPrev: 0.03, cite: ['friedlander1998'] },
  { id: 'stroke', label: 'Stroke', rr: 1.4, early: 65, earlyRR: 2.5, share: { m: [0.03, 0.05], f: [0.04, 0.07] }, fdrPrev: 0.15, cite: ['seshadri2010'] },
  { id: 'diabetes', label: 'Type 2 diabetes', rr: 2.0, early: 50, share: { m: [0.04, 0.03], f: [0.035, 0.027] }, fdrPrev: 0.3, cite: ['interact2013'] },
  { id: 'dementia', label: 'Alzheimer’s disease or dementia', rr: 1.7, early: 65, share: { m: [0.003, 0.06], f: [0.003, 0.1] }, fdrPrev: 0.15, cite: ['loy2014'] },
  { id: 'prostate', label: 'Prostate cancer', rr: 2.48, early: 65, sex: 'm', share: { m: [0.006, 0.025], f: [0, 0] }, fdrPrev: 0.08, cite: ['kicinski2011'] },
  { id: 'breast', label: 'Breast cancer', rr: 1.8, early: 50, share: { m: [0.0003, 0.0003], f: [0.06, 0.025] }, fdrPrev: 0.08, cite: ['cghfbc2001'] },
  { id: 'ovarian', label: 'Ovarian cancer', rr: 3.1, early: 50, sex: 'f', share: { m: [0, 0], f: [0.012, 0.008] }, fdrPrev: 0.015, cite: ['stratton1998'] },
  { id: 'colorectal', label: 'Colon or rectal cancer', rr: 2.24, early: 50, share: { m: [0.03, 0.018], f: [0.025, 0.018] }, fdrPrev: 0.06, cite: ['butterworth2006'] },
  { id: 'lung', label: 'Lung cancer', rr: 1.84, early: 60, share: { m: [0.045, 0.06], f: [0.045, 0.055] }, fdrPrev: 0.08, cite: ['matakidou2005'] },
  { id: 'pancreatic', label: 'Pancreatic cancer', rr: 1.8, early: 60, share: { m: [0.02, 0.018], f: [0.018, 0.018] }, fdrPrev: 0.02, cite: ['permuthwey2009'] },
  { id: 'melanoma', label: 'Melanoma', rr: 1.74, early: 50, share: { m: [0.005, 0.004], f: [0.003, 0.002] }, fdrPrev: 0.03, cite: ['gandini2005'] },
  { id: 'otherCancer', label: 'Another cancer, or type unknown', rr: 1.15, early: 50, share: { m: [0.1, 0.08], f: [0.1, 0.08] }, fdrPrev: 0.2, cite: ['kharazmi2012'] },
];

function shareFor(cond, sex, age) {
  const band = age < 65 ? 0 : 1;
  if (sex === 'male') return cond.share.m[band];
  if (sex === 'female') return cond.share.f[band];
  return (cond.share.m[band] + cond.share.f[band]) / 2;
}

// Relative risk of the disease for the respondent from all entries for one condition.
export function familyConditionRR(cond, entries) {
  const firstDeg = entries.filter((e) => RELATIVES.find((r) => r.id === e.rel)?.degree === 1);
  const secondDeg = entries.filter((e) => RELATIVES.find((r) => r.id === e.rel)?.degree === 2);
  const isEarly = (e) => {
    const b = AGE_BANDS.find((x) => x.id === e.age);
    return b && b.mid != null && b.mid < cond.early;
  };
  let rr = 1;
  if (firstDeg.length) {
    const early = firstDeg.some(isEarly);
    rr = early ? (cond.earlyRR ?? cond.rr ** 1.4) : cond.rr;
    if (firstDeg.length >= 2) rr = Math.max(rr, cond.rr ** 1.7) * (early ? 1.1 : 1);
  }
  if (secondDeg.length) {
    const r2 = 1 + (cond.rr - 1) / 2;
    const r2n = secondDeg.length >= 2 ? 1 + (cond.rr - 1) * 0.75 : r2;
    rr = firstDeg.length ? rr * Math.sqrt(r2n) : r2n; // second-degree adds less on top of first-degree history
  }
  return rr;
}

function familyLogs(v, { age, sex }) {
  const entries = (v.entries || []).filter((e) => e.rel && e.cond);
  const logs = [];
  for (const cond of FAMILY_CONDITIONS) {
    const s = shareFor(cond, sex, age);
    if (s === 0) continue;
    const mine = entries.filter((e) => e.cond === cond.id);
    // Unlisted conditions stay at the population average unless the person says the list is complete.
    const complete = v.complete || entries.length === 0;
    if (!mine.length && !complete) continue;
    const rr = mine.length ? familyConditionRR(cond, mine) : 1;
    const own = Math.log(1 + s * (rr - 1));
    const avg = Math.log(1 + s * cond.fdrPrev * (cond.rr - 1));
    logs.push(own - avg);
  }
  return [logs.reduce((a, b) => a + b, 0)];
}

export const familyHistoryFactor = {
  id: 'familyHx',
  section: 'family',
  kind: 'custom',
  label: 'Family medical history',
  group: 'family',
  modifiable: false,
  cite: [...new Set([...FAMILY_CONDITIONS.flatMap((c) => c.cite), 'cdcWonder'])],
  resolve(a) { return a.familyHx && a.familyHx.answered ? a.familyHx : null; },
  logsAt: familyLogs,
  describe(v) {
    const entries = (v.entries || []).filter((e) => e.rel && e.cond);
    if (!entries.length) return 'No significant family history reported';
    return entries.map((e) => {
      const r = RELATIVES.find((x) => x.id === e.rel)?.label || e.rel;
      const c = FAMILY_CONDITIONS.find((x) => x.id === e.cond)?.label || e.cond;
      const a = AGE_BANDS.find((x) => x.id === e.age);
      return `${r}: ${c}${a && a.mid != null ? ` (diagnosed ${a.label.toLowerCase()})` : ''}`;
    }).join('; ');
  },
};
