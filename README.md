# Nirmaan Sahayak AI

**Check a building plan against the MP Bhumi Vikas Rules before the citizen pays any fee.**

- **Team:** [[team name]]
- **Members:** Shawaiz Siddiqui, Fahad [[surname]]
- **Track:** Track 1, Bhumi Vikas Sahayak (Claude Impact Lab × Cerebras Café Compute, Bhopal, 11 Oct 2026)
- **User:** the building-permission clerk at the Bhopal Municipal Corporation counter
- **Live demo:** [[vercel url]] · access code for the jury: [[code]]
- **Demo video:** [[link]]

## The problem in one line

A citizen pays fees, submits plans and waits, then learns the plan breaks a setback rule.
The clerk has 108 pages and about a minute per person.

## What it does

1. The clerk types one sentence in Hindi or English, for example
   `200 वर्ग मीटर प्लॉट, 9 मीटर सड़क, पीछे 1.5 मीटर, फीस कितनी?`
2. Claude reads the sentence and fills a plan form. The clerk can correct any field.
3. Plain code checks the plan: front, rear and side open space, plot size for the building type, and fee.
   Each result shows pass, fail or warning, the rule number, the PDF page and the exact rule text.
4. General questions ("how long is permission valid?") get a short answer with rule, page and quote,
   or "not found in the rules".
5. Every quote is checked word for word against the rulebook before it is marked verified.
6. Plots up to 500 sq m get a warning: Rule 2(5)(c) was amended on 28 Aug 2026, after our data.

The AI reads language. The code applies the rules. The clerk decides.

## Run it (5 steps)

1. `git clone [[repo url]] && cd nirmaan-sahayak-ai`
2. `npm install`
3. `cp .env.example .env` and set `ANTHROPIC_API_KEY` (optional: `ACCESS_CODE`, `DATABASE_URL`)
4. `npm run dev`
5. Open http://localhost:3000

Without any API key, the plan form and all rule checks still work. Only the sentence reading and
general questions need Claude.

Tests: `npm test` · Accuracy run: `npm run eval`

## Accuracy

| What | Result |
|---|---|
| Rule checks (boundary cases, `npm test`) | [[x]]/[[y]] pass |
| Official sample questions: correct found / not found | [[x]]/17 |
| Correct rule number (when found) | [[x]]/15 |
| Quotes verified word for word | [[x]]/[[y]] |

Full results: `data/eval_results.json`. Test cases: `data/eval_cases.json`.

## What works and what doesn't

Works:
- [[fill in]]

Doesn't, or not yet:
- Plan checks cover residential buildings up to 12.5 m height: front, rear and side open space, plot size, fee.
  Taller buildings (Rule 42 tables), FAR, parking and other uses are not checked by code; ask them as questions.
- Fee slabs have gaps (75 to 76 sq m). We read them as continuous: 75.5 sq m uses the 76 to 125 slab.
- The 28 Aug 2026 amendment is not in our data; the tool only warns about it.
- Hindi official text is auto-converted from an old font; some pages (for example the fee table) have errors,
  so it is shown for reading only. Numbers always come from the English rules.
- Voice input (Sarvam) and fast auto-fill (Cerebras): planned, not built.

## Data used

- MP Bhumi Vikas Rules 2012, English, consolidated to 6 Mar 2025 (event pack): https://mptownplan.gov.in/NewsPDF/bvn06032025E.pdf
- Same, Hindi: https://mptownplan.gov.in/NewsPDF/bvn06032025H.pdf (converted from Kruti Dev font with `tools/kd2u.py`)
- Amendment of 28 Aug 2026 to Rule 2(5)(c): https://teamleaseregtech.com/updates/article/59469/government-of-madhya-pradesh-amendment-to-land-development-rules
- `data/tables.json`: table values from Rules 21, 53 and 56, typed by hand and checked against the PDF.
  Every quote is machine-checked against the rules text.

## Services used

- Claude API (Anthropic): sentence reading and rule questions
- Neon Postgres (optional): stores checks with a reference ID. Stores plan inputs and results only, no personal data.
- Vercel: hosting

## How it is built

Next.js (App Router, TypeScript), Tailwind, zod, vitest. `app/page.tsx` is a server component;
interactive parts are small client components. Claude calls run in server actions. The rules engine is
plain TypeScript in `lib/engine` with no network access. See `CLAUDE.md` for the full structure.

## Demo script (2 minutes)

1. Problem (15 s): rejection after paying fees; 108 pages; one minute per citizen.
2. Type the 200 sq m plan sentence that only asks about fees. Form fills, checklist shows rear gap FAIL,
   Rule 56(2)(a), page 78, verified quote. "Nobody asked about the rear gap. We caught it."
3. Ask "How do I pay my property tax online?": not found in the rules.
4. Show the amendment warning and the accuracy table.
5. Close: one link, core works without an AI key, every answer has a rule and a page.

## License

MIT. See `LICENSE`. This tool gives guidance only. The BMC officer makes every decision.
