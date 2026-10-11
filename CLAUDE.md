# CLAUDE.md: shared rules for every agent on this repo

Project: **Nirmaan Sahayak AI**. Track 1, Bhumi Vikas Sahayak, Claude Impact Lab Bhopal, 11 Oct 2026.
Two developers working at the same time, each with their own AI coding agent.
Shawaiz uses Claude Code. Fahad uses Claude Code or sometimes Google Antigravity.
These rules apply to every agent, whatever the tool (`AGENTS.md` points here for non-Claude agents).
Read this file fully before doing anything. Then read your own task file:
`tasks/SHAWAIZ.md` or `tasks/FAHAD.md`. If you cannot tell which developer you work for, ask before editing.

## 1. What we are building (one paragraph)

A tool for one user: the building-permission clerk at the Bhopal Municipal Corporation counter.
The clerk types one sentence (Hindi or English) about a citizen's plan or question.
- If it has plan details (plot area, road width, gaps, built-up area), Claude extracts the numbers,
  a form fills itself, and **plain code** checks the plan against the rules: pass, fail or warn per rule,
  each with rule number, PDF page and the exact quote.
- If it is a general rule question, Claude answers from the full rulebook with rule number, quote and page,
  or says "not found". Code verifies the quote exists word for word before showing it as verified.
The AI understands language. The code applies the rules. The clerk decides.

## 2. Hard rules from the organisers (never break)

- No personal data stored or logged. No names, phone numbers, addresses.
- No connection to any government portal.
- No secrets in code. Keys only from environment variables. `.env*` is git-ignored.
- Never present output as legal advice. Every result screen shows: rules version and "Guidance only. The officer decides."
- Repo must run in 5 steps or fewer (see README).

## 3. Stack (already set up, do not add frameworks)

- Next.js 16 (App Router) + TypeScript (strict) + Tailwind. Next 16 has breaking changes: check
  `node_modules/next/dist/docs/` before using an API you are unsure of (see `AGENTS.md`).
- `@anthropic-ai/sdk` for Claude, `zod` for validation, `@neondatabase/serverless` (optional history)
- `vitest` for tests, `tsx` for scripts
- Deploy: Vercel

Env vars (`.env.example` lists them):
- `ANTHROPIC_API_KEY` (required for Ask; engine works without it)
- `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`)
- `ACCESS_CODE` (optional; if empty, no access gate)
- `DATABASE_URL` (optional; if empty, history is off)

## 4. Architecture rules

- `app/page.tsx` is a **Server Component only**. No `"use client"`, no hooks, no event handlers in it.
  It renders server pieces (banner, layout) and mounts ONE client component: `<Workspace />`.
- Interactivity lives in small client components under `components/`, each with `"use client"` at the top.
- Server work (Claude calls, quote verification, DB) lives in **Server Actions** in `app/actions/*.ts`
  (`"use server"`) which call plain functions in `lib/`.
- Do NOT import the `server-only` package in `lib/ai/**` or `lib/rules/**`: `scripts/eval.ts` imports them via tsx.
- Data files are imported as JSON (`import rules from "@/data/rules.json"`), never read with `fs`
  (fs paths break on Vercel).
- The rules engine (`lib/engine/**`) is pure TypeScript: no network, no env, no React. Same input, same output.
  It runs in the browser so checks work even with no API key.
- All numbers shown to the user come from the engine or `data/tables.json`. Claude never does maths
  and never decides pass or fail.

## 5. Coding standards

- Small, single-purpose files. A component over ~120 lines gets split.
- Reusable UI pieces: `RulePill`, `QuoteBlock`, `StatusIcon`, `NumberField`, `Card`. Reuse them, do not copy markup.
- Named exports, typed props (`interface XProps`), no `any`. Validate external input (Claude output, form input) with zod.
- No hardcoded user-facing strings inside components: put them in `lib/strings.ts` (bilingual: `{ hi, en }`).
- Handle failure visibly: if Claude or DB fails, show a short message and keep the engine working.
- Accessible basics: labels on inputs, buttons have text, status not shown by colour alone (icon + text).
- Run `npm run lint`, `npm run typecheck` and `npm test` before every push. Fix what you broke.
- Plain-language comments only where the "why" is not obvious.

## 6. The shared contract: `lib/types.ts`

Owned by Shawaiz. Both sides code against it. Do not edit it yourself (see section 8).

