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
  punjabi2009: {
    short: 'Punjabi et al., PLoS Med 2009',
    full: 'Punjabi NM, Caffo BS, Goodwin JL, et al. Sleep-disordered breathing and mortality: a prospective cohort study. PLoS Med. 2009;6(8):e1000132.',
    doi: '10.1371/journal.pmed.1000132',
  },
  marin2005: {
    short: 'Marin et al., Lancet 2005',
    full: 'Marin JM, Carrizo SJ, Vicente E, Agusti AGN. Long-term cardiovascular outcomes in men with obstructive sleep apnoea-hypopnoea with or without treatment with continuous positive airway pressure: an observational study. Lancet. 2005;365(9464):1046-1053.',
    doi: '10.1016/S0140-6736(05)71141-7',
  },
  ley2011: {
    short: 'Ley et al., Am J Respir Crit Care Med 2011',
    full: 'Ley B, Collard HR, King TE Jr. Clinical course and prediction of survival in idiopathic pulmonary fibrosis. Am J Respir Crit Care Med. 2011;183(4):431-440.',
    doi: '10.1164/rccm.201006-0894CI',
  },
  thurman2017: {
    short: 'Thurman et al., Epilepsia 2017',
    full: 'Thurman DJ, Logroscino G, Beghi E, et al. The burden of premature mortality of epilepsy in high-income countries: a systematic review from the Mortality Task Force of the International League Against Epilepsy. Epilepsia. 2017;58(1):17-26.',
  },
  macleod2014: {
    short: 'Macleod et al., Mov Disord 2014',
    full: 'Macleod AD, Taylor KSM, Counsell CE. Mortality in Parkinson’s disease: a systematic review and meta-analysis. Mov Disord. 2014;29(13):1615-1622.',
    doi: '10.1002/mds.25898',
  },
  lunde2017: {
    short: 'Lunde et al., J Neurol Neurosurg Psychiatry 2017',
    full: 'Lunde HMB, Assmus J, Myhr KM, Bø L, Grytten N. Survival and cause of death in multiple sclerosis: a 60-year longitudinal population study. J Neurol Neurosurg Psychiatry. 2017;88(8):621-625.',
    doi: '10.1136/jnnp-2016-315238',
  },
  abic2008: {
    short: 'Ankle Brachial Index Collaboration, JAMA 2008',
    full: 'Ankle Brachial Index Collaboration. Ankle brachial index combined with Framingham Risk Score to predict cardiovascular events and mortality: a meta-analysis. JAMA. 2008;300(2):197-208.',
    doi: '10.1001/jama.300.2.197',
  },
  usrds: {
    short: 'USRDS Annual Data Report',
    full: 'United States Renal Data System. Annual Data Report: Epidemiology of Kidney Disease in the United States. National Institutes of Health, NIDDK. Survival after initiation of dialysis and after kidney transplantation.',
    url: 'https://usrds-adr.niddk.nih.gov/',
  },
  bewtra2013: {
    short: 'Bewtra et al., Inflamm Bowel Dis 2013',
    full: 'Bewtra M, Kaiser LM, TenHave T, Lewis JD. Crohn’s disease and ulcerative colitis are associated with elevated standardized mortality ratios: a meta-analysis. Inflamm Bowel Dis. 2013;19(3):599-613.',
  },
  dadoun2013: {
    short: 'Dadoun et al., Joint Bone Spine 2013',
    full: 'Dadoun S, Zeboulon-Ktorza N, Combescure C, et al. Mortality in rheumatoid arthritis over the last fifty years: systematic review and meta-analysis. Joint Bone Spine. 2013;80(1):29-33.',
    doi: '10.1016/j.jbspin.2012.02.005',
  },
  yurkovich2014: {
    short: 'Yurkovich et al., Arthritis Care Res 2014',
    full: 'Yurkovich M, Vostretsova K, Chen W, Aviña-Zubieta JA. Overall and cause-specific mortality in patients with systemic lupus erythematosus: a meta-analysis of observational studies. Arthritis Care Res. 2014;66(4):608-616.',
    doi: '10.1002/acr.22173',
  },
  gelfand2007: {
    short: 'Gelfand et al., Arch Dermatol 2007',
    full: 'Gelfand JM, Troxel AB, Lewis JD, et al. The risk of mortality in patients with psoriasis: results from a population-based study. Arch Dermatol. 2007;143(12):1493-1499.',
    doi: '10.1001/archderm.143.12.1493',
  },
  haentjens2010: {
    short: 'Haentjens et al., Ann Intern Med 2010',
    full: 'Haentjens P, Magaziner J, Colón-Emeric CS, et al. Meta-analysis: excess mortality after hip fracture among older women and men. Ann Intern Med. 2010;152(6):380-390.',
    doi: '10.7326/0003-4819-152-6-201003160-00008',
  },
  lebwohl2020: {
    short: 'Lebwohl et al., JAMA 2020',
    full: 'Lebwohl B, Green PHR, Söderling J, Roelstraete B, Ludvigsson JF. Association between celiac disease and mortality risk in a Swedish population. JAMA. 2020;323(13):1277-1285.',
    doi: '10.1001/jama.2020.1943',
  },
  nuesch2011: {
    short: 'Nüesch et al., BMJ 2011',
    full: 'Nüesch E, Dieppe P, Reichenbach S, et al. All cause and disease specific mortality in patients with knee or hip osteoarthritis: population based cohort study. BMJ. 2011;342:d1165.',
    doi: '10.1136/bmj.d1165',
  },
  arcelus2011: {
    short: 'Arcelus et al., Arch Gen Psychiatry 2011',
    full: 'Arcelus J, Mitchell AJ, Wales J, Nielsen S. Mortality rates in patients with anorexia nervosa and other eating disorders: a meta-analysis of 36 studies. Arch Gen Psychiatry. 2011;68(7):724-731.',
    doi: '10.1001/archgenpsychiatry.2011.74',
  },
  dalsgaard2015: {
    short: 'Dalsgaard et al., Lancet 2015',
    full: 'Dalsgaard S, Østergaard SD, Leckman JF, Mortensen PB, Pedersen MG. Mortality in children, adolescents, and adults with attention deficit hyperactivity disorder: a nationwide cohort study. Lancet. 2015;385(9983):2190-2196.',
    doi: '10.1016/S0140-6736(14)61684-6',
  },
  walker2015: {
    short: 'Walker et al., JAMA Psychiatry 2015',
    full: 'Walker ER, McGee RE, Druss BG. Mortality in mental disorders and global disease burden implications: a systematic review and meta-analysis. JAMA Psychiatry. 2015;72(4):334-341.',
    doi: '10.1001/jamapsychiatry.2014.2502',
  },
  kicinski2011: {
    short: 'Kicinski et al., PLoS One 2011',
    full: 'Kicinski M, Vangronsveld J, Nawrot TS. An epidemiological reappraisal of the familial aggregation of prostate cancer: a meta-analysis. PLoS One. 2011;6(10):e27130.',
    doi: '10.1371/journal.pone.0027130',
  },
  cghfbc2001: {
    short: 'Collaborative Group on Hormonal Factors in Breast Cancer, Lancet 2001',
    full: 'Collaborative Group on Hormonal Factors in Breast Cancer. Familial breast cancer: collaborative reanalysis of individual data from 52 epidemiological studies including 58 209 women with breast cancer and 101 986 women without the disease. Lancet. 2001;358(9291):1389-1399.',
    doi: '10.1016/S0140-6736(01)06524-2',
  },
  stratton1998: {
    short: 'Stratton et al., BJOG 1998',
    full: 'Stratton JF, Pharoah P, Smith SK, Easton D, Ponder BA. A systematic review and meta-analysis of family history and risk of ovarian cancer. Br J Obstet Gynaecol. 1998;105(5):493-499.',
  },
  butterworth2006: {
    short: 'Butterworth et al., Eur J Cancer 2006',
    full: 'Butterworth AS, Higgins JPT, Pharoah P. Relative and absolute risk of colorectal cancer for individuals with a family history: a meta-analysis. Eur J Cancer. 2006;42(2):216-227.',
    doi: '10.1016/j.ejca.2005.09.023',
  },
  matakidou2005: {
    short: 'Matakidou et al., Br J Cancer 2005',
    full: 'Matakidou A, Eisen T, Houlston RS. Systematic review of the relationship between family history and lung cancer risk. Br J Cancer. 2005;93(7):825-833.',
    doi: '10.1038/sj.bjc.6602769',
  },
  permuthwey2009: {
    short: 'Permuth-Wey & Egan, Fam Cancer 2009',
    full: 'Permuth-Wey J, Egan KM. Family history is a significant risk factor for pancreatic cancer: results from a systematic review and meta-analysis. Fam Cancer. 2009;8(2):109-117.',
    doi: '10.1007/s10689-008-9214-8',
  },
  gandini2005: {
    short: 'Gandini et al., Eur J Cancer 2005',
    full: 'Gandini S, Sera F, Cattaruzza MS, et al. Meta-analysis of risk factors for cutaneous melanoma: III. Family history, actinic damage and phenotypic factors. Eur J Cancer. 2005;41(14):2040-2059.',
    doi: '10.1016/j.ejca.2005.03.034',
  },
  kharazmi2012: {
    short: 'Kharazmi et al., BMJ 2012',
    full: 'Kharazmi E, Fallah M, Sundquist K, Hemminki K. Familial risk of early and late onset cancer: nationwide prospective cohort study. BMJ. 2012;345:e8076.',
    doi: '10.1136/bmj.e8076',
  },
  murabito2005: {
    short: 'Murabito et al., JAMA 2005',
    full: 'Murabito JM, Pencina MJ, Nam BH, et al. Sibling cardiovascular disease as a risk factor for cardiovascular disease in middle-aged adults. JAMA. 2005;294(24):3117-3123.',
    doi: '10.1001/jama.294.24.3117',
  },
  friedlander1998: {
    short: 'Friedlander et al., Circulation 1998',
    full: 'Friedlander Y, Siscovick DS, Weinmann S, et al. Family history as a risk factor for primary cardiac arrest. Circulation. 1998;97(2):155-160.',
    doi: '10.1161/01.CIR.97.2.155',
  },
  seshadri2010: {
    short: 'Seshadri et al., Circulation 2010',
    full: 'Seshadri S, Beiser A, Pikula A, et al. Parental occurrence of stroke and risk of stroke in their children: the Framingham study. Circulation. 2010;121(11):1304-1312.',
    doi: '10.1161/CIRCULATIONAHA.109.854240',
  },
  interact2013: {
    short: 'InterAct Consortium, Diabetologia 2013',
    full: 'InterAct Consortium. The link between family history and risk of type 2 diabetes is not explained by anthropometric, lifestyle or genetic risk factors: the EPIC-InterAct study. Diabetologia. 2013;56(1):60-69.',
    doi: '10.1007/s00125-012-2715-x',
  },
  loy2014: {
    short: 'Loy et al., Lancet 2014',
    full: 'Loy CT, Schofield PR, Turner AM, Kwok JBJ. Genetics of dementia. Lancet. 2014;383(9919):828-840.',
    doi: '10.1016/S0140-6736(13)60630-3',
  },
  cdcWonder: {
    short: 'CDC WONDER, Underlying Cause of Death',
    full: 'Centers for Disease Control and Prevention. CDC WONDER: Underlying Cause of Death, 2018–2023, by age group and sex. Used for each cause’s approximate share of all deaths.',
    url: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
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
