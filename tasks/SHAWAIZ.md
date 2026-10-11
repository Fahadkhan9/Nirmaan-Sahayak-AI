# Tasks: Shawaiz (app, UI, AI, setup, deploy)

Agent: read `CLAUDE.md` first. Only edit files Shawaiz owns (CLAUDE.md section 7).
Tick each task when done and add a line to "Done log". Commit per task: `S<n>: <what>`.
Total budget about 60 minutes. Times are targets, not limits. If a task overruns by 5 min, simplify it.

---

## S0. Setup and first push (T+0 to T+10) — do this before Fahad starts coding

1. Create the app in an empty folder named `nirmaan-sahayak-ai`:
   ```bash
   npx create-next-app@latest nirmaan-sahayak-ai --ts --tailwind --eslint --app --use-npm --import-alias "@/*" --no-src-dir
   cd nirmaan-sahayak-ai
   npm i @anthropic-ai/sdk zod @neondatabase/serverless
   npm i -D vitest tsx
   ```
2. Copy the starter pack into the repo root: `CLAUDE.md`, `tasks/`, `data/`, `tools/`, `VIVA.md`, `README.md`.
3. `tsconfig.json`: make sure `"strict": true` and `"resolveJsonModule": true`.
4. Create `vitest.config.ts`:
   ```ts
   import { defineConfig } from "vitest/config";
   import path from "node:path";
   export default defineConfig({
     resolve: { alias: { "@": path.resolve(__dirname, ".") } },
     test: { environment: "node" },
   });
   ```
5. `package.json` scripts: add
   `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"eval": "tsx scripts/eval.ts"`.
6. `.env.example`:
   ```
   ANTHROPIC_API_KEY=
   ANTHROPIC_MODEL=claude-sonnet-5-5
   ACCESS_CODE=
   DATABASE_URL=
   ```
   Confirm `.gitignore` covers `.env*` but NOT `.env.example` (add `!.env.example`).
7. Create `lib/types.ts` with the exact contract from CLAUDE.md section 6.
8. Create stubs so both sides compile from minute one (Fahad takes over his after this commit):
   - `lib/engine/index.ts`: `export function runChecks(_: PlanInput): Check[] { return []; }`
   - `lib/rules/hindi.ts`: `export function getHindiPage(_: number): string | null { return null; }`
   - `scripts/eval.ts`: `console.log("eval: not implemented yet");`
9. `npm run lint && npm run typecheck && npm run build` must pass.
10. Create a **public** GitHub repo `nirmaan-sahayak-ai`, push, add Fahad as collaborator.
11. Import the repo in Vercel now (yes, the empty app). Set env vars in Vercel. Confirm the URL loads.
    Deploying early removes the last-minute deploy risk.
12. Tell Fahad: "Setup pushed. Pull now."

- [ ] S0 done

## S1. Strings and small reusable UI (T+10 to T+15)

- `lib/strings.ts`: one object of bilingual labels `{ hi, en }`. Include: app name, tagline, banner text,
  every PlanInput field label with unit, every CheckId label, status words (पास/Pass, फेल/Fail, ध्यान दें/Check,
  जानकारी चाहिए/Missing, जानकारी/Info), "not found in rules", "verified", "unverified", "new citizen",
  "check", placeholders. Show labels as `hi · en` in one line (no language toggle needed).
- `components/ui/card.tsx`, `components/ui/rule-pill.tsx` (shows `Rule 56(2)(a) · p.78`),
  `components/ui/status-icon.tsx` (icon + text, never colour alone), `components/ui/number-field.tsx`
  (label, unit, controlled number input, empty string = undefined).
- `components/version-banner.tsx` (server component): `RULES_VERSION` + "Guidance only. The officer decides."
  in both languages.

- [x] S1 done

## S2. Rulebook and quote verifier (T+15 to T+22)

