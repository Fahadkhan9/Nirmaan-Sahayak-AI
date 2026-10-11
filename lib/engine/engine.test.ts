import { describe, expect, it } from "vitest";
import evalCases from "@/data/eval_cases.json";
import rules from "@/data/rules.json";
import type { Check, CheckId, PlanInput } from "@/lib/types";
import { runChecks } from "./index";

function find(input: PlanInput, id: CheckId): Check | undefined {
  return runChecks(input).find((c) => c.id === id);
}

describe("engineCases from data/eval_cases.json", () => {
  for (const c of evalCases.engineCases) {
    it(`${c.id}: ${c.note}`, () => {
      const check = find(c.input as PlanInput, c.check as CheckId);
      expect(check).toBeDefined();
      if ("expectRequiredM" in c) expect(check?.requiredM).toBe(c.expectRequiredM);
      if ("expectFeeRs" in c) expect(check?.amountRs).toBe(c.expectFeeRs);
      if ("expectStatus" in c) expect(check?.status).toBe(c.expectStatus);
    });
  }
});

describe("side: detached relaxation", () => {
  const base: PlanInput = { buildingType: "detached", height: 6, frontage: 10 };

  it("passes with 3.0 m and 1.5 m when height <= 7 and frontage < 12", () => {
    const c = find({ ...base, sideA: 3, sideB: 1.5 }, "side");
    expect(c?.status).toBe("pass");
    expect(c?.refs).toHaveLength(2);
  });

  it("fails the same sides when height is above 7 m", () => {
    expect(find({ ...base, height: 8, sideA: 3, sideB: 1.5 }, "side")?.status).toBe("fail");
  });

  it("fails when the relaxed side is below 1.5 m", () => {
    expect(find({ ...base, sideA: 3, sideB: 1.2 }, "side")?.status).toBe("fail");
  });

  it("fails when neither side reaches 3.0 m", () => {
    expect(find({ ...base, sideA: 2, sideB: 2 }, "side")?.status).toBe("fail");
  });
});

describe("plotType", () => {
  it("fails a 100 sq m detached plot and names the types it fits", () => {
    const c = find({ buildingType: "detached", plotArea: 100 }, "plotType");
    expect(c?.status).toBe("fail");
    expect(c?.detail?.en).toContain("row-type");
    expect(c?.detail?.en).toContain("Appendix-J");
  });

  it("passes the demo semi-detached plot", () => {
    expect(find({ buildingType: "semi", plotArea: 200, frontage: 9 }, "plotType")?.status).toBe("pass");
  });
});

describe("demo case", () => {
  const checks = runChecks({
    plotArea: 200,
    streetWidth: 9,
    buildingType: "semi",
    height: 9,
    front: 3,
    rear: 1.5,
    sideA: 3,
    builtUpArea: 180,
  });
  const status = Object.fromEntries(checks.map((c) => [c.id, c.status]));

  it("matches the expected results", () => {
    expect(status).toEqual({ amendment: "warn", front: "pass", rear: "fail", side: "pass", plotType: "pass", fee: "info" });
  });

  it("runs checks in the agreed order", () => {
    expect(checks.map((c) => c.id)).toEqual(["amendment", "front", "rear", "side", "plotType", "fee"]);
  });
});

describe("other behaviour", () => {
  it("warns instead of checking front and rear above 12.5 m", () => {
    const checks = runChecks({ height: 13, streetWidth: 9, plotArea: 200 });
    expect(checks.find((c) => c.id === "front")?.status).toBe("warn");
    expect(checks.find((c) => c.id === "rear")?.status).toBe("warn");
  });

  it("returns info with the required gap when no proposed value is given", () => {
    const c = find({ streetWidth: 10 }, "front");
    expect(c?.status).toBe("info");
    expect(c?.requiredM).toBe(3.6);
  });

  it("adds the Rule 56(1)(b) note for streets under 6 m", () => {
    expect(find({ streetWidth: 5 }, "front")?.refs.map((r) => r.rule)).toContain("56(1)(b)");
  });

  it("does not calculate the fee for high-rise buildings", () => {
    const c = find({ builtUpArea: 500, height: 31 }, "fee");
    expect(c?.status).toBe("warn");
    expect(c?.amountRs).toBeUndefined();
  });

  it("hides fee, height and amendment when they do not apply", () => {
    const ids = runChecks({ plotArea: 600, height: 9 }).map((c) => c.id);
    expect(ids).not.toContain("fee");
    expect(ids).not.toContain("height");
    expect(ids).not.toContain("amendment");
  });

  it("is deterministic", () => {
    const input: PlanInput = { plotArea: 200, streetWidth: 9, buildingType: "semi", builtUpArea: 180 };
    expect(runChecks(input)).toEqual(runChecks(input));
  });
});

describe("refs", () => {
  const inputs: PlanInput[] = [
    {},
    { plotArea: 200, streetWidth: 9, buildingType: "semi", height: 9, front: 3, rear: 1.5, sideA: 3, builtUpArea: 180 },
    { plotArea: 100, streetWidth: 5, buildingType: "detached", frontage: 10, height: 6, sideA: 3, sideB: 1.5, builtUpArea: 75.5 },
    { plotArea: 300, buildingType: "row", height: 13, builtUpArea: 2600 },
    { builtUpArea: 500, height: 31 },
  ];

  it("every check except missing has refs with a non-empty quote", () => {
    for (const input of inputs) {
      for (const c of runChecks(input)) {
        if (c.status === "missing") continue;
        expect(c.refs.length, `${c.id} refs`).toBeGreaterThan(0);
        for (const r of c.refs) expect(r.quote.length, `${c.id} quote`).toBeGreaterThan(0);
      }
    }
  });

  it("every quote appears word for word in its rule text", () => {
    const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
    const text = new Map(rules.map((r) => [r.rule, norm(r.text)]));
    for (const input of inputs) {
      for (const c of runChecks(input)) {
        for (const r of c.refs) expect(text.get(r.ruleId), `${c.id}: ${r.quote}`).toContain(norm(r.quote));
      }
    }
  });
});
