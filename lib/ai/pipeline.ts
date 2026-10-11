import Anthropic from "@anthropic-ai/sdk";
import type { AskResult } from "@/lib/types";
import { bi, strings } from "@/lib/strings";
import type { Bi } from "@/lib/strings";
import { answer } from "@/lib/ai/answer";
import { extract, toPlanInput } from "@/lib/ai/extract";

const MAX_CHARS = 1000;

export function askError(message: Bi): AskResult {
  return { kind: "question", fields: {}, missing: [], error: bi(message) };
}

// Log only the error type and status, never the clerk's text (no personal data in logs).
function logFailure(step: string, err: unknown): void {
  const status = err instanceof Anthropic.APIError ? err.status : undefined;
  console.error(`ask: ${step} failed`, err instanceof Error ? err.name : "unknown", status ?? "");
}

export async function runAsk(text: string): Promise<AskResult> {
  const input = text.trim();
  if (!input) return askError(strings.errors.emptyInput);
  if (input.length > MAX_CHARS) return askError(strings.errors.tooLong);

  let result: AskResult;
  let question: string | null;
  try {
    const extracted = await extract(input);
    const fields = toPlanInput(extracted.fields);
    const missing = extracted.missing.filter((key) => fields[key] === undefined);
    result = { kind: extracted.kind, fields, missing };
    question = extracted.question?.trim() || null;
  } catch (err) {
    logFailure("extract", err);
    return askError(strings.errors.askFailed);
  }

  if (!question) return result;
  try {
    return { ...result, answer: await answer(question) };
  } catch (err) {
    // Keep the extracted fields so the plan check still runs.
    logFailure("answer", err);
    return { ...result, error: bi(strings.errors.answerFailed) };
  }
}