- `lib/rules/rulebook.ts`:
  - `import rules from "@/data/rules.json"` (array of `{rule,title,page_start,page_end,text}`).
  - `getRule(ruleId)`, `normalize(s)` (collapse all whitespace to one space, trim),
    `rulebookText()` builds one string: `=== Rule {rule}: {title} (PDF pages {start}-{end}) ===\n{text}` for all rules.
    Memoise it.
- `lib/rules/verify.ts`: `verifyQuote(ref: RuleRef): VerifiedRef`
  1. If normalized quote is empty or under 12 characters: `verified: false`.
  2. If it appears in `getRule(ref.ruleId).text` (normalized, case-insensitive): `verified: true`.
     If `ref.page` is outside that rule's page range, set `page` to the rule's `page_start`.
  3. Else search all rules. If found in exactly one other rule: return that rule's id and page, `verified: true`
     (handles inserted rules like 17-a living inside 17).
  4. Else `verified: false`.
- `lib/rules/verify.test.ts`: one true case (a row from `data/tables.json`), one false case (made-up text),
  one "wrong rule id" case.

- [x] S2 done

## S3. Claude pipeline (T+22 to T+35)

Files: `lib/ai/client.ts`, `lib/ai/prompts.ts`, `lib/ai/extract.ts`, `lib/ai/answer.ts`, `lib/ai/pipeline.ts`,
`app/actions/ask.ts`.

**client.ts**: one Anthropic client from `ANTHROPIC_API_KEY`; model from `ANTHROPIC_MODEL` with default
`claude-sonnet-5-5`. Export `hasAiKey()`.

**Call 1, extract (no rulebook, cheap)** in `extract.ts`. Force a tool call:
`tool_choice: { type: "tool", name: "extract_request" }`, `max_tokens: 500`.
Tool input schema: `kind` ("plan" | "question" | "both"), `fields` (all PlanInput keys, numbers, optional),
`missing` (array of PlanInput keys needed for a full check), `question` (string or null: the general rule
question part, rewritten as a standalone question in the original language).
System prompt (put in `prompts.ts`):
```
You read one message typed by a building-permission clerk in Bhopal. It may be Hindi, English or mixed.
Extract ONLY numbers the message states. Never guess or fill defaults.
Units: convert feet to metres (x 0.3048) and square feet to square metres (x 0.0929), round to 2 decimals.
"Road", "sadak", "सड़क", "street" width -> streetWidth. "Aage/front" gap -> front. "Peeche/rear" -> rear.
"Side/bagal" -> sideA (and sideB if two sides are given). "Built-up", "construction area", "निर्मित क्षेत्र" -> builtUpArea.
Plot size -> plotArea. Building height -> height. Floors are NOT height; do not convert floors to metres.
"Detached/alag" -> detached, "semi-detached/ardh" -> semi, "row house/kataar" -> row.
kind = "plan" if it gives plan details, "question" if it only asks about rules, "both" if it does both.
If the message asks something the plan check cannot answer (validity, documents, who signs, fees for
non-residential, lifts, any general rule), put that part in `question`.
```
Validate tool input with zod. Drop non-positive numbers.

**Call 2, answer (only if `question` is not null)** in `answer.ts`.
`system` is an array: first a short instruction block, then
`{ type: "text", text: rulebookText(), cache_control: { type: "ephemeral" } }` (prompt caching).
Force tool `answer_question`, `max_tokens: 800`. Tool schema: `found` (boolean), `language` ("hi" | "en"),
`answer` (string), `rule` (string, as printed), `ruleId` (string, top-level number like "56" or "26-B"),
`page` (number), `quote` (string).
Instruction block:
```
You help a Bhopal Municipal Corporation clerk. Answer ONLY from the rulebook below
(MP Bhumi Vikas Rules 2012, consolidated to 6 March 2025).
- If the rulebook does not answer the question, set found=false and say so in one sentence. Never use outside knowledge.
- answer: at most 3 short sentences, in the same language as the question (Hindi question -> simple Hindi).
  Keep numbers and units exactly as in the rule.
- quote: copy ONE contiguous passage of 1 to 3 lines from the rule, character for character, in English.
  Prefer the table row that holds the number. Do not include page headers like "Rule 56 M.P. Bhumi Vikas Rules, 2012 78".
- rule: the most specific sub-rule, e.g. "56(2)(a)". ruleId: the top-level rule, e.g. "56".
- Never call it legal advice. Never invent a rule number.
```
After the call: `ref = verifyQuote({rule, ruleId, page, quote})`. Return `AnswerResult`.
If `found` is false, return no ref.

