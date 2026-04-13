import {
  DEFAULT_CUSTOM_RULES,
  DOUBLE_NEGATIVE_PATTERNS,
  PROOFREADING_TYPE_META,
  REDUNDANT_RULES,
  SETSUZOKU_WORDS,
  SPOKEN_RULES,
} from "../data/proofreadingRules";
import { analyzeHiraganaRecommendations } from "./analyzeHiraganaRecommendations";
import { analyzeYureIssues } from "./analyzeYureIssues";

function createIssue(type, start, end, text, message, suggestion) {
  return {
    type,
    start,
    end,
    text,
    message,
    suggestion,
    severity: PROOFREADING_TYPE_META[type]?.severity ?? "low",
    label: PROOFREADING_TYPE_META[type]?.label ?? type,
  };
}

function collectRegexIssues(text, rules, type, issues) {
  rules.forEach(({ re, suggestion, note }) => {
    const regex = new RegExp(re.source, re.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push(createIssue(type, match.index, match.index + match[0].length, match[0], note, suggestion));
    }
  });
}

function splitSentences(text) {
  const regex = /[^。！？\n]+[。！？]?/g;
  const result = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    result.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  }
  return result;
}

function classifyStyle(sentence) {
  const trimmed = sentence.trim();
  if (/(です|でした|でしょう|ません)(。|！|？)?$/.test(trimmed)) return "desu";
  if (/(ます|ました|ませんでした|ましょう)(。|！|？)?$/.test(trimmed)) return "masu";
  if (/(だ|である|だった)(。|！|？)?$/.test(trimmed)) return "da";
  return "other";
}

function extractEndingToken(sentence) {
  const trimmed = sentence.trim();
  const endings = ["ませんでした", "ました", "ません", "ましょう", "です", "でした", "でしょう", "ます", "である", "だった", "だ"];
  return endings.find((ending) => trimmed.endsWith(ending) || trimmed.endsWith(`${ending}。`) || trimmed.endsWith(`${ending}！`) || trimmed.endsWith(`${ending}？`)) ?? "";
}

function collectBuntaiIssues(sentences, issues) {
  const styled = sentences.map((sentence) => ({ ...sentence, style: classifyStyle(sentence.text) }));
  for (let index = 1; index < styled.length; index += 1) {
    const prev = styled[index - 1];
    const current = styled[index];
    const prevPolite = prev.style === "desu" || prev.style === "masu";
    const currentPolite = current.style === "desu" || current.style === "masu";
    if ((prevPolite && current.style === "da") || (prev.style === "da" && currentPolite)) {
      issues.push(
        createIssue(
          "buntai",
          current.start,
          current.end,
          current.text.trim(),
          "文体が混在しています。",
          "です・ます調か、だ・である調のどちらかにそろえてください。",
        ),
      );
    }
  }
}

function collectBunmatsuIssues(sentences, issues) {
  let streak = [];
  sentences.forEach((sentence) => {
    const token = extractEndingToken(sentence.text);
    if (!token) {
      streak = [];
      return;
    }
    const lastToken = streak[0]?.token;
    if (!lastToken || lastToken === token) {
      streak.push({ ...sentence, token });
    } else {
      streak = [{ ...sentence, token }];
    }

    if (streak.length >= 3) {
      const first = streak[0];
      const last = streak[streak.length - 1];
      const exists = issues.find((issue) => issue.type === "bunmatsu" && issue.start === first.start && issue.end === last.end);
      if (!exists) {
        issues.push(
          createIssue(
            "bunmatsu",
            first.start,
            last.end,
            streak.map((item) => item.text).join(""),
            `同じ文末「${token}」が連続しています。`,
            "語尾を変えるか、文をまとめられないか確認してください。",
          ),
        );
      }
    }
  });
}

function collectSpaceIssues(text, issues) {
  const regex = /[ \u3000]{2,}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    issues.push(
      createIssue("space", match.index, match.index + match[0].length, match[0], "連続した空白があります。", "不要な空白を削除してください。"),
    );
  }
}

function collectCommandIssues(text, issues) {
  const regex = /してください/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    issues.push(
      createIssue(
        "shitekure",
        match.index,
        match.index + match[0].length,
        match[0],
        "命令的に見えやすい表現です。",
        "「してください」以外の柔らかい表現にできないか確認してください。",
      ),
    );
  }
}

function collectYureIssues(text, issues) {
  issues.push(...analyzeYureIssues(text, createIssue));
}

