import { Card } from "@/components/ui/card";
import { rs } from "@/lib/engine/text";
import { bi, strings } from "@/lib/strings";
import type { Check } from "@/lib/types";

interface CheckSummaryProps {
  checks: Check[];
}

export function CheckSummary({ checks }: CheckSummaryProps) {
  const fee = checks.find((c) => c.id === "fee")?.amountRs;
  const tiles = [
    { label: strings.check.passCount, value: String(checks.filter((c) => c.status === "pass").length) },
    { label: strings.check.failCount, value: String(checks.filter((c) => c.status === "fail").length) },
    { label: strings.check.totalFee, value: fee === undefined ? "—" : rs(fee) },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map((tile) => (
        <Card key={tile.label.en} className="text-center">
          <p className="text-sm text-zinc-600">{bi(tile.label)}</p>
          <p className="text-2xl font-bold text-zinc-900">{tile.value}</p>
        </Card>
      ))}
    </div>
  );
}
