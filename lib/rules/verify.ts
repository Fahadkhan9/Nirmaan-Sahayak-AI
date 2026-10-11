import type { RuleRef, VerifiedRef } from "@/lib/types";
import { getRule, listRules, normalize } from "@/lib/rules/rulebook";
import type { Rule } from "@/lib/rules/rulebook";

// Shorter quotes ("Rs 1.00") match by chance, so they never count as verified.
const MIN_QUOTE_CHARS = 12;

let searchable: Map<Rule, string> | null = null;

function searchText(rule: Rule): string {
  searchable ??= new Map(listRules().map((r) => [r, normalize(r.text).toLowerCase()]));
  return searchable.get(rule) ?? "";
}

// Keep Claude's sub-rule (e.g. "17-a" inside 17) unless it names a different rule.
function printedRule(printed: string, ruleId: string): string {
  const escaped = ruleId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}(?![0-9])`, "i").test(printed.trim()) ? printed : ruleId;
}

export function verifyQuote(ref: RuleRef): VerifiedRef {
  const quote = normalize(ref.quote);
  const needle = quote.toLowerCase();
  if (needle.length < MIN_QUOTE_CHARS) return { ...ref, quote, verified: false };

  const own = getRule(ref.ruleId);
  if (own && searchText(own).includes(needle)) {
    const pageOk = ref.page >= own.page_start && ref.page <= own.page_end;
    return { ...ref, quote, ruleId: own.rule, page: pageOk ? ref.page : own.page_start, verified: true };
  }

  // Claude sometimes names the wrong rule; accept only if exactly one other rule holds the quote.
  const hits = listRules().filter((r) => r !== own && searchText(r).includes(needle));
  if (hits.length === 1) {
    const [hit] = hits;
    return {
      rule: printedRule(ref.rule, hit.rule),
      ruleId: hit.rule,
      page: hit.page_start,
      quote,
      verified: true,
    };
  }
  return { ...ref, quote, verified: false };
}
