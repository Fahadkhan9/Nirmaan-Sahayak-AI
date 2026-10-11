"use server";

import { z } from "zod";
import type { AskResult } from "@/lib/types";
import { strings } from "@/lib/strings";
import { hasAiKey } from "@/lib/ai/client";
import { askError, runAsk } from "@/lib/ai/pipeline";

export async function askAction(text: string): Promise<AskResult> {
  // Server actions are public endpoints, so check the input type here too.
  const parsed = z.string().safeParse(text);
  if (!parsed.success) return askError(strings.errors.emptyInput);
  if (!hasAiKey()) return askError(strings.errors.noAiKey);
  return runAsk(parsed.data);
}
