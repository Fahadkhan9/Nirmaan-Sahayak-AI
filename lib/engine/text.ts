// Bilingual detail templates for checks. Numbers are formatted here so both languages match.

export interface Detail {
  hi: string;
  en: string;
}

export function m(n: number): string {
  return `${n.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} m`;
}

export function rs(n: number): string {
  return `Rs ${n.toLocaleString("en-IN")}`;
}

export function join(...parts: (Detail | undefined)[]): Detail {
  const used = parts.filter((p): p is Detail => p !== undefined);
  return {
    hi: used.map((p) => p.hi).join(" "),
    en: used.map((p) => p.en).join(" "),
  };
}

export function requiredText(requiredM: number, proposedM?: number): Detail {
  if (proposedM === undefined) {
    return {
      hi: `कम से कम ${m(requiredM)} खाली जगह छोड़नी होगी।`,
      en: `At least ${m(requiredM)} must be left open.`,
    };
  }
  return proposedM >= requiredM
    ? { hi: `${m(proposedM)} दिया है, ${m(requiredM)} चाहिए: ठीक है।`, en: `${m(proposedM)} given, ${m(requiredM)} needed: OK.` }
    : { hi: `${m(proposedM)} दिया है, कम से कम ${m(requiredM)} चाहिए।`, en: `${m(proposedM)} given, at least ${m(requiredM)} needed.` };
}

export function tallText(thresholdM: number): Detail {
  return {
    hi: `ऊंचाई ${m(thresholdM)} से ज़्यादा है: नियम 56(5) के अनुसार नियम 42 की तालिका 4 और 5 लागू होंगी। यहां जांच नहीं की गई।`,
    en: `Height above ${m(thresholdM)}: Rule 56(5) sends this to Tables 4 and 5 of Rule 42. Not checked here.`,
  };
}
