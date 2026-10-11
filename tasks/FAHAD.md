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

- [x] F0 done

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

- [x] F1 done

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

- `package-lock.json` is out of sync with `package.json` (`npm ci` fails: missing `@emnapi/runtime` and
  `@emnapi/core` 1.11.3). Please run `npm install` and commit the lock. I used `npm install --no-package-lock`.
- `npm run typecheck` fails on a fresh clone (`LayoutProps` not found in `app/layout.tsx`) until Next
  generates its route types. Suggest `"typecheck": "next typegen && tsc --noEmit"`.

## Decisions

(DECISION: what changed, because why)

F0 findings. I checked against the official PDF `docs/bvn06032025E.pdf` (PDF page numbers = printed
page numbers). Every number in `tables.json` matches pages 3, 35, 36, 70, 77 and 78, and all 32 quotes
appear word for word on the page they cite. Notes on meaning:
- DECISION: fee detail will say "residential only; shops, commercial and shops-cum-residence add 50%
  (Rule 21(3)(b) items 2 and 4)" instead of "other uses have different rates", because items 3 and 6
  (factory admin block, social/educational) use the same slabs as item 1.
- DECISION: fee check adds a `warn` note when `height > 30`, because the 21(3)(b) slabs exclude
  high-rise buildings (Rule 2(38): more than 10 storeys or more than 30 m), which follow 21(3)(c).
- DECISION: front check adds a note when `streetWidth < 6`, because Rule 56(1)(b) says that in existing
  developed areas the building line is 6.0 m from the street centre line. The engine does not check this.
- The fee slabs are printed as whole numbers (0-75, 76-125, ...). `assumption` (continuous reading)
  covers the gaps. Keep it visible in the fee detail.
- Rule 53(1)(i): semi and row both cover 125-225 sq m. Detached needs frontage strictly above 12,
  so a 300 sq m plot with exactly 12 m frontage fails detached and fits semi/row by frontage only.
- Amendment: the 2(5)(c) quote and page 3 are correct. The 28 Aug 2026 "plots up to 500 sq m" change
  comes from an outside source and is not in the rulebook text, so the check stays a `warn` only.
- eval_cases.json: all 16 engine expectations match the tables. Ask answers for q1, q2, q3, q4, q5,
  q10, q12 and q14 match the rule text. q13: Rule 83 requires lifts above 12.5 m (the question
  says 15 m, which is fine). Counts for F3: engine 16, ask 17, expectFound 15.

F1 decisions:
- DECISION: fee eval cases e8-e11 now expect the total (slab + application fee, e.g. 75 sq m -> 825) because
  `amountRs` is the total and F3 scores engine cases straight from `runChecks`.
- DECISION: side check also warns (no check) above 12.5 m, because Rule 56(3) sits under "open spaces for
  buildings up to 12.5 m" and 56(5) sends taller buildings to Rule 42, the same as front and rear.
- DECISION: added to `tables.json`: `frontOpenSpace.narrowStreet` (56(1)(b)), `plotType.ewsLig` (53(1)(ii)),
  `residentialPermissionFee.highRise` (2(38), p.8, > 30 m), `residentialPermissionFee.otherUses` (50% surcharge)
  and `amendments[0].messageHi`, so checks cite real quotes and hardcode no numbers. All quotes checked on the PDF.
- DECISION: `missing` checks return `refs: []`. plotType passes on plot size alone when frontage is not given,
  with a "frontage not checked" note. Detached with only one side given: `fail` if that side is already too
  small, otherwise `info`.
- DECISION: high-rise (> 30 m) fee is a `warn` with no `amountRs`, because the 21(3)(c) rates are not in the tables.

## Done log

(time · task · one line)

16:09 · F0 · checked tables.json and eval_cases.json against rules text: numbers OK, 3 engine decisions logged
16:20 · F0 · re-checked against the official PDF in docs/: all numbers and 32 quotes match their pages
16:25 · F1 · rules engine: 7 checks + tables/lookup/ref/text helpers, 32 tests passing, demo case matches S5
