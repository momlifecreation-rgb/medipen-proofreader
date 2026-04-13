import { MEDICAL_AD_RULES, MEDICAL_AD_TYPE_META } from "../data/medicalAdRules";

export function analyzeMedicalAdText(text) {
  if (!text) return [];

  const issues = [];
  MEDICAL_AD_RULES.forEach(({ phrase, reason, severity }) => {
    let index = 0;
    while ((index = text.indexOf(phrase, index)) !== -1) {
      issues.push({
        id: issues.length,
        type: "medicalAd",
        label: MEDICAL_AD_TYPE_META.medicalAd.label,
        severity,
        start: index,
        end: index + phrase.length,
        text: phrase,
        message: reason,
        suggestion: "法的な確定判断ではなく、注意喚起として確認してください。",
      });
      index += phrase.length;
    }
  });
  return issues;
}
