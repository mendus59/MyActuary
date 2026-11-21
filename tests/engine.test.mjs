import test from 'node:test';
import assert from 'node:assert/strict';
import { SSA_2023 } from '../js/data/ssa-2023.js';
import { buildTable, evaluate, resolveAnswers, softBound } from '../js/engine.js';
import { FACTORS } from '../js/factors.js';
import { CITATIONS } from '../js/citations.js';

const avg = resolveAnswers({});

test('baseline data covers ages 0-119 for both sexes', () => {
  for (const s of ['male', 'female']) {
    assert.equal(SSA_2023[s].q.length, 120);
    assert.equal(SSA_2023[s].e.length, 120);
    SSA_2023[s].q.forEach((q) => assert.ok(q > 0 && q < 1));
  }
});

test('an average respondent reproduces published SSA period life expectancy', () => {
  for (const sex of ['male', 'female']) {
    for (const age of [18, 30, 45, 60, 75, 90, 100]) {
      const e = buildTable(avg, { age, sex, improvement: 0 })[0].e;
      assert.ok(Math.abs(e - SSA_2023[sex].e[age]) < 0.06, `${sex} ${age}: ${e} vs ${SSA_2023[sex].e[age]}`);
    }
  }
});

test('prevalence weights sum to 1 and every factor cites a known source', () => {
  for (const f of FACTORS) {
    assert.ok(f.cite.length > 0);
    f.cite.forEach((c) => assert.ok(CITATIONS[c], `${f.id} cites unknown ${c}`));
    if (f.kind === 'excess' || f.kind === 'custom' || f.normalized) continue;
    const s = f.options.reduce((a, o) => a + o.prev, 0);
    assert.ok(Math.abs(s - 1) < 0.005, `${f.id} prevalence sums to ${s}`);
    assert.ok(f.cite.length > 0);
    f.cite.forEach((c) => assert.ok(CITATIONS[c], `${f.id} cites unknown ${c}`));
    f.options.forEach((o) => { if (o.improvesTo) assert.ok(f.options.some((x) => x.id === o.improvesTo) || (f.scenarioOptions || []).some((x) => x.id === o.improvesTo)); });
  }
});

test('mortality improvement raises life expectancy', () => {
  const p = evaluate({ person: { age: 40, sex: 'female' }, settings: { improvement: false } }, { currentYear: 2026 });
  const c = evaluate({ person: { age: 40, sex: 'female' } }, { currentYear: 2026 });
  assert.ok(c.e > p.e + 1);
});

test('smoking is a large detriment and quitting ranks first', () => {
  const r = evaluate({ person: { age: 45, sex: 'male' }, smoking: 'cur20', alcohol: 'd1', bp: 'lt120' }, { currentYear: 2026 });
  assert.ok(r.e < r.eBase - 5, `smoker LE ${r.e} vs ${r.eBase}`);
  assert.equal(r.detriments[0].id, 'smoking');
  assert.ok(r.detriments[0].gain > 4);
  assert.ok(r.ratio > 1.8);
});

test('a very healthy profile is bounded and plausible', () => {
  const r = evaluate({
    person: { age: 45, sex: 'female' }, smoking: 'never', body: { units: 'metric', heightCm: 168, weightKg: 62 },
    activity: { moderateMin: 200, vigorousMin: 60 }, strength: 'yes', alcohol: 'd1', bp: 'lt120', diabetes: 'none',
    diet: { answered: true, items: { veg: 1, fruit: 1, legumes: 1, nuts: 1, fish: 1, grains: 1, oil: 1, meat: 1, sugar: 1 } },
    family: 'long', sleep: 'h7', social: 'good', depression: 'no', cholesterol: 'ok', chd: 'no', stroke: 'no', afib: 'no', ckd: 'no',
  }, { currentYear: 2026 });
  assert.ok(r.e > r.eBase + 3 && r.e < r.eBase + 15, `healthy LE ${r.e} vs ${r.eBase}`);
  assert.ok(r.ratio >= 0.35);
  assert.equal(r.detriments.length, 0);
});

