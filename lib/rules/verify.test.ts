import { describe, expect, it } from "vitest";
import tables from "@/data/tables.json";
import { getRule, normalize, rulebookText } from "@/lib/rules/rulebook";
import { verifyQuote } from "@/lib/rules/verify";

const rearRow = tables.rearOpenSpace.rows[2]; // "3. Above 150 and up to 225.00 2.50", p.78

describe("verifyQuote", () => {
  it("verifies a real table quote in its own rule", () => {
    const ref = verifyQuote({ rule: "56(2)(a)", ruleId: "56", page: 78, quote: rearRow.quote });
    expect(ref).toMatchObject({ verified: true, ruleId: "56", page: 78 });
  });

  it("ignores whitespace and case differences", () => {
    const messy = `  ${rearRow.quote.toUpperCase().replace(/ /g, "\n  ")} `;
    const ref = verifyQuote({ rule: "56(2)(a)", ruleId: "56", page: 78, quote: messy });
    expect(ref.verified).toBe(true);
    expect(ref.quote).toBe(normalize(messy));
  });

  it("rejects made-up text", () => {
    const ref = verifyQuote({
      rule: "56(2)(a)",
      ruleId: "56",
      page: 78,
      quote: "Rear open space shall be 9 meters for all plots in Bhopal.",
    });
    expect(ref.verified).toBe(false);
  });

  it("rejects quotes too short to be meaningful", () => {
    expect(verifyQuote({ rule: "21", ruleId: "21", page: 36, quote: "Rs 1.00" }).verified).toBe(false);
  });

  it("moves a quote with the wrong rule id to the one rule that holds it", () => {
    const ref = verifyQuote({ rule: "55(2)", ruleId: "55", page: 70, quote: rearRow.quote });
    expect(ref).toMatchObject({ verified: true, ruleId: "56", rule: "56", page: 77 });
  });

  it("fixes a page outside the rule's page range", () => {
    const ref = verifyQuote({ rule: "56(2)(a)", ruleId: "56", page: 5, quote: rearRow.quote });
    expect(ref).toMatchObject({ verified: true, page: 77 });
  });
});

describe("rulebook", () => {
  it("looks up rules case-insensitively", () => {
    expect(getRule("26-b")?.rule).toBe("26-B");
    expect(getRule("999")).toBeUndefined();
  });

  it("builds the prompt text with rule headers", () => {
    expect(rulebookText()).toContain("=== Rule 56:");
    expect(rulebookText()).toBe(rulebookText());
  });
});
