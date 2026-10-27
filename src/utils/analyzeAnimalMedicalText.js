import { ANIMAL_MEDICAL_RULES } from "../data/animalMedicalRules";

export function analyzeAnimalMedicalText(text) {
  const issues = [];
  for (const rule of ANIMAL_MEDICAL_RULES) {
    const hits = [];
    for (const variant of rule.variants) {
      let start = 0;
      while ((start = text.indexOf(variant, start)) !== -1) {
        const end = start + variant.length;
        const insideAscii = rule.asciiBoundary && (/[A-Za-z0-9]/.test(text[start - 1] || "") || /[A-Za-z0-9]/.test(text[end] || ""));
        // Do not flag a shorter alias inside an already accepted spelling.
        const accepted = rule.preferred.split(/[、・]/).some((word) => {
          const offset = word.indexOf(variant);
          return offset >= 0 && text.slice(start - offset, start - offset + word.length) === word;
        });
        if (!insideAscii && (!accepted || rule.mixedOnly)) hits.push({ start, end, text: variant });
        start = end;
      }
    }
    if (rule.mixedOnly && new Set(hits.map((hit) => hit.text)).size < 2) continue;
    for (const hit of hits) issues.push({
      ...hit, type: "animalMedical", label: "動物医療用語", severity: "low",
      message: `${rule.mixedOnly ? "記事内で表記が混在しています。" : "用語統一表の採用表記を確認してください。"}（${rule.source}）`,
      suggestion: `${rule.contextual ? "文脈に応じて確認：" : "推奨表記："}${rule.preferred}${rule.note ? `。備考：${rule.note}` : ""}`,
    });
  }
  return issues;
}
