// Eval: `npm run eval`. The engine part needs nothing; the Ask part needs ANTHROPIC_API_KEY in .env.
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { RULES_VERSION } from "@/lib/types";
import { loadRunAsk, runAskCases, type AskCaseResult } from "./eval/ask";
import { runEngineCases } from "./eval/engine";

const root = process.cwd();
const envFile = path.join(root, ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

function count(items: (boolean | null)[]): { ok: number; of: number } {
  const scored = items.filter((x): x is boolean => x !== null);
  return { ok: scored.filter(Boolean).length, of: scored.length };
}

async function main(): Promise<void> {
  console.log("\nEngine cases");
  const engine = runEngineCases();
  console.table(engine.map(({ id, check, expected, got, ok }) => ({ id, check, expected, got, ok: ok ? "ok" : "FAIL" })));
  const engineScore = count(engine.map((e) => e.ok));

  let ask: AskCaseResult[] = [];
  let askSkipped: string | null = null;
  if (!process.env.ANTHROPIC_API_KEY) {
    askSkipped = "ANTHROPIC_API_KEY is not set";
  } else {
    const loaded = await loadRunAsk();
    if ("reason" in loaded) askSkipped = loaded.reason;
    else {
      console.log("\nAsk cases (one at a time)");
      ask = await runAskCases(loaded.runAsk);
      console.table(
        ask.map((a) => ({
          id: a.id,
          expect: a.expectFound ? `found ${a.acceptRules.join("/")}` : "not found",
          got: a.error ? `error: ${a.error.slice(0, 40)}` : a.found ? `found ${a.rule} p.${a.page}` : "not found",
          found: a.foundOk ? "ok" : "MISS",
          rule: a.ruleOk === null ? "" : a.ruleOk ? "ok" : "MISS",
          verified: a.verifiedOk === null ? "" : a.verifiedOk ? "ok" : "NO",
        })),
      );
    }
  }

  const found = count(ask.map((a) => a.foundOk));
  const rule = count(ask.map((a) => a.ruleOk));
  const verified = count(ask.map((a) => a.verifiedOk));

  console.log("\nTotals");
  console.log(`  engine            ${engineScore.ok}/${engineScore.of}`);
  if (askSkipped) console.log(`  ask               skipped: ${askSkipped}`);
  else {
    console.log(`  found/not-found   ${found.ok}/${ask.length}`);
    console.log(`  rule              ${rule.ok}/${rule.of}`);
    console.log(`  verified quotes   ${verified.ok}/${verified.of}`);
  }

  const out = path.join(root, "data", "eval_results.json");
  const results = {
    timestamp: new Date().toISOString(),
    rulesVersion: RULES_VERSION,
    model: askSkipped ? null : (process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5"),
    totals: {
      engine: engineScore,
      ask: askSkipped
        ? { skipped: askSkipped }
        : { foundNotFound: { ok: found.ok, of: ask.length }, rule, verified },
    },
    engine,
    ask,
  };
  writeFileSync(out, JSON.stringify(results, null, 2) + "\n");
  console.log(`\nWrote ${path.relative(root, out)}`);

  if (engineScore.ok !== engineScore.of) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
