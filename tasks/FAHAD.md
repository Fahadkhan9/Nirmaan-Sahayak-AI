# Tasks: Fahad (data, rules engine, tests, eval, README, viva notes)

Agent: read `CLAUDE.md` first. Only edit files Fahad owns (CLAUDE.md section 7).
Tick each task when done and add a line to "Done log". Commit per task: `F<n>: <what>`.
Do not install npm packages: ask Shawaiz. Do not edit `lib/types.ts`: ask Shawaiz.

---

## F0. Check the data by hand (T+0 to T+10, while Shawaiz sets up the repo, no coding)

Open the official English PDF (`resources/MP_Bhumi_Vikas_Rules_2012_upto_2025-03-06_EN.pdf` in the event pack)
and check every number in `data/tables.json` against these pages:
- p.77 front open space table (Rule 56(1)(a))
- p.78 rear open space table (Rule 56(2)(a)) and side open space (Rule 56(3))
- p.70 plot size and frontage (Rule 53(1)(i))
- p.35 application fee, p.36 residential permission fee slabs (Rule 21)
- p.3 Rule 2(5)(c)
All quotes in `tables.json` were already machine-checked against the rules text. You are checking the numbers
and the meaning. Write any problem under "Decisions" below. Also skim `data/eval_cases.json` expected answers.

- [ ] F0 done

## F1. Rules engine (T+10 to T+30)

When Shawaiz says "pulled", run `git pull --rebase`. You now own `lib/engine/**` (replace the stub).

Files:
- `lib/engine/tables.ts`: `import tables from "@/data/tables.json"` and export typed accessors.
- `lib/engine/lookup.ts`: `findRow(rows, value)`: a row matches when
  `(minExclusive === null || value > minExclusive) && (maxInclusive === null || value <= maxInclusive)`.
- `lib/engine/ref.ts`: helper to build a `RuleRef` from a table entry.
- One file per check in `lib/engine/checks/`: `front.ts`, `rear.ts`, `side.ts`, `plot-type.ts`, `height.ts`,
  `fee.ts`, `amendment.ts`. Each exports `(input: PlanInput) => Check | null` (null = not applicable, hide it).
- `lib/engine/index.ts`: `runChecks(input)` runs them in this order and drops nulls:
  amendment, height, front, rear, side, plotType, fee.

Exact behaviour (all values come from `data/tables.json`, never hardcode numbers in checks):

**front** (Rule 56(1)(a)): needs `streetWidth`.
- No streetWidth: status `missing` (detail: "road width needed").
- requiredM = matching row. No `front` given: status `info` (shows the required gap; this answers
  "how much gap do I leave?"). `front >= requiredM`: `pass`, else `fail`.
- If `height > 12.5`: status `warn`, detail says Rule 56(5) sends this to Rule 42 tables, not checked here.

**rear** (Rule 56(2)(a)): same pattern, basis `plotArea`, proposed `rear`. Same height > 12.5 warning.

**side** (Rule 56(3)): needs `buildingType`; if missing, status `missing`.
- row: status `pass`, detail "no side open space required", ref = row quote.
- detached: both sides need 3.0 m. Relaxation if `height <= 7` and `frontage < 12`: one side may be 1.5 m
  (other still 3.0). With sideA and sideB: pass if both >= 3.0, or relaxation applies and max >= 3.0 and
  min >= 1.5. If side values missing: `info` with required values. If relaxation inputs are unknown, use 3.0 and
  add detail "may reduce one side to 1.5 m if height up to 7 m and frontage under 12 m".
- semi: one side. required = 2.5 if `height <= 10` and `frontage <= 10`, else 3.0. Proposed = max(sideA, sideB).
- Refs: the main quote, plus the relaxation quote when it was used.

**plotType** (Rule 53(1)(i)): needs `buildingType` and `plotArea` (frontage optional but checked if given).
- detached: plotArea > 225 and frontage > 12. semi: 125 to 225 and 8 to 12 (inclusive).
  row: 50 to 225 and 4.5 to 12 (inclusive).
- Outside range: `fail`, detail names which building types the numbers do fit, and notes that EWS/LIG plots
  follow Appendix-J.

**height**: only if `height > 12.5`: `warn` with the tallBuilding ref. Otherwise null.

**fee** (Rule 21): needs `builtUpArea`, else null.
- permission fee = matching slab (`residentialPermissionFee.rows`, continuous reading as in `assumption`).
- application fee = builtUpArea x 1.00, rounded to the nearest rupee.
- status `info`, `amountRs` = total, detail shows both parts in Hindi and English, refs = both rules.
- detail also says: "residential buildings only; other uses have different rates (Rule 21(3)(b) item 2)".

**amendment**: if `plotArea <= 500`: `warn`, detail = the amendment message from `tables.json`
(both languages; write the Hindi yourself in plain words), ref = rule 2(5)(c), page 3, quote from tables.json.

Tests in `lib/engine/engine.test.ts`:
- Loop over `engineCases` in `data/eval_cases.json` and assert the expected value or status.
- Add: detached relaxation pass and fail, plotType fail for a 100 sq m detached plot,
  every check returns refs with a non-empty quote (except missing).
- `npm test` must pass before you push.

- [ ] F1 done

## F2. Hindi page lookup (T+30 to T+33)

`lib/rules/hindi.ts`: `import pages from "@/data/rules_hi_pages.json"` (array of `{page, text}`).
`getHindiPage(page)` returns the text or null. Text comes from the official Hindi PDF converted from the
Kruti Dev font by `tools/kd2u.py`. Some pages (for example p.36 fee table) have conversion errors in numbers,
so this is for display only.

- [ ] F2 done

## F3. Eval script (T+33 to T+43)

`scripts/eval.ts` (run with `npm run eval`, needs `ANTHROPIC_API_KEY` in `.env`; load it with
`import "dotenv/config"` only if Shawaiz has installed dotenv, otherwise run `node --env-file=.env`
via `tsx --env-file=.env scripts/eval.ts`):
1. Engine part: run `engineCases` through `runChecks`, count passes.
2. Ask part: for each `askCases` item call `runAsk(question)` from `@/lib/ai/pipeline`. Score:
   - `foundOk`: `answer.found === expectFound`
   - `ruleOk`: when expectFound, `answer.ref.ruleId` is in `acceptRules`
   - `verifiedOk`: when found, `answer.ref.verified === true`
3. Print a table and totals: engine X/16, found/not-found Y/17, rule Z/15, verified quotes V/W.
4. Write `data/eval_results.json` with per-case results and a timestamp.
Run calls one after another (not in parallel) to avoid rate limits.

- [ ] F3 done

## F4. README, LICENSE, viva notes (T+43 to T+55)

- `LICENSE`: MIT, year 2026, team members' names.
- `README.md`: fill every `[[...]]` placeholder in the template. Put the real eval numbers from F3.
  Keep "What works / what doesn't" honest.
- Read `VIVA.md` with Shawaiz. Fix anything that no longer matches what you built.

- [ ] F4 done

## F5. Demo and submit (T+50 to T+60, together)

- Record the 2-minute demo (script in README).
- Check: repo public, no `.env` committed (`git log --all -- .env` shows nothing), Vercel URL works.
- Submit the form: https://docs.google.com/forms/d/e/1FAIpQLSfKNgfbYvYMI6xHgS0ir4kBhZWspGp37hIzbt9PhB-ZfK70vQ/viewform

- [ ] F5 done

---

## Requests to the other side

(write here, then tell Shawaiz out loud)

## Decisions

(DECISION: what changed, because why)

## Done log

(time · task · one line)