function collectWidthIssues(text, issues) {
  const checks = [
    { re: /[Ａ-Ｚａ-ｚ０-９]/g, message: "全角英数字が含まれています。", suggestion: "半角に統一するか確認してください。" },
    { re: /[()]/g, message: "半角かっこが含まれています。", suggestion: "全角かっこに統一するか確認してください。" },
    { re: /[：]/g, message: "全角コロンが含まれています。", suggestion: "記号の統一を確認してください。" },
    { re: /\?/g, message: "半角の ? が含まれています。", suggestion: "？ に統一してください。" },
    { re: /!/g, message: "半角の ! が含まれています。", suggestion: "！ に統一してください。" },
    { re: /%/g, message: "半角の % が含まれています。", suggestion: "％ に統一してください。" },
  ];
  checks.forEach(({ re, message, suggestion }) => {
    const regex = new RegExp(re.source, re.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push(createIssue("zenkaku", match.index, match.index + match[0].length, match[0], message, suggestion));
    }
  });
}

function collectSetsuzokuIssues(text, issues) {
  const paragraphs = text.split(/\n+/);
  let base = 0;
  paragraphs.forEach((paragraph) => {
    SETSUZOKU_WORDS.forEach((word) => {
      const regex = new RegExp(word, "g");
      const offsets = [];
      let match;
      while ((match = regex.exec(paragraph)) !== null) offsets.push(match.index);
      if (offsets.length < 2) return;
      offsets.forEach((offset) => {
        issues.push(
          createIssue(
            "setsuzoku",
            base + offset,
            base + offset + word.length,
            word,
            `接続詞「${word}」が同じ段落で重複しています。`,
            "別の接続詞や言い換えを検討してください。",
          ),
        );
      });
    });
    base += paragraph.length + 1;
  });
}

function collectDoubleNegativeIssues(text, issues) {
  DOUBLE_NEGATIVE_PATTERNS.forEach(({ re, suggestion }) => {
    const regex = new RegExp(re.source, re.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push(
        createIssue(
          "doubleNegative",
          match.index,
          match.index + match[0].length,
          match[0],
          "二重否定表現です。回りくどく見える可能性があります。",
          suggestion,
        ),
      );
    }
  });
}

function collectShujutsuIssues(sentences, issues) {
  sentences.forEach((sentence) => {
    const subjectCount = (sentence.text.match(/[^\s、。，,.]{1,20}(は|が)/g) || []).length;
    const commaCount = (sentence.text.match(/[、，,]/g) || []).length;
    const hasPredicate = /(です|ます|だ|である|した|する|された|なる|なった|できる|ある|いる)(。|！|？)?$/.test(sentence.text.trim());
    if (sentence.text.length >= 60 && subjectCount >= 2 && commaCount >= 2 && hasPredicate) {
      issues.push(
        createIssue(
          "shujutsu",
          sentence.start,
          sentence.end,
          sentence.text.trim(),
          "主語や主題の手がかりが多く、主述関係が分かりにくい可能性があります。",
          "主語を絞るか、文を分けられないか確認してください。",
        ),
      );
    }
  });
}

function collectCustomIssues(text, rules, issues) {
  rules.forEach((rule) => {
    if (!rule.from) return;
    let index = 0;
    while ((index = text.indexOf(rule.from, index)) !== -1) {
      issues.push(
        createIssue(
          "custom",
          index,
          index + rule.from.length,
          rule.from,
          "カスタム辞書に登録された表現です。",
          rule.to ? `${rule.to} への置き換えを検討してください。` : "表記を確認してください。",
        ),
      );
      index += rule.from.length;
    }
  });
}

export function analyzeProofreadingText(text, customRules = DEFAULT_CUSTOM_RULES) {
  const issues = [];
  if (!text) return issues;

  collectRegexIssues(text, REDUNDANT_RULES, "redundant", issues);
  collectRegexIssues(text, SPOKEN_RULES, "spoken", issues);

  const sentences = splitSentences(text);
  collectShujutsuIssues(sentences, issues);
  collectBuntaiIssues(sentences, issues);
  collectBunmatsuIssues(sentences, issues);
  collectSpaceIssues(text, issues);
  collectCommandIssues(text, issues);
  collectYureIssues(text, issues);
  issues.push(...analyzeHiraganaRecommendations(text, createIssue));
  collectDoubleNegativeIssues(text, issues);
  collectWidthIssues(text, issues);
  collectSetsuzokuIssues(text, issues);
  collectCustomIssues(text, customRules, issues);

  issues.sort((a, b) => a.start - b.start || a.end - b.end);
  const seen = new Set();
  return issues
    .filter((issue) => {
      const key = `${issue.type}-${issue.start}-${issue.end}-${issue.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((issue, index) => ({ ...issue, id: index }));
}
