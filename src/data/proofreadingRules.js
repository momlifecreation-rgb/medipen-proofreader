export const REDUNDANT_RULES = [
  { re: /することができます/g, suggestion: "できます", note: "冗長な表現です。" },
  { re: /することができる/g, suggestion: "できる", note: "冗長な表現です。" },
  { re: /していくことが重要です/g, suggestion: "していくことが大切です", note: "少し回りくどい表現です。" },
  { re: /させていただきます/g, suggestion: "します", note: "過剰にへりくだった表現です。" },
  { re: /ということです/g, suggestion: "です", note: "冗長な表現です。" },
];

export const SPOKEN_RULES = [
  { re: /すごく/g, suggestion: "とても", note: "話し言葉寄りの表現です。" },
  { re: /やっぱり/g, suggestion: "やはり", note: "話し言葉寄りの表現です。" },
  { re: /ちゃんと/g, suggestion: "適切に", note: "話し言葉寄りの表現です。" },
  { re: /けっこう/g, suggestion: "比較的", note: "話し言葉寄りの表現です。" },
  { re: /ちょっと/g, suggestion: "やや", note: "話し言葉寄りの表現です。" },
];

export const SETSUZOKU_WORDS = ["しかし", "また", "さらに", "そして", "そのため", "一方で", "ただし", "なお"];

export const DOUBLE_NEGATIVE_PATTERNS = [
  { re: /ないわけではない/g, suggestion: "肯定形に言い換えられないか確認してください。" },
  { re: /ないわけでもない/g, suggestion: "肯定形に言い換えられないか確認してください。" },
  { re: /ないことはない/g, suggestion: "肯定形に言い換えられないか確認してください。" },
  { re: /なくはない/g, suggestion: "肯定形に言い換えられないか確認してください。" },
  { re: /ないとはいえない/g, suggestion: "意味が曖昧なら言い換えを検討してください。" },
  { re: /ないともいえない/g, suggestion: "意味が曖昧なら言い換えを検討してください。" },
];

export const PROOFREADING_TYPE_META = {
  redundant: { label: "冗長表現", severity: "medium" },
  spoken: { label: "話し言葉", severity: "medium" },
  bunmatsu: { label: "文末連続", severity: "low" },
  buntai: { label: "文体混在", severity: "medium" },
  space: { label: "空白", severity: "low" },
  shitekure: { label: "命令形", severity: "medium" },
  yure: { label: "表記ゆれ", severity: "medium" },
  hiraganaPreferred: { label: "ひらがな推奨", severity: "low" },
  zenkaku: { label: "全角半角", severity: "low" },
  setsuzoku: { label: "接続詞重複", severity: "low" },
  doubleNegative: { label: "二重否定", severity: "medium" },
  shujutsu: { label: "主述", severity: "medium" },
  custom: { label: "カスタム辞書", severity: "medium" },
};

export const DEFAULT_CUSTOM_RULES = [
  { id: 1, from: "下さい", to: "ください" },
  { id: 2, from: "出来る", to: "できる" },
  { id: 3, from: "有る", to: "ある" },
];
