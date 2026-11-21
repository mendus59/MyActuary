import { conditionsFactor, sleepApneaFactor, familyHistoryFactor } from './medical.js';
// Risk-factor definitions.
//
// Each option carries:
//   rr    – all-cause mortality hazard ratio relative to the option marked as the
//           study reference (rr = 1), taken or interpolated from the cited study.
//   prev  – approximate share of U.S. adults at that level (NHANES / NHIS). The
//           model divides each person's rr by the population-weighted mean rr so
//           that an "average" respondent reproduces the SSA baseline table.
//   improvesTo – the option a person could realistically move to by changing this
//           factor; used to rank modifiable detriments.
//
// Factor fields:
//   group        – factors in the same group partly share causal pathways
//                  (e.g. BMI acts partly through blood pressure and glucose), so
//                  their log-hazards are combined with diminishing weights.
//   attenuation  – fraction by which the log hazard ratio shrinks between age 60
//                  and age 90 (relative risks narrow at older ages).
//   modifiable   – whether it is ranked as a modifiable detriment.

export const SECTIONS = [
  { id: 'about', title: 'About you', blurb: 'The baseline table is chosen from your age and sex.' },
  { id: 'body', title: 'Body measurements', blurb: 'Used to compute body-mass index (BMI).' },
  { id: 'habits', title: 'Tobacco, alcohol and drugs', blurb: 'Among the largest modifiable drivers of adult mortality.' },
  { id: 'activity', title: 'Activity, sleep and diet', blurb: 'Typical week over the last few months.' },
  { id: 'clinical', title: 'Clinical measures', blurb: 'From your most recent check-up. Choose "I don\u2019t know" if unsure; the model then assumes the population average.' },
  { id: 'history', title: 'Medical history', blurb: 'Conditions a doctor has diagnosed.' },
  { id: 'cancer', title: 'Cancer', blurb: 'Survival after cancer depends mostly on the type and the stage at diagnosis.' },
  { id: 'family', title: 'Family and genetic history', blurb: 'Parental longevity, inherited conditions, and the illnesses your blood relatives have had.' },
  { id: 'exposures', title: 'Occupation, activities and driving', blurb: 'Insurers ask about these because they add accident risk on top of health risk.' },
  { id: 'life', title: 'Life circumstances', blurb: 'Where you live, income, education and relationships are strong, well-documented predictors of U.S. mortality.' },
  { id: 'wellbeing', title: 'Wellbeing and overall health', blurb: 'Social connection, mood and how you rate your own health.' },
];

export const DIET_ITEMS = [
  { id: 'veg', label: '3 or more servings of vegetables most days' },
  { id: 'fruit', label: '2 or more servings of fruit most days' },
  { id: 'legumes', label: 'Beans, lentils or chickpeas 3+ times a week' },
  { id: 'nuts', label: 'Nuts or seeds 3+ times a week' },
  { id: 'fish', label: 'Fish or seafood 2+ times a week' },
  { id: 'grains', label: 'Mostly whole grains rather than refined grains' },
  { id: 'oil', label: 'Olive or vegetable oil as the main cooking fat (not butter)' },
  { id: 'meat', label: 'Less than one serving of red or processed meat a day' },
  { id: 'sugar', label: 'Less than one sugar-sweetened drink a day' },
];

const opt = (id, label, rr, prev, extra = {}) => ({ id, label, rr, prev, ...extra });

