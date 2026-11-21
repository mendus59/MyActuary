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
  { id: 'habits', title: 'Tobacco and alcohol', blurb: 'Two of the largest modifiable drivers of adult mortality.' },
  { id: 'activity', title: 'Activity, sleep and diet', blurb: 'Typical week over the last few months.' },
  { id: 'clinical', title: 'Clinical measures', blurb: 'From your most recent check-up. Choose "I don’t know" if unsure; the model then assumes the population average.' },
  { id: 'history', title: 'Medical and family history', blurb: 'Diagnosed conditions and parental history.' },
  { id: 'wellbeing', title: 'Social and mental wellbeing', blurb: 'Social connection and mood have measurable effects on survival.' },
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
    section: 'history',
    label: 'Parental longevity',
    question: 'Which best describes your biological parents?',
    group: 'family',
    attenuation: 0,
    modifiable: false,
    cite: ['atkins2016', 'lloydjones2004'],
    options: [
      opt('long', 'At least one parent lived to 90 or older', 0.85, 0.2),
      opt('typical', 'Neither reached 90, and neither died of heart disease or stroke before 60', 1.0, 0.65),
      opt('early', 'A parent died of heart disease or stroke before age 60', 1.25, 0.15),
    ],
  },
  {
    id: 'social',
    section: 'wellbeing',
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
