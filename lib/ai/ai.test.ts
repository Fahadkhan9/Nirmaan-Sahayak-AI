import { describe, expect, it } from "vitest";
import tables from "@/data/tables.json";
import { toPlanInput } from "@/lib/ai/extract";
import type { Extracted } from "@/lib/ai/extract";
import { toAnswerResult } from "@/lib/ai/answer";
import { runAsk } from "@/lib/ai/pipeline";

const empty: Extracted["fields"] = {
  plotArea: null,
  builtUpArea: null,
  frontage: null,
  streetWidth: null,
  height: null,
  front: null,
  rear: null,
  sideA: null,
  sideB: null,
  buildingType: null,
};

describe("toPlanInput", () => {
  it("keeps metric values and building type", () => {
    const out = toPlanInput({
      ...empty,
      plotArea: { value: 200, unit: "sqm" },
      rear: { value: 1.5, unit: "m" },
      buildingType: "semi",
    });
    expect(out).toEqual({ plotArea: 200, rear: 1.5, buildingType: "semi" });
  });

  it("converts feet, square feet and gaj in code", () => {
    const out = toPlanInput({
      ...empty,
      streetWidth: { value: 30, unit: "ft" },
      plotArea: { value: 1200, unit: "sqft" },
      builtUpArea: { value: 100, unit: "sqyd" },
    });
    expect(out).toEqual({ streetWidth: 9.14, plotArea: 111.48, builtUpArea: 83.61 });
  });

  it("drops zero and negative numbers", () => {
    expect(toPlanInput({ ...empty, front: { value: 0, unit: "m" }, rear: { value: -2, unit: "m" } })).toEqual({});
  });
});

describe("toAnswerResult", () => {
  const quote = tables.rearOpenSpace.rows[2].quote;

  it("verifies the quote of a found answer", () => {
    const out = toAnswerResult({
      found: true,
      language: "en",
      answer: " 2.5 m. ",
      rule: "56(2)(a)",
      ruleId: "56",
      page: 78,
      quote,
    });
    expect(out.answer).toBe("2.5 m.");
    expect(out.ref).toMatchObject({ verified: true, ruleId: "56", page: 78 });
  });

  it("returns no ref when not found", () => {
    const out = toAnswerResult({
      found: false,
      language: "en",
      answer: "Not in the rules.",
      rule: null,
      ruleId: null,
      page: null,
      quote: null,
    });
    expect(out.ref).toBeUndefined();
  });
});

describe("runAsk input checks (no API call)", () => {
  it("rejects empty text", async () => {
    expect((await runAsk("   ")).error).toBeTruthy();
  });

  it("rejects text over 1000 characters", async () => {
    expect((await runAsk("a".repeat(1001))).error).toBeTruthy();
  });
});
