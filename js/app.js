import { SECTIONS, FACTORS, DIET_ITEMS, computeBMI, metHours } from './factors.js';
import { CITATIONS, citationLink } from './citations.js';
import { evaluate, DEFAULT_IMPROVEMENT, MODEL_VERSION } from './engine.js';
import { lineChart, divergingBars } from './charts.js';
import { exportPdf, importFile } from './pdf.js';
import { fmt, citeShort, escapeHtml } from './format.js';

const STORAGE_KEY = 'myactuary.session.v1';
const $ = (s, root = document) => root.querySelector(s);

let state = loadState();
let step = 0;
let lastResult = null;

function blankAnswers() {
  return {
    person: { name: '', age: '', sex: '' },
    settings: { improvement: true },
    body: { units: 'imperial', heightFt: '', heightIn: '', weightLb: '', heightCm: '', weightKg: '' },
    activity: { moderateMin: '', vigorousMin: '' },
    diet: { answered: false, items: {} },
  };
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.answers) return { answers: { ...blankAnswers(), ...s.answers }, view: s.view || 'intro', step: s.step || 0 };
    }
  } catch { /* storage unavailable */ }
  return { answers: blankAnswers(), view: 'intro', step: 0, fresh: true };
}

function save() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: state.answers, view: state.view, step })); } catch { /* ignore */ }
}

function toast(msg, ms = 3200) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, ms);
}

function show(view) {
  for (const v of ['intro', 'form', 'report', 'method']) $(`#view-${v}`).hidden = v !== view;
  if (view !== 'method') state.view = view;
  save();
  window.scrollTo({ top: 0 });
}

/* ---------- Questionnaire ---------- */

function citeLine(ids) {
  return `<p class="cite-line">Evidence: ${ids.map((id) => {
    const href = citationLink(id);
    const txt = escapeHtml(CITATIONS[id].short);
    return href ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${txt}</a>` : txt;
  }).join('; ')}</p>`;
}

function selectQuestion(f, opts = {}) {
  const cur = state.answers[f.id] || '';
  if (f.ui === 'dropdown') {
    return `<div class="q" data-factor="${f.id}">
      <label class="q-label" for="sel-${f.id}">${escapeHtml(f.question)}</label>
      ${f.help ? `<p class="q-help">${escapeHtml(f.help)}</p>` : ''}
      <div class="field"><select id="sel-${f.id}" name="${f.id}" class="wide-select">
        <option value="">Prefer not to say / outside the U.S.</option>
        ${f.options.map((o) => `<option value="${o.id}" ${cur === o.id ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
      </select></div>
      ${citeLine(f.cite)}
    </div>`;
  }
  const unknownLabel = opts.unknownLabel || 'I don’t know / prefer not to say';
  return `<fieldset class="q" data-factor="${f.id}">
    <legend>${escapeHtml(f.question)}</legend>
    ${f.help ? `<p class="q-help">${escapeHtml(f.help)}</p>` : ''}
    <div class="options">
      ${f.options.map((o) => `<label class="opt"><input type="radio" name="${f.id}" value="${o.id}" ${cur === o.id ? 'checked' : ''}><span>${escapeHtml(o.label)}</span></label>`).join('')}
      <label class="opt unknown"><input type="radio" name="${f.id}" value="" ${cur === '' ? 'checked' : ''}><span>${unknownLabel}</span></label>
    </div>
    ${citeLine(f.cite)}
  </fieldset>`;
}

const F = Object.fromEntries(FACTORS.map((f) => [f.id, f]));

const SECTION_NOTES = {
  history: '<p class="note"><strong>Not modeled:</strong> organ transplant and some rarer serious conditions whose prognosis depends heavily on specifics. If any apply to you, treat this report as optimistic and ask your clinician about prognosis.</p>',
  cancer: '<p class="note">Cancer is modeled as extra (additive) risk that is highest in the first years after diagnosis and fades after five years, using SEER 5-year relative survival for the type and stage you choose. Survival also depends on grade, molecular subtype and treatment, so your oncologist\u2019s estimate should take precedence.</p>',
  wellbeing: '<p class="note">If you are having thoughts of harming yourself, please reach out now. In the U.S., call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline) any time.</p>',
  exposures: '<p class="note">Occupation, activities and driving are modeled as an added annual accident risk, as insurers do with flat extra premiums, rather than as a multiple of health-related mortality.</p>',
};

