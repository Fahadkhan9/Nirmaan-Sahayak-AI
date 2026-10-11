import { RULES_VERSION } from "@/lib/types";
import type { BuildingType, CheckId, CheckStatus, PlanInput } from "@/lib/types";

export interface Bi {
  hi: string;
  en: string;
}

export interface FieldLabel extends Bi {
  unit?: Bi;
}

// Labels are shown as "hi · en" on one line; there is no language toggle.
export function bi(s: Bi): string {
  return `${s.hi} · ${s.en}`;
}

const m: Bi = { hi: "मी", en: "m" };
const sqm: Bi = { hi: "वर्ग मी", en: "sq m" };

const fields: Record<keyof PlanInput, FieldLabel> = {
  plotArea: { hi: "भूखंड क्षेत्रफल", en: "Plot area", unit: sqm },
  frontage: { hi: "भूखंड की चौड़ाई (फ्रंटेज)", en: "Frontage", unit: m },
  streetWidth: { hi: "सड़क की चौड़ाई", en: "Road width", unit: m },
  height: { hi: "भवन की ऊँचाई", en: "Building height", unit: m },
  buildingType: { hi: "भवन का प्रकार", en: "Building type" },
  front: { hi: "सामने खुला स्थान", en: "Front open space", unit: m },
  rear: { hi: "पीछे खुला स्थान", en: "Rear open space", unit: m },
  sideA: { hi: "बगल खुला स्थान 1", en: "Side open space 1", unit: m },
  sideB: { hi: "बगल खुला स्थान 2", en: "Side open space 2", unit: m },
  builtUpArea: { hi: "कुल निर्मित क्षेत्र", en: "Total built-up area", unit: sqm },
};

const buildingTypes: Record<BuildingType, Bi> = {
  detached: { hi: "पृथक", en: "Detached" },
  semi: { hi: "अर्द्ध विलग्न भवन", en: "Semi-detached" }, // official term, Rule 2(62)
  row: { hi: "पंक्तिबद्ध (रो हाउस)", en: "Row house" },
};

const checks: Record<CheckId, Bi> = {
  front: { hi: "सामने खुला स्थान", en: "Front open space" },
  rear: { hi: "पीछे खुला स्थान", en: "Rear open space" },
  side: { hi: "बगल खुला स्थान", en: "Side open space" },
  plotType: { hi: "भूखंड आकार और प्रकार", en: "Plot size and type" },
  height: { hi: "भवन की ऊँचाई", en: "Building height" },
  fee: { hi: "अनुज्ञा शुल्क", en: "Permission fee" },
  amendment: { hi: "संशोधन सूचना", en: "Amendment notice" },
};

const status: Record<CheckStatus, Bi> = {
  pass: { hi: "पास", en: "Pass" },
  fail: { hi: "फेल", en: "Fail" },
  warn: { hi: "ध्यान दें", en: "Check" },
  missing: { hi: "जानकारी चाहिए", en: "Missing" },
  info: { hi: "जानकारी", en: "Info" },
};

export const strings = {
  app: {
    name: { hi: "निर्माण सहायक AI", en: "Nirmaan Sahayak AI" },
    tagline: {
      hi: "भवन अनुज्ञा काउंटर के लिए नियम जाँच",
      en: "Rule checks for the building-permission counter",
    },
  },
  banner: {
    guidance: { hi: "केवल मार्गदर्शन। निर्णय अधिकारी का है।", en: "Guidance only. The officer decides." },
    rulesVersionLabel: { hi: "नियम संस्करण", en: "Rules version" },
    rulesVersion: {
      hi: "म.प्र. भूमि विकास नियम 2012, 6 मार्च 2025 तक संशोधित",
      en: RULES_VERSION,
    },
  },
  fields,
  buildingTypes,
  checks,
  status,
  ref: {
    rule: { hi: "नियम", en: "Rule" },
    page: { hi: "पृष्ठ", en: "p." },
  },
  sections: {
    plan: { hi: "योजना विवरण", en: "Plan details" },
    checks: { hi: "नियम जाँच", en: "Rule checks" },
    answer: { hi: "नियम उत्तर", en: "Rule answer" },
    ask: { hi: "नागरिक की योजना या प्रश्न", en: "Citizen's plan or question" },
  },
  answer: {
    notFound: { hi: "नियमों में नहीं मिला", en: "Not found in the rules" },
    verified: { hi: "सत्यापित", en: "Verified" },
    unverified: { hi: "असत्यापित", en: "Unverified" },
  },
  check: {
    required: { hi: "आवश्यक", en: "Required" },
    proposed: { hi: "प्रस्तावित", en: "Proposed" },
    add: { hi: "जोड़ें", en: "Add" },
    passCount: { hi: "पास", en: "Passed" },
    failCount: { hi: "फेल", en: "Failed" },
    totalFee: { hi: "कुल शुल्क", en: "Total fee" },
  },
  actions: {
    check: { hi: "जाँचें", en: "Check" },
    checking: { hi: "जाँच हो रही है…", en: "Checking…" },
    newCitizen: { hi: "नया नागरिक", en: "New citizen" },
    select: { hi: "चुनें", en: "Select" },
    submitHint: { hi: "Ctrl/⌘ + Enter से भेजें", en: "Ctrl/⌘ + Enter to send" },
  },
  placeholders: {
    ask: {
      hi: "200 वर्ग मीटर प्लॉट, 9 मीटर सड़क, पीछे 1.5 मीटर, फीस कितनी?",
      en: "200 sq m plot, 9 m road, rear 1.5 m, what is the fee?",
    },
  },
  hindiText: {
    summary: { hi: "आधिकारिक हिंदी पाठ", en: "Official Hindi text" },
    autoConverted: { hi: "स्वतः परिवर्तित, PDF से मिलाएँ", en: "Auto-converted, check the PDF" },
    notAvailable: { hi: "इस पृष्ठ का हिंदी पाठ उपलब्ध नहीं", en: "Hindi text not available for this page" },
    loading: { hi: "लोड हो रहा है…", en: "Loading…" },
  },
  access: {
    title: { hi: "प्रवेश कोड", en: "Access code" },
    submit: { hi: "प्रवेश करें", en: "Enter" },
    wrong: { hi: "कोड गलत है", en: "Wrong code" },
  },
  errors: {
    noAiKey: {
      hi: "AI सेट नहीं है। फ़ॉर्म सीधे भरें, जाँच फिर भी चलेगी।",
      en: "AI is not set up. Fill the form directly; checks still work.",
    },
    askFailed: {
      hi: "AI से उत्तर नहीं मिला। फ़ॉर्म सीधे भरें।",
      en: "Could not get an AI answer. Fill the form directly.",
    },
    answerFailed: {
      hi: "नियम का उत्तर नहीं मिला। योजना की जाँच फिर भी चलेगी।",
      en: "Could not get a rule answer. The plan check still works.",
    },
    emptyInput: {
      hi: "कृपया प्रश्न या योजना का विवरण लिखें।",
      en: "Please type a question or plan details.",
    },
    tooLong: {
      hi: "संदेश बहुत लंबा है (अधिकतम 1000 अक्षर)।",
      en: "Message too long (max 1000 characters).",
    },
  },
};
