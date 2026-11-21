// Bibliography. Every relative risk used by the model points at one or more of these.
export const CITATIONS = {
  ssa2023: {
    short: 'SSA OCACT, 2023 Period Life Table',
    full: 'Social Security Administration, Office of the Chief Actuary. Actuarial Life Table: 2023 period life table for the Social Security area population, as used in the 2026 Trustees Report.',
    url: 'https://www.ssa.gov/oact/STATS/table4c6.html',
  },
  ssaTR: {
    short: 'SSA Trustees Report 2026',
    full: 'Board of Trustees, Federal OASDI Trust Funds. 2026 Annual Report, intermediate assumptions for future reductions in age-sex-adjusted death rates (long-range average roughly 0.7% per year).',
    url: 'https://www.ssa.gov/oact/TR/',
  },
  jha2013: {
    short: 'Jha et al., NEJM 2013',
    full: 'Jha P, Ramasundarahettige C, Landsman V, et al. 21st-century hazards of smoking and benefits of cessation in the United States. N Engl J Med. 2013;368(4):341-350.',
    doi: '10.1056/NEJMsa1211128',
  },
  carter2015: {
    short: 'Carter et al., NEJM 2015',
    full: 'Carter BD, Abnet CC, Feskanich D, et al. Smoking and mortality: beyond established causes. N Engl J Med. 2015;372(7):631-640.',
    doi: '10.1056/NEJMsa1407211',
  },
  thun2013: {
    short: 'Thun et al., NEJM 2013',
    full: 'Thun MJ, Carter BD, Feskanich D, et al. 50-year trends in smoking-related mortality in the United States. N Engl J Med. 2013;368(4):351-364.',
    doi: '10.1056/NEJMsa1211127',
  },
  gbmc2016: {
    short: 'Global BMI Mortality Collaboration, Lancet 2016',
    full: 'Global BMI Mortality Collaboration. Body-mass index and all-cause mortality: individual-participant-data meta-analysis of 239 prospective studies in four continents. Lancet. 2016;388(10046):776-786.',
    doi: '10.1016/S0140-6736(16)30175-1',
  },
  arem2015: {
    short: 'Arem et al., JAMA Intern Med 2015',
    full: 'Arem H, Moore SC, Patel A, et al. Leisure time physical activity and mortality: a detailed pooled analysis of the dose-response relationship. JAMA Intern Med. 2015;175(6):959-967.',
    doi: '10.1001/jamainternmed.2015.0533',
  },
  momma2022: {
    short: 'Momma et al., Br J Sports Med 2022',
    full: 'Momma H, Kawakami R, Honda T, Sawada SS. Muscle-strengthening activities are associated with lower risk and mortality in major non-communicable diseases: a systematic review and meta-analysis of cohort studies. Br J Sports Med. 2022;56(13):755-763.',
    doi: '10.1136/bjsports-2021-105061',
  },
  wood2018: {
    short: 'Wood et al., Lancet 2018',
    full: 'Wood AM, Kaptoge S, Butterworth AS, et al. Risk thresholds for alcohol consumption: combined analysis of individual-participant data for 599 912 current drinkers in 83 prospective studies. Lancet. 2018;391(10129):1513-1523.',
    doi: '10.1016/S0140-6736(18)30134-X',
  },
  zhao2023: {
    short: 'Zhao et al., JAMA Netw Open 2023',
    full: 'Zhao J, Stockwell T, Naimi T, et al. Association between daily alcohol intake and risk of all-cause mortality: a systematic review and meta-analyses. JAMA Netw Open. 2023;6(3):e236185.',
    doi: '10.1001/jamanetworkopen.2023.6185',
  },
  sofi2010: {
    short: 'Sofi et al., Am J Clin Nutr 2010',
    full: 'Sofi F, Abbate R, Gensini GF, Casini A. Accruing evidence on benefits of adherence to the Mediterranean diet on health: an updated systematic review and meta-analysis. Am J Clin Nutr. 2010;92(5):1189-1196.',
    doi: '10.3945/ajcn.2010.29673',
  },
  cappuccio2010: {
    short: 'Cappuccio et al., Sleep 2010',
    full: "Cappuccio FP, D'Elia L, Strazzullo P, Miller MA. Sleep duration and all-cause mortality: a systematic review and meta-analysis of prospective studies. Sleep. 2010;33(5):585-592.",
    doi: '10.1093/sleep/33.5.585',
  },
  lewington2002: {
    short: 'Prospective Studies Collaboration, Lancet 2002',
    full: 'Lewington S, Clarke R, Qizilbash N, Peto R, Collins R; Prospective Studies Collaboration. Age-specific relevance of usual blood pressure to vascular mortality: a meta-analysis of individual data for one million adults in 61 prospective studies. Lancet. 2002;360(9349):1903-1913.',
    doi: '10.1016/S0140-6736(02)11911-8',
  },
  ettehad2016: {
    short: 'Ettehad et al., Lancet 2016',
    full: 'Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. Lancet. 2016;387(10022):957-967.',
    doi: '10.1016/S0140-6736(15)01225-8',
  },
  erfc2011: {
    short: 'Emerging Risk Factors Collaboration, NEJM 2011',
    full: 'Emerging Risk Factors Collaboration. Diabetes mellitus, fasting glucose, and risk of cause-specific death. N Engl J Med. 2011;364(9):829-841.',
    doi: '10.1056/NEJMoa1008862',
  },
  cai2020: {
    short: 'Cai et al., BMJ 2020',
    full: 'Cai X, Zhang Y, Li M, et al. Association between prediabetes and risk of all cause mortality and cardiovascular disease: updated meta-analysis. BMJ. 2020;370:m2297.',
    doi: '10.1136/bmj.m2297',
  },
  ctt2010: {
    short: 'Cholesterol Treatment Trialists, Lancet 2010',
    full: "Cholesterol Treatment Trialists' (CTT) Collaboration. Efficacy and safety of more intensive lowering of LDL cholesterol: a meta-analysis of data from 170 000 participants in 26 randomised trials. Lancet. 2010;376(9753):1670-1681.",
    doi: '10.1016/S0140-6736(10)61350-5',
  },
  holtlunstad2015: {
    short: 'Holt-Lunstad et al., Perspect Psychol Sci 2015',
    full: 'Holt-Lunstad J, Smith TB, Baker M, Harris T, Stephenson D. Loneliness and social isolation as risk factors for mortality: a meta-analytic review. Perspect Psychol Sci. 2015;10(2):227-237.',
    doi: '10.1177/1745691614568352',
  },
  cuijpers2014: {
    short: 'Cuijpers et al., Am J Psychiatry 2014',
    full: 'Cuijpers P, Vogelzangs N, Twisk J, et al. Comprehensive meta-analysis of excess mortality in depression in the general community versus patients with specific illnesses. Am J Psychiatry. 2014;171(4):453-462.',
    doi: '10.1176/appi.ajp.2013.13030325',
  },
  erfc2015: {
    short: 'Emerging Risk Factors Collaboration, JAMA 2015',
    full: 'Emerging Risk Factors Collaboration. Association of cardiometabolic multimorbidity with mortality. JAMA. 2015;314(1):52-60.',
    doi: '10.1001/jama.2015.7008',
  },
  ckdpc2010: {
    short: 'CKD Prognosis Consortium, Lancet 2010',
    full: 'Chronic Kidney Disease Prognosis Consortium. Association of estimated glomerular filtration rate and albuminuria with all-cause and cardiovascular mortality in general population cohorts: a collaborative meta-analysis. Lancet. 2010;375(9731):2073-2081.',
    doi: '10.1016/S0140-6736(10)60674-5',
  },
  odutayo2016: {
    short: 'Odutayo et al., BMJ 2016',
    full: 'Odutayo A, Wong CX, Hsiao AJ, et al. Atrial fibrillation and risks of cardiovascular disease, renal disease, and death: systematic review and meta-analysis. BMJ. 2016;354:i4482.',
    doi: '10.1136/bmj.i4482',
  },
  atkins2016: {
    short: 'Atkins et al., J Am Coll Cardiol 2016',
    full: 'Atkins JL, Pilling LC, Masoli JAH, et al. Longer-lived parents and cardiovascular outcomes: 8-year follow-up in 186,000 U.K. Biobank participants. J Am Coll Cardiol. 2016;68(8):874-875.',
  },
  lloydjones2004: {
    short: 'Lloyd-Jones et al., JAMA 2004',
    full: 'Lloyd-Jones DM, Nam BH, D’Agostino RB Sr, et al. Parental cardiovascular disease as a risk factor for cardiovascular disease in middle-aged adults: a prospective study of parents and offspring. JAMA. 2004;291(18):2204-2211.',
    doi: '10.1001/jama.291.18.2204',
  },
  nhanes: {
    short: 'CDC NCHS (NHANES / NHIS)',
    full: 'Centers for Disease Control and Prevention, National Center for Health Statistics. National Health and Nutrition Examination Survey (2017–March 2020) and National Health Interview Survey. Used for approximate U.S. adult prevalence of each risk level, which anchors the baseline table to the average population.',
    url: 'https://www.cdc.gov/nchs/',
  },
};

export const citationOrder = Object.keys(CITATIONS);

export function citationLink(id) {
  const c = CITATIONS[id];
  if (!c) return null;
  if (c.doi) return `https://doi.org/${c.doi}`;
  return c.url || null;
}
