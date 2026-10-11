import type { Check, PlanInput, RuleRef } from "@/lib/types";
import { makeRef } from "../ref";
import { sideTable, tallBuilding } from "../tables";
import { join, m, requiredText, tallText, type Detail } from "../text";

type Relax = "applies" | "ruledOut" | "unknown";

// Rule 56(3). Like front and rear, it only covers buildings up to 12.5 m.
export function sideCheck(input: PlanInput): Check | null {
  if (!input.buildingType) {
    return { id: "side", status: "missing", detail: { hi: "भवन का प्रकार चाहिए।", en: "Building type needed." }, refs: [] };
  }
  if (input.height !== undefined && input.height > tallBuilding.thresholdM) {
    return { id: "side", status: "warn", detail: tallText(tallBuilding.thresholdM), refs: [makeRef(tallBuilding, tallBuilding.quote)] };
  }
  if (input.buildingType === "row") {
    return {
      id: "side",
      status: "pass",
      detail: { hi: "कतार भवन में बगल की खाली जगह ज़रूरी नहीं।", en: "No side open space required for row-type buildings." },
      refs: [makeRef(sideTable, sideTable.row.quote)],
    };
  }
  return input.buildingType === "detached" ? detached(input) : semi(input);
}

function relaxState(heightOk: boolean | undefined, frontageOk: boolean | undefined): Relax {
  if (heightOk === false || frontageOk === false) return "ruledOut";
  return heightOk && frontageOk ? "applies" : "unknown";
}

function detached(input: PlanInput): Check {
  const d = sideTable.detached;
  const r = d.relaxation;
  const relax = relaxState(
    input.height === undefined ? undefined : input.height <= r.maxHeightM,
    input.frontage === undefined ? undefined : input.frontage < r.frontageLessThanM,
  );
  const refs: RuleRef[] = [makeRef(sideTable, d.quote)];
  if (relax !== "ruledOut") refs.push(makeRef(sideTable, r.quote));
  const rule: Detail =
    relax === "applies"
      ? { hi: `एक तरफ ${m(d.bothSidesM)} और दूसरी तरफ कम से कम ${m(r.oneSideM)}।`, en: `One side ${m(d.bothSidesM)}, the other at least ${m(r.oneSideM)}.` }
      : { hi: `दोनों तरफ ${m(d.bothSidesM)}।`, en: `${m(d.bothSidesM)} on both sides.` };
  const note: Detail | undefined =
    relax === "unknown"
      ? {
          hi: `ऊंचाई ${m(r.maxHeightM)} तक और फ्रंटेज ${m(r.frontageLessThanM)} से कम हो तो एक तरफ ${m(r.oneSideM)} हो सकती है।`,
          en: `May reduce one side to ${m(r.oneSideM)} if height up to ${m(r.maxHeightM)} and frontage under ${m(r.frontageLessThanM)}.`,
        }
      : undefined;

  const sides = [input.sideA, input.sideB].filter((s): s is number => s !== undefined);
  const lowest = relax === "applies" ? r.oneSideM : d.bothSidesM;
  if (sides.length < 2) {
    const one = sides[0];
    const fails = one !== undefined && one < lowest;
    const need: Detail = { hi: "दोनों तरफ की खाली जगह बताएं।", en: "Give the open space on both sides." };
    return {
      id: "side",
      status: fails ? "fail" : "info",
      requiredM: fails ? lowest : d.bothSidesM,
      proposedM: one,
      detail: join(fails ? requiredText(lowest, one) : rule, fails ? undefined : need, note),
      refs,
    };
  }

  const lo = Math.min(...sides);
  const hi = Math.max(...sides);
  // Compare the side that decides the result, so required/proposed explain the outcome.
  let requiredM = d.bothSidesM;
  let proposedM = lo;
  if (relax === "applies" && lo < d.bothSidesM) {
    if (hi < d.bothSidesM) proposedM = hi;
    else requiredM = r.oneSideM;
  }
  return {
    id: "side",
    status: proposedM >= requiredM ? "pass" : "fail",
    requiredM,
    proposedM,
    detail: join(rule, note),
    refs,
  };
}

function semi(input: PlanInput): Check {
  const s = sideTable.semi;
  const r = s.relaxation;
  const relax = relaxState(
    input.height === undefined ? undefined : input.height <= r.maxHeightM,
    input.frontage === undefined ? undefined : input.frontage <= r.maxFrontageM,
  );
  const requiredM = relax === "applies" ? r.oneSideM : s.oneSideM;
  const sides = [input.sideA, input.sideB].filter((v): v is number => v !== undefined);
  const proposedM = sides.length ? Math.max(...sides) : undefined;
  const refs: RuleRef[] = [makeRef(sideTable, s.quote)];
  if (relax !== "ruledOut") refs.push(makeRef(sideTable, r.quote));
  const note: Detail | undefined =
    relax === "unknown"
      ? {
          hi: `ऊंचाई ${m(r.maxHeightM)} तक और फ्रंटेज ${m(r.maxFrontageM)} तक हो तो ${m(r.oneSideM)} काफ़ी है।`,
          en: `May be ${m(r.oneSideM)} if height up to ${m(r.maxHeightM)} and frontage up to ${m(r.maxFrontageM)}.`,
        }
      : undefined;
  return {
    id: "side",
    status: proposedM === undefined ? "info" : proposedM >= requiredM ? "pass" : "fail",
    requiredM,
    proposedM,
    detail: join({ hi: "एक तरफ खाली जगह:", en: "Open space on one side:" }, requiredText(requiredM, proposedM), note),
    refs,
  };
}
