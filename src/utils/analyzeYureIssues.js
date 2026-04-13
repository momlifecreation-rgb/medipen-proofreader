import { HYOKI_YURE_RULES } from "../data/hyokiYureRules";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeKana(value) {
  return value
    .normalize("NFKC")
    .replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
}

function buildVariantRegex(variant) {
  const escaped = escapeRegex(variant);
  return new RegExp(`${escaped}(?:[ぁ-んー]+)?`, "g");
}

function buildInflectedRegex(variant) {
  const last = variant.at(-1);
  const stem = escapeRegex(variant.slice(0, -1));

  if (!last || !/[ぁ-んァ-ヶー一-龥々]/.test(last)) {
    return buildVariantRegex(variant);
  }

  const patterns = {
    う: `${stem}(?:う|わない|わなかった|います|いました|える|えば|おう|った|って|っている|っていた|っていない)`,
    く: `${stem}(?:く|かない|かなかった|きます|きました|ける|けば|こう|いた|いて|いている|いていた|いていない)`,
    ぐ: `${stem}(?:ぐ|がない|がなかった|ぎます|ぎました|げる|げば|ごう|いだ|いで|いでいる|いでいた|いでいない)`,
    す: `${stem}(?:す|さない|さなかった|します|しました|せる|せば|そう|した|して|している|していた|していない)`,
    つ: `${stem}(?:つ|たない|たなかった|ちます|ちました|てる|てば|とう|った|って|っている|っていた|っていない)`,
    ぬ: `${stem}(?:ぬ|なない|ななかった|にます|にました|ねる|ねば|のう|んだ|んで|んでいる|んでいた|んでいない)`,
    ぶ: `${stem}(?:ぶ|ばない|ばなかった|びます|びました|べる|べば|ぼう|んだ|んで|んでいる|んでいた|んでいない)`,
    む: `${stem}(?:む|まない|まなかった|みます|みました|める|めば|もう|んだ|んで|んでいる|んでいた|んでいない)`,
    る: `${stem}(?:る|ない|なかった|ます|ました|れば|よう|た|て|ている|ていた|ていない|られる|られない|られた|られて|ろ|った|って|ります|りました|らない|らなかった)`,
    い: `${stem}(?:い|く|かった|くない|くなかった|ければ|さ|そう|すぎる)`,
  };

  return new RegExp(patterns[last] ?? `${escapeRegex(variant)}(?:[ぁ-んー]+)?`, "g");
}

export function analyzeYureIssues(text, createIssue) {
  if (!text) return [];

  const issues = [];

  HYOKI_YURE_RULES.forEach((rule) => {
    const hits = [];

    rule.variants.forEach((variant, index) => {
      const regex = rule.matchers?.[index] ?? (rule.inflect ? buildInflectedRegex(variant) : buildVariantRegex(variant));
      let match;
      while ((match = regex.exec(text)) !== null) {
        hits.push({
          variant,
          normalized: normalizeKana(variant),
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    });

    const mixed = [...new Set(hits.map((hit) => hit.normalized))];
    if (mixed.length < 2) return;

    const usedVariants = [...new Set(hits.map((hit) => hit.variant))];
    hits.forEach((hit) => {
      issues.push(
        createIssue(
          "yure",
          hit.start,
          hit.end,
          hit.text,
          `表記ゆれがあります: ${usedVariants.join(" / ")}`,
          `${rule.preferred} に統一してください。`,
        ),
      );
    });
  });

  return issues;
}
