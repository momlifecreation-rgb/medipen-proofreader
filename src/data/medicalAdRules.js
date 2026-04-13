export const MEDICAL_AD_RULES = [
  { phrase: "必ず治る", reason: "治療結果を断定的に示す表現は注意が必要です。", severity: "high" },
  { phrase: "完治", reason: "治癒を断定する表現は注意が必要です。", severity: "high" },
  { phrase: "安全", reason: "安全性を断定する表現は注意が必要です。", severity: "medium" },
  { phrase: "副作用なし", reason: "副作用が一切ないと受け取られやすい表現です。", severity: "high" },
  { phrase: "最先端", reason: "優良性を強く印象づける表現は注意が必要です。", severity: "medium" },
  { phrase: "最高", reason: "最上級表現は注意が必要です。", severity: "high" },
  { phrase: "日本一", reason: "比較優良表現として注意が必要です。", severity: "high" },
  { phrase: "奇跡", reason: "著しく期待をあおる表現は注意が必要です。", severity: "medium" },
  { phrase: "絶対", reason: "断定表現は注意が必要です。", severity: "high" },
];

export const MEDICAL_AD_TYPE_META = {
  medicalAd: { label: "医療広告", severity: "high" },
};
