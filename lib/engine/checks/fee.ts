import type { Check, PlanInput } from "@/lib/types";
import { findRow } from "../lookup";
import { makeRef } from "../ref";
import { applicationFee, permissionFeeTable as fees } from "../tables";
import { join, m, rs, type Detail } from "../text";

// Rule 21: permission fee slab (21(3)(b), residential) + application fee (21(2)(ii)).
export function feeCheck(input: PlanInput): Check | null {
  const area = input.builtUpArea;
  if (area === undefined) return null;

  const { highRise, otherUses } = fees;
  if (input.height !== undefined && input.height > highRise.heightAboveM) {
    return {
      id: "fee",
      status: "warn",
      detail: {
        hi: `${m(highRise.heightAboveM)} से ऊंचा भवन हाई-राइज़ है (नियम 2(38))। इसकी फीस नियम 21(3)(c) से लगेगी, यहां गणना नहीं की गई।`,
        en: `Above ${m(highRise.heightAboveM)} is a high-rise building (Rule 2(38)). Its fee follows Rule 21(3)(c), not calculated here.`,
      },
      refs: [makeRef(highRise, highRise.quote)],
    };
  }

  const row = findRow(fees.rows, area);
  if (!row) return null;
  const permission = row.feeRs;
  const application = Math.round(area * applicationFee.rsPerSqmBuiltUp);
  const total = permission + application;

  // Printed slabs are whole numbers (0-75, 76-125...). Values between them use the next slab.
  const inGap = row.minExclusive !== null && row.maxInclusive !== null && area < row.minExclusive + 1;
  const gapNote: Detail | undefined = inGap
    ? { hi: "छपी स्लैब के बीच का माप: अगली स्लैब ली गई।", en: "Area falls between printed slabs: the next slab is used." }
    : undefined;

  return {
    id: "fee",
    status: "info",
    amountRs: total,
    detail: join(
      {
        hi: `अनुमति फीस ${rs(permission)} (नियम 21(3)(b)) + आवेदन फीस ${rs(application)} (नियम 21(2)(ii)) = ${rs(total)}।`,
        en: `Permission fee ${rs(permission)} (Rule 21(3)(b)) + application fee ${rs(application)} (Rule 21(2)(ii)) = ${rs(total)}.`,
      },
      {
        hi: `केवल आवासीय भवन के लिए। दुकान, व्यावसायिक और दुकान-सह-आवास पर ${otherUses.surchargePct}% अधिक (नियम 21(3)(b) मद 2 और 4)।`,
        en: `Residential buildings only. Shops, commercial and shops-cum-residence pay ${otherUses.surchargePct}% more (Rule 21(3)(b) items 2 and 4).`,
      },
      gapNote,
    ),
    refs: [makeRef(fees, row.quote), makeRef(applicationFee, applicationFee.quote), makeRef(otherUses, otherUses.quote)],
  };
}
