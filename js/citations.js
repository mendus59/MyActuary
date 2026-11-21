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
  seer: {
    short: 'NCI SEER Cancer Stat Facts',
    full: 'National Cancer Institute, Surveillance, Epidemiology, and End Results (SEER) Program. Cancer Stat Facts: 5-year relative survival by stage at diagnosis (SEER 22, 2014–2020).',
    url: 'https://seer.cancer.gov/statfacts/',
  },
  jones2019: {
    short: 'Jones et al., Eur J Heart Fail 2019',
    full: 'Jones NR, Roalfe AK, Adoki I, Hobbs FDR, Taylor CJ. Survival of patients with chronic heart failure in the community: a systematic review and meta-analysis. Eur J Heart Fail. 2019;21(11):1306-1325.',
    doi: '10.1002/ejhf.1594',
  },
  mannino2003: {
    short: 'Mannino et al., Thorax 2003',
    full: 'Mannino DM, Buist AS, Petty TL, Enright PL, Redd SC. Lung function and mortality in the United States: data from the First National Health and Nutrition Examination Survey follow up study. Thorax. 2003;58(5):388-393.',
    doi: '10.1136/thorax.58.5.388',
  },
  marcus2020: {
    short: 'Marcus et al., JAMA Netw Open 2020',
    full: 'Marcus JL, Leyden WA, Alexeeff SE, et al. Comparison of overall and comorbidity-free life expectancy between insured adults with and without HIV infection, 2000-2016. JAMA Netw Open. 2020;3(6):e207954.',
    doi: '10.1001/jamanetworkopen.2020.7954',
  },
  finch2014: {
    short: 'Finch et al., J Clin Oncol 2014',
    full: 'Finch APM, Lubinski J, Møller P, et al. Impact of oophorectomy on cancer incidence and mortality in women with a BRCA1 or BRCA2 mutation. J Clin Oncol. 2014;32(15):1547-1553.',
    doi: '10.1200/JCO.2013.53.2820',
  },
  versmissen2008: {
    short: 'Versmissen et al., BMJ 2008',
    full: 'Versmissen J, Oosterveer DM, Yazdanpanah M, et al. Efficacy of statins in familial hypercholesterolaemia: a long term cohort study. BMJ. 2008;337:a2423.',
    doi: '10.1136/bmj.a2423',
  },
  desalvo2006: {
    short: 'DeSalvo et al., J Gen Intern Med 2006',
    full: 'DeSalvo KB, Bloser N, Reynolds K, He J, Muntner P. Mortality prediction with a single general self-rated health question: a meta-analysis. J Gen Intern Med. 2006;21(3):267-275.',
    doi: '10.1111/j.1525-1497.2005.00291.x',
  },
  chetty2016: {
    short: 'Chetty et al., JAMA 2016',
    full: 'Chetty R, Stepner M, Abraham S, et al. The association between income and life expectancy in the United States, 2001-2014. JAMA. 2016;315(16):1750-1766.',
    doi: '10.1001/jama.2016.4226',
  },
  lantz1998: {
    short: 'Lantz et al., JAMA 1998',
    full: 'Lantz PM, House JS, Lepkowski JM, Williams DR, Mero RP, Chen J. Socioeconomic factors, health behaviors, and mortality: results from a nationally representative prospective study of US adults. JAMA. 1998;279(21):1703-1708.',
    doi: '10.1001/jama.279.21.1703',
  },
  krueger2015: {
    short: 'Krueger et al., PLoS One 2015',
    full: 'Krueger PM, Tran MK, Hummer RA, Chang VW. Mortality attributable to low levels of education in the United States. PLoS One. 2015;10(7):e0131809.',
    doi: '10.1371/journal.pone.0131809',
  },
  roelfs2011: {
    short: 'Roelfs et al., Am J Epidemiol 2011',
    full: 'Roelfs DJ, Shor E, Kalish R, Yogev T. The rising relative risk of mortality for singles: meta-analysis and meta-regression. Am J Epidemiol. 2011;174(4):379-389.',
    doi: '10.1093/aje/kwr111',
  },
  shor2012: {
    short: 'Shor et al., Soc Sci Med 2012',
    full: 'Shor E, Roelfs DJ, Bugyi P, Schwartz JE. Meta-analysis of marital dissolution and mortality: reevaluating the intersection of gender and age. Soc Sci Med. 2012;75(1):46-59.',
    doi: '10.1016/j.socscimed.2012.03.003',
  },
  bls: {
    short: 'BLS Census of Fatal Occupational Injuries',
    full: 'U.S. Bureau of Labor Statistics. Census of Fatal Occupational Injuries: fatal work injury rates per 100,000 full-time equivalent workers by occupation (2023).',
    url: 'https://www.bls.gov/iif/fatal-injuries-tables.htm',
  },
  uspa: {
    short: 'U.S. Parachute Association safety data',
    full: 'United States Parachute Association. Skydiving safety: annual U.S. fatality counts and rate per 100,000 jumps.',
    url: 'https://www.uspa.org/skydiving-safety',
  },
  denoble2008: {
    short: 'Denoble et al., Diving Hyperb Med 2008',
    full: 'Denoble PJ, Pollock NW, Vaithiyanathan P, Caruso JL, Dovenbarger JA, Vann RD. Scuba injury death rate among insured DAN members. Diving Hyperb Med. 2008;38(4):182-188.',
  },
  aopa: {
    short: 'AOPA Air Safety Institute, McSpadden (Nall) Report',
    full: 'AOPA Air Safety Institute. Richard G. McSpadden Report (formerly the Joseph T. Nall Report): U.S. general aviation fatal accident rates per 100,000 flight hours.',
    url: 'https://www.aopa.org/training-and-safety/air-safety-institute/accident-analysis/mcspadden-report',
  },
  nhtsaMoto: {
    short: 'NHTSA Traffic Safety Facts: Motorcycles',
    full: 'National Highway Traffic Safety Administration. Traffic Safety Facts: Motorcycles (2022 data). Per vehicle mile traveled, motorcyclists are far more likely than passenger-car occupants to die in a crash.',
    url: 'https://crashstats.nhtsa.dot.gov/',
  },
  nhtsaOverview: {
    short: 'NHTSA Traffic Safety Facts: Overview 2022',
    full: 'National Highway Traffic Safety Administration. Overview of Motor Vehicle Traffic Crashes in 2022 (about 42,500 deaths; roughly 13 per 100,000 population). Lap/shoulder belts reduce the risk of fatal injury to front-seat passenger-car occupants by 45%.',
    url: 'https://www.nhtsa.gov/vehicle-safety/seat-belts',
  },
  gebers2003: {
    short: 'Gebers & Peck, Accid Anal Prev 2003',
    full: 'Gebers MA, Peck RC. Using traffic conviction correlates to identify high accident-risk drivers. Accid Anal Prev. 2003;35(6):903-912.',
  },
  larney2020: {
    short: 'Larney et al., JAMA Psychiatry 2020',
    full: 'Larney S, Tran LT, Leung J, et al. All-cause and cause-specific mortality among people using extramedical opioids: a systematic review and meta-analysis. JAMA Psychiatry. 2020;77(5):493-502.',
    doi: '10.1001/jamapsychiatry.2019.4170',
  },
  nchsLT2024: {
    short: 'NCHS, U.S. Life Tables 2024',
    full: 'National Center for Health Statistics. United States Life Tables, 2024. National Vital Statistics Reports. 2026;75(5). Life expectancy by age, Hispanic origin and race (Table A).',
    url: 'https://www.cdc.gov/nchs/data/nvsr/nvsr75/nvsr75-05.pdf',
  },
  nchsState2022: {
    short: 'NCHS, U.S. State Life Tables 2022',
    full: 'Arias E, Xu J, Tejada-Vera B, Bastian B. U.S. State Life Tables, 2022. National Vital Statistics Reports. 2025;74(12). Life expectancy at birth and at age 65 by state (Tables A and B).',
    url: 'https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-12.pdf',
  },
  simon2021: {
    short: 'Simon et al., Gut 2021',
    full: 'Simon TG, Roelstraete B, Khalili H, Hagstr\u00f6m H, Ludvigsson JF. Mortality in biopsy-confirmed nonalcoholic fatty liver disease: results from a nationwide cohort. Gut. 2021;70(7):1375-1382.',
    doi: '10.1136/gutjnl-2020-322786',
  },
  damico2006: {
    short: 'D\u2019Amico et al., J Hepatol 2006',
    full: 'D\u2019Amico G, Garcia-Tsao G, Pagliaro L. Natural history and prognostic indicators of survival in cirrhosis: a systematic review of 118 studies. J Hepatol. 2006;44(1):217-231.',
    doi: '10.1016/j.jhep.2005.10.013',
  },
  brodaty2012: {
    short: 'Brodaty et al., Int Psychogeriatr 2012',
    full: 'Brodaty H, Seeher K, Gibson L. Dementia time to death: a systematic literature review on survival time and years of life lost in people with dementia. Int Psychogeriatr. 2012;24(7):1034-1045.',
    doi: '10.1017/S1041610211002924',
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
