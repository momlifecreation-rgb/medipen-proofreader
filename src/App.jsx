import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditorPane from "./components/EditorPane";
import ModeTabs from "./components/ModeTabs";
import NoticeBox from "./components/NoticeBox";
import ResultList from "./components/ResultList";
import { DEFAULT_CUSTOM_RULES, PROOFREADING_TYPE_META } from "./data/proofreadingRules";
import { SAMPLE_TEXTS } from "./data/sampleTexts";
import { analyzeMedicalAdText } from "./utils/analyzeMedicalAdText";
import { analyzeProofreadingText } from "./utils/analyzeProofreadingText";
import { analyzeReferenceText } from "./utils/analyzeReferenceText";
import { analyzeYakkiText } from "./utils/analyzeYakkiText";

const MODES = [
  {
    key: "proofreading",
    label: "文章校正モード",
    description: "冗長表現、話し言葉、文末連続、文体混在、表記ゆれなど、一般的な文章校正を行います。",
    noticeTitle: "文章校正モード",
    noticeText: "薬機法チェックはこのモードでは行いません。文章表現の整理を目的とした補助チェックです。",
    sampleKey: "proofreading",
  },
  {
    key: "reference",
    label: "文献表記チェックモード",
    description: "参考文献の形式面を1行ごとに確認し、形式上の注意点を表示します。",
    noticeTitle: "文献表記チェックの注意",
    noticeText: "厳密な文献自動解析ではありません。最終確認は人が行ってください。",
    sampleKey: "reference",
  },
  {
    key: "medicalAd",
    label: "医療広告チェックモード",
    description: "医療広告ガイドライン上、注意が必要になりやすい表現候補を辞書ベースで検出します。",
    noticeTitle: "医療広告チェックの注意",
    noticeText: "法的な確定判断ではなく、注意喚起のための補助チェックです。",
    sampleKey: "medicalAd",
  },
  {
    key: "yakki",
    label: "薬機法チェックモード",
    description: "薬機法上問題がある可能性のある表現候補を辞書ベースで検出します。",
    noticeTitle: "薬機法チェックの注意",
    noticeText: "法的な確定判断ではなく、注意喚起のための補助チェックです。",
    sampleKey: "yakki",
  },
];

const TYPE_COLORS = {
  high: { badge: "#d93025", bg: "#fff1f1", text: "#8c1d18" },
  medium: { badge: "#e69500", bg: "#fff8e8", text: "#8a5a00" },
  low: { badge: "#3b82f6", bg: "#eef6ff", text: "#1c4f99" },
};

function getModeConfig(mode) {
  return MODES.find((item) => item.key === mode) ?? MODES[0];
}

function analyzeByMode(mode, text, customRules) {
  switch (mode) {
    case "reference":
      return analyzeReferenceText(text);
    case "medicalAd":
      return analyzeMedicalAdText(text);
    case "yakki":
      return analyzeYakkiText(text);
    case "proofreading":
    default:
      return analyzeProofreadingText(text, customRules);
  }
}

function buildFilterOptions(mode, issues) {
  if (mode !== "proofreading") return [{ key: "all", label: "すべて" }];
  const entries = Object.entries(PROOFREADING_TYPE_META).map(([key, meta]) => ({ key, label: meta.label }));
  return [{ key: "all", label: "すべて" }, ...entries].filter(
    (option) => option.key === "all" || issues.some((issue) => issue.type === option.key),
  );
}

