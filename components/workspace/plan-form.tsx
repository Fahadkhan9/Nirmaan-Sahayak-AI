"use client";

import { Card } from "@/components/ui/card";
import { NumberField } from "@/components/ui/number-field";
import { bi, strings } from "@/lib/strings";
import type { BuildingType, PlanInput } from "@/lib/types";

type NumericKey = Exclude<keyof PlanInput, "buildingType">;

const NUMERIC_KEYS: NumericKey[] = [
  "plotArea",
  "frontage",
  "streetWidth",
  "height",
  "front",
  "rear",
  "sideA",
  "sideB",
  "builtUpArea",
];
const BUILDING_TYPES: BuildingType[] = ["detached", "semi", "row"];

interface PlanFormProps {
  fields: PlanInput;
  onChange: (fields: PlanInput) => void;
  missing: (keyof PlanInput)[];
}

export function PlanForm({ fields, onChange, missing }: PlanFormProps) {
  const stillMissing = missing.filter((key) => fields[key] === undefined);
  return (
    <Card as="section">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">{bi(strings.sections.plan)}</h2>
      {stillMissing.length > 0 && (
        <p className="mb-3 flex flex-wrap items-center gap-2 text-sm print:hidden">
          <span className="font-medium text-zinc-700">{bi(strings.check.add)}:</span>
          {stillMissing.map((key) => (
            <span key={key} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-900">
              {bi(strings.fields[key])}
            </span>
          ))}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="buildingType" className="text-sm font-medium text-zinc-700">
            {bi(strings.fields.buildingType)}
          </label>
          <select
            id="buildingType"
            value={fields.buildingType ?? ""}
            onChange={(e) =>
              onChange({ ...fields, buildingType: (e.target.value || undefined) as BuildingType | undefined })
            }
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base"
          >
            <option value="">{bi(strings.actions.select)}</option>
            {BUILDING_TYPES.map((type) => (
              <option key={type} value={type}>
                {bi(strings.buildingTypes[type])}
              </option>
            ))}
          </select>
        </div>
        {NUMERIC_KEYS.map((key) => (
          <NumberField
            key={key}
            id={key}
            label={strings.fields[key]}
            value={fields[key]}
            onChange={(value) => onChange({ ...fields, [key]: value })}
          />
        ))}
      </div>
    </Card>
  );
}
