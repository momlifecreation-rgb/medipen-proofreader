export default function ResultCard({ issue, active, innerRef, onClick }) {
  return (
    <div
      ref={innerRef}
      onClick={onClick}
      style={{
        marginBottom: 8,
        padding: "10px 12px",
        borderRadius: 10,
        border: active ? "1px solid #7eb8ff" : "1px solid #e1e6f0",
        background: active ? "#eef5ff" : "#fff",
        cursor: "pointer",
        boxShadow: active ? "0 2px 8px rgba(62, 117, 214, 0.15)" : "none",
      }}
    >
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{ background: "#1f3556", color: "#fff", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
          {issue.label}
        </span>
        <span style={{ fontSize: 11, color: "#5d6880", fontWeight: 600 }}>
          「{issue.text.slice(0, 24)}{issue.text.length > 24 ? "…" : ""}」
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#39465b", lineHeight: 1.7 }}>理由: {issue.message}</div>
      <div style={{ fontSize: 12, color: "#5b6780", lineHeight: 1.7, marginTop: 4 }}>
        修正候補・注意メモ: {issue.suggestion || "確認してください。"}
      </div>
    </div>
  );
}