export const FACTORS = [
  {
    id: 'smoking',
    section: 'habits',
    label: 'Cigarette smoking',
    question: 'Which best describes your cigarette smoking?',
    group: 'tobacco',
    attenuation: 0.3,
    modifiable: true,
    cite: ['jha2013', 'carter2015', 'thun2013'],
    options: [
      opt('never', 'Never smoked (fewer than 100 cigarettes in my life)', 1.0, 0.66),
      opt('former15', 'Former smoker, quit 15 or more years ago', 1.1, 0.13),
      opt('former5', 'Former smoker, quit 5 to 15 years ago', 1.3, 0.06),
      opt('former0', 'Former smoker, quit less than 5 years ago', 1.6, 0.03),
      opt('cur1', 'Current smoker, fewer than 10 a day', 2.0, 0.05, { improvesTo: 'quitNow' }),
      opt('cur10', 'Current smoker, 10 to 19 a day', 2.6, 0.04, { improvesTo: 'quitNow' }),
      opt('cur20', 'Current smoker, 20 or more a day', 3.0, 0.03, { improvesTo: 'quitNow' }),
    ],
    // Former smokers' excess risk declines with time since quitting (Jha 2013).
    // Returns the option whose rr applies t years from now.
    trajectory(optionId, t) {
      switch (optionId) {
        case 'former0': return t < 2.5 ? 'former0' : t < 12.5 ? 'former5' : 'former15';
        case 'former5': return t < 5 ? 'former5' : 'former15';
        case 'quitNow': return t < 5 ? 'former0' : t < 15 ? 'former5' : 'former15';
        default: return optionId;
      }
    },
    advice: 'Quitting at any age lowers mortality; quitting before 40 avoids about 90% of the excess risk (Jha 2013). Evidence-based cessation support (counseling plus medication) roughly doubles quit rates.',
  },
  {
    id: 'bmi',
    section: 'body',
    label: 'Body-mass index',
    derived: true,
    group: 'cardiometabolic',
    attenuation: 0.5,
    modifiable: true,
    cite: ['gbmc2016'],
    options: [
      opt('b15', 'BMI under 18.5', 1.51, 0.016, { improvesTo: 'b22', max: 18.5 }),
      opt('b18', 'BMI 18.5 to 20', 1.13, 0.03, { improvesTo: 'b22', max: 20 }),
      opt('b20', 'BMI 20 to 22.5', 1.0, 0.09, { max: 22.5 }),
      opt('b22', 'BMI 22.5 to 25', 1.0, 0.14, { max: 25 }),
      opt('b25', 'BMI 25 to 27.5', 1.07, 0.16, { improvesTo: 'b22', max: 27.5 }),
      opt('b27', 'BMI 27.5 to 30', 1.2, 0.15, { improvesTo: 'b25', max: 30 }),
      opt('b30', 'BMI 30 to 35', 1.45, 0.21, { improvesTo: 'b27', max: 35 }),
      opt('b35', 'BMI 35 to 40', 1.94, 0.11, { improvesTo: 'b30', max: 40 }),
      opt('b40', 'BMI 40 or higher', 2.76, 0.094, { improvesTo: 'b35', max: Infinity }),
    ],
    resolve(a) {
      const bmi = computeBMI(a.body);
      if (bmi == null) return null;
      return this.options.find((o) => bmi < o.max).id;
    },
    advice: 'Improvement targets one BMI band lower, a realistic goal (about 5–10% of body weight). The cited association is from never-smokers without pre-existing disease, which removes much of the reverse-causation bias in earlier studies.',
  },
  {
    id: 'activity',
    section: 'activity',
    label: 'Aerobic physical activity',
    derived: true,
    group: 'cardiometabolic',
    attenuation: 0.2,
    modifiable: true,
    cite: ['arem2015'],
    options: [
      opt('a0', 'No leisure-time activity', 1.0, 0.25, { improvesTo: 'a7', max: 0.01 }),
      opt('a1', 'Below guidelines (under 150 moderate min/week)', 0.8, 0.25, { improvesTo: 'a15', max: 7.5 }),
      opt('a7', 'Meets guidelines (150–299 moderate min/week)', 0.69, 0.2, { improvesTo: 'a22', max: 15 }),
      opt('a15', '2–3× guidelines', 0.63, 0.12, { max: 22.5 }),
      opt('a22', '3–5× guidelines', 0.61, 0.1, { max: 40 }),
      opt('a40', '5–10× guidelines', 0.61, 0.06, { max: 75 }),
      opt('a75', 'More than 10× guidelines', 0.69, 0.02, { max: Infinity }),
    ],
    resolve(a) {
      const m = metHours(a.activity);
      if (m == null) return null;
      return this.options.find((o) => m < o.max).id;
    },
    advice: 'Most of the benefit comes from moving from none to the 150 minutes/week guideline; three to five times the guideline captures nearly all of it (Arem 2015).',
  },
  {
    id: 'strength',
    section: 'activity',
    label: 'Muscle-strengthening activity',
    question: 'Do you do muscle-strengthening exercise (weights, bands, body-weight) on 2 or more days a week?',
    group: 'cardiometabolic',
    attenuation: 0.2,
    modifiable: true,
    cite: ['momma2022'],
    options: [
      opt('no', 'No', 1.0, 0.7, { improvesTo: 'yes' }),
      opt('yes', 'Yes', 0.85, 0.3),
    ],
    advice: '30–60 minutes a week of muscle-strengthening activity is associated with 10–20% lower all-cause mortality, independent of aerobic activity (Momma 2022).',
  },
  {
    id: 'alcohol',
    section: 'habits',
    label: 'Alcohol',
    question: 'How many standard drinks do you have in a typical week? (One drink = 12 oz beer, 5 oz wine or 1.5 oz spirits.)',
    group: 'alcohol',
    attenuation: 0.2,
    modifiable: true,
    cite: ['wood2018', 'zhao2023'],
    options: [
      opt('none', 'None', 1.0, 0.4),
      opt('d1', '1 to 7', 1.0, 0.4),
      opt('d8', '8 to 14', 1.05, 0.1, { improvesTo: 'd1' }),
      opt('d15', '15 to 24', 1.15, 0.05, { improvesTo: 'd1' }),
      opt('d25', '25 to 34', 1.3, 0.03, { improvesTo: 'd1' }),
      opt('d35', '35 or more', 1.5, 0.02, { improvesTo: 'd1' }),
    ],
    advice: 'Mortality rises above roughly 100 g of alcohol a week (about 7 U.S. drinks); the large pooled analysis found no net benefit from light drinking once biased comparison groups were removed (Wood 2018; Zhao 2023).',
  },
  {
    id: 'diet',
    section: 'activity',
    label: 'Diet quality',
    derived: true,
    group: 'cardiometabolic',
    attenuation: 0.2,
    modifiable: true,
    cite: ['sofi2010'],
    // Hazard 0.92 per 2-point increase on a 0–9 Mediterranean-style score (Sofi 2010).
    options: [
      opt('s0', 'Score 0–2 of 9', 0.96, 0.2, { improvesTo: 's5', max: 3 }),
      opt('s3', 'Score 3–4 of 9', 0.864, 0.35, { improvesTo: 's7', max: 5 }),
      opt('s5', 'Score 5–6 of 9', 0.795, 0.3, { improvesTo: 's7', max: 7 }),
      opt('s7', 'Score 7–9 of 9', 0.716, 0.15, { max: Infinity }),
    ],
    resolve(a) {
      if (!a.diet || !a.diet.answered) return null;
      const s = DIET_ITEMS.filter((d) => a.diet.items && a.diet.items[d.id]).length;
      return this.options.find((o) => s < o.max).id;
    },
    advice: 'Each 2-point improvement on a 9-point Mediterranean-diet score is associated with about 8% lower all-cause mortality (Sofi 2010).',
  },
  {
    id: 'sleep',
    section: 'activity',
    label: 'Sleep duration',
    question: 'On average, how many hours do you sleep per night?',
    group: 'lifestyle',
    attenuation: 0.2,
    modifiable: true,
    cite: ['cappuccio2010'],
    options: [
      opt('lt6', 'Less than 6 hours', 1.12, 0.12, { improvesTo: 'h7' }),
      opt('h6', '6 to 7 hours', 1.05, 0.23, { improvesTo: 'h7' }),
      opt('h7', '7 to 8 hours', 1.0, 0.5),
      opt('h8', '8 to 9 hours', 1.07, 0.1),
      opt('gt9', 'More than 9 hours', 1.3, 0.05),
    ],
    advice: 'Habitual short sleep is associated with 12% higher mortality (Cappuccio 2010). Long sleep shows a larger association but is more likely a marker of underlying illness, so it is not ranked as modifiable.',
  },
  {
    id: 'bp',
    section: 'clinical',
    label: 'Systolic blood pressure',
    question: 'What is your usual systolic (top-number) blood pressure, on treatment if you take medication?',
    group: 'cardiometabolic',
    attenuation: 0.5,
    modifiable: true,
    cite: ['ettehad2016', 'lewington2002'],
    // About 15% higher all-cause mortality per 10 mmHg above 120 (Ettehad 2016: 13% lower per 10 mmHg reduction).
    options: [
      opt('lt120', 'Under 120', 1.0, 0.45),
      opt('s120', '120 to 129', 1.07, 0.2, { improvesTo: 'lt120' }),
      opt('s130', '130 to 139', 1.23, 0.15, { improvesTo: 'lt120' }),
      opt('s140', '140 to 159', 1.52, 0.14, { improvesTo: 's120' }),
      opt('s160', '160 to 179', 2.0, 0.05, { improvesTo: 's120' }),
      opt('s180', '180 or higher', 2.5, 0.01, { improvesTo: 's130' }),
    ],
    advice: 'Each 10 mmHg reduction in systolic pressure lowers all-cause mortality by about 13% in randomized trials (Ettehad 2016).',
  },
  {
    id: 'diabetes',
    section: 'clinical',
    label: 'Blood sugar / diabetes',
    question: 'Which best describes your blood-sugar status?',
    group: 'cardiometabolic',
    attenuation: 0.4,
    modifiable: true,
    cite: ['erfc2011', 'cai2020'],
    options: [
      opt('none', 'Normal blood sugar', 1.0, 0.51),
      opt('pre', 'Prediabetes (A1c 5.7–6.4%)', 1.13, 0.38, { improvesTo: 'none' }),
      opt('ctl', 'Diabetes, A1c under 7%', 1.6, 0.05),
      opt('mid', 'Diabetes, A1c 7–9%', 1.9, 0.04, { improvesTo: 'ctl' }),
      opt('poor', 'Diabetes, A1c above 9%', 2.5, 0.02, { improvesTo: 'ctl' }),
    ],
    advice: 'Diabetes roughly doubles all-cause mortality on average (ERFC 2011); risk is graded by glycemic control. Prediabetes carries about 13% excess risk (Cai 2020).',
  },
  {
    id: 'cholesterol',
    section: 'clinical',
    label: 'LDL cholesterol',
    question: 'Which best describes your LDL ("bad") cholesterol?',
    group: 'cardiometabolic',
    attenuation: 0.5,
    modifiable: true,
    cite: ['ctt2010'],
    options: [
      opt('ok', 'Normal (LDL under 130 mg/dL)', 1.0, 0.6),
      opt('treated', 'Elevated, now controlled on treatment', 1.0, 0.2),
      opt('high', 'Elevated (LDL 130 mg/dL or higher), untreated', 1.13, 0.2, { improvesTo: 'treated' }),
    ],
    advice: 'Each 1 mmol/L (39 mg/dL) LDL reduction lowers all-cause mortality by about 10% in randomized trials (CTT 2010).',
  },
  {
    id: 'chd',
    section: 'history',
    label: 'Coronary heart disease',
    question: 'Have you had a heart attack, or been diagnosed with coronary heart disease?',
    group: 'conditions',
    attenuation: 0.4,
    modifiable: false,
    cite: ['erfc2015'],
    options: [opt('no', 'No', 1.0, 0.95), opt('yes', 'Yes', 2.0, 0.05)],
  },
  {
    id: 'stroke',
    section: 'history',
    label: 'Stroke',
    question: 'Have you had a stroke?',
    group: 'conditions',
    attenuation: 0.4,
    modifiable: false,
    cite: ['erfc2015'],
    options: [opt('no', 'No', 1.0, 0.97), opt('yes', 'Yes', 2.1, 0.03)],
  },
  {
    id: 'afib',
    section: 'history',
    label: 'Atrial fibrillation',
    question: 'Have you been diagnosed with atrial fibrillation?',
    group: 'conditions',
    attenuation: 0.3,
    modifiable: false,
    cite: ['odutayo2016'],
    options: [opt('no', 'No', 1.0, 0.97), opt('yes', 'Yes', 1.46, 0.03)],
  },
  {
    id: 'ckd',
    section: 'history',
    label: 'Kidney function',
    question: 'Have you been told you have chronic kidney disease? If so, what stage?',
    group: 'conditions',
    attenuation: 0.3,
    modifiable: false,
    cite: ['ckdpc2010'],
    options: [
      opt('no', 'No kidney disease', 1.0, 0.86),
      opt('s3a', 'Stage 3a (eGFR 45–59)', 1.3, 0.09),
      opt('s3b', 'Stage 3b (eGFR 30–44)', 1.8, 0.035),
      opt('s4', 'Stage 4 or 5 (eGFR under 30)', 3.0, 0.015),
    ],
  },
  {
    id: 'family',
    section: 'family',
    label: 'Parental longevity',
    question: 'Which best describes your biological parents?',
    group: 'family',
    attenuation: 0,
    modifiable: false,
    cite: ['atkins2016', 'lloydjones2004'],
    options: [
      opt('long', 'At least one parent is 90 or older now, or lived to 90 or older', 0.85, 0.2),
      opt('living', 'Both parents are alive and under 90', 1.0, 0.25),
      opt('typical', 'A parent has died before 90, but not of heart disease or stroke before 60', 1.0, 0.4),
      opt('early', 'A parent died of heart disease or stroke before age 60', 1.25, 0.15),
    ],
  },
  {
    id: 'social',
    section: 'life',
    label: 'Social connection',
    question: 'How connected do you feel to friends, family or community?',
    group: 'psychosocial',
    attenuation: 0,
    modifiable: true,
    cite: ['holtlunstad2015'],
    options: [
      opt('good', 'Well connected; I rarely feel lonely', 1.0, 0.75),
      opt('some', 'Sometimes isolated or lonely', 1.14, 0.15, { improvesTo: 'good' }),
      opt('often', 'Often isolated or lonely, or living alone with little contact', 1.29, 0.1, { improvesTo: 'good' }),
    ],
    advice: 'Social isolation and loneliness are each associated with roughly 26–29% higher mortality, comparable to other established risk factors (Holt-Lunstad 2015).',
  },
  {
    id: 'depression',
    section: 'wellbeing',
    label: 'Depression',
    question: 'Over the past year, have you experienced depression?',
    group: 'psychosocial',
    attenuation: 0.2,
    modifiable: true,
    cite: ['cuijpers2014'],
    options: [
      opt('no', 'No', 1.0, 0.85),
      opt('treated', 'Yes, and it is being treated or managed', 1.3, 0.08),
      opt('untreated', 'Yes, and it is not being treated', 1.52, 0.07, { improvesTo: 'treated' }),
    ],
    advice: 'Depression is associated with about 50% excess mortality in community samples (Cuijpers 2014). If you are struggling, please talk to a clinician; in the U.S. you can call or text 988 any time.',
  },
];