**pipeline.ts** `runAsk(text)`: trim, reject empty or over 1000 chars; call extract; if question, call answer;
return `AskResult`. Catch errors: return `{ kind: "question", fields: {}, missing: [], error: "<short message>" }`.
No `server-only` import here (the eval script uses it).

**app/actions/ask.ts**: `"use server"`; `export async function askAction(text: string): Promise<AskResult>`
calls `runAsk`. If `!hasAiKey()` return an error telling the clerk to use the form directly.

- [x] S3 done

## S4. Workspace UI (T+15 to T+40, build in parallel with S2 and S3 using the engine stub)

`app/page.tsx` (server only): header (app name, tagline), `<VersionBanner />`, `<Workspace />`. Nothing else.

Client components in `components/workspace/`:
- `workspace.tsx`: state = `text`, `fields: PlanInput`, `ask: AskResult | null`, `pending`.
  `checks = useMemo(() => runChecks(fields), [fields])`. On submit: `askAction(text)` inside `useTransition`,
  then merge `result.fields` into `fields`, store `ask`. "New citizen" button resets everything.
- `ask-box.tsx`: textarea (placeholder: `200 वर्ग मीटर प्लॉट, 9 मीटर सड़क, पीछे 1.5 मीटर, फीस कितनी?`),
  submit button, pending state, error line. Ctrl/Cmd+Enter submits.
- `plan-form.tsx`: grid of `NumberField`s + building type select. Editing any field re-runs checks instantly.
  Shows "Add: <missing fields>" chips from `ask.missing`.
- `check-summary.tsx`: three small stat tiles: pass count, fail count, total fee (Rs).
- `check-list.tsx` + `check-row.tsx`: sort fail, warn, missing, info, pass. Row = StatusIcon + label +
  "required X m, proposed Y m" + RulePill + `QuoteBlock`. Failed rows get a light red background.
- `quote-block.tsx`: monospace quote, "verified" badge. Optional `<details>` "आधिकारिक हिंदी पाठ" that calls
  `getHindiPageAction(page)` (S7) and shows the text with the label "auto-converted, check PDF".
- `answer-card.tsx`: answer text, RulePill, QuoteBlock, verified or unverified badge;
  if `found=false`: "नियमों में नहीं मिला · Not found in the rules". If `ref.ruleId === "2"` show the amendment note.
- Layout: input on top, then two columns on wide screens (form left, results right), one column on mobile.
  Clean, flat, plenty of whitespace, readable at arm's length (base text 16px).

- [ ] S4 done

## S5. Integrate, deploy, smoke test (T+40 to T+48)

1. `git pull --rebase` to get Fahad's engine. Remove nothing of his.
2. Test the demo case locally: type
   `200 वर्ग मीटर प्लॉट, 9 मीटर सड़क, अर्ध-पृथक, ऊंचाई 9 मीटर, आगे 3 मीटर, पीछे 1.5 मीटर, साइड 3 मीटर, निर्मित क्षेत्र 180 वर्ग मीटर, फीस कितनी?`
   Expect: rear FAIL (needs 2.5 m, Rule 56(2)(a), p.78), front pass, side pass, plot type pass, amendment warn, fee shown.
3. Test "How do I pay my property tax online?" shows "not found".
4. Lint, typecheck, test, push. Check the Vercel URL with the same two cases.

