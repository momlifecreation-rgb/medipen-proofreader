import { ACCESS_DATE_PATTERNS, REFERENCE_TYPE_META } from "../data/referenceRules";

function createIssue(type, start, end, text, message, suggestion) {
  return {
    type,
    label: REFERENCE_TYPE_META[type].label,
    severity: REFERENCE_TYPE_META[type].severity,
    start,
    end,
    text,
    message,
    suggestion,
  };
}

function getLineRanges(text) {
  const lines = text.split("\n");
  let cursor = 0;
  return lines.map((line) => {
    const range = { line, start: cursor, end: cursor + line.length };
    cursor += line.length + 1;
    return range;
  });
}

export function analyzeReferenceText(text) {
  if (!text) return [];

  const issues = [];
  const lines = getLineRanges(text).filter(({ line }) => line.trim());

  lines.forEach(({ line, start }) => {
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    const colonIndex = line.indexOf(":");
    const fullColonIndex = line.indexOf("：");

    if (yearMatch && colonIndex === -1 && fullColonIndex === -1) {
      issues.push(
        createIssue(
          "authorColon",
          start,
          start + Math.min(line.length, yearMatch.index + yearMatch[0].length),
          line.slice(0, Math.min(line.length, yearMatch.index + yearMatch[0].length)),
          "著者名の後ろのコロンがない可能性があります。",
          "著者名の直後に「:」または「：」を入れるか確認してください。",
        ),
      );
    }

    if (yearMatch) {
      const beforeYear = line.slice(0, yearMatch.index).trim();
      if (beforeYear && !/[.。]\s*$/.test(beforeYear)) {
        issues.push(
          createIssue(
            "titlePeriod",
            start,
            start + yearMatch.index,
            beforeYear,
            "タイトルの後ろのピリオドがない可能性があります。",
            "タイトルの終わりにピリオドを置くか、採用ルールを確認してください。",
          ),
        );
      }
    }

    const journalIndex = line.search(/[A-Za-z][A-Za-z\s]+/);
    const volumeIndex = line.search(/\d+\(\d+\)|\d+:\d+-\d+/);
    if (yearMatch && volumeIndex !== -1 && yearMatch.index > volumeIndex) {
      issues.push(
        createIssue(
          "order",
          start + volumeIndex,
          start + line.length,
          line.slice(volumeIndex),
          "雑誌名・年・巻号・ページの並び順が乱れている可能性があります。",
          "一般的には雑誌名 → 発行年 → 巻号 → ページの順か確認してください。",
        ),
      );
    } else if (journalIndex !== -1 && yearMatch && journalIndex > yearMatch.index) {
      issues.push(
        createIssue(
          "order",
          start + yearMatch.index,
          start + line.length,
          line.slice(yearMatch.index),
          "雑誌名より先に発行年が来ている可能性があります。",
          "採用している文献スタイルの順序を確認してください。",
        ),
      );
    }

    if (/[：，．（）]/.test(line) && /[:,.()]/.test(line)) {
      issues.push(
        createIssue(
          "punctuation",
          start,
          start + line.length,
          line,
          "全角記号と半角記号が混在しています。",
          "コロン、ピリオド、かっこなどの表記を統一してください。",
        ),
      );
    }

    const urlMatch = line.match(/https?:\/\/\S+|www\.\S+/);
    if (urlMatch) {
      const url = urlMatch[0];
      if (url.startsWith("www.") || /https?：/.test(url) || /https?:\/\/.*[）]/.test(url)) {
        issues.push(
          createIssue(
            "url",
            start + urlMatch.index,
            start + urlMatch.index + url.length,
            url,
            "URL表記が不統一、または形式上不自然な可能性があります。",
            "URLは半角の http(s) 形式で統一してください。",
          ),
        );
      }
    }

    const hasAccessDate = ACCESS_DATE_PATTERNS.some((pattern) => pattern.test(line));
    if (/閲覧|アクセス/.test(line) && !hasAccessDate) {
      issues.push(
        createIssue(
          "accessDate",
          start,
          start + line.length,
          line,
          "最終閲覧日の書き方が不統一の可能性があります。",
          "「最終閲覧日: YYYY-MM-DD」など、ルールを決めて統一してください。",
        ),
      );
    }
  });

  return issues.map((issue, index) => ({ ...issue, id: index }));
}
