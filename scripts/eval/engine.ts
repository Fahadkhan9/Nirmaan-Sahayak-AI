import evalCases from "@/data/eval_cases.json";
import { runChecks } from "@/lib/engine";
import type { CheckId, PlanInput } from "@/lib/types";

export interface EngineResult {
  id: string;
  note: string;
  check: string;
  expected: string;
  got: string;
  ok: boolean;
}

// Each case names one check and one expected value: requiredM, fee total or status.
export function runEngineCases(): EngineResult[] {
  return evalCases.engineCases.map((c) => {
    const check = runChecks(c.input as PlanInput).find((r) => r.id === (c.check as CheckId));
    let expected: string;
    let got: string;
    if ("expectRequiredM" in c) {
      expected = `requiredM ${c.expectRequiredM}`;
      got = `requiredM ${check?.requiredM ?? "-"}`;
    } else if ("expectFeeRs" in c) {
      expected = `Rs ${c.expectFeeRs}`;
      got = `Rs ${check?.amountRs ?? "-"}`;
    } else {
      expected = `status ${c.expectStatus}`;
      got = `status ${check?.status ?? "-"}`;
    }
    return { id: c.id, note: c.note, check: c.check, expected, got, ok: check !== undefined && expected === got };
  });
}
