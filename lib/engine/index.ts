import type { Check, PlanInput } from "@/lib/types";
import { amendmentCheck } from "./checks/amendment";
import { feeCheck } from "./checks/fee";
import { frontCheck } from "./checks/front";
import { heightCheck } from "./checks/height";
import { plotTypeCheck } from "./checks/plot-type";
import { rearCheck } from "./checks/rear";
import { sideCheck } from "./checks/side";

const CHECKS = [amendmentCheck, heightCheck, frontCheck, rearCheck, sideCheck, plotTypeCheck, feeCheck];

export function runChecks(input: PlanInput): Check[] {
  return CHECKS.map((check) => check(input)).filter((c): c is Check => c !== null);
}