test('table is internally consistent', () => {
  const r = evaluate({ person: { age: 60, sex: 'unspecified' }, smoking: 'former0', diabetes: 'mid' }, { currentYear: 2026 });
  const rows = r.rows;
  assert.equal(rows[0].age, 60);
  assert.equal(rows.at(-1).q, 1);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(Math.abs(rows[i].l - (rows[i - 1].l - rows[i - 1].d)) < 1e-6);
    assert.ok(rows[i].S <= rows[i - 1].S);
  }
  assert.ok(r.median > 60 && r.median < 110);
});

test('soft bound saturates smoothly', () => {
  assert.ok(Math.abs(softBound(0) - 1) < 1e-12);
  assert.ok(Math.abs(softBound(0.1) - Math.exp(0.1)) < 0.01);
  assert.ok(softBound(-10) > 0.35 && softBound(-10) < 0.36);
  assert.ok(softBound(10) < 10);
});

test('BMI and activity are derived from raw inputs', () => {
  const r = resolveAnswers({ body: { units: 'imperial', heightFt: 5, heightIn: 10, weightLb: 230 }, activity: { moderateMin: 150, vigorousMin: 0 } });
  assert.equal(r.bmi, 'b30');
  assert.equal(r.activity, 'a7');
});

test('cancer is modeled by type and stage', () => {
  const opts = { currentYear: 2026 };
  const base = { person: { age: 55, sex: 'female' } };
  const none = evaluate({ ...base, cancer: { status: 'none' } }, opts);
  const breast = evaluate({ ...base, cancer: { status: 'recent', when: 'lt1', type: 'breast', stage: 'local' } }, opts);
  const lung = evaluate({ ...base, cancer: { status: 'recent', when: 'lt1', type: 'lung', stage: 'distant' } }, opts);
  assert.ok(none.e >= breast.e && breast.e > lung.e + 15);
  // 5-year survival for distant lung cancer should be in the single digits.
  assert.ok(lung.rows[5].S < 0.12, `distant lung 5y survival ${lung.rows[5].S}`);
});

test('accident exposures add risk and rank as modifiable', () => {
  const r = evaluate({ person: { age: 35, sex: 'male' }, hazards: { answered: true, items: { pilot: true } }, driving: { record: 'dui', belt: 'notalways' } }, { currentYear: 2026 });
  const ids = r.detriments.map((d) => d.id);
  assert.ok(ids.includes('hazards') && ids.includes('driving'));
  assert.ok(r.e < r.eBase);
});

test('socioeconomic gradient is in the expected direction and range', () => {
  const lo = evaluate({ person: { age: 40, sex: 'male' }, income: 'q1', education: 'lths' }, { currentYear: 2026 });
  const hi = evaluate({ person: { age: 40, sex: 'male' }, income: 'q5', education: 'ba' }, { currentYear: 2026 });
  const gap = hi.e - lo.e;
  assert.ok(gap > 4 && gap < 15, `income/education gap ${gap}`);
});

test('state and race reproduce published life-expectancy gaps at 65', () => {
  const opts = { currentYear: 2026 };
  const base = evaluate({ person: { age: 65, sex: 'unspecified' }, settings: { improvement: false } }, opts).e;
  const wv = evaluate({ person: { age: 65, sex: 'unspecified' }, settings: { improvement: false }, state: 'west-virginia' }, opts).e;
  const hi = evaluate({ person: { age: 65, sex: 'unspecified' }, settings: { improvement: false }, state: 'hawaii' }, opts).e;
  // NCHS 2022: e65 West Virginia 16.6, Hawaii 20.5, U.S. 18.9
  assert.ok(Math.abs(wv / base - 16.6 / 18.9) < 0.02, `WV ratio ${wv / base}`);
  assert.ok(Math.abs(hi / base - 20.5 / 18.9) < 0.02, `HI ratio ${hi / base}`);
  const asian = evaluate({ person: { age: 40, sex: 'unspecified' }, settings: { improvement: false }, race: 'asian' }, opts).e;
  const all40 = evaluate({ person: { age: 40, sex: 'unspecified' }, settings: { improvement: false } }, opts).e;
  assert.ok(asian > all40 + 3);
});