// Multi-part questions for factors that store an object (cancer, driving, occupation, activities).
function excessQuestion(f) {
  const v = state.answers[f.id] || {};
  return f.questions.map((q, i) => {
    if (q.showIf && !q.showIf(v)) return '';
    const last = i === f.questions.length - 1 || f.questions.slice(i + 1).every((n) => n.showIf && !n.showIf(v));
    const cite = last ? citeLine(f.cite) : '';
    if (q.type === 'checklist') {
      return `<fieldset class="q" data-factor="${f.id}">
        <legend>${escapeHtml(q.question)}</legend>
        ${q.options.map((o) => `<label class="check"><input type="checkbox" data-ex="${f.id}" data-key="${q.key}" value="${o.id}" ${v.answered && v[q.key]?.[o.id] ? 'checked' : ''}><span>${escapeHtml(o.label)}</span></label>`).join('')}
        <label class="check"><input type="checkbox" data-ex="${f.id}" data-key="${q.key}" value="__none" ${v.answered && !q.options.some((o) => v[q.key]?.[o.id]) ? 'checked' : ''}><span>None of these</span></label>
        ${cite}
      </fieldset>`;
    }
    return `<fieldset class="q" data-factor="${f.id}">
      <legend>${escapeHtml(q.question)}</legend>
      <div class="options">
        ${q.options.map((o) => `<label class="opt"><input type="radio" name="${f.id}.${q.key}" data-ex="${f.id}" data-key="${q.key}" value="${o.id}" ${v[q.key] === o.id ? 'checked' : ''}><span>${escapeHtml(o.label)}</span></label>`).join('')}
        ${i === 0 ? `<label class="opt unknown"><input type="radio" name="${f.id}.${q.key}" data-ex="${f.id}" data-key="${q.key}" value="" ${!v[q.key] ? 'checked' : ''}><span>Prefer not to say</span></label>` : ''}
      </div>
      ${cite}
    </fieldset>`;
  }).join('');
}

