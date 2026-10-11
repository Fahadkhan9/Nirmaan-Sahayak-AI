import type { Check, PlanInput } from "@/lib/types";
import { makeRef } from "../ref";
import { frontTable } from "../tables";
import { m } from "../text";
import { openSpaceCheck } from "./open-space";

export function frontCheck(input: PlanInput): Check | null {
  const { narrowStreet } = frontTable;
  const narrow = input.streetWidth !== undefined && input.streetWidth < narrowStreet.streetBelowM;
  const check = openSpaceCheck({
    id: "front",
    table: frontTable,
    basis: input.streetWidth,
    proposed: input.front,
    height: input.height,
    missingDetail: { hi: "सड़क की चौड़ाई चाहिए।", en: "Road width needed." },
    note: narrow
      ? {
          hi: `पुराने बसे क्षेत्र में ${m(narrowStreet.streetBelowM)} से कम चौड़ी सड़क हो तो भवन रेखा सड़क के बीच से ${m(narrowStreet.buildingLineFromCentreM)} पर होगी (नियम 56(1)(b))। यह यहां जांचा नहीं गया।`,
          en: `In existing developed areas with streets under ${m(narrowStreet.streetBelowM)}, the building line is ${m(narrowStreet.buildingLineFromCentreM)} from the street centre line (Rule 56(1)(b)). Not checked here.`,
        }
      : undefined,
  });
  if (narrow && check.status !== "warn" && check.status !== "missing") {
    check.refs.push(makeRef(narrowStreet, narrowStreet.quote));
  }
  return check;
}