- [ ] S5 done

## S6. Access code (should, 5 min)

`middleware.ts` (or `proxy.ts` if Next warns middleware is deprecated): if `ACCESS_CODE` is empty, allow all.
Else, if cookie `ns_access` !== `ACCESS_CODE`, redirect to `/access`. `app/access/page.tsx` (server) with a
small client form calling a server action that sets the cookie (httpOnly, sameSite lax, 12 h) and redirects to `/`.

- [ ] S6 done

## S7. Hindi official text (should, 5 min, needs Fahad's F3)

`app/actions/hindi.ts`: `"use server"`; `getHindiPageAction(page)` returns `getHindiPage(page)`.
Never send the whole Hindi JSON to the browser.

- [x] S7 done

## S8. Print slip (stretch, 5 min)

"Print slip" button calls `window.print()`. `@media print` CSS hides the input box and buttons, shows a header
with reference ID (`NS-` + yyyymmdd-hhmmss), the inputs, the checklist, rules version, and
"Guidance only. The officer decides."

- [ ] S8 done

## S9. Neon history (stretch, only if S5 to S8 are done)

`lib/db/index.ts` as in CLAUDE.md plan: if no `DATABASE_URL`, functions return quietly.
Table `checks(id text primary key, created_at timestamptz default now(), input_text text, fields jsonb,
results jsonb, answer jsonb, rules_version text, app_version text)`. Save after each ask and on print.
No personal data.

- [ ] S9 done

## Cut today

- Sarvam voice input and Cerebras auto-fill: not enough time. Listed in README as future work.

---

## Requests to the other side

(write here, then tell Fahad out loud)

- Git workflow changed (CLAUDE.md section 8): no direct commits to `main` or `develop`. Branch
  `feature/f<n>-<name>` from `develop`, PR into `develop`. In `tasks/FAHAD.md`, read "git pull --rebase"
  as "pull `develop`, then branch". If you use Antigravity, it should read `AGENTS.md`, which points to CLAUDE.md.

## Decisions

(DECISION: what changed, because why)

DECISION: `@types/node` bumped to ^24 because vitest 5 needs >=22 and local Node is 24.
DECISION: vitest `passWithNoTests: true` because `npm test` must pass before the first tests exist.
DECISION: eslint allows `_`-prefixed unused args because the stubs keep the shared signatures.
DECISION: git flow is feature branch -> `develop` -> `main` via PRs (no direct commits to either) because
Shawaiz wants reviewed merges and a stable `main`. S0 goes in as a PR from `feature/s0-setup`.
DECISION: S3 uses structured outputs (`messages.parse` + zod) instead of forced `tool_choice`, because claude-sonnet-5-5 rejects forced tool use with a 400.
DECISION: S3 extract returns value + unit; code converts ft/sq ft/gaj to metres, because Claude never does maths (CLAUDE.md section 4).
DECISION: S3 max_tokens 2000/4000 with effort low/medium, because the model always thinks and 500/800 could cut answers off.
DECISION: S3 sends server-side refusal fallback (`fallbacks: "default"`) on models that support it.
DECISION: `AGENTS.md` points every non-Claude agent (Fahad sometimes uses Antigravity) to CLAUDE.md.

## Done log

(time · task · one line)

16:01 · S1 · `lib/strings.ts` (bilingual labels), Card, RulePill, StatusIcon, NumberField, VersionBanner.
16:12 · S2 · `lib/rules/rulebook.ts`, `verifyQuote` + 8 tests; vitest config renamed to `.mts` (ESM warning).
16:42 · S0 fix · lockfile regenerated (missing @emnapi entries broke `npm ci`); `typecheck` runs `next typegen` first (Fahad requests).
16:47 · S3 · Claude pipeline: extract + answer (rulebook cached), runAsk, askAction, 10 tests. Not live-tested (no key here).
16:47 · S7 · `getHindiPageAction(page)` server action (validates page, one page per call).