/* ---------- Additional underwriting factors ---------- */

// 5-year relative survival by cancer type and SEER summary stage (approximate, SEER 22, 2014-2020).
export const CANCER_TYPES = [
  { id: 'breast', label: 'Breast', rs: { local: 0.99, regional: 0.86, distant: 0.31 } },
  { id: 'prostate', label: 'Prostate', rs: { local: 0.995, regional: 0.99, distant: 0.34 } },
  { id: 'colorectal', label: 'Colon or rectum', rs: { local: 0.91, regional: 0.73, distant: 0.13 } },
  { id: 'lung', label: 'Lung', rs: { local: 0.63, regional: 0.35, distant: 0.08 } },
  { id: 'melanoma', label: 'Melanoma of the skin', rs: { local: 0.99, regional: 0.74, distant: 0.35 } },
  { id: 'pancreas', label: 'Pancreas', rs: { local: 0.44, regional: 0.16, distant: 0.03 } },
  { id: 'other', label: 'Other or several types', rs: { local: 0.9, regional: 0.7, distant: 0.3 } },
];
const CANCER_STAGES = [
  { id: 'local', label: 'Localized (confined to where it started)' },
  { id: 'regional', label: 'Regional (spread to nearby lymph nodes or tissue)' },
  { id: 'distant', label: 'Distant / metastatic (spread to distant organs)' },
  { id: 'unknown', label: 'I don’t know the stage' },
];

