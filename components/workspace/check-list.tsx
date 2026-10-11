import type { Check, CheckStatus } from "@/lib/types";
import { CheckRow } from "./check-row";

interface CheckListProps {
  checks: Check[];
}

// Problems first, so the clerk sees what blocks the plan without scrolling.
const ORDER: Record<CheckStatus, number> = { fail: 0, warn: 1, missing: 2, info: 3, pass: 4 };

export function CheckList({ checks }: CheckListProps) {
  const sorted = [...checks].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((check) => (
        <CheckRow key={check.id} check={check} />
      ))}
    </ul>
  );
}
