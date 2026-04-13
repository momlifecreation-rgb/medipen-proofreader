import { useEffect, useRef } from "react";
import HighlightedText from "./HighlightedText";

export default function EditorPane({ text, onChange, issues, activeIssueId, onClickMark, textareaRef }) {
  const highlightScrollRef = useRef(null);
  const hasText = text.length > 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightScrollRef.current;
    if (!textarea || !highlight) return;

    const syncScroll = () => {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    };

    syncScroll();
    textarea.addEventListener("scroll", syncScroll);
    return () => textarea.removeEventListener("scroll", syncScroll);
  }, [text, textareaRef]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: 520,
        border: "1px solid #d5deed",
        borderRadius: 10,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        ref={highlightScrollRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          padding: 13,
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          lineHeight: 1.85,
          fontSize: 14,
          color: "#1f2937",
          pointerEvents: "none",
        }}
      >
        <HighlightedText text={text} issues={issues} activeIssueId={activeIssueId} onClickMark={onClickMark} />
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={onChange}
        placeholder="ここにチェックしたいテキストを入力してください。"
        spellCheck={false}
        style={{
          position: "relative",
          width: "100%",
          minHeight: 520,
          padding: 13,
          border: "none",
          resize: "vertical",
          outline: "none",
          background: "transparent",
          boxSizing: "border-box",
          fontSize: 14,
          lineHeight: 1.85,
          color: hasText ? "transparent" : "#111827",
          caretColor: "#111827",
        }}
      />
    </div>
  );
}