function cancerExcess(v, { t, baseMu }) {
  if (!v || !v.status) return 0;
  // People with no current cancer diagnosis have slightly lower near-term mortality than the
  // population, whose death rates include patients already diagnosed.
  if (v.status === 'none') return t < 2 ? -0.08 * baseMu : t < 5 ? -0.04 * baseMu : 0;
  if (v.status === 'past') return 0.1 * baseMu;
  const type = CANCER_TYPES.find((c) => c.id === v.type) || CANCER_TYPES.at(-1);
  const stage = ['local', 'regional', 'distant'].includes(v.stage) ? v.stage : 'regional';
  const lambda = -Math.log(type.rs[stage]) / 5; // average annual excess hazard over 5 years
  if (v.when === '1to5') return t < 3 ? 0.6 * lambda : 0.1 * baseMu;
  return t < 2 ? 1.5 * lambda : t < 5 ? (2 / 3) * lambda : 0.1 * baseMu;
}

// Motor-vehicle deaths per person-year (NHTSA/CDC, about 13 per 100,000; higher for young and old).
function motorVehicleBase(age) {
  if (age < 25) return 0.00018;
  if (age < 75) return 0.00013;
  return 0.00018;
}
const DRIVING_RECORD = { nodrive: 0.6, clean: 0.9, v1: 1.4, v3: 2.0, dui: 2.5 };
const SEATBELT = { always: 0.94, notalways: 1.7 };

export const HAZARD_ITEMS = [
  { id: 'skydive', label: 'Skydiving (25 or more jumps a year)', excess: 0.0002, cite: 'uspa' },
  { id: 'scuba', label: 'Recreational scuba diving', excess: 0.00016, cite: 'denoble2008' },
  { id: 'pilot', label: 'Flying as a private (non-commercial) pilot', excess: 0.0008, cite: 'aopa' },
  { id: 'moto', label: 'Riding a motorcycle regularly', excess: 0.0005, cite: 'nhtsaMoto' },
];

const OCCUPATIONS = [
  { id: 'low', label: 'Office, professional, retail, healthcare, education, retired or not working', excess: 0 },
  { id: 'moderate', label: 'Construction trades, manufacturing, landscaping, police or firefighting', excess: 0.0001 },
  { id: 'high', label: 'Truck or delivery driving, farming/ranching, roofing, power-line or ironwork', excess: 0.0003 },
  { id: 'veryhigh', label: 'Logging, commercial fishing, or piloting small commercial aircraft', excess: 0.001 },
];
const AVG_OCC_EXCESS = 0.00003;

