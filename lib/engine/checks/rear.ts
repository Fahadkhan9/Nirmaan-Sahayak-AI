import type { Check, PlanInput } from "@/lib/types";
import { rearTable } from "../tables";
import { openSpaceCheck } from "./open-space";

export function rearCheck(input: PlanInput): Check | null {
  return openSpaceCheck({
    id: "rear",
    table: rearTable,
    basis: input.plotArea,
    proposed: input.rear,
    height: input.height,
    missingDetail: { hi: "प्लॉट का क्षेत्रफल चाहिए।", en: "Plot area needed." },
  });
}
