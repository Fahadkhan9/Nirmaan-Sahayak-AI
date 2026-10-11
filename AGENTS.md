<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules (Nirmaan Sahayak AI)

For any AI coding agent on this repo (Claude Code, Google Antigravity, or other).

The rules live in `CLAUDE.md`. Read it fully before doing anything; it is binding for every agent, not only Claude.
Then read your developer's task file: `tasks/SHAWAIZ.md` or `tasks/FAHAD.md`.

Short version (CLAUDE.md wins if they ever differ):
- Only edit files your developer owns (CLAUDE.md section 7).
- Never commit to `main` or `develop`. Work on `feature/<task>-<name>` from `develop`, PR into `develop` (section 8).
- Do not edit `lib/types.ts` or install npm packages unless you work for Shawaiz.
- Run `npm run lint`, `npm run typecheck`, `npm test` before every push.
