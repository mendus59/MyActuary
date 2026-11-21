# MyActuary

A private, client-side web app that builds a **personal actuarial life table**: year-by-year probabilities of death (qx), a survival curve, life expectancy, and a ranked list of the modifiable factors costing you the most years.

**Live site:** https://mendus59.github.io/MyActuary/ (after GitHub Pages is enabled; see below)

## How it works

1. **Baseline.** SSA Office of the Chief Actuary, 2023 period life table (2026 Trustees Report), ages 0–119 by sex ([source](https://www.ssa.gov/oact/STATS/table4c6.html)). With no answers beyond age and sex the app reproduces SSA's published life expectancies exactly (covered by tests).
2. **Projection.** Optional cohort basis: baseline rates fall 0.7% a year from 2023, in line with the Trustees' intermediate assumption.
3. **Personal adjustments.** 34 factors grouped the way life insurers underwrite:
   - *Health and habits:* smoking (with time-since-quitting), BMI, aerobic and strength activity, alcohol, drug use, diet, sleep, blood pressure, blood sugar, LDL.
   - *Medical history:* coronary heart disease, stroke, atrial fibrillation, chronic kidney disease, heart failure (by NYHA class), COPD (by GOLD stage / home oxygen), HIV, liver disease (fatty liver through decompensated cirrhosis), dementia, and cancer by type, stage and time since diagnosis.
   - *Family and genetics:* parental longevity / early cardiovascular death, BRCA1/2 or Lynch syndrome, familial hypercholesterolemia.
   - *Exposures:* occupation, hazardous activities (skydiving, scuba, private flying, motorcycling), driving record and seat-belt use.
   - *Life circumstances and wellbeing:* state of residence, race and ethnicity, household income, education, marital status, social connection, depression, self-rated health.

   Chronic risk factors map to all-cause hazard ratios from cited meta-analyses or pooled cohorts, normalised by U.S. prevalence so the average respondent matches the baseline, and are applied as proportional hazards with age attenuation, overlap weighting for shared pathways, and soft bounds (0.35×–10×). Cancer, occupation, activities and driving are added as extra annual risk (SEER relative survival, BLS fatal-injury rates, published per-participant fatality rates, NHTSA crash data), the way insurers use flat extras.
4. **Outputs.** Life expectancy, median and quartile ages at death, chance of reaching milestone ages, a 10-year mortality ratio with an illustrative underwriting-style class, factor contributions, and modifiable detriments ranked by life-expectancy gain.

Full methodology and all 50 references are in the app (**Methodology**) and in the PDF report. Risk definitions live in [`js/factors.js`](js/factors.js), references in [`js/citations.js`](js/citations.js), the engine in [`js/engine.js`](js/engine.js).

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
