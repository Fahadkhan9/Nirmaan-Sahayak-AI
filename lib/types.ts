export type BuildingType = "detached" | "semi" | "row";

export interface PlanInput {
  plotArea?: number;      // sq m
  frontage?: number;      // m
  streetWidth?: number;   // m, width of street the plot faces
  height?: number;        // m
  buildingType?: BuildingType;
  front?: number;         // proposed front open space, m
  rear?: number;          // proposed rear open space, m
  sideA?: number;         // proposed side open space, side 1, m
  sideB?: number;         // proposed side open space, side 2, m
  builtUpArea?: number;   // sq m, total proposed built-up area
}

export type CheckId = "front" | "rear" | "side" | "plotType" | "height" | "fee" | "amendment";
export type CheckStatus = "pass" | "fail" | "warn" | "missing" | "info";

export interface RuleRef {
  rule: string;   // as printed, e.g. "56(2)(a)"
  ruleId: string; // top-level rule number for lookup, e.g. "56"
  page: number;   // English PDF page
  quote: string;  // exact English text, whitespace-normalised
}

export interface Check {
  id: CheckId;
  status: CheckStatus;
  requiredM?: number;     // for open-space checks
  proposedM?: number;
  amountRs?: number;      // for fee
  detail?: { hi: string; en: string }; // short explanation from engine templates
  refs: RuleRef[];        // one or more rule references
}

export interface VerifiedRef extends RuleRef { verified: boolean }

export interface AnswerResult {
  found: boolean;
  language: "hi" | "en";
  answer: string;          // short answer in the question's language
  ref?: VerifiedRef;
}

export interface AskResult {
  kind: "plan" | "question" | "both";
  fields: PlanInput;
  missing: (keyof PlanInput)[];
  answer?: AnswerResult;
  error?: string;
}

export const RULES_VERSION = "MP Bhumi Vikas Rules 2012, consolidated to 6 March 2025";
