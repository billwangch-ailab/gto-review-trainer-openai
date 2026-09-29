"use client";

import { useEffect, useMemo, useState } from "react";
import { advancedQuestions, dailyQuestions, topics, type Topic, type Question } from "./advanced";

type Mode = "dashboard" | "advanced" | "preflop" | "postflop" | "daily" | "review" | "hands";
type Attempt = {
  questionId: string;
  type: Question["type"];
  spot: string;
  hand: string;
  board?: string;
  selected: string;
  answer: string;
  correct: boolean;
  leak: string;
  timestamp: number;
};

const preflopQuestions: Question[] = [
  {
    id: "pf-001",
    type: "preflop",
    spot: "BTN open，100BB deep",
    position: "BTN",
    hand: "A5s",
    prompt: "前面都棄牌，你在 BTN 拿到 A5s。標準策略是？",
    options: ["Fold", "Call", "Open 2.5BB", "All-in"],
    answer: "Open 2.5BB",
    mix: "偏純 open",
    concept: "BTN 可以用很多 suited wheel A 進攻，A5s 有阻擋牌、可成順可成同花，翻後也有足夠可玩性。",
    leak: "BTN 過緊",
    tags: ["BTN", "Open", "Suited Ace"],
  },
  {
    id: "pf-002",
    type: "preflop",
    spot: "UTG open，100BB deep",
    position: "UTG",
    hand: "KTo",
    prompt: "你在 UTG 拿到 KTo。6-max 現金桌標準策略是？",
    options: ["Fold", "Open 2.5BB", "Call", "3-bet"],
    answer: "Fold",
    mix: "偏純 fold",
    concept: "UTG 範圍需要更緊。KTo 容易被更好的 Kx 壓制，翻後反向隱含賠率偏高。",
    leak: "早位過鬆",
    tags: ["UTG", "Open", "Offsuit Broadways"],
  },
  {
    id: "pf-003",
    type: "preflop",
    spot: "CO open，SB facing open",
    position: "SB",
    hand: "AJo",
    prompt: "CO open 到 2.5BB，你在 SB 拿 AJo。比較好的主線是？",
    options: ["Fold", "Call", "3-bet", "All-in"],
    answer: "3-bet",
    mix: "高頻 3-bet，偶爾 call 取決於 rake 與對手",
    concept: "SB 不利位置且後面還有 BB，通常用 3-bet 或 fold 策略較乾淨。AJo 對 CO 範圍有價值與阻擋牌。",
    leak: "SB 被動跟注",
    tags: ["SB", "3-bet", "CO vs SB"],
  },
  {
    id: "pf-004",
    type: "preflop",
    spot: "HJ open，BB defense",
    position: "BB",
    hand: "76s",
    prompt: "HJ open 2.5BB，你在 BB 拿 76s。標準反應是？",
    options: ["Fold", "Call", "3-bet bluff", "All-in"],
    answer: "Call",
    mix: "主要 defend call",
    concept: "BB 已投入盲注，面對一般 open 尺寸有較好價格。76s 能覆蓋中低牌面並保留隱含賠率。",
    leak: "BB 防守不足",
    tags: ["BB", "Defense", "Suited Connector"],
  },
  {
    id: "pf-005",
    type: "preflop",
    spot: "BTN open，BB 3-bet",
    position: "BTN",
    hand: "AQo",
    prompt: "你 BTN open，BB 3-bet 到 10BB，你拿 AQo。100BB deep 主線是？",
    options: ["Fold", "Call", "4-bet small", "All-in"],
    answer: "Call",
    mix: "call 為主，少量 4-bet 取決於對手",
    concept: "AQo 對 BB 3-bet 範圍有足夠 equity，但直接 4-bet 後常被更強範圍繼續。位置優勢讓 call 很有價值。",
    leak: "對 3-bet 過度反擊",
    tags: ["BTN", "Facing 3-bet", "Broadway"],
  },
  {
    id: "pf-006",
    type: "preflop",
    spot: "CO open，BTN facing open",
    position: "BTN",
    hand: "K9s",
    prompt: "CO open 2.5BB，你在 BTN 拿 K9s。比較標準的策略是？",
    options: ["Fold", "Call", "3-bet", "All-in"],
    answer: "Call",
    mix: "call 與 3-bet 混合，低級別可偏 call",
    concept: "K9s 有位置、可玩性與阻擋牌，但 kicker 不夠強，直接 3-bet 太高頻容易把範圍打薄。",
    leak: "BTN 對 CO 過度 3-bet",
    tags: ["BTN", "Call", "CO vs BTN"],
  },
];

