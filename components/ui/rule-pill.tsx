import { strings } from "@/lib/strings";

interface RulePillProps {
  rule: string;
  page: number;
}

// Rule numbers and pages refer to the English PDF, so the pill text stays English.
export function RulePill({ rule, page }: RulePillProps) {
  const { rule: ruleLabel, page: pageLabel } = strings.ref;
  return (
    <span
      className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-0.5 font-mono text-sm text-zinc-700"
      title={`${ruleLabel.hi} ${rule}, ${pageLabel.hi} ${page}`}
    >
      {ruleLabel.en} {rule} · {pageLabel.en}
      {page}
    </span>
  );
}