function sectionHtml(sec) {
  const a = state.answers;
  let body = '';
  switch (sec.id) {
    case 'about':
      body = `
      <div class="q">
        <div class="fields">
          <div class="field"><label for="f-name">Name for the report (optional)</label><input class="wide" id="f-name" data-path="person.name" value="${escapeHtml(a.person.name || '')}" maxlength="80" placeholder="Shown only on your report"></div>
          <div class="field"><label for="f-age">Age (years)</label><input id="f-age" data-path="person.age" type="number" inputmode="numeric" min="18" max="110" value="${escapeHtml(String(a.person.age ?? ''))}" required></div>
        </div>
      </div>
      <fieldset class="q">
        <legend>Sex used for the actuarial table</legend>
        <p class="q-help">Published life tables are split by sex at birth because mortality differs substantially. If you prefer not to say, the model averages the two tables.</p>
        <div class="options">
          ${[['male', 'Male'], ['female', 'Female'], ['unspecified', 'Prefer not to say (average of both tables)']].map(([v, l]) => `<label class="opt"><input type="radio" name="sex" data-path="person.sex" value="${v}" ${a.person.sex === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}
        </div>
        ${citeLine(['ssa2023'])}
      </fieldset>
      <fieldset class="q">
        <legend>Projection basis</legend>
        <div class="options">
          <label class="opt"><input type="radio" name="improvement" value="on" ${a.settings.improvement !== false ? 'checked' : ''}><span><strong>Cohort (recommended).</strong> Assume death rates keep falling about ${(DEFAULT_IMPROVEMENT * 100).toFixed(1)}% a year, as the Social Security Trustees project. This is how insurers and pension plans price.</span></label>
          <label class="opt"><input type="radio" name="improvement" value="off" ${a.settings.improvement === false ? 'checked' : ''}><span><strong>Period.</strong> Assume today's death rates stay fixed for the rest of your life. Matches the published SSA table.</span></label>
        </div>
        ${citeLine(['ssaTR'])}
      </fieldset>`;
      break;
    case 'body': {
      const metric = a.body.units === 'metric';
      body = `
      <div class="q">
        <span class="q-label">Height and weight</span>
        <div class="seg" role="group" aria-label="Units">
          <button type="button" data-units="imperial" aria-pressed="${!metric}">ft / lb</button>
          <button type="button" data-units="metric" aria-pressed="${metric}">cm / kg</button>
        </div>
        <div class="fields" style="margin-top:12px">
          ${metric
    ? `<div class="field"><label for="f-hcm">Height (cm)</label><input id="f-hcm" type="number" inputmode="decimal" data-path="body.heightCm" value="${a.body.heightCm ?? ''}"></div>
             <div class="field"><label for="f-wkg">Weight (kg)</label><input id="f-wkg" type="number" inputmode="decimal" data-path="body.weightKg" value="${a.body.weightKg ?? ''}"></div>`
    : `<div class="field"><label for="f-hft">Height (ft)</label><input id="f-hft" type="number" inputmode="numeric" data-path="body.heightFt" value="${a.body.heightFt ?? ''}"></div>
             <div class="field"><label for="f-hin">(in)</label><input id="f-hin" type="number" inputmode="decimal" data-path="body.heightIn" value="${a.body.heightIn ?? ''}"></div>
             <div class="field"><label for="f-wlb">Weight (lb)</label><input id="f-wlb" type="number" inputmode="decimal" data-path="body.weightLb" value="${a.body.weightLb ?? ''}"></div>`}
        </div>
        <p class="computed" id="bmi-out"></p>
        ${citeLine(F.bmi.cite)}
      </div>`;
      break;
    }
    case 'activity':
      body = `
      <div class="q">
        <span class="q-label">In a typical week, how many minutes of exercise do you get?</span>
        <p class="q-help">Moderate: brisk walking, cycling on flat ground, doubles tennis. Vigorous: running, swimming laps, hard cycling. Leave both blank if you're not sure.</p>
        <div class="fields">
          <div class="field"><label for="f-mod">Moderate (min/week)</label><input id="f-mod" type="number" inputmode="numeric" min="0" data-path="activity.moderateMin" value="${a.activity.moderateMin ?? ''}"></div>
          <div class="field"><label for="f-vig">Vigorous (min/week)</label><input id="f-vig" type="number" inputmode="numeric" min="0" data-path="activity.vigorousMin" value="${a.activity.vigorousMin ?? ''}"></div>
        </div>
        <p class="computed" id="met-out"></p>
        ${citeLine(F.activity.cite)}
      </div>
      ${selectQuestion(F.strength)}
      <fieldset class="q">
        <legend>Which of these describe how you usually eat?</legend>
        <p class="q-help">A short Mediterranean-style diet score (0–9). Tick all that apply.</p>
        <label class="check"><input type="checkbox" id="diet-answered" ${a.diet.answered ? 'checked' : ''}><span><strong>Include my diet in the assessment</strong> (unticked = assume an average diet)</span></label>
        <div id="diet-items" ${a.diet.answered ? '' : 'style="opacity:.55"'}>
          ${DIET_ITEMS.map((d) => `<label class="check"><input type="checkbox" data-diet="${d.id}" ${a.diet.items?.[d.id] ? 'checked' : ''}><span>${d.label}</span></label>`).join('')}
        </div>
        <p class="computed" id="diet-out"></p>
        ${citeLine(F.diet.cite)}
      </fieldset>
      ${selectQuestion(F.sleep)}`;
      break;
    default: {
      const order = { state: 1, race: 2, income: 3, education: 4, marital: 5, social: 6 };
      const fs = FACTORS.filter((f) => f.section === sec.id && !f.derived).sort((x, y) => (order[x.id] || 0) - (order[y.id] || 0));
      body = fs.map((f) => (f.kind === 'excess' ? excessQuestion(f) : selectQuestion(f, f.id === 'family' ? { unknownLabel: 'I don\u2019t know (e.g. adopted)' } : {}))).join('') + (SECTION_NOTES[sec.id] || '');
    }
  }
  return `<div class="card"><div class="section-head"><p class="eyebrow">Step ${SECTIONS.indexOf(sec) + 1} of ${SECTIONS.length}</p><h2>${sec.title}</h2><p>${sec.blurb}</p></div>${body}</div>`;
}

function setPath(path, value) {
  const [a, b] = path.split('.');
  state.answers[a] = state.answers[a] || {};
  state.answers[a][b] = value;
}

function renderStepper() {
  const list = $('#stepper-list');
  list.innerHTML = SECTIONS.map((s, i) => `<li class="${i === step ? 'active' : ''} ${i < step ? 'done' : ''}"><button type="button" data-step="${i}"><span class="num">${i + 1}</span><span class="label">${s.title}</span></button></li>`).join('');
  const answered = countAnswered();
  $('#progress-bar').style.width = `${Math.round((answered.done / answered.total) * 100)}%`;
  $('#progress-text').textContent = `${answered.done} of ${answered.total} questions answered`;
}

function countAnswered() {
  const a = state.answers;
  let done = 0;
  const total = FACTORS.length + 2;
  if (a.person.age) done++;
  if (a.person.sex) done++;
  for (const f of FACTORS) {
    if (f.id === 'bmi') { if (computeBMI(a.body) != null) done++; continue; }
    if (f.id === 'activity') { if (metHours(a.activity) != null) done++; continue; }
    if (f.id === 'diet') { if (a.diet.answered) done++; continue; }
    if (f.kind === 'excess') { if (f.resolve(a) != null) done++; continue; }
    if (a[f.id]) done++;
  }
  return { done, total };
}

function updateComputed() {
  const a = state.answers;
  const bmiOut = $('#bmi-out');
  if (bmiOut) {
    const b = computeBMI(a.body);
    bmiOut.innerHTML = b == null ? 'Enter height and weight to calculate BMI.' : `Your BMI: <strong>${b.toFixed(1)}</strong> · ${F.bmi.options.find((o) => b < o.max).label}`;
  }
  const metOut = $('#met-out');
  if (metOut) {
    const m = metHours(a.activity);
    metOut.innerHTML = m == null ? 'Leave blank to assume average activity.' : `<strong>${m.toFixed(1)} MET-hours/week</strong> · ${F.activity.options.find((o) => m < o.max).label}`;
  }
  const dietOut = $('#diet-out');
  if (dietOut) {
    const s = DIET_ITEMS.filter((d) => a.diet.items?.[d.id]).length;
    dietOut.innerHTML = a.diet.answered ? `Diet score: <strong>${s} of 9</strong>` : 'Diet not included; the model assumes an average diet.';
  }
}

function renderForm() {
  const form = $('#questionnaire');
  form.innerHTML = sectionHtml(SECTIONS[step]);
  renderStepper();
  updateComputed();
  $('#prev').disabled = step === 0;
  $('#next').textContent = step === SECTIONS.length - 1 ? 'Generate my report' : 'Next';
}

function onFormInput(ev) {
  const t = ev.target;
  if (t.dataset.ex) {
    if (ev.type !== 'change') return;
    const f = F[t.dataset.ex];
    const v = { ...(state.answers[f.id] || {}) };
    const q = f.questions.find((x) => x.key === t.dataset.key);
    if (q.type === 'checklist') {
      v.answered = true;
      v[q.key] = { ...(v[q.key] || {}) };
      if (t.value === '__none') { if (t.checked) v[q.key] = {}; } else v[q.key][t.value] = t.checked;
    } else {
      v[q.key] = t.value;
    }
    state.answers[f.id] = v;
    save();
    const y = window.scrollY;
    renderForm();
    window.scrollTo({ top: y });
    return;
  }
  if (t.dataset.path) {
    setPath(t.dataset.path, t.value);
  } else if (t.name === 'improvement') {
    state.answers.settings.improvement = t.value === 'on';
  } else if ((t.type === 'radio' || t.tagName === 'SELECT') && F[t.name]) {
    state.answers[t.name] = t.value;
  } else if (t.id === 'diet-answered') {
    state.answers.diet.answered = t.checked;
    $('#diet-items').style.opacity = t.checked ? '' : '.55';
  } else if (t.dataset.diet) {
    state.answers.diet.items = state.answers.diet.items || {};
    state.answers.diet.items[t.dataset.diet] = t.checked;
    if (!state.answers.diet.answered) { state.answers.diet.answered = true; $('#diet-answered').checked = true; $('#diet-items').style.opacity = ''; }
  }
  updateComputed();
  renderStepper();
  save();
}

function validateAbout() {
  const age = Number(state.answers.person.age);
  if (!(age >= 18 && age <= 110)) { toast('Please enter an age between 18 and 110.'); step = 0; renderForm(); $('#f-age')?.focus(); return false; }
  if (!state.answers.person.sex) { toast('Please choose which actuarial table to use.'); step = 0; renderForm(); return false; }
  return true;
}

/* ---------- Report ---------- */

function renderReport() {
  if (!validateAbout()) { show('form'); return; }
  const r = evaluate(state.answers);
  lastResult = r;
  const diff = r.e - r.eBase;
  const ratioPct = Math.round(r.ratio * 100);
  const name = r.person.name ? escapeHtml(r.person.name) : 'You';
  const sexLabel = { male: 'male', female: 'female', unspecified: 'sex not specified' }[r.person.sex];
  const basis = r.improvement ? `Cohort basis (${(r.improvement * 100).toFixed(1)}%/yr improvement)` : 'Period basis (no improvement)';

  const html = `
  <div class="report-head">
    <div>
      <p class="eyebrow">Personal mortality assessment</p>
      <h1 style="margin:0">${r.person.name ? `Prepared for ${name}` : 'Your life table'}</h1>
      <p class="muted" style="margin:.3em 0 0">Age ${r.person.age}, ${sexLabel} · ${basis}</p>
    </div>
    <div class="meta">Generated ${new Date(r.generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}<br>Model v${MODEL_VERSION} · SSA 2023 baseline</div>
  </div>

  <div class="kpis">
    <div class="kpi"><div class="k-label">Life expectancy</div><div class="k-value">${r.e.toFixed(1)} yr</div><div class="k-sub">remaining, to about age ${r.expectedAge.toFixed(0)}</div></div>
    <div class="kpi"><div class="k-label">Versus U.S. average</div><div class="k-value ${diff >= 0 ? 'delta-pos' : 'delta-neg'}">${diff >= 0 ? '+' : '−'}${Math.abs(diff).toFixed(1)} yr</div><div class="k-sub">average for your age and sex: ${r.eBase.toFixed(1)} yr</div></div>
    <div class="kpi"><div class="k-label">Median age at death</div><div class="k-value">${r.median.toFixed(0)}</div><div class="k-sub">middle 50%: ${r.quantiles.p25.toFixed(0)} to ${r.quantiles.p75.toFixed(0)}</div></div>
    <div class="kpi"><div class="k-label">Mortality ratio</div><div class="k-value">${ratioPct}%</div><div class="k-sub">of standard, next 10 years<br>${r.rating.label}</div></div>
  </div>

  <div class="panel">
    <h2>Biggest modifiable detriments to your longevity</h2>
    <p class="sub">Ranked by years of life expectancy you could plausibly gain by changing each factor to the target shown, everything else held equal.${r.detriments.length > 1 ? ` Addressing all of them together: <strong class="delta-pos">+${(r.eAllImproved - r.e).toFixed(1)} years</strong> (less than the sum, because risks overlap).` : ''}</p>
    ${r.detriments.length ? `<ol class="detriments">${r.detriments.map((d, i) => `
      <li>
        <span class="rank">${i + 1}</span>
        <div>
          <h3>${escapeHtml(d.label)}</h3>
          <p><strong>Now:</strong> ${escapeHtml(d.answer)} · <strong>Target:</strong> ${escapeHtml(d.target)}</p>
          <p>${escapeHtml(d.advice)}</p>
          ${citeLine(d.cite)}
        </div>
        <div class="gain">+${d.gain.toFixed(1)} yr<small>life expectancy</small></div>
      </li>`).join('')}</ol>`
    : '<p class="empty">No modifiable factor you reported is costing you meaningful life expectancy. Keep it up.</p>'}
  </div>

  <div class="grid-2">
    <div class="panel">
      <h2>Survival curve</h2>
      <p class="sub">Probability of being alive at each age</p>
      <div class="legend"><span><i style="background:var(--series-you)"></i>${r.person.name ? name : 'You'}</span><span><i style="background:var(--series-avg)"></i>U.S. average, same age and sex</span></div>
      <div id="chart-survival"></div>
    </div>
    <div class="panel">
      <h2>Annual probability of death (q<sub>x</sub>)</h2>
      <p class="sub">Chance of dying within the year at each age, log scale</p>
      <div class="legend"><span><i style="background:var(--series-you)"></i>${r.person.name ? name : 'You'}</span><span><i style="background:var(--series-avg)"></i>U.S. average</span></div>
      <div id="chart-qx"></div>
    </div>
  </div>

  <div class="grid-2">
    <div class="panel">
      <h2>Chance of reaching key ages</h2>
      <p class="sub">Bar: you. Orange tick: U.S. average.</p>
      <table class="milestones">
        <thead><tr><th>Age</th><th class="bar-cell"></th><th>You</th><th>Average</th></tr></thead>
        <tbody>${r.milestones.map((m) => `<tr><td>${m.age}</td><td class="bar-cell"><div class="mbar"><span style="width:${(m.p * 100).toFixed(1)}%"></span><em style="left:${(m.pBase * 100).toFixed(1)}%"></em></div></td><td>${fmt.pct(m.p)}</td><td class="muted">${fmt.pct(m.pBase)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="panel">
      <h2>What moves your estimate</h2>
      <p class="sub">Years gained or lost versus an average American of your age and sex, factor by factor. The average is not a healthy benchmark (typical BMI is near 30 and most adults fall short of activity guidelines), so a factor can sit close to average here and still offer a sizable gain above.</p>
      <div id="chart-contrib"></div>
    </div>
  </div>

  <div class="panel">
    <h2>Reliability of this estimate</h2>
    <p class="sub" style="margin-bottom:0">If the cited relative risks are 30% weaker or stronger than modeled, your life expectancy would be <strong>${r.sensitivity.low.toFixed(1)} to ${r.sensitivity.high.toFixed(1)} years</strong>. ${r.unanswered.length ? `Not answered, so assumed average: ${r.unanswered.map(escapeHtml).join(', ')}.` : 'You answered every question.'} Individual outcomes vary widely around any expectation: the middle 80% of people with your profile die between ages ${survQ(r, 0.9)} and ${r.quantiles.p90.toFixed(0)}.</p>
  </div>

  <div class="panel">
    <h2>Your life table</h2>
    <p class="sub">Per 100,000 people with your profile alive at age ${r.person.age}. q<sub>x</sub> = probability of dying within the year; l<sub>x</sub> = survivors; d<sub>x</sub> = deaths; e<sub>x</sub> = remaining life expectancy.</p>
    <div class="table-wrap">
      <table class="lt">
        <thead><tr><th>Age</th><th>Year</th><th>q<sub>x</sub> you</th><th>q<sub>x</sub> avg</th><th>Ratio</th><th>l<sub>x</sub></th><th>d<sub>x</sub></th><th>e<sub>x</sub></th><th>Alive</th></tr></thead>
        <tbody>${r.rows.filter((x) => x.l >= 0.5 || x.age === r.person.age).map((x, i) => `<tr class="${i === 0 ? 'now' : ''}"><td>${x.age}</td><td>${x.year}</td><td>${fmt.q(x.q)}</td><td class="muted">${fmt.q(x.qBase)}</td><td>${x.mult.toFixed(2)}×</td><td>${fmt.int(x.l)}</td><td>${fmt.int(x.d)}</td><td>${x.e.toFixed(2)}</td><td>${fmt.pct(x.S)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>

  <aside class="disclaimer" role="note" style="max-width:none">
    <strong>Not medical, insurance or financial advice.</strong> This report applies published population-level relative risks to a published population life table. It is an educational estimate, not a diagnosis, prognosis, underwriting decision or financial plan. The underwriting-style class is illustrative only; insurers use their own data, medical records and rules. Talk to a qualified professional before making health, insurance or retirement decisions.
    <br><button type="button" class="btn-link" data-open-method style="padding-left:0">How this is calculated and full references →</button>
  </aside>`;
  $('#report').innerHTML = html;

  const css = getComputedStyle(document.documentElement);
  const cYou = css.getPropertyValue('--series-you').trim();
  const cAvg = css.getPropertyValue('--series-avg').trim();
  const rows = r.rows.filter((x) => x.age <= 110);
  lineChart($('#chart-survival'), [
    { name: 'You', color: cYou, values: rows.map((x) => ({ x: x.age, y: x.S })) },
    { name: 'U.S. avg', color: cAvg, values: rows.map((x) => ({ x: x.age, y: x.SBase })) },
  ], { yMin: 0, yMax: 1, yFormat: (v) => `${Math.round(v * 100)}%`, yFormatTip: (v) => fmt.pct(v), xLabel: 'Age', tipTitle: (x) => `Age ${x}`, ariaLabel: 'Survival curve' });
  lineChart($('#chart-qx'), [
    { name: 'You', color: cYou, values: rows.map((x) => ({ x: x.age, y: x.q })) },
    { name: 'U.S. avg', color: cAvg, values: rows.map((x) => ({ x: x.age, y: x.qBase })) },
  ], { logY: true, yFormat: (v) => (v >= 0.01 ? `${Math.round(v * 100)}%` : `${+(v * 100).toPrecision(1)}%`), yFormatTip: (v) => `${(v * 100).toFixed(3)}%`, xLabel: 'Age', tipTitle: (x) => `Age ${x}`, ariaLabel: 'Annual probability of death' });
  const contrib = [...r.contributions].filter((c) => Math.abs(c.vsAverage) >= 0.05).sort((a, b) => a.vsAverage - b.vsAverage);
  if (contrib.length) divergingBars($('#chart-contrib'), contrib.map((c) => ({ label: c.label, sub: c.answer, value: c.vsAverage })));
  else $('#chart-contrib').innerHTML = '<p class="empty">Answer more questions to see how each factor moves your estimate.</p>';
}

function survQ(r, p) {
  const rows = r.rows;
  for (let i = 0; i < rows.length - 1; i++) if (rows[i].S >= p && rows[i + 1].S < p) return (rows[i].age + (rows[i].S - p) / (rows[i].S - rows[i + 1].S)).toFixed(0);
  return rows[0].age;
}

/* ---------- Methodology ---------- */

function renderMethod() {
  const factorRows = FACTORS.map((f) => `<tr><td><strong>${f.label}</strong><br><span class="small">${f.kind === 'excess' ? 'Modeled as added annual risk (see section 3).' : f.options.map((o) => `${escapeHtml(o.label)}: HR ${o.anchors ? o.anchors.map(([a, h]) => `${h.toFixed(2)} at ${a}`).join(', ') : o.rr}`).join('; ')}</span></td><td>${f.cite.map(citeShort).join('; ')}</td></tr>`).join('');
  $('#method').innerHTML = `<div class="panel method">
    <p class="eyebrow">Methodology</p>
    <h1>How MyActuary builds your life table</h1>
    <h3>1. Baseline mortality</h3>
    <p>The starting point is the Social Security Administration Office of the Chief Actuary's 2023 period life table for the Social Security area population, as used in the 2026 Trustees Report. It gives, for every age from 0 to 119 and each sex, the probability q<sub>x</sub> of dying within a year. With no answers beyond age and sex, MyActuary reproduces the published SSA life expectancies exactly.</p>
    <h3>2. Projection basis</h3>
    <p>By default, the baseline q<sub>x</sub> for each future calendar year is reduced by ${(DEFAULT_IMPROVEMENT * 100).toFixed(1)}% per year from 2023, in line with the long-range intermediate assumption of the Social Security Trustees. This produces a cohort-style table similar to the generational tables insurers and pension plans use. You can switch to a pure period basis.</p>
    <h3>3. Personal adjustments</h3>
    <p>Each answer maps to an all-cause mortality hazard ratio (HR) from a large meta-analysis or pooled cohort study, listed below. Because the SSA table already reflects the U.S. mix of smokers, non-smokers, healthy and unhealthy people, each HR is divided by the population-weighted average HR for that factor (using approximate NHANES/NHIS prevalence). An answer of "I don't know" therefore leaves the baseline unchanged.</p>
    <p>Adjustments are applied as proportional hazards: q'<sub>x</sub> = 1 − (1 − q<sub>x</sub>)<sup>M</sup>, where M is your combined multiplier at that age. Three refinements keep the result realistic:</p>
    <ul>
      <li><strong>Age attenuation.</strong> Relative risks narrow at older ages, so each factor's log-HR is reduced linearly between ages 60 and 90 (by 0% to 50% depending on the factor; BMI and blood pressure attenuate most, consistent with the cited pooled analyses).</li>
      <li><strong>Overlap.</strong> Factors that act through shared pathways (BMI, blood pressure, blood sugar, cholesterol, activity and diet) are combined with diminishing weights (1, 0.8, 0.64 … floored at 0.5) rather than simply multiplied, to avoid double counting.</li>
      <li><strong>Bounds.</strong> The combined multiplier saturates smoothly between 0.35× and 10× population mortality.</li>
      <li><strong>Added (excess) risk.</strong> Cancer, occupation, hazardous activities and driving are added to the hazard rather than multiplied, because their risk does not scale with age-related mortality. Cancer uses SEER 5-year relative survival by type and stage, front-loaded in the first two years and fading to a small residual after five. Occupation uses BLS fatal-injury rates until age 67. Activities use published fatality rates per participant. Driving scales the U.S. motor-vehicle death rate by your record and seat-belt use.</li>
      <li><strong>Race/ethnicity and state.</strong> Age-specific hazard ratios were solved so that, applied to the SSA baseline, they reproduce each group's published life expectancy relative to the U.S. total (NCHS 2024 U.S. life tables at ages 20\u201385; NCHS 2022 state life tables at birth and age 65). They are combined with income and education with diminishing weights because these overlap heavily.</li>
      <li><strong>Smoking cessation.</strong> Former smokers' excess risk declines with time since quitting, following Jha et al. (2013). The "quit now" scenario uses the same trajectory.</li>
    </ul>
    <h3>4. Outputs</h3>
    <p>Life expectancy is the complete expectation of life assuming deaths are spread evenly within each year of age. The mortality ratio is your expected deaths over the next 10 years divided by the average person's. The underwriting-style class maps that ratio to conventional labels (substandard tables are +25% each); it is illustrative only. Detriments are ranked by recomputing your full table with one factor moved to a realistic target.</p>
    <h3>5. Limitations</h3>
    <ul>
      <li>Hazard ratios come from observational studies (except blood pressure and cholesterol treatment) and may include residual confounding.</li>
      <li>Race/ethnicity and state effects are calibrated to published NCHS life expectancies at several ages, so they capture average differences only; county and neighborhood differences within a state are larger still. U.S. insurers may not use race.</li>
      <li>Organ transplant and some rarer serious conditions are not modeled. Cancer survival is approximated by type and stage only.</li>
      <li>Income and education effects are partly explained by health behaviors and access to care; the hazard ratios used are attenuated for behaviors, and they overlap with each other, so they are combined with diminishing weights.</li>
      <li>Population prevalence figures are approximate.</li>
    </ul>
    <h3>Relative risks used</h3>
    <table><thead><tr><th>Factor and hazard ratios (vs. study reference)</th><th>Source</th></tr></thead><tbody>${factorRows}</tbody></table>
    <h3>References</h3>
    <ol class="refs">${Object.entries(CITATIONS).map(([id, c]) => { const h = citationLink(id); return `<li>${escapeHtml(c.full)}${h ? ` <a href="${h}" target="_blank" rel="noopener noreferrer">${c.doi ? `doi:${c.doi}` : h}</a>` : ''}</li>`; }).join('')}</ol>
    <h3>Privacy</h3>
    <p>MyActuary is a static page. Your answers are kept in this browser tab's session storage and cleared when the tab closes. The page's Content Security Policy forbids all network connections, so nothing you enter can be sent anywhere. The PDF report embeds your answers in its document metadata so you can load it back in later; anyone you share the PDF with can read them.</p>
  </div>`;
}

/* ---------- Import / export ---------- */

async function handleImport(file) {
  try {
    const answers = await importFile(file);
    state.answers = { ...blankAnswers(), ...answers };
    step = 0;
    save();
    renderReport();
    show('report');
    toast('Report loaded. Choose "Edit answers" to make changes.');
  } catch (e) {
    toast(e.message || 'Could not read that file.', 5000);
  }
}

/* ---------- Wire up ---------- */

function init() {
  $('#questionnaire').addEventListener('input', onFormInput);
  $('#questionnaire').addEventListener('change', onFormInput);
  $('#questionnaire').addEventListener('submit', (e) => e.preventDefault());
  $('#questionnaire').addEventListener('click', (e) => {
    const u = e.target.closest('[data-units]');
    if (u) { state.answers.body.units = u.dataset.units; save(); renderForm(); }
  });
  $('#stepper-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (b) { step = +b.dataset.step; save(); renderForm(); window.scrollTo({ top: 0 }); }
  });
  $('#prev').addEventListener('click', () => { if (step > 0) { step--; save(); renderForm(); window.scrollTo({ top: 0 }); } });
  $('#next').addEventListener('click', () => {
    if (step === 0 && !validateAbout()) return;
    if (step < SECTIONS.length - 1) { step++; save(); renderForm(); window.scrollTo({ top: 0 }); } else { renderReport(); show('report'); }
  });
  $('#skip-to-report').addEventListener('click', () => { if (validateAbout()) { renderReport(); show('report'); } });
  $('#start').addEventListener('click', () => { step = 0; renderForm(); show('form'); });
  $('#resume').addEventListener('click', () => { renderForm(); show('form'); });
  $('#edit').addEventListener('click', () => { step = 0; renderForm(); show('form'); });
  $('#clear').addEventListener('click', () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    state = { answers: blankAnswers(), view: 'intro' };
    step = 0;
    lastResult = null;
    $('#resume').hidden = true;
    show('intro');
    toast('Your answers were cleared from this browser.');
  });
  $('#export-pdf').addEventListener('click', async () => {
    try { await exportPdf(state.answers, lastResult || evaluate(state.answers)); toast('PDF downloaded. Load it here any time to edit your answers.'); } catch (e) { console.error(e); toast('Could not create the PDF.'); }
  });
  const openImport = () => $('#import-file').click();
  $('#nav-import').addEventListener('click', openImport);
  $('#intro-import').addEventListener('click', openImport);
  $('#import-file').addEventListener('change', (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) handleImport(f); });
  let prevView = 'intro';
  const openMethod = () => { prevView = state.view; renderMethod(); show('method'); };
  $('#nav-method').addEventListener('click', openMethod);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-method]')) openMethod(); });
  $('#method-back').addEventListener('click', () => show(prevView));
  // Drag-and-drop a saved PDF anywhere on the page.
  document.addEventListener('dragover', (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); });
  document.addEventListener('drop', (e) => { const f = e.dataTransfer?.files?.[0]; if (f) { e.preventDefault(); handleImport(f); } });

  step = Math.min(state.step || 0, SECTIONS.length - 1);
  if (!state.fresh) $('#resume').hidden = false;
  if (state.view === 'report') {
    try { renderReport(); show('report'); return; } catch { /* fall through */ }
  }
  if (state.view === 'form') { renderForm(); show('form'); return; }
  show('intro');
}

init();
