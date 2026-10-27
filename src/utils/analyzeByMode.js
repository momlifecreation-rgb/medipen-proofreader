import { analyzeProofreadingText } from "./analyzeProofreadingText";
import { analyzeReferenceText } from "./analyzeReferenceText";
import { analyzeMedicalAdText } from "./analyzeMedicalAdText";
import { analyzeYakkiText } from "./analyzeYakkiText";
import { analyzeAnimalMedicalText } from "./analyzeAnimalMedicalText";
import { ANIMAL_MEDICAL_WORKBOOK } from "../data/animalMedicalRules";

// Add future specialist analyzers here. Basic proofreading always runs.
export const MODE_ANALYZERS = {
  reference: analyzeReferenceText,
  medicalAd: analyzeMedicalAdText,
  yakki: analyzeYakkiText,
  animalMedical: analyzeAnimalMedicalText,
};

export function analyzeByMode(mode, text, customRules) {
  let basic = analyzeProofreadingText(text, customRules);
  if (mode === "animalMedical") {
    const preferences = ANIMAL_MEDICAL_WORKBOOK[0].rows.filter((r) => r.row >= 36 && r.D);
    basic = basic.filter((issue) => {
      if (!["yure", "hiraganaPreferred"].includes(issue.type)) return true;
      return !preferences.some((r) => [r.B, r.C, r.D].filter(Boolean).some((v) => v.split(/[・（(]/).some((word) => word.length > 0 && issue.text.startsWith(word))));
    });
  }
  const extra = MODE_ANALYZERS[mode]?.(text) ?? [];
  if (mode === "animalMedical") {
    basic = basic.filter((issue) => !["yure", "hiraganaPreferred", "zenkaku"].includes(issue.type) || !extra.some((special) => issue.start < special.end && issue.end > special.start));
  }
  const seen = new Set();
  return [...basic.map((i) => ({ ...i, sourceMode: "basic" })), ...extra.map((i) => ({ ...i, sourceMode: mode }))]
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .filter((i) => {
      const key = `${i.type}:${i.start}:${i.end}:${i.suggestion}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((issue, id) => ({ ...issue, id }));
}
