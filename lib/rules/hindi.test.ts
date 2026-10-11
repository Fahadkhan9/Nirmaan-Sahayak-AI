import { describe, expect, it } from "vitest";
import { getHindiPage } from "./hindi";

describe("getHindiPage", () => {
  it("returns the Hindi text for a page", () => {
    expect(getHindiPage(36)).toContain("नियम 21");
  });

  it("returns the page the engine cites for rear open space", () => {
    expect(getHindiPage(78)).toContain("56");
  });

  it("returns null for pages that do not exist", () => {
    expect(getHindiPage(0)).toBeNull();
    expect(getHindiPage(999)).toBeNull();
    expect(getHindiPage(3.5)).toBeNull();
  });
});
