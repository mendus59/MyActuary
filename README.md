# MyActuary

<!-- site-summary:start -->
<!-- This section is this project's card on https://mendus59.github.io and is copied there daily.
     Keep it true of what's on main: one plain-text summary line (max 160 characters), then 1-6 short bullets.
     See CLAUDE.md ("Site summary"). -->
Build a personal actuarial life table from U.S. mortality data and evidence-based risk factors, entirely in your browser.

- Starts from the SSA 2023 period life table and adjusts it for 30 factors grouped the way life insurers underwrite.
- Covers health and habits, medical history, family history and genetics, risky jobs and hobbies, driving, and life circumstances.
- Shows your life expectancy, survival curve, chance of reaching milestone ages and an illustrative underwriting-style class.
- Ranks the changeable factors costing you the most years by how much life expectancy you could gain.
- Nothing leaves your browser: no backend, no analytics, and every network request is blocked.
- Download a PDF report with the full methodology and 45 references, and load it later to pick up where you left off.
<!-- site-summary:end -->

A private, client-side web app that builds a **personal actuarial life table**: year-by-year probabilities of death (qx), a survival curve, life expectancy, and a ranked list of the modifiable factors costing you the most years.

**Live site:** https://mendus59.github.io/MyActuary/ (after GitHub Pages is enabled; see below)

## How it works

1. **Baseline.** SSA Office of the Chief Actuary, 2023 period life table (2026 Trustees Report), ages 0–119 by sex ([source](https://www.ssa.gov/oact/STATS/table4c6.html)). With no answers beyond age and sex the app reproduces SSA's published life expectancies exactly (covered by tests).
2. **Projection.** Optional cohort basis: baseline rates fall 0.7% a year from 2023, in line with the Trustees' intermediate assumption.
3. **Personal adjustments.** 37 factor groups (over 60 individual conditions) organized the way life insurers underwrite:
   - *Health and habits:* smoking (with time-since-quitting), BMI, aerobic and strength activity, alcohol, drug use, diet, sleep, blood pressure, blood sugar, LDL.
   - *Medical history:* coronary heart disease, stroke, atrial fibrillation, chronic kidney disease, heart failure (by NYHA class), COPD (by GOLD stage / home oxygen), HIV, liver disease (fatty liver through decompensated cirrhosis), dementia, sleep apnea (by severity and treatment), cancer by type, stage and time since diagnosis, and an organ-system checklist of 19 further conditions (pulmonary fibrosis, epilepsy, Parkinson's, MS, peripheral artery disease, dialysis, kidney transplant, Crohn's, ulcerative colitis, celiac, rheumatoid arthritis, lupus, severe psoriasis, hip fracture, disabling osteoarthritis, schizophrenia or bipolar disorder, anorexia, ADHD).
   - *Family and genetics:* parental longevity / early cardiovascular death, BRCA1/2 or Lynch syndrome, familial hypercholesterolemia, and a family medical history of 13 conditions (heart disease, sudden cardiac death, stroke, diabetes, dementia, and eight cancers) by relative, number of relatives and age at diagnosis.
   - *Exposures:* occupation, hazardous activities (skydiving, scuba, private flying, motorcycling), driving record and seat-belt use.
   - *Life circumstances and wellbeing:* state of residence, race and ethnicity, household income, education, marital status, social connection, depression, self-rated health.

   Chronic risk factors map to all-cause hazard ratios from cited meta-analyses or pooled cohorts, normalised by U.S. prevalence so the average respondent matches the baseline, and are applied as proportional hazards with age attenuation, overlap weighting for shared pathways, and soft bounds (0.35×–10×). Cancer, occupation, activities and driving are added as extra annual risk (SEER relative survival, BLS fatal-injury rates, published per-participant fatality rates, NHTSA crash data), the way insurers use flat extras. Family history uses a documented MyActuary method that converts published disease relative risks into all-cause risk using each cause's share of U.S. deaths (CDC WONDER).
4. **Outputs.** Life expectancy, median and quartile ages at death, chance of reaching milestone ages, a 10-year mortality ratio with an illustrative underwriting-style class, factor contributions, and modifiable detriments ranked by life-expectancy gain.

Full methodology and all 82 references are in the app (**Methodology**) and in the PDF report. Risk definitions live in [`js/factors.js`](js/factors.js), references in [`js/citations.js`](js/citations.js), the engine in [`js/engine.js`](js/engine.js).

## Privacy

- Static site, no backend, no analytics, no external scripts or fonts (jsPDF is vendored in `vendor/`).
- A Content Security Policy with `connect-src 'none'` blocks every network request from the page.
- Answers are kept in `sessionStorage` (cleared when the tab closes) and can be wiped with **Clear my data**.
- **Download PDF report** embeds the answers as base64 JSON in the PDF's Keywords metadata. **Load a saved report** reads them back so you can edit. Anyone with the PDF can read those answers.

## Development

```sh
npm test          # engine tests (Node 22+)
npm run serve     # http://localhost:8080
```

No build step: ES modules are served as-is.

## Deploying

`.github/workflows/pages.yml` runs the tests and deploys to GitHub Pages on every push to `main`. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Disclaimer

MyActuary is an educational estimate based on population-level research. It is not medical, insurance or financial advice.

## License

MIT. Vendored jsPDF and jsPDF-AutoTable are MIT licensed (see `vendor/`).
