import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { PlanInput } from "@/lib/types";
import { getClient, modelParams, parsedOrThrow } from "@/lib/ai/client";
import { EXTRACT_SYSTEM } from "@/lib/ai/prompts";

const LENGTH_KEYS = ["frontage", "streetWidth", "height", "front", "rear", "sideA", "sideB"] as const;
const AREA_KEYS = ["plotArea", "builtUpArea"] as const;
const PLAN_KEYS = [...AREA_KEYS, ...LENGTH_KEYS, "buildingType"] as const;

// Claude reports the unit it read; code does the conversion (Claude never does maths).
const TO_METRES = { m: 1, ft: 0.3048 } as const;
const TO_SQ_METRES = { sqm: 1, sqft: 0.092903, sqyd: 0.836127 } as const;

const length = z.object({ value: z.number(), unit: z.enum(["m", "ft"]) }).nullable();
const area = z.object({ value: z.number(), unit: z.enum(["sqm", "sqft", "sqyd"]) }).nullable();

export const ExtractSchema = z.object({
  kind: z.enum(["plan", "question", "both"]),
  fields: z.object({
    plotArea: area,
    builtUpArea: area,
    frontage: length,
    streetWidth: length,
    height: length,
    front: length,
    rear: length,
    sideA: length,
    sideB: length,
    buildingType: z.enum(["detached", "semi", "row"]).nullable(),
  }),
  missing: z.array(z.enum(PLAN_KEYS)),
  question: z.string().nullable(),
});

export type Extracted = z.infer<typeof ExtractSchema>;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function toPlanInput(fields: Extracted["fields"]): PlanInput {
  const out: PlanInput = {};
  for (const key of LENGTH_KEYS) {
    const v = fields[key];
    if (v && v.value > 0) out[key] = round2(v.value * TO_METRES[v.unit]);
  }
  for (const key of AREA_KEYS) {
    const v = fields[key];
    if (v && v.value > 0) out[key] = round2(v.value * TO_SQ_METRES[v.unit]);
  }
  if (fields.buildingType) out.buildingType = fields.buildingType;
  return out;
}

export async function extract(text: string): Promise<Extracted> {
  const res = await getClient().beta.messages.parse({
    ...modelParams(),
    max_tokens: 2000,
    output_config: { effort: "low", format: betaZodOutputFormat(ExtractSchema) },
    system: EXTRACT_SYSTEM,
    messages: [{ role: "user", content: text }],
  });
  return parsedOrThrow(res);
}