FACTORS.push(
  {
    id: 'drugs',
    section: 'habits',
    label: 'Drug use',
    question: 'Do you use opioids that were not prescribed to you, heroin, cocaine or methamphetamine?',
    group: 'drugs',
    attenuation: 0.2,
    modifiable: true,
    cite: ['larney2020'],
    options: [
      opt('no', 'No', 1.0, 0.985),
      opt('past', 'Not in the last year, but I have in the past', 1.5, 0.008, {}),
      opt('yes', 'Yes, in the last year', 5.0, 0.007, { improvesTo: 'past' }),
    ],
    advice: 'People who use non-prescribed opioids have roughly ten times the mortality of their peers, mostly from overdose (Larney 2020). Treatment with methadone or buprenorphine roughly halves that risk. Free, confidential help: SAMHSA National Helpline, 1-800-662-4357.',
  },
  {
    id: 'hf',
    section: 'history',
    label: 'Heart failure',
    question: 'Have you been diagnosed with heart failure?',
    group: 'conditions',
    attenuation: 0.3,
    modifiable: false,
    cite: ['jones2019'],
    options: [
      opt('no', 'No', 1.0, 0.975),
      opt('mild', 'Yes, with few or no symptoms in daily life (NYHA class I–II)', 2.5, 0.018),
      opt('severe', 'Yes, with symptoms on minimal exertion or at rest (NYHA class III–IV)', 5.0, 0.007),
    ],
  },
  {
    id: 'copd',
    section: 'history',
    label: 'COPD / chronic lung disease',
    question: 'Have you been diagnosed with COPD, emphysema or chronic bronchitis?',
    group: 'conditions',
    attenuation: 0.3,
    modifiable: false,
    cite: ['mannino2003'],
    options: [
      opt('no', 'No', 1.0, 0.93),
      opt('mild', 'Yes, mild (GOLD 1)', 1.3, 0.03),
      opt('moderate', 'Yes, moderate (GOLD 2)', 1.6, 0.025),
      opt('severe', 'Yes, severe (GOLD 3–4)', 2.7, 0.012),
      opt('oxygen', 'Yes, and I use home oxygen', 4.0, 0.003),
    ],
  },
  {
    id: 'hiv',
    section: 'history',
    label: 'HIV',
    question: 'Are you living with HIV?',
    group: 'conditions',
    attenuation: 0.2,
    modifiable: true,
    cite: ['marcus2020'],
    options: [
      opt('no', 'No', 1.0, 0.996),
      opt('suppressed', 'Yes, on treatment with an undetectable viral load', 1.6, 0.003),
      opt('unsuppressed', 'Yes, not on treatment or not suppressed', 3.5, 0.001, { improvesTo: 'suppressed' }),
    ],
    advice: 'With modern antiretroviral therapy started early, the life-expectancy gap for people with HIV has narrowed to a few years (Marcus 2020).',
  },
  {
    id: 'cancer',
    section: 'cancer',
    kind: 'excess',
    label: 'Cancer',
    modifiable: false,
    cite: ['seer'],
    questions: [
      { key: 'status', question: 'Have you ever been diagnosed with cancer? (Do not count basal-cell or squamous-cell skin cancer.)', options: [
        { id: 'none', label: 'No' },
        { id: 'past', label: 'Yes, more than 5 years ago, with no sign of cancer since' },
        { id: 'recent', label: 'Yes, within the last 5 years, or I have active cancer' },
      ] },
      { key: 'when', question: 'When were you diagnosed?', showIf: (v) => v.status === 'recent', options: [
        { id: 'lt1', label: 'Within the last year' },
        { id: '1to5', label: '1 to 5 years ago' },
      ] },
      { key: 'type', question: 'What type of cancer?', showIf: (v) => v.status === 'recent', options: CANCER_TYPES.map((c) => ({ id: c.id, label: c.label })) },
      { key: 'stage', question: 'What was the stage at diagnosis?', showIf: (v) => v.status === 'recent', options: CANCER_STAGES },
    ],
    resolve(a) { return a.cancer && a.cancer.status ? a.cancer : null; },
    excessAt: cancerExcess,
    describe(v) {
      if (v.status === 'none') return 'No cancer diagnosis';
      if (v.status === 'past') return 'Cancer more than 5 years ago, no recurrence';
      const type = (CANCER_TYPES.find((c) => c.id === v.type) || { label: 'Type not given' }).label;
      const stage = (CANCER_STAGES.find((c) => c.id === v.stage) || { label: 'stage unknown' }).label.split(' (')[0].toLowerCase();
      return `${type} cancer, ${stage}, diagnosed ${v.when === '1to5' ? '1–5 years ago' : 'within the last year'}`;
    },
  },
  {
    id: 'genetic',
    section: 'family',
    label: 'Inherited conditions',
    question: 'Has genetic testing or a doctor identified any of these inherited conditions in you?',
    group: 'genetic',
    attenuation: 0.2,
    modifiable: true,
    cite: ['finch2014', 'versmissen2008'],
    options: [
      opt('none', 'None known, or never tested', 1.0, 0.985),
      opt('brcaManaged', 'BRCA1/2 or Lynch syndrome, with risk-reducing surgery or recommended screening', 1.1, 0.003),
      opt('brca', 'BRCA1/2 or Lynch syndrome, without risk-reducing surgery or screening', 1.4, 0.002, { improvesTo: 'brcaManaged' }),
      opt('fhTreated', 'Familial hypercholesterolemia, on cholesterol-lowering treatment', 1.1, 0.005),
      opt('fh', 'Familial hypercholesterolemia, untreated', 1.6, 0.005, { improvesTo: 'fhTreated' }),
    ],
    advice: 'For BRCA carriers, preventive oophorectomy was associated with a 77% reduction in all-cause mortality (Finch 2014). In familial hypercholesterolemia, statin treatment brought heart-disease risk close to the general population’s (Versmissen 2008).',
  },
  {
    id: 'occupation',
    section: 'exposures',
    kind: 'excess',
    label: 'Occupational hazard',
    modifiable: false,
    cite: ['bls'],
    questions: [{ key: 'job', question: 'Which best describes your main job?', options: OCCUPATIONS.map(({ id, label }) => ({ id, label })) }],
    resolve(a) { return a.occupation && a.occupation.job ? a.occupation : null; },
    excessAt(v, { age }) {
      if (age >= 67) return 0;
      const o = OCCUPATIONS.find((x) => x.id === v.job);
      return o ? o.excess - AVG_OCC_EXCESS : 0;
    },
    describe(v) { const o = OCCUPATIONS.find((x) => x.id === v.job); return o ? o.label : ''; },
  },
  {
    id: 'hazards',
    section: 'exposures',
    kind: 'excess',
    label: 'Hazardous activities',
    modifiable: true,
    cite: ['uspa', 'denoble2008', 'aopa', 'nhtsaMoto'],
    questions: [{ key: 'items', type: 'checklist', question: 'Do you regularly do any of these? Tick all that apply.', options: HAZARD_ITEMS.map(({ id, label }) => ({ id, label })) }],
    resolve(a) { return a.hazards && a.hazards.answered ? a.hazards : null; },
    excessAt(v, { age }) {
      if (age >= 80) return 0;
      return HAZARD_ITEMS.reduce((s, h) => s + (v.items && v.items[h.id] ? h.excess : 0), 0);
    },
    describe(v) {
      const on = HAZARD_ITEMS.filter((h) => v.items && v.items[h.id]).map((h) => h.label.split(' (')[0]);
      return on.length ? on.join(', ') : 'None';
    },
    improve(v) { return HAZARD_ITEMS.some((h) => v.items && v.items[h.id]) ? { answered: true, items: {} } : null; },
    targetLabel: 'Stop, or reduce how often',
    advice: 'Each activity adds an accident risk that is independent of health. Annual fatality risks used: skydiving about 1 in 5,000 at 50 jumps a year (USPA); scuba about 1 in 6,000 divers (Denoble 2008); private flying about 1 in 1,250 at 80 hours a year (AOPA); motorcycling about 1 in 2,000 riders (NHTSA).',
  },
  {
    id: 'driving',
    section: 'exposures',
    kind: 'excess',
    label: 'Driving record and seat belt use',
    modifiable: true,
    cite: ['nhtsaOverview', 'gebers2003'],
    questions: [
      { key: 'record', question: 'Which best describes your driving record over the last 5 years?', options: [
        { id: 'nodrive', label: 'I don’t drive' },
        { id: 'clean', label: 'No moving violations or at-fault crashes' },
        { id: 'v1', label: '1 or 2 moving violations or an at-fault crash' },
        { id: 'v3', label: '3 or more violations, or a license suspension' },
        { id: 'dui', label: 'A DUI/DWI conviction' },
      ] },
      { key: 'belt', question: 'Do you always wear a seat belt, including as a passenger and on short trips?', options: [
        { id: 'always', label: 'Always' },
        { id: 'notalways', label: 'Not always' },
      ] },
    ],
    resolve(a) { return a.driving && (a.driving.record || a.driving.belt) ? a.driving : null; },
    excessAt(v, { age }) {
      const m = (DRIVING_RECORD[v.record] ?? 1) * (SEATBELT[v.belt] ?? 1);
      return motorVehicleBase(age) * (m - 1);
    },
    describe(v) {
      const r = { nodrive: 'Does not drive', clean: 'Clean record', v1: '1–2 violations', v3: '3+ violations or suspension', dui: 'DUI/DWI conviction' }[v.record] || 'Record not given';
      const b = { always: 'always belted', notalways: 'not always belted' }[v.belt] || 'belt use not given';
      return `${r}, ${b}`;
    },
    improve(v) {
      const better = { ...v };
      if (['v1', 'v3', 'dui'].includes(v.record)) better.record = 'clean';
      if (v.belt === 'notalways') better.belt = 'always';
      return better.record !== v.record || better.belt !== v.belt ? better : null;
    },
    targetLabel: 'Always belted, no violations or impaired driving',
    advice: 'Seat belts cut the risk of death in a crash by about 45% (NHTSA). Drivers with multiple convictions or a DUI have markedly higher future crash rates (Gebers & Peck 2003).',
  },
  {
    id: 'income',
    section: 'life',
    label: 'Household income',
    question: 'What is your total household income before taxes?',
    group: 'ses',
    attenuation: 0.3,
    modifiable: false,
    cite: ['chetty2016', 'lantz1998'],
    // Hazard ratios by household-income quintile, attenuated for health behaviors (Lantz 1998)
    // and consistent with the 10-15 year life-expectancy gradient in Chetty 2016.
    options: [
      opt('q1', 'Under $35,000', 1.5, 0.2),
      opt('q2', '$35,000 to $65,000', 1.2, 0.2),
      opt('q3', '$65,000 to $100,000', 1.0, 0.2),
      opt('q4', '$100,000 to $165,000', 0.9, 0.2),
      opt('q5', 'Over $165,000', 0.8, 0.2),
    ],
  },
  {
    id: 'education',
    section: 'life',
    label: 'Education',
    question: 'What is the highest level of education you have completed?',
    group: 'ses',
    attenuation: 0.3,
    modifiable: false,
    cite: ['krueger2015'],
    options: [
      opt('lths', 'Less than high school', 1.45, 0.1),
      opt('hs', 'High school diploma or GED', 1.3, 0.27),
      opt('some', 'Some college or associate degree', 1.15, 0.26),
      opt('ba', 'Bachelor’s degree or higher', 1.0, 0.37),
    ],
  },
  {
    id: 'marital',
    section: 'life',
    label: 'Marital status',
    question: 'What is your marital status?',
    group: 'psychosocial',
    attenuation: 0.2,
    modifiable: false,
    cite: ['roelfs2011', 'shor2012'],
    options: [
      opt('married', 'Married or living with a partner', 1.0, 0.53),
      opt('never', 'Never married', 1.24, 0.3),
      opt('divorced', 'Divorced or separated', 1.3, 0.11),
      opt('widowed', 'Widowed', 1.15, 0.06),
    ],
  },
  {
    id: 'selfRated',
    section: 'wellbeing',
    label: 'Self-rated health',
    question: 'In general, how would you rate your health?',
    group: 'conditions',
    attenuation: 0.2,
    modifiable: false,
    cite: ['desalvo2006'],
    options: [
      opt('excellent', 'Excellent', 1.0, 0.2),
      opt('vgood', 'Very good', 1.1, 0.32),
      opt('good', 'Good', 1.23, 0.3),
      opt('fair', 'Fair', 1.44, 0.13),
      opt('poor', 'Poor', 1.92, 0.05),
    ],
  },
);


