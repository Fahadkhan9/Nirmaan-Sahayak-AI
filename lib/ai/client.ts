import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-sonnet-5-5";

// Models that accept server-side refusal fallback with "default" routing.
const FALLBACK_MODELS = new Set(["claude-sonnet-5-5", "claude-opus-5-5", "claude-opus-5", "claude-fable-5-1"]);

let client: Anthropic | null = null;

export function hasAiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Created on first use so importing this file never needs a key (tests, eval, no-key mode).
export function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export function getModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
}

export function modelParams() {
  const model = getModel();
  return FALLBACK_MODELS.has(model)
    ? { model, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
    : { model };
}

interface ParsedResponse<T> {
  stop_reason: string | null;
  parsed_output: T | null;
}

// Structured output is null when Claude refused or ran out of tokens; treat both as a failed call.
export function parsedOrThrow<T>(res: ParsedResponse<T>): T {
  if (res.stop_reason === "refusal") throw new Error("Claude declined the request");
  if (res.stop_reason === "max_tokens") throw new Error("Claude response was cut off");
  if (res.parsed_output === null) throw new Error("Claude returned no structured output");
  return res.parsed_output;
}