test('liver disease and dementia raise mortality in order of severity', () => {
  const opts = { currentYear: 2026 };
  const p = { age: 60, sex: 'male' };
  const e = (x) => evaluate({ person: p, ...x }, opts).e;
  const none = e({ liver: { status: 'none' } });
  const masld = e({ liver: { status: 'masld' } });
  const comp = e({ liver: { status: 'cirrhosis' } });
  const decomp = e({ liver: { status: 'decomp' } });
  assert.ok(none > masld && masld > comp && comp > decomp && decomp < 6);
  assert.ok(e({ dementia: 'severe' }) < e({ dementia: 'mild' }));
});

test('family history: father with prostate cancer, grandparents with cancer, multiple and early relatives', () => {
  const opts = { currentYear: 2026 };
  const p = { age: 40, sex: 'male' };
  const e = (entries) => evaluate({ person: p, familyHx: { answered: true, entries } }, opts).e;
  const base = evaluate({ person: p }, opts).e;
  const clean = e([]);
  const dad = e([{ rel: 'father', cond: 'prostate', age: '60s' }]);
  const dadEarly = e([{ rel: 'father', cond: 'prostate', age: 'lt50' }]);
  const gp = e([{ rel: 'grandparent', cond: 'otherCancer', age: 'unk' }]);
  const two = e([{ rel: 'father', cond: 'colorectal', age: '60s' }, { rel: 'sibling', cond: 'colorectal', age: '60s' }]);
  const one = e([{ rel: 'father', cond: 'colorectal', age: '60s' }]);
  assert.ok(clean > base && clean - base < 1.0, `clean history credit ${clean - base}`);
  // Unlisted conditions stay at the population average, so a single entry is measured against base.
  assert.ok(dad < base && base - dad > 0.1 && base - dad < 1.5, `prostate effect ${base - dad}`);
  assert.ok(dadEarly < dad);
  assert.ok(gp < base && base - gp < base - dad, `grandparent effect ${base - gp}`);
  const dadComplete = evaluate({ person: p, familyHx: { answered: true, complete: true, entries: [{ rel: 'father', cond: 'prostate', age: '60s' }] } }, opts).e;
  assert.ok(dadComplete > dad && dadComplete < clean);
  assert.ok(two < one);
  // Sex-specific cancers do not affect the other sex.
  const f = (entries) => evaluate({ person: { age: 40, sex: 'female' }, familyHx: { answered: true, entries } }, opts).e;
  assert.ok(Math.abs(f([{ rel: 'father', cond: 'prostate', age: '60s' }]) - evaluate({ person: { age: 40, sex: 'female' } }, opts).e) < 1e-9);
});

test('sleep apnea and other conditions', () => {
  const opts = { currentYear: 2026 };
  const p = { age: 50, sex: 'male' };
  const e = (x) => evaluate({ person: p, ...x }, opts).e;
  assert.ok(e({ apnea: 'severe' }) < e({ apnea: 'moderate' }) && e({ apnea: 'moderate' }) < e({ apnea: 'treated' }));
  const r = evaluate({ person: p, apnea: 'severe' }, opts);
  assert.ok(r.detriments.some((d) => d.id === 'apnea'), 'untreated apnea listed as a detriment');
  const none = e({ conditions: { answered: true, items: {} } });
  const ra = e({ conditions: { answered: true, items: { ra: true } } });
  const dial = e({ conditions: { answered: true, items: { dialysis: true } } });
  assert.ok(none > ra && ra > dial && dial < 15, `none ${none} ra ${ra} dialysis ${dial}`);
});
