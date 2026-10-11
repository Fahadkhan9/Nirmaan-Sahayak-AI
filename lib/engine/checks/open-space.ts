import type { Check, CheckId } from "@/lib/types";
import { findRow } from "../lookup";
import { makeRef } from "../ref";
import { tallBuilding, type OpenSpaceTable } from "../tables";
import { join, requiredText, tallText, type Detail } from "../text";

interface OpenSpaceArgs {
  id: CheckId;
  table: OpenSpaceTable;
  basis: number | undefined;
  proposed: number | undefined;
  height: number | undefined;
  missingDetail: Detail;
  note?: Detail;
}

// Shared logic for the front (Rule 56(1)(a)) and rear (Rule 56(2)(a)) tables.
export function openSpaceCheck(a: OpenSpaceArgs): Check {
  if (a.height !== undefined && a.height > a.table.appliesUpToHeightM) {
    return {
      id: a.id,
      status: "warn",
      detail: tallText(a.table.appliesUpToHeightM),
      refs: [makeRef(tallBuilding, tallBuilding.quote)],
    };
  }
  if (a.basis === undefined) {
    return { id: a.id, status: "missing", detail: a.missingDetail, refs: [] };
  }
  const row = findRow(a.table.rows, a.basis);
  if (!row) {
    return { id: a.id, status: "missing", detail: a.missingDetail, refs: [] };
  }
  const requiredM = row.valueM;
  const status = a.proposed === undefined ? "info" : a.proposed >= requiredM ? "pass" : "fail";
  return {
    id: a.id,
    status,
    requiredM,
    proposedM: a.proposed,
    detail: join(requiredText(requiredM, a.proposed), a.note),
    refs: [makeRef(a.table, row.quote)],
  };
}
