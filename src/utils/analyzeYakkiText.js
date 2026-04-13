import { YAKKI_NG, YAKKI_TYPE_META } from "../data/yakkiRules";

export function analyzeYakkiText(text) {
  if (!text) return [];

  const issues = [];
  YAKKI_NG.forEach((word) => {
    let index = 0;
    while ((index = text.indexOf(word, index)) !== -1) {
      issues.push({
        id: issues.length,
        type: "yakki",
        label: YAKKI_TYPE_META.yakki.label,
        severity: YAKKI_TYPE_META.yakki.severity,
        start: index,
        end: index + word.length,
        text: word,
        message: "薬機法上問題がある可能性のある表現です。",
        suggestion: "法的な確定判断ではなく注意喚起です。必要に応じて専門家確認をしてください。",
      });
      index += word.length;
    }
  });
  return issues;
}
