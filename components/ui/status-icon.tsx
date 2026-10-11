import { bi, strings } from "@/lib/strings";
import type { CheckStatus } from "@/lib/types";

interface StatusIconProps {
  status: CheckStatus;
}

// Icon + text + colour, so status never depends on colour alone.
const look: Record<CheckStatus, { icon: string; className: string }> = {
  pass: { icon: "✓", className: "bg-green-100 text-green-800" },
  fail: { icon: "✗", className: "bg-red-100 text-red-800" },
  warn: { icon: "!", className: "bg-amber-100 text-amber-900" },
  missing: { icon: "?", className: "bg-zinc-100 text-zinc-700" },
  info: { icon: "i", className: "bg-blue-100 text-blue-800" },
};

export function StatusIcon({ status }: StatusIconProps) {
  const { icon, className } = look[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold ${className}`}
    >
      <span aria-hidden="true">{icon}</span>
      {bi(strings.status[status])}
    </span>
  );
}
