import pages from "@/data/rules_hi_pages.json";

// Official Hindi PDF text, converted from Kruti Dev by tools/kd2u.py.
// Some numbers are wrong after conversion (e.g. the p.36 fee table), so this is for display only.

const byPage = new Map<number, string>(pages.map((p) => [p.page, p.text]));

export function getHindiPage(page: number): string | null {
  const text = byPage.get(page);
  return text && text.trim() ? text : null;
}
