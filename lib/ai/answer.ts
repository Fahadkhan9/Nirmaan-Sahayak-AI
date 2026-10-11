import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { AnswerResult } from "@/lib/types";
import { getClient, modelParams, parsedOrThrow } from "@/lib/ai/client";
import { ANSWER_INSTRUCTIONS } from "@/lib/ai/prompts";
import { rulebookText } from "@/lib/rules/rulebook";
import { verifyQuote } from "@/lib/rules/verify";

export const AnswerSchema = z.object({
  found: z.boolean(),
  language: z.enum(["hi", "en"]),
  answer: z.string(),
  rule: z.string().nullable(),
  ruleId: z.string().nullable(),
  page: z.number().int().nullable(),
  quote: z.string().nullable(),
});

export type RawAnswer = z.infer<typeof AnswerSchema>;

export function toAnswerResult(raw: RawAnswer): AnswerResult {
  const result: AnswerResult = { found: raw.found, language: raw.language, answer: raw.answer.trim() };
  const { rule, ruleId, page, quote } = raw;
  if (!raw.found || !rule || !ruleId || page === null || !quote) return result;
  return { ...result, ref: verifyQuote({ rule, ruleId, page, quote }) };
}

export async function answer(question: string): Promise<AnswerResult> {
  const res = await getClient().beta.messages.parse({
    ...modelParams(),
    max_tokens: 4000,
    output_config: { effort: "medium", format: betaZodOutputFormat(AnswerSchema) },
    // Instructions first, then the ~70k-token rulebook as a cached block; the question stays out of the prefix.
    system: [
      { type: "text", text: ANSWER_INSTRUCTIONS },
      { type: "text", text: rulebookText(), cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: question }],
  });
  return toAnswerResult(parsedOrThrow(res));
}
