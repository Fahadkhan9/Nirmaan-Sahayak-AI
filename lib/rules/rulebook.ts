import rules from "@/data/rules.json";

export interface Rule {
  rule: string; // top-level rule number, e.g. "56" or "26-B"
  title: string;
  page_start: number;
  page_end: number;
  text: string;
}

const allRules: Rule[] = rules;
const byId = new Map(allRules.map((r) => [r.rule.toUpperCase(), r]));

export function listRules(): Rule[] {
  return allRules;
}

export function getRule(ruleId: string): Rule | undefined {
  return byId.get(ruleId.trim().toUpperCase());
}

export function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

let cachedText: string | null = null;

// The whole rulebook as one prompt string; built once per server instance.
export function rulebookText(): string {
  cachedText ??= allRules
    .map((r) => `=== Rule ${r.rule}: ${r.title} (PDF pages ${r.page_start}-${r.page_end}) ===\n${r.text}`)
    .join("\n\n");
  return cachedText;
}
