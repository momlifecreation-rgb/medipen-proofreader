export default function ModeTabs({ modes, activeMode, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {modes.map((mode) => {
        const active = mode.key === activeMode;
        return (
          <button
            key={mode.key}
            onClick={() => onChange(mode.key)}
            style={{
              padding: "8px 14px",
              borderRadius: 18,
              border: active ? "1px solid #7eb8ff" : "1px solid #d7dcec",
              background: active ? "#e9f2ff" : "#fff",
              color: active ? "#1a3f7a" : "#55627a",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