const postflopQuestions: Question[] = [
  {
    id: "po-001",
    type: "postflop",
    spot: "BTN vs BB single-raised pot",
    position: "BTN",
    hand: "As Kh",
    board: "Kc 7d 2s",
    pot: "5.5BB",
    stack: "97BB",
    villain: "BB check",
    prompt: "你 BTN open，BB call。翻牌 K72 rainbow，BB check。你拿 AK，下注策略？",
    options: ["Check", "Bet 33%", "Bet 75%", "All-in"],
    answer: "Bet 33%",
    mix: "小注高頻",
    concept: "BTN 在 K 高乾燥牌面有範圍優勢，小注能讓大量弱牌繼續，同時保護整體 c-bet 範圍。",
    leak: "乾燥牌面下注過大",
    tags: ["C-bet", "Range Advantage", "Small Bet"],
  },
  {
    id: "po-002",
    type: "postflop",
    spot: "BB vs BTN single-raised pot",
    position: "BB",
    hand: "8h 7h",
    board: "9h 6h 2c",
    pot: "5.5BB",
    stack: "97BB",
    villain: "BTN bet 33%",
    prompt: "BTN c-bet 33%，你在 BB 拿 8h7h，牌面 9h6h2c。最佳反應？",
    options: ["Fold", "Call", "Raise", "All-in"],
    answer: "Raise",
    mix: "高頻 raise 半詐唬",
    concept: "你有 open-ended straight draw 加 flush draw，equity 很高。raise 可以立刻施壓，也讓強牌與強聽牌平衡。",
    leak: "強聽牌太被動",
    tags: ["Check-raise", "Draw", "Semi-bluff"],
  },
  {
    id: "po-003",
    type: "postflop",
    spot: "3-bet pot，SB vs BTN",
    position: "SB",
    hand: "Qd Qs",
    board: "Ah 8c 3d",
    pot: "21BB",
    stack: "90BB",
    villain: "你 OOP",
    prompt: "你 SB 3-bet，BTN call。翻牌 A83 rainbow，你拿 QQ。主線？",
    options: ["Check", "Bet 25%", "Bet 75%", "All-in"],
    answer: "Check",
    mix: "check 為主",
    concept: "A 高牌面你有範圍優勢，但 QQ 是中等攤牌價值，下注常被 Ax 繼續、讓差牌棄掉。check 保護範圍較好。",
    leak: "中等牌過度保護",
    tags: ["3-bet pot", "Showdown Value", "OOP"],
  },
  {
    id: "po-004",
    type: "postflop",
    spot: "BTN vs BB turn barrel",
    position: "BTN",
    hand: "Jd Td",
    board: "Qd 8c 3s 9d",
    pot: "12BB",
    stack: "92BB",
    villain: "BB check-call flop, check turn",
    prompt: "你翻牌小注被 call，轉牌 9d。你拿 JdTd。現在？",
    options: ["Check", "Bet 33%", "Bet 75%", "All-in"],
    answer: "Bet 75%",
    mix: "大注高頻",
    concept: "轉牌讓你拿到堅果順子加同花 redraw。這張牌提升你的強牌與 bluff equity，適合用較大尺寸建立底池。",
    leak: "強牌慢打過多",
    tags: ["Turn Barrel", "Nut Advantage", "Sizing"],
  },
  {
    id: "po-005",
    type: "postflop",
    spot: "River bluff catch",
    position: "BB",
    hand: "Kc Qc",
    board: "Ks 7s 4d 2h 2c",
    pot: "32BB",
    stack: "74BB",
    villain: "BTN bet 75% river",
    prompt: "BTN 三槍，河牌 2c paired board。你拿 KQ 無黑桃。面對 75% pot？",
    options: ["Fold", "Call", "Raise", "All-in"],
    answer: "Call",
    mix: "主要 bluff catch",
    concept: "你有頂對好 kicker，且沒有阻擋對手 miss spade bluff。河牌成對降低部分強牌組合，KQ 通常需要守住。",
    leak: "河牌棄太多",
    tags: ["River", "Bluff Catch", "Blockers"],
  },
  {
    id: "po-006",
    type: "postflop",
    spot: "CO vs BB monotone flop",
    position: "CO",
    hand: "Ad Qh",
    board: "Kd 8d 4d",
    pot: "5.5BB",
    stack: "98BB",
    villain: "BB check",
    prompt: "你 CO open，BB call。翻牌 Kd8d4d，BB check。你拿 AdQh。下注？",
    options: ["Check", "Bet 33%", "Bet 75%", "All-in"],
    answer: "Bet 33%",
    mix: "小注或 check 混合",
    concept: "你有 nut flush draw 與高牌 equity，小注能壓迫無方塊牌，也保留範圍彈性。",
    leak: "單色牌面過度放棄",
    tags: ["Monotone", "Blockers", "C-bet"],
  },
];

