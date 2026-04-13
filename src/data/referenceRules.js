export const REFERENCE_TYPE_META = {
  authorColon: { label: "著者名", severity: "medium" },
  titlePeriod: { label: "タイトル", severity: "medium" },
  order: { label: "並び順", severity: "medium" },
  punctuation: { label: "記号", severity: "low" },
  url: { label: "URL", severity: "low" },
  accessDate: { label: "閲覧日", severity: "low" },
};

export const ACCESS_DATE_PATTERNS = [
  /最終閲覧日[:：]?\s*\d{4}[/-]\d{1,2}[/-]\d{1,2}/,
  /アクセス日[:：]?\s*\d{4}[/-]\d{1,2}[/-]\d{1,2}/,
  /閲覧日[:：]?\s*\d{4}[/-]\d{1,2}[/-]\d{1,2}/,
];
