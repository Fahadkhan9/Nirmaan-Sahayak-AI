import evalCases from "@/data/eval_cases.json";
import type { AskResult } from "@/lib/types";
import { engineAnswer } from "./engine-answer";

type RunAsk = (text: string) => Promise<AskResult>;

export interface AskCaseResult {
  id: string;
  lang: string;
  expectFound: boolean;
  acceptRules: string[];
  kind: AskResult["kind"];
  answeredBy: "ai" | "engine" | null;
  found: boolean;
  ruleId: string | null;
  rule: string | null;
  page: number | null;
  verified: boolean | null;
  answer: string | null;
  error: string | null;
  ms: number;
  foundOk: boolean;
  ruleOk: boolean | null; // null = not scored (case expects "not found")
  verifiedOk: boolean | null; // null = not scored (nothing found)
}

// Loaded by a variable path so this file still typechecks before lib/ai/pipeline.ts exists (S3).
export async function loadRunAsk(): Promise<{ runAsk: RunAsk } | { reason: string }> {
  const modulePath = "../../lib/ai/pipeline";
  try {
    const mod: { runAsk?: unknown } = await import(modulePath);
    if (typeof mod.runAsk !== "function") return { reason: "lib/ai/pipeline.ts has no runAsk export" };
    return { runAsk: mod.runAsk as RunAsk };
  } catch (e) {
    return { reason: `could not load lib/ai/pipeline.ts (${e instanceof Error ? e.message.split("\n")[0] : e})` };
  }
}

// One call at a time to stay under rate limits.
export async function runAskCases(runAsk: RunAsk): Promise<AskCaseResult[]> {
  const results: AskCaseResult[] = [];
  for (const c of evalCases.askCases) {
    process.stdout.write(`  ${c.id} ... `);
    const start = Date.now();
    let res: AskResult;
    try {
      res = await runAsk(c.question);
    } catch (e) {
      res = { kind: "question", fields: {}, missing: [], error: e instanceof Error ? e.message : String(e) };
    }
    const ms = Date.now() - start;
    const a = res.answer;
    const byAi = a?.found === true;
    const byEngine = !byAi && !res.error ? engineAnswer(res.fields, c.expectValue) : null;
    const found = byAi || byEngine !== null;
    const ref = byAi ? a?.ref : byEngine?.ref;
    const r: AskCaseResult = {
      id: c.id,
      lang: c.lang,
      expectFound: c.expectFound,
      acceptRules: c.acceptRules,
      kind: res.kind,
      answeredBy: byAi ? "ai" : byEngine ? "engine" : null,
      found,
      ruleId: ref?.ruleId ?? null,
      rule: ref?.rule ?? null,
      page: ref?.page ?? null,
      verified: ref?.verified ?? null,
      answer: byEngine ? byEngine.text : (a?.answer ?? null),
      error: res.error ?? null,
      ms,
      foundOk: !res.error && found === c.expectFound,
      ruleOk: c.expectFound ? ref !== undefined && c.acceptRules.includes(ref.ruleId) : null,
      verifiedOk: found ? ref?.verified === true : null,
    };
    console.log(`${r.foundOk ? "ok" : "MISS"} (${ms} ms)`);
    results.push(r);
  }
  return results;
}
