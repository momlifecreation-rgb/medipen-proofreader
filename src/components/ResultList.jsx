import ResultCard from "./ResultCard";

export default function ResultList({ issues, activeIssueId, issueRefs, onClickIssue }) {
  if (issues.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e1e6f0",
          borderRadius: 10,
          padding: 14,
          color: "#66758f",
          fontSize: 13,
        }}
      >
        現在のモードでは問題候補は見つかりませんでした。
      </div>
    );
  }

  return (
    <div>
      {issues.map((issue) => (
        <ResultCard
          key={issue.id}
          issue={issue}
          active={activeIssueId === issue.id}
          innerRef={(element) => {
            if (element) issueRefs.current[issue.id] = element;
          }}
          onClick={() => onClickIssue(issue.id)}
        />
      ))}
    </div>
  );
}
