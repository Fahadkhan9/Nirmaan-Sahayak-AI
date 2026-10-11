import type { BuildingType, Check, PlanInput } from "@/lib/types";
import { makeRef } from "../ref";
import { plotTypeTable as t } from "../tables";
import { join, m, type Detail } from "../text";

const TYPE_NAMES: Record<BuildingType, Detail> = {
  detached: { hi: "पृथक", en: "detached" },
  semi: { hi: "अर्ध-पृथक", en: "semi-detached" },
  row: { hi: "कतार (row)", en: "row-type" },
};

const TYPES: BuildingType[] = ["detached", "semi", "row"];

// Rule 53(1)(i). Frontage is optional: when missing, only the plot size is checked.
function fits(type: BuildingType, plot: number, frontage: number | undefined): boolean {
  if (type === "detached") {
    return plot > t.detached.plotMinExclusive && (frontage === undefined || frontage > t.detached.frontageMinExclusive);
  }
  const r = t[type];
  const plotOk = plot >= r.plotMin && plot <= r.plotMax;
  return plotOk && (frontage === undefined || (frontage >= r.frontageMin && frontage <= r.frontageMax));
}

export function plotTypeCheck(input: PlanInput): Check | null {
  const { buildingType, plotArea, frontage } = input;
  if (!buildingType || plotArea === undefined) {
    return {
      id: "plotType",
      status: "missing",
      detail: { hi: "भवन का प्रकार और प्लॉट का क्षेत्रफल चाहिए।", en: "Building type and plot area needed." },
      refs: [],
    };
  }
  const name = TYPE_NAMES[buildingType];
  const mainRef = makeRef(t, t[buildingType].quote);
  const noFrontage: Detail | undefined =
    frontage === undefined ? { hi: "फ्रंटेज नहीं दिया, उसकी जांच नहीं हुई।", en: "Frontage not given, not checked." } : undefined;

  if (fits(buildingType, plotArea, frontage)) {
    return {
      id: "plotType",
      status: "pass",
      detail: join({ hi: `प्लॉट का आकार ${name.hi} भवन के लिए ठीक है।`, en: `Plot size fits a ${name.en} building.` }, noFrontage),
      refs: [mainRef],
    };
  }

  const others = TYPES.filter((ty) => ty !== buildingType && fits(ty, plotArea, frontage)).map((ty) => TYPE_NAMES[ty]);
  const given = frontage === undefined ? `${plotArea} sq m` : `${plotArea} sq m, ${m(frontage)}`;
  const fitText: Detail = others.length
    ? { hi: `ये माप इनके लिए ठीक हैं: ${others.map((o) => o.hi).join(", ")}।`, en: `These numbers fit: ${others.map((o) => o.en).join(", ")}.` }
    : { hi: "ये माप किसी भी प्रकार के लिए ठीक नहीं हैं।", en: "These numbers fit no building type." };
  return {
    id: "plotType",
    status: "fail",
    detail: join(
      { hi: `${given}: ${name.hi} भवन के लिए नहीं चलेगा।`, en: `${given}: does not fit a ${name.en} building.` },
      fitText,
      { hi: "EWS/LIG प्लॉट के नियम Appendix-J में हैं।", en: "EWS/LIG plots follow Appendix-J." },
      noFrontage,
    ),
    refs: [mainRef, makeRef(t.ewsLig, t.ewsLig.quote)],
  };
}
