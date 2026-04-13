const SEVERITY_COLORS = {
  high: { bg: "#ffe3e0", activeBg: "#ffd2cc" },
  medium: { bg: "#fff1cc", activeBg: "#ffe7b3" },
  low: { bg: "#e6f0ff", activeBg: "#d9e8ff" },
};

export default function HighlightedText({ text, issues, activeIssueId, onClickMark }) {
  if (!text) {
    return null;
  }

  const covered = new Array(text.length).fill(null);
  issues.forEach((issue) => {
    for (let index = issue.start; index < Math.min(issue.end, text.length); index += 1) {
      if (covered[index] === null) covered[index] = issue.id;
    }
  });
  const issueById = Object.fromEntries(issues.map((issue) => [issue.id, issue]));

  const segments = [];
  let cursor = 0;
  while (cursor < text.length) {
    const currentId = covered[cursor];
    if (currentId === null) {
      const start = cursor;
      while (cursor < text.length && covered[cursor] === null) cursor += 1;
      segments.push({ type: "text", start, end: cursor });
      continue;
    }

    const issue = issueById[currentId];
    const end = Math.min(issue.end, text.length);
    segments.push({ type: "mark", issueId: currentId, start: issue.start, end });
    cursor = end;
  }

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "text") return <span key={index}>{text.slice(segment.start, segment.end)}</span>;
        const issue = issueById[segment.issueId];
        const palette = SEVERITY_COLORS[issue.severity] ?? SEVERITY_COLORS.low;
        const active = activeIssueId === segment.issueId;
        return (
          <mark
            key={index}
            data-issue-id={segment.issueId}
            onClick={() => onClickMark(segment.issueId)}
            title={issue.message}
            style={{
              background: active ? palette.activeBg : palette.bg,
              color: "inherit",
              borderRadius: 2,
              padding: 0,
              cursor: "pointer",
            }}
          >
            {text.slice(segment.start, segment.end)}
          </mark>
        );
      })}
    </>
  );
}