// Fatty-liver stages: all-cause hazard ratios vs. matched general population (Simon 2021).
// Cirrhosis: annual mortality by clinical stage (D'Amico 2006: about 1-3% a year compensated,
// 20-57% a year once decompensated).
const LIVER = [
  { id: 'none', label: 'No', hr: 1 },
  { id: 'masld', label: 'Fatty liver (MASLD/NAFLD) without inflammation or scarring', hr: 1.71 },
  { id: 'mash', label: 'Fatty liver with inflammation (MASH/NASH), no significant scarring', hr: 2.14 },
  { id: 'fibrosis', label: 'Liver fibrosis (scarring) without cirrhosis, any cause', hr: 2.44 },
  { id: 'cirrhosis', label: 'Cirrhosis, compensated (no ascites, bleeding, confusion or jaundice)', excess: 0.022 },
  { id: 'decomp', label: 'Cirrhosis with complications (ascites, variceal bleeding, encephalopathy or jaundice)', excess: 0.3 },
];

/* ---------- Demographics: race/ethnicity and state ---------- */
// Age-specific hazard ratios calibrated so that, applied to the SSA baseline, they reproduce
// each group's published life expectancy relative to the U.S. total at each anchor age
// (NCHS U.S. Life Tables 2024, Table A; NCHS U.S. State Life Tables 2022, Tables A and B).
// These differences reflect social, economic and health-care conditions, not biology.
FACTORS.push(
  {
    id: 'race',
    section: 'life',
    label: 'Race and ethnicity',
    question: 'Which best describes your race or ethnicity? (Optional)',
    help: 'U.S. life expectancy differs by race and ethnicity because of differences in income, access to care, neighborhood, discrimination and other social conditions, not genetics. Insurers are not allowed to use race; it is included here because you asked for a fuller picture, and you can skip it.',
    group: 'ses',
    attenuation: 0,
    normalized: true,
    modifiable: false,
    cite: ['nchsLT2024'],
    options: [
      opt('white', 'White, non-Hispanic', null, 0, { anchors: [[20, 1.009], [40, 1.03], [50, 1.021], [65, 1.026], [75, 1.033], [85, 1.049]] }),
      opt('hispanic', 'Hispanic or Latino (any race)', null, 0, { anchors: [[20, 0.78], [40, 0.761], [50, 0.762], [65, 0.767], [75, 0.766], [85, 0.784]] }),
      opt('aian', 'American Indian or Alaska Native, non-Hispanic', null, 0, { anchors: [[20, 1.843], [40, 1.633], [50, 1.415], [65, 1.067], [75, 0.84], [85, 0.641]] }),
      opt('asian', 'Asian, non-Hispanic', null, 0, { anchors: [[20, 0.552], [40, 0.562], [50, 0.575], [65, 0.608], [75, 0.641], [85, 0.693]] }),
      opt('black', 'Black, non-Hispanic', null, 0, { anchors: [[20, 1.353], [40, 1.31], [50, 1.273], [65, 1.2], [75, 1.05], [85, 0.933]] }),
      opt('other', 'Another race, or more than one', null, 0, { anchors: [[20, 1], [85, 1]] }),
    ],
  },
  {
    id: 'state',
    section: 'life',
    ui: 'dropdown',
    label: 'State of residence',
    question: 'Which state do you live in?',
    help: 'Life expectancy at birth ranges from 72.2 years (West Virginia) to 80.0 (Hawaii).',
    group: 'ses',
    attenuation: 0,
    normalized: true,
    modifiable: false,
    cite: ['nchsState2022'],
    options: [
      opt("alabama", "Alabama", null, 0, { anchors: [[20, 1.38], [65, 1.278]] }),
      opt("alaska", "Alaska", null, 0, { anchors: [[20, 1.161], [65, 1.041]] }),
      opt("arizona", "Arizona", null, 0, { anchors: [[20, 1.073], [65, 1.014]] }),
      opt("arkansas", "Arkansas", null, 0, { anchors: [[20, 1.369], [65, 1.296]] }),
      opt("california", "California", null, 0, { anchors: [[20, 0.852], [65, 0.899]] }),
      opt("colorado", "Colorado", null, 0, { anchors: [[20, 0.915], [65, 0.935]] }),
      opt("connecticut", "Connecticut", null, 0, { anchors: [[20, 0.844], [65, 0.887]] }),
      opt("delaware", "Delaware", null, 0, { anchors: [[20, 1.092], [65, 1.014]] }),
      opt("district-of-columbia", "District of Columbia", null, 0, { anchors: [[20, 1.083], [65, 1.027]] }),
      opt("florida", "Florida", null, 0, { anchors: [[20, 0.965], [65, 0.935]] }),
      opt("georgia", "Georgia", null, 0, { anchors: [[20, 1.151], [65, 1.145]] }),
      opt("hawaii", "Hawaii", null, 0, { anchors: [[20, 0.799], [65, 0.809]] }),
      opt("idaho", "Idaho", null, 0, { anchors: [[20, 0.923], [65, 0.987]] }),
      opt("illinois", "Illinois", null, 0, { anchors: [[20, 1], [65, 1.027]] }),
      opt("indiana", "Indiana", null, 0, { anchors: [[20, 1.202], [65, 1.177]] }),
      opt("iowa", "Iowa", null, 0, { anchors: [[20, 0.965], [65, 1.027]] }),
      opt("kansas", "Kansas", null, 0, { anchors: [[20, 1.092], [65, 1.114]] }),
      opt("kentucky", "Kentucky", null, 0, { anchors: [[20, 1.404], [65, 1.332]] }),
      opt("louisiana", "Louisiana", null, 0, { anchors: [[20, 1.38], [65, 1.209]] }),
      opt("maine", "Maine", null, 0, { anchors: [[20, 1.083], [65, 1.027]] }),
      opt("maryland", "Maryland", null, 0, { anchors: [[20, 0.974], [65, 0.987]] }),
      opt("massachusetts", "Massachusetts", null, 0, { anchors: [[20, 0.814], [65, 0.899]] }),
      opt("michigan", "Michigan", null, 0, { anchors: [[20, 1.064], [65, 1.07]] }),
      opt("minnesota", "Minnesota", null, 0, { anchors: [[20, 0.852], [65, 0.911]] }),
      opt("mississippi", "Mississippi", null, 0, { anchors: [[20, 1.529], [65, 1.351]] }),
      opt("missouri", "Missouri", null, 0, { anchors: [[20, 1.223], [65, 1.161]] }),
      opt("montana", "Montana", null, 0, { anchors: [[20, 1.018], [65, 0.974]] }),
      opt("nebraska", "Nebraska", null, 0, { anchors: [[20, 0.931], [65, 1]] }),
      opt("nevada", "Nevada", null, 0, { anchors: [[20, 1.102], [65, 1.145]] }),
      opt("new-hampshire", "New Hampshire", null, 0, { anchors: [[20, 0.899], [65, 0.974]] }),
      opt("new-jersey", "New Jersey", null, 0, { anchors: [[20, 0.829], [65, 0.911]] }),
      opt("new-mexico", "New Mexico", null, 0, { anchors: [[20, 1.3], [65, 1.027]] }),
      opt("new-york", "New York", null, 0, { anchors: [[20, 0.836], [65, 0.887]] }),
      opt("north-carolina", "North Carolina", null, 0, { anchors: [[20, 1.151], [65, 1.114]] }),
      opt("north-dakota", "North Dakota", null, 0, { anchors: [[20, 0.965], [65, 0.923]] }),
      opt("ohio", "Ohio", null, 0, { anchors: [[20, 1.182], [65, 1.161]] }),
      opt("oklahoma", "Oklahoma", null, 0, { anchors: [[20, 1.38], [65, 1.332]] }),
      opt("oregon", "Oregon", null, 0, { anchors: [[20, 0.982], [65, 1.014]] }),
      opt("pennsylvania", "Pennsylvania", null, 0, { anchors: [[20, 1.018], [65, 1.027]] }),
      opt("rhode-island", "Rhode Island", null, 0, { anchors: [[20, 0.859], [65, 0.935]] }),
      opt("south-carolina", "South Carolina", null, 0, { anchors: [[20, 1.234], [65, 1.129]] }),
      opt("south-dakota", "South Dakota", null, 0, { anchors: [[20, 1.018], [65, 0.935]] }),
      opt("tennessee", "Tennessee", null, 0, { anchors: [[20, 1.38], [65, 1.26]] }),
      opt("texas", "Texas", null, 0, { anchors: [[20, 1.036], [65, 1.084]] }),
      opt("utah", "Utah", null, 0, { anchors: [[20, 0.875], [65, 0.987]] }),
      opt("vermont", "Vermont", null, 0, { anchors: [[20, 0.931], [65, 0.923]] }),
      opt("virginia", "Virginia", null, 0, { anchors: [[20, 1], [65, 1.055]] }),
      opt("washington", "Washington", null, 0, { anchors: [[20, 0.923], [65, 0.974]] }),
      opt("west-virginia", "West Virginia", null, 0, { anchors: [[20, 1.581], [65, 1.37]] }),
      opt("wisconsin", "Wisconsin", null, 0, { anchors: [[20, 0.948], [65, 0.974]] }),
      opt("wyoming", "Wyoming", null, 0, { anchors: [[20, 1.064], [65, 1.055]] }),
    ],
  },
  {
    id: 'dementia',
    section: 'history',
    label: 'Dementia',
    question: 'Have you been diagnosed with dementia (including Alzheimer\u2019s disease)?',
    group: 'conditions',
    attenuation: 0,
    modifiable: false,
    cite: ['brodaty2012'],
    options: [
      opt('no', 'No', 1.0, 0.975),
      opt('mild', 'Yes, mild (living mostly independently)', 2.5, 0.015),
      opt('severe', 'Yes, moderate or severe (needs daily help)', 4.5, 0.01),
    ],
  },
  {
    id: 'liver',
    section: 'history',
    kind: 'excess',
    label: 'Liver disease',
    modifiable: false,
    cite: ['simon2021', 'damico2006'],
    questions: [{ key: 'status', question: 'Have you been diagnosed with liver disease?', options: LIVER.map(({ id, label }) => ({ id, label })) }],
    resolve(a) { return a.liver && a.liver.status ? a.liver : null; },
    excessAt(v, { baseMu }) {
      const o = LIVER.find((x) => x.id === v.status);
      if (!o) return 0;
      return o.hr != null ? (o.hr - 1) * baseMu : o.excess;
    },
    describe(v) { const o = LIVER.find((x) => x.id === v.status); return o ? o.label : ''; },
  },
);