const allQuestions = [...advancedQuestions, ...preflopQuestions, ...postflopQuestions];
const storageKey = "gto-review-trainer-attempts-v1";

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ts);
}

function isToday(ts: number) {
  const date = new Date(ts);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("dashboard");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [dailyBank, setDailyBank] = useState<Question[]>(advancedQuestions.slice(0, 20));
  const [dailyCorrect, setDailyCorrect] = useState(0);
  const [topic, setTopic] = useState<Topic>("全部");
  const [retryQuestion, setRetryQuestion] = useState<Question | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [note, setNote] = useState("");
  const [savedHands, setSavedHands] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      const hands = JSON.parse(window.localStorage.getItem("gto-review-hands-v1") || "[]");
      // Browser-only hydration runs once after SSR; the loaded guard prevents overwriting saved history.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(stored)) setAttempts(stored.filter((item) => item && typeof item.questionId === "string" && typeof item.timestamp === "number" && typeof item.correct === "boolean"));
      if (Array.isArray(hands)) setSavedHands(hands.filter((item) => typeof item === "string"));
    } catch { /* A malformed or unavailable local store must not block practice. */ }
    setDailyBank(dailyQuestions(new Date()));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(attempts)); } catch { /* Storage may be full or disabled. */ }
  }, [attempts, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem("gto-review-hands-v1", JSON.stringify(savedHands)); } catch { /* Storage may be full or disabled. */ }
  }, [savedHands, loaded]);

  const filteredAdvanced = advancedQuestions.filter((q) => topic === "全部" || q.topic === topic);
  const activeBank = mode === "advanced" ? filteredAdvanced : mode === "preflop" ? preflopQuestions : mode === "postflop" ? postflopQuestions : allQuestions;
  const dailyComplete = dailyIndex >= dailyBank.length;
  const activeQuestion = retryQuestion || (mode === "daily" ? dailyBank[Math.min(dailyIndex, dailyBank.length - 1)] : activeBank[questionIndex % activeBank.length]);
  const todayAttempts = attempts.filter((attempt) => isToday(attempt.timestamp));
  const misses = attempts.filter((attempt) => !attempt.correct);
  const accuracy = attempts.length ? Math.round((attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100) : 0;
  const todayAccuracy = todayAttempts.length
    ? Math.round((todayAttempts.filter((attempt) => attempt.correct).length / todayAttempts.length) * 100)
    : 0;

  const weakSpots = useMemo(() => {
    const counts = misses.reduce<Record<string, number>>((acc, attempt) => {
      acc[attempt.leak] = (acc[attempt.leak] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [misses]);

  function submitAnswer(option: string) {
    if (revealed || !loaded || (mode === "daily" && dailyComplete)) return;
    const correct = option === activeQuestion.answer;
    if (mode === "daily" && correct) setDailyCorrect((count) => count + 1);
    setSelected(option);
    setRevealed(true);
    setAttempts((current) => [
      {
        questionId: activeQuestion.id,
        type: activeQuestion.type,
        spot: activeQuestion.spot,
        hand: activeQuestion.hand,
        board: activeQuestion.board,
        selected: option,
        answer: activeQuestion.answer,
        correct,
        leak: activeQuestion.leak,
        timestamp: Date.now(),
      },
      ...current,
    ]);
  }

  function nextQuestion() {
    setSelected("");
    setRevealed(false);
    if (retryQuestion) { setRetryQuestion(null); return; }
    if (mode === "daily") setDailyIndex((index) => index + 1);
    else setQuestionIndex((index) => index + 1);
  }

  function jumpTo(nextMode: Mode) {
    setMode(nextMode);
    setRetryQuestion(null);
    setSelected("");
    setRevealed(false);
    setQuestionIndex(0);
  }

  function saveHand() {
    if (!note.trim()) return;
    setSavedHands((hands) => [note.trim(), ...hands].slice(0, 8));
    setNote("");
  }

  return (
    <main className="trainer-shell">
      <aside className="side-panel" aria-label="GTO Review Trainer navigation">
        <div className="brand-lockup">
          <div className="chip-mark">GTO</div>
          <div>
            <p>Poker Trainer</p>
            <h1>GTO Review</h1>
          </div>
        </div>
        <nav className="mode-list">
          {[
            ["dashboard", "首頁總覽", "今日進度與弱點"],
            ["advanced", "進階決策訓練", "Equity → Range → EV"],
            ["preflop", "翻前基礎", "位置與起手牌"],
            ["postflop", "翻後情境", "牌面與下注尺度"],
            ["daily", "每日 20 題", "進階混合・不重複"],
            ["review", "錯題本", "重練最痛的點"],
            ["hands", "牌局筆記", "貼上自己的手牌"],
          ].map(([key, label, helper]) => (
            <button
              className={mode === key ? "mode-button active" : "mode-button"}
              key={key}
              onClick={() => jumpTo(key as Mode)}
            >
              <span>{label}</span>
              <small>{helper}</small>
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="top-strip">
          <div>
            <p className="eyebrow">No-Limit Hold’em training</p>
            <h2>{mode === "dashboard" ? "從勝率直覺走到範圍決策" : "先估範圍，再算價格，最後做決策"}</h2>
          </div>
          <div className="streak-pill">
            <span>{todayAttempts.length}</span>
            <small>/ 20 今日題數</small>
          </div>
        </header>

        {mode === "dashboard" && (
          <section className="dashboard-grid">
            <Metric label="總答題數" value={attempts.length.toString()} tone="green" />
            <Metric label="總正確率" value={`${accuracy}%`} tone="gold" />
            <Metric label="今日正確率" value={`${todayAccuracy}%`} tone="blue" />
            <Metric label="錯題數" value={misses.length.toString()} tone="red" />

            <div className="learning-path">
              <span className="eyebrow">今天的學習路線 · 24 道進階題</span>
              <h3>懂概念之後，練習把它算成決策</h3>
              <p>Equity 直覺 → Combo 與頻率 → Range 加權 → Pot odds 與 EV → 實戰修正</p>
              <p className="empty-text">包含 A5s 拆桶、阻擋牌、混合頻率、抓詐唬門檻與 SPR。計算題會給定假設；情境題不冒充 solver 唯一解。</p>
            </div>
            <div className="training-table">
              <div className="section-title">
                <p>建議練習</p>
                <h3>{weakSpots[0]?.[0] || "今天練：Combo 加權與跟注 EV"}</h3>
              </div>
              <div className="quick-actions">
                <button onClick={() => jumpTo("advanced")}>開始進階 24 題</button>
                <button onClick={() => jumpTo("postflop")}>練翻後</button>
                <button onClick={() => jumpTo("daily")}>開始每日題</button>
              </div>
            </div>

            <div className="leak-board">
              <div className="section-title">
                <p>目前弱點</p>
                <h3>用錯題自動整理</h3>
              </div>
              {weakSpots.length ? (
                weakSpots.map(([leak, count]) => (
                  <div className="leak-row" key={leak}>
                    <span>{leak}</span>
                    <strong>{count} 次</strong>
                  </div>
                ))
              ) : (
                <p className="empty-text">先完成幾題，這裡會開始顯示你的常見漏點。</p>
              )}
            </div>
          </section>
        )}

        {mode === "advanced" && (
          <div className="topic-filter" aria-label="進階主題">
            {topics.map((name) => <button key={name} aria-pressed={topic === name} onClick={() => { setTopic(name); setQuestionIndex(0); setSelected(""); setRevealed(false); }}>{name}</button>)}
          </div>
        )}
        {mode === "daily" && dailyComplete && (
          <section className="review-list" aria-live="polite">
            <h3>本輪 20 題完成</h3>
            <p>答對 {dailyCorrect} / {dailyBank.length} 題；錯題已加入錯題本。</p>
            <button className="primary-action" onClick={() => jumpTo("review")}>檢討錯題</button>
            <button className="primary-action" onClick={() => { setDailyIndex(0); setDailyCorrect(0); setSelected(""); setRevealed(false); setDailyBank(dailyQuestions(new Date())); }}>再練一輪</button>
          </section>
        )}
        {(mode === "advanced" || mode === "preflop" || mode === "postflop" || (mode === "daily" && !dailyComplete) || (mode === "review" && retryQuestion)) && (

          <QuestionCard
            question={activeQuestion}
            selected={selected}
            revealed={revealed}
            onAnswer={submitAnswer}
            onNext={nextQuestion}
            progress={retryQuestion ? 1 : mode === "daily" ? dailyIndex + 1 : questionIndex % activeBank.length + 1}
            total={retryQuestion ? 1 : mode === "daily" ? dailyBank.length : activeBank.length}
            nextLabel={retryQuestion ? "返回錯題本" : mode === "daily" && dailyIndex === dailyBank.length - 1 ? "查看本輪成績" : "下一題"}
          />
        )}

        {mode === "review" && !retryQuestion && (
          <section className="review-list">
            <div className="section-title">
              <p>錯題本</p>
              <h3>答錯的題目會自動留在這裡</h3>
            </div>
            {misses.length ? (
              misses.map((attempt) => (
                <article className="review-item" key={`${attempt.questionId}-${attempt.timestamp}`}>
                  <div>
                    <span className="tag">{attempt.type === "advanced" ? "進階" : attempt.type === "preflop" ? "翻前" : "翻後"}</span>
                    <h4>{attempt.spot}</h4>
                    <p>
                      手牌 {attempt.hand}
                      {attempt.board ? `，牌面 ${attempt.board}` : ""}
                    </p>
                  </div>
                  <div className="answer-pair">
                    <span>你選：{attempt.selected}</span>
                    <strong>建議：{attempt.answer}</strong>
                    <small>{formatDate(attempt.timestamp)}</small>
                    {allQuestions.some((q) => q.id === attempt.questionId) && <button className="primary-action" onClick={() => { setRetryQuestion(allQuestions.find((q) => q.id === attempt.questionId)!); setSelected(""); setRevealed(false); }}>重新作答</button>}
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-text">目前還沒有錯題。這是好事，但也可能只是還沒開始打磨。</p>
            )}
          </section>
        )}

        {mode === "hands" && (
          <section className="hands-panel">
            <div className="section-title">
              <p>牌局輸入</p>
              <h3>把真實 hand history 轉成複習素材</h3>
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="貼上你的牌局，例如：BTN opens 2.5BB, BB calls. Flop Ks 7s 2c..."
            />
            <button className="primary-action" onClick={saveHand}>保存牌局</button>
            <div className="saved-hands">
              {savedHands.map((hand, index) => (
                <article key={`${hand}-${index}`}>
                  <span>Hand #{savedHands.length - index}</span>
                  <p>{hand}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`metric-card ${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function QuestionCard({
  question,
  selected,
  revealed,
  onAnswer,
  onNext,
  progress,
  total,
  nextLabel,
}: {
  question: Question;
  selected: string;
  revealed: boolean;
  onAnswer: (option: string) => void;
  onNext: () => void;
  progress: number;
  total: number;
  nextLabel: string;
}) {
  return (
    <section className="question-layout">
      <article className="spot-card">
        <div className="question-meta">
          <span>{question.type === "advanced" ? "進階" : question.type === "preflop" ? "Preflop" : "Postflop"}</span>
          <span>{question.spot}</span>
          <span>題目 {progress} / {total}</span>
        </div>
        <div className="table-felt">
          <div className="seat hero">Hero {question.position}</div>
          <div className="board-line">
            {question.board ? question.board.split(" ").map((card) => <PlayingCard card={card} key={card} />) : <span className="blind-note">翻前決策</span>}
          </div>
          <div className="hole-cards">
            {question.hand.split(" ").length > 1
              ? question.hand.split(" ").map((card) => <PlayingCard card={card} key={card} />)
              : <strong>{question.hand}</strong>}
          </div>
          <div className="seat villain">{question.villain || question.spot}</div>
        </div>
        <div className="spot-details">
          {question.pot && <span>Pot {question.pot}</span>}
          {question.stack && <span>Stack {question.stack}</span>}
          {revealed && question.mix && <span>{question.mix}</span>}
        </div>
        {question.assumptions && <p className="assumptions">{question.assumptions}</p>}
        <h3>{question.prompt}</h3>
        <div className="answer-grid">
          {question.options.map((option) => {
            const state = revealed && option === question.answer ? "correct" : revealed && option === selected ? "wrong" : "";
            return (
              <button disabled={revealed} className={state} key={option} onClick={() => onAnswer(option)}>
                {option}
              </button>
            );
          })}
        </div>
      </article>

      <aside className="coach-panel">
        <div aria-live="polite" className={revealed && selected === question.answer ? "result good" : revealed ? "result bad" : "result"}>
          <p>{revealed ? (selected === question.answer ? "這題打得漂亮" : "這題值得複習") : "等待你的選擇"}</p>
          <strong>{revealed ? question.answer : "先不要偷看答案"}</strong>
        </div>
        <div className="coach-copy">
          <span>核心概念</span>
          <p>{revealed ? question.concept : "選完行動後，這裡會顯示 GTO 思路、下注尺度與常見漏點。"}</p>
        </div>
        {revealed && question.steps && <ol className="solution-steps">{question.steps.map((step) => <li key={step}>{step}</li>)}</ol>}
        {revealed && question.type !== "advanced" && <p className="assumptions">基礎情境的建議主線，並非 solver 計算的唯一解；實際策略取決於完整範圍、尺寸與抽水。</p>}
        {revealed && <div className="tag-cloud">
          {question.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>}
        <button className="primary-action" disabled={!revealed} onClick={onNext}>{nextLabel}</button>
      </aside>
    </section>
  );
}

function PlayingCard({ card }: { card: string }) {
  const suit = card.slice(-1);
  const rank = card.slice(0, -1);
  const red = suit === "h" || suit === "d";
  const suitLabel: Record<string, string> = { h: "♥", d: "♦", c: "♣", s: "♠" };
  return (
    <span className={red ? "playing-card red" : "playing-card"}>
      <strong>{rank}</strong>
      <small>{suitLabel[suit] || suit}</small>
    </span>
  );
}