export default function App() {
  const [mode, setMode] = useState("proofreading");
  const [tab, setTab] = useState("editor");
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const [issues, setIssues] = useState([]);
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customRules, setCustomRules] = useState(DEFAULT_CUSTOM_RULES);
  const [newRule, setNewRule] = useState({ from: "", to: "" });
  const textareaRef = useRef(null);
  const issueRefs = useRef({});

  useEffect(() => {
    setIssues(analyzeByMode(mode, text, customRules));
    setActiveIssueId(null);
    setFilter("all");
  }, [mode, text, customRules]);

  const modeConfig = getModeConfig(mode);
  const filterOptions = useMemo(() => buildFilterOptions(mode, issues), [mode, issues]);
  const filteredIssues = filter === "all" ? issues : issues.filter((issue) => issue.type === filter);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        filterOptions.map((option) => [
          option.key,
          option.key === "all" ? issues.length : issues.filter((issue) => issue.type === option.key).length,
        ]),
      ),
    [filterOptions, issues],
  );

  const focusIssueInEditor = useCallback(
    (issue) => {
      const textarea = textareaRef.current;
      if (!textarea || !issue) return;
      textarea.focus();
      textarea.setSelectionRange(issue.start, issue.end);
      const style = window.getComputedStyle(textarea);
      const lineHeight = Number.parseFloat(style.lineHeight) || 26;
      const linesBefore = text.slice(0, issue.start).split("\n").length - 1;
      textarea.scrollTop = Math.max(0, linesBefore * lineHeight - textarea.clientHeight / 2);
    },
    [text],
  );

  const handleIssueClick = useCallback(
    (issueId) => {
      setActiveIssueId(issueId);
      const issue = issues.find((item) => item.id === issueId);
      focusIssueInEditor(issue);
    },
    [issues, focusIssueInEditor],
  );

  const handleMarkClick = useCallback(() => {}, []);

  const addRule = useCallback(() => {
    if (!newRule.from.trim()) return;
    setCustomRules((current) => [...current, { id: Date.now(), from: newRule.from.trim(), to: newRule.to.trim() }]);
    setNewRule({ from: "", to: "" });
  }, [newRule]);

  const handleSpeechToggle = useCallback(() => {
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      if (!text.trim()) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 3.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, [isSpeaking, text]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14 }}>
      <div
        style={{
          background: "#1a1f3c",
          color: "#fff",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          medipen <span style={{ color: "#7eb8ff" }}>校正ツール</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            ["editor", "エディター"],
            ["rules", "カスタム辞書"],
          ].map(([key, label]) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 18,
                  border: "none",
                  cursor: "pointer",
                  background: active ? "#7eb8ff" : "rgba(255,255,255,0.12)",
                  color: active ? "#1a1f3c" : "#d9dfef",
                  fontWeight: 700,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "editor" ? (
        <div className="app-grid" style={{ padding: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #dce3f0", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <ModeTabs modes={MODES} activeMode={mode} onChange={setMode} />
              <div style={{ color: "#4f607b", lineHeight: 1.7, fontSize: 13 }}>{modeConfig.description}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => setText(SAMPLE_TEXTS[modeConfig.sampleKey])}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1px solid #cfd8e8",
                    background: "#f8fbff",
                    color: "#244c84",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  サンプル文章を読み込む
                </button>
                <span style={{ color: "#72809b", fontSize: 12 }}>結果件数: {issues.length}件</span>
              </div>
              <NoticeBox
                title={modeConfig.noticeTitle}
                text={modeConfig.noticeText}
                tone={mode === "reference" || mode === "medicalAd" || mode === "yakki" ? "caution" : "info"}
              />
            </div>

            <div
              style={{
                alignSelf: "flex-start",
                color: "#4f607b",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 9px",
                background: "#fff",
                border: "1px solid #dce3f0",
                borderRadius: 999,
              }}
            >
              文字数: {text.length}文字
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {filterOptions.map((option) => {
                const active = filter === option.key;
                const color = TYPE_COLORS[option.key === "all" ? "low" : issues.find((issue) => issue.type === option.key)?.severity || "low"];
                return (
                  <button
                    key={option.key}
                    onClick={() => setFilter(option.key)}
                    style={{
                      padding: "4px 9px",
                      borderRadius: 16,
                      border: active ? `1px solid ${color.badge}` : "1px solid #d9dfec",
                      background: active ? color.bg : "#fff",
                      color: active ? color.text : "#6f7d94",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {option.label} {counts[option.key] ? `(${counts[option.key]})` : ""}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleSpeechToggle}
                  disabled={!text.trim() && !isSpeaking}
                  title={isSpeaking ? "読み上げ停止" : "読み上げ開始"}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    border: "1px solid #cfd8e8",
                    background: isSpeaking ? "#fff2f0" : "#f8fbff",
                    color: isSpeaking ? "#c2410c" : "#244c84",
                    cursor: !text.trim() && !isSpeaking ? "not-allowed" : "pointer",
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {isSpeaking ? "■" : "▶"}
                </button>
              </div>
              <EditorPane
                text={text}
                onChange={(event) => setText(event.target.value)}
                issues={issues}
                activeIssueId={activeIssueId}
                onClickMark={handleMarkClick}
                textareaRef={textareaRef}
              />
              <div style={{ fontSize: 11, color: "#7a869c", lineHeight: 1.5 }}>
                読み上げはブラウザ機能を使用しています。医療用語の読み間違いがある場合があります。
              </div>
            </div>
          </div>

          <div className="app-sidebar">
            <div style={{ background: "#f9fbff", border: "1px solid #dde3ef", borderRadius: 12, padding: 18, maxHeight: "calc(100vh - 36px)", overflowY: "auto" }}>
              <div style={{ fontWeight: 800, color: "#203555", marginBottom: 10 }}>問題一覧</div>
              <ResultList issues={filteredIssues} activeIssueId={activeIssueId} issueRefs={issueRefs} onClickIssue={handleIssueClick} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 28, maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1f3c", marginBottom: 8 }}>カスタム辞書</div>
          <div style={{ color: "#6c7890", marginBottom: 18, lineHeight: 1.7 }}>
            文章校正モードで使う独自ルールを追加できます。ほかのモードでは実行しません。
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <input
              value={newRule.from}
              onChange={(event) => setNewRule((current) => ({ ...current, from: event.target.value }))}
              onKeyDown={(event) => event.key === "Enter" && addRule()}
              placeholder="検出したい表現"
              style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #d5deed", fontSize: 13 }}
            />
            <span style={{ lineHeight: "38px", color: "#a7b0c2" }}>→</span>
            <input
              value={newRule.to}
              onChange={(event) => setNewRule((current) => ({ ...current, to: event.target.value }))}
              onKeyDown={(event) => event.key === "Enter" && addRule()}
              placeholder="推奨表記"
              style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #d5deed", fontSize: 13 }}
            />
            <button
              onClick={addRule}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                border: "none",
                background: "#1a1f3c",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              追加
            </button>
          </div>

          {customRules.map((rule) => (
            <div
              key={rule.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: "#fff",
                borderRadius: 10,
                marginBottom: 8,
                border: "1px solid #dce3f0",
              }}
            >
              <span style={{ background: "#f0f5ff", color: "#264f88", borderRadius: 5, padding: "2px 9px", fontWeight: 700, fontSize: 12 }}>
                {rule.from}
              </span>
              <span style={{ color: "#b4bccb" }}>→</span>
              <span style={{ color: "#39465b", fontSize: 13 }}>{rule.to || "確認"}</span>
              <button
                onClick={() => setCustomRules((current) => current.filter((item) => item.id !== rule.id))}
                style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", color: "#8e9ab0", fontSize: 16 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
