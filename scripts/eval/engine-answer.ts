import { runChecks } from "@/lib/engine";
import { verifyQuote } from "@/lib/rules/verify";
import type { PlanInput, VerifiedRef } from "@/lib/types";

export interface EngineAnswer {
  text: string;
  ref: VerifiedRef;
}

// Plan-style questions ("10 m street, how much front gap?") are answered on screen by the rules engine,
// not by a text answer. Count one only when a check's required gap equals the expected number.
export function engineAnswer(fields: PlanInput, expectValue: string): EngineAnswer | null {
  if (!/^\d+(\.\d+)?$/.test(expectValue.trim())) return null;
  const expected = Number(expectValue);
  const check = runChecks(fields).find((c) => c.requiredM === expected && c.refs.length > 0);
  if (!check) return null;
  return {
    text: `engine: ${check.id} needs ${check.requiredM} m`,
    ref: verifyQuote(check.refs[0]),
  };
}
