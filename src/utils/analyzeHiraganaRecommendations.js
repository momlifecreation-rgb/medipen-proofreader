import { HIRAGANA_RECOMMENDATION_RULES } from "../data/hyokiYureRules";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function analyzeHiraganaRecommendations(text, createIssue) {
  if (!text) return [];

  const issues = [];
  HIRAGANA_RECOMMENDATION_RULES.forEach((rule) => {
    const regex = new RegExp(escapeRegex(rule.from), "g");
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push(
        createIssue(
          "hiraganaPreferred",
          match.index,
          match.index + match[0].length,
          match[0],
          "ひらがな表記が推奨されます。",
          `${rule.to} に統一してください。`,
        ),
      );
    }
  });

  return issues;
}
