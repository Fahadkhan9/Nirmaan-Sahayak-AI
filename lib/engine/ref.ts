import type { RuleRef } from "@/lib/types";
import type { RefSource } from "./tables";

export function makeRef(source: RefSource, quote: string): RuleRef {
  return {
    rule: source.rule,
    ruleId: source.ruleId,
    page: source.page,
    quote: quote.replace(/\s+/g, " ").trim(),
  };
}