```ts
export type BuildingType = "detached" | "semi" | "row";

export interface PlanInput {
  plotArea?: number;      // sq m
  frontage?: number;      // m
  streetWidth?: number;   // m, width of street the plot faces
  height?: number;        // m
  buildingType?: BuildingType;
  front?: number;         // proposed front open space, m
  rear?: number;          // proposed rear open space, m
  sideA?: number;         // proposed side open space, side 1, m
  sideB?: number;         // proposed side open space, side 2, m
  builtUpArea?: number;   // sq m, total proposed built-up area
}

export type CheckId = "front" | "rear" | "side" | "plotType" | "height" | "fee" | "amendment";
export type CheckStatus = "pass" | "fail" | "warn" | "missing" | "info";

export interface RuleRef {
  rule: string;   // as printed, e.g. "56(2)(a)"
  ruleId: string; // top-level rule number for lookup, e.g. "56"
  page: number;   // English PDF page
  quote: string;  // exact English text, whitespace-normalised
}

export interface Check {
  id: CheckId;
  status: CheckStatus;
  requiredM?: number;     // for open-space checks
  proposedM?: number;
  amountRs?: number;      // for fee
  detail?: { hi: string; en: string }; // short explanation from engine templates
  refs: RuleRef[];        // one or more rule references
}

export interface VerifiedRef extends RuleRef { verified: boolean }

export interface AnswerResult {
  found: boolean;
  language: "hi" | "en";
  answer: string;          // short answer in the question's language
  ref?: VerifiedRef;
}

export interface AskResult {
  kind: "plan" | "question" | "both";
  fields: PlanInput;
  missing: (keyof PlanInput)[];
  answer?: AnswerResult;
  error?: string;
}

export const RULES_VERSION = "MP Bhumi Vikas Rules 2012, consolidated to 6 March 2025";
```

Engine entry point (Fahad builds): `runChecks(input: PlanInput): Check[]` in `lib/engine/index.ts`.
Ask entry point (Shawaiz builds): `runAsk(text: string): Promise<AskResult>` in `lib/ai/pipeline.ts`.
Quote verifier (Shawaiz builds): `verifyQuote(ref: RuleRef): VerifiedRef` in `lib/rules/verify.ts`.
Hindi page lookup (Fahad builds): `getHindiPage(page: number): string | null` in `lib/rules/hindi.ts`.

## 7. Who owns which files (this is how we avoid merge conflicts)

| Owner | Files and folders |
|---|---|
| Shawaiz | `app/**`, `components/**`, `lib/ai/**`, `lib/rules/verify.ts`, `lib/rules/rulebook.ts`, `lib/db/**`, `lib/strings.ts`, `lib/types.ts`, `middleware.ts` (or `proxy.ts`), `package.json`, config files, `CLAUDE.md`, `tasks/SHAWAIZ.md` |
| Fahad | `data/**`, `lib/engine/**`, `lib/rules/hindi.ts`, `scripts/**`, `tools/**`, `README.md`, `VIVA.md`, `tasks/FAHAD.md` |

- An agent only creates or edits files its developer owns.
- Need a change in the other person's file? Do not edit it. Write a request in your own task file
  under "Requests to the other side", tell your teammate out loud, and continue with a local stub.
- New npm package? Only Shawaiz installs (avoids `package-lock.json` conflicts). Fahad requests it.

## 8. Git workflow (feature branch -> `develop` -> `main`)

- `main` is the stable branch. Never commit or push to it directly. It only changes by a PR from `develop`.
- `develop` is the shared working branch. It only changes by PRs from feature branches. Never commit to it directly.

For each task:
1. `git switch develop && git pull --rebase`, then branch: `git switch -c feature/<task>-<short-name>`
   (e.g. `feature/s3-answer-card`, `feature/f2-rear-check`).
2. Small commits, one task each: `S3: answer card` or `F2: rear check + tests`.
3. Before push: lint, typecheck, tests pass. Then `git pull --rebase origin develop` and push the feature branch.
4. Open a PR into `develop`. Merge only when checks pass. Delete the feature branch after merge.
5. When `develop` is stable (and before deploying the demo), open a PR `develop` -> `main`.
6. Never force-push to `develop` or `main`. Never commit `.env`.
7. Agents never push or merge unless their developer asks.

## 9. Task tracking (every agent must do this)

- After finishing a task, tick it in your own task file: `- [x] S3 ...` and add one line under "Done log"
  with the time and what changed. Commit that with the task.
- If something is cut or blocked, mark it `- [~]` with a one-line reason.

## 10. Changing a rule or implementation on the go

The developer has the final word. If your developer disagrees with anything in this file or the task file:
1. Do it the developer's way.
2. Add a line under "Decisions" in your own task file: `DECISION: <what changed> because <reason>`.
3. If it changes `lib/types.ts`, a shared function signature, or the other person's work:
   stop, write it under "Requests to the other side", and the developers agree out loud first.
   Shawaiz then updates `lib/types.ts` and this file.
Decisions in a task file override this file for that developer's own area.
