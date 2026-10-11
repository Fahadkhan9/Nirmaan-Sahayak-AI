import { RulePill } from "@/components/ui/rule-pill";
import { StatusIcon } from "@/components/ui/status-icon";
import { m } from "@/lib/engine/text";
import { bi, strings } from "@/lib/strings";
import type { Check } from "@/lib/types";
import { QuoteBlock } from "./quote-block";

interface CheckRowProps {
  check: Check;
}

export function CheckRow({ check }: CheckRowProps) {
  const failed = check.status === "fail";
  return (
    <li
      className={`rounded-xl border p-4 ${failed ? "border-red-200 bg-red-50" : "border-zinc-200 bg-white"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusIcon status={check.status} />
        <h3 className="font-semibold text-zinc-900">{bi(strings.checks[check.id])}</h3>
      </div>
      {(check.requiredM !== undefined || check.proposedM !== undefined) && (
        <p className="mt-2 text-sm text-zinc-700">
          {check.requiredM !== undefined && `${bi(strings.check.required)}: ${m(check.requiredM)}`}
          {check.requiredM !== undefined && check.proposedM !== undefined && " · "}
          {check.proposedM !== undefined && `${bi(strings.check.proposed)}: ${m(check.proposedM)}`}
        </p>
      )}
      {check.detail && (
        <div className="mt-2 text-sm text-zinc-800">
          <p>{check.detail.hi}</p>
          <p className="text-zinc-600">{check.detail.en}</p>
        </div>
      )}
      {check.refs.map((ref) => (
        <div key={`${ref.rule}-${ref.quote}`} className="mt-3 flex flex-col gap-2">
          <RulePill rule={ref.rule} page={ref.page} />
          {/* Engine quotes come from tables.json, which was checked word for word against the PDF. */}
          <QuoteBlock quote={ref.quote} page={ref.page} verified />
        </div>
      ))}
    </li>
  );
}
