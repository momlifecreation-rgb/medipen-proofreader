import workbook from "./animalMedicalWorkbook.json";

export const ANIMAL_MEDICAL_WORKBOOK = workbook;
const split = (value = "") => value.split(/[、，,・\s]+/).filter(Boolean);
const clean = (value = "") => value.split(/[（(\n]/)[0].trim();

// Preserve contextual notes and source rows so editors can review the original rule.
export const ANIMAL_MEDICAL_RULES = workbook.flatMap((sheet, index) => sheet.rows.flatMap((row) => {
  let preferred;
  let variants;
  let note;
  let mixedOnly = false;
  if (index === 0 && row.row >= 36) {
    preferred = clean(row.D);
    variants = split(row.C);
    note = row.E || "";
  } else if (index === 1 && row.row > 2) {
    preferred = clean(row.C);
    variants = split(row.B);
    note = row.D || "";
  } else if (index === 3 && row.row > 1) {
    preferred = clean(row.B);
    note = row.D || "";
    mixedOnly = note.includes("統一されていれば");
    variants = mixedOnly ? split(row.B) : split(clean(row.C));
  } else return [];
  if (!preferred || /[〇○✖※…：]|初出|など|または/.test(preferred)) return [];
  const accepted = split(preferred);
  if (!mixedOnly) variants = variants.filter((v) => !accepted.includes(v));
  variants = variants.filter((v) => v.length >= 2 && !/[（）()～…※○〇]/.test(v));
  if (!variants.length) return [];
  return [{ variants, preferred, note, mixedOnly, source: `${sheet.name} ${row.row}行`, contextual: /場合|とき|先生|確認|のみ|意の|比喩/.test(note) || accepted.length > 1 }];
}));

ANIMAL_MEDICAL_RULES.push(
  ...[["PCV", "Ht"], ["Plate", "PLT"], ["CPK", "CK"], ["TCHO", "T-Cho"], ["TBIL", "T-Bil"], ["CRE", "Cre"], ["GLU", "Glu"], ["CL", "Cl"], ["iP", "IP"], ["ALP-IF", "ALP"]].map(([from, preferred]) => ({ variants: [from], preferred, source: `${workbook[2].name} 統一表記`, asciiBoundary: true, note: "検査項目の略語表記を確認してください。" })),
  { variants: ["左心室", "左心房", "右心室", "右心房"], preferred: "左室・左房・右室・右房", contextual: true, source: `${workbook[0].name} 15行`, note: "左右と室・房の対応を保ってください。" },
  { variants: ["／"], preferred: "/", source: `${workbook[0].name} 4行` },
);
