import type { Check, PlanInput } from "@/lib/types";
import { makeRef } from "../ref";
import { tallBuilding } from "../tables";
import { tallText } from "../text";

export function heightCheck(input: PlanInput): Check | null {
  if (input.height === undefined || input.height <= tallBuilding.thresholdM) return null;
  return {
    id: "height",
    status: "warn",
    detail: tallText(tallBuilding.thresholdM),
    refs: [makeRef(tallBuilding, tallBuilding.quote)],
  };
}