FACTORS.push(sleepApneaFactor, conditionsFactor, familyHistoryFactor);

export const FACTOR_BY_ID = Object.fromEntries(FACTORS.map((f) => [f.id, f]));

// Extra option used only for "what if" scenarios (not shown in the questionnaire).
FACTOR_BY_ID.smoking.scenarioOptions = [opt('quitNow', 'Quit smoking now', null, 0)];

export function computeBMI(body) {
  if (!body) return null;
  let cm, kg;
  if (body.units === 'metric') {
    cm = Number(body.heightCm);
    kg = Number(body.weightKg);
  } else {
    const ft = Number(body.heightFt) || 0;
    const inch = Number(body.heightIn) || 0;
    cm = (ft * 12 + inch) * 2.54;
    kg = Number(body.weightLb) * 0.45359237;
  }
  if (!(cm > 90 && cm < 250 && kg > 25 && kg < 400)) return null;
  return kg / (cm / 100) ** 2;
}

// Leisure-time MET-hours per week. 150 moderate minutes = 7.5 MET-h (Arem 2015 convention).
export function metHours(act) {
  if (!act || (act.moderateMin === '' && act.vigorousMin === '') || (act.moderateMin == null && act.vigorousMin == null)) return null;
  const mod = Math.max(0, Number(act.moderateMin) || 0);
  const vig = Math.max(0, Number(act.vigorousMin) || 0);
  return (mod * 3 + vig * 6) / 60;
}
