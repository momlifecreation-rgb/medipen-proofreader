export default function NoticeBox({ title, text, tone = "info" }) {
  const tones = {
    info: { bg: "#f6f8fc", border: "#c9d3e7", title: "#29456b", text: "#4c5f79" },
    caution: { bg: "#fff8ef", border: "#f0c98b", title: "#7f4f00", text: "#7a5b2b" },
  };
  const palette = tones[tone] ?? tones.info;

  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontWeight: 700, color: palette.title, marginBottom: 4 }}>{title}</div>
      <div style={{ color: palette.text, lineHeight: 1.7, fontSize: 13 }}>{text}</div>
    </div>
  );
}
