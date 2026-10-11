"use client";

import { bi } from "@/lib/strings";
import type { FieldLabel } from "@/lib/strings";

interface NumberFieldProps {
  id: string;
  label: FieldLabel;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function NumberField({ id, label, value, onChange }: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {bi(label)}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value ?? ""}
          onChange={(e) => {
            // Empty box means "not given", never 0.
            const n = e.target.valueAsNumber;
            onChange(e.target.value === "" || Number.isNaN(n) ? undefined : n);
          }}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        />
        {label.unit && (
          <span className="shrink-0 text-sm text-zinc-500">{label.unit.en}</span>
        )}
      </div>
    </div>
  );
}
