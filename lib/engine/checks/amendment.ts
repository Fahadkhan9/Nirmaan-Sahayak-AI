import type { Check, PlanInput } from "@/lib/types";
import { makeRef } from "../ref";
import { amendments } from "../tables";

// Later notifications that this rulebook version does not include.
export function amendmentCheck(input: PlanInput): Check | null {
  const area = input.plotArea;
  if (area === undefined) return null;
  const hit = amendments.find((a) => area <= a.appliesWhen.plotAreaSqmMaxInclusive);
  if (!hit) return null;
  return {
    id: "amendment",
    status: "warn",
    detail: { hi: hit.messageHi, en: hit.message },
    refs: [makeRef(hit, hit.quote)],
  };
}
