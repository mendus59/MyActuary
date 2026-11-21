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
