import tables from "@/data/tables.json";

// Typed views over data/tables.json. Every number the engine uses comes from here.

export interface RefSource {
  rule: string;
  ruleId: string;
  page: number;
}

export interface QuotedSource extends RefSource {
  quote: string;
}

export interface RangeRow {
  minExclusive: number | null;
  maxInclusive: number | null;
  quote: string;
}

export interface OpenSpaceRow extends RangeRow {
  valueM: number;
}

export interface FeeRow extends RangeRow {
  feeRs: number;
}

export interface OpenSpaceTable extends RefSource {
  appliesUpToHeightM: number;
  rows: OpenSpaceRow[];
}

export interface FrontTable extends OpenSpaceTable {
  narrowStreet: QuotedSource & { streetBelowM: number; buildingLineFromCentreM: number };
}

export interface SideTable extends RefSource {
  detached: {
    bothSidesM: number;
    quote: string;
    relaxation: { maxHeightM: number; frontageLessThanM: number; oneSideM: number; quote: string };
  };
  semi: {
    oneSideM: number;
    quote: string;
    relaxation: { maxHeightM: number; maxFrontageM: number; oneSideM: number; quote: string };
  };
  row: { quote: string };
}

export interface TallBuilding extends QuotedSource {
  thresholdM: number;
}

export interface PlotTypeTable extends RefSource {
  detached: { plotMinExclusive: number; frontageMinExclusive: number; quote: string };
  semi: { plotMin: number; plotMax: number; frontageMin: number; frontageMax: number; quote: string };
  row: { plotMin: number; plotMax: number; frontageMin: number; frontageMax: number; quote: string };
  ewsLig: QuotedSource;
}

export interface ApplicationFee extends QuotedSource {
  rsPerSqmBuiltUp: number;
}

export interface PermissionFeeTable extends RefSource {
  rows: FeeRow[];
  highRise: QuotedSource & { heightAboveM: number };
  otherUses: QuotedSource & { surchargePct: number };
}

export interface Amendment extends QuotedSource {
  id: string;
  date: string;
  appliesWhen: { plotAreaSqmMaxInclusive: number };
  message: string;
  messageHi: string;
}

export const frontTable: FrontTable = tables.frontOpenSpace;
export const rearTable: OpenSpaceTable = tables.rearOpenSpace;
export const sideTable: SideTable = tables.sideOpenSpace;
export const tallBuilding: TallBuilding = tables.tallBuilding;
export const plotTypeTable: PlotTypeTable = tables.plotType;
export const applicationFee: ApplicationFee = tables.applicationFee;
export const permissionFeeTable: PermissionFeeTable = tables.residentialPermissionFee;
export const amendments: Amendment[] = tables.amendments;
