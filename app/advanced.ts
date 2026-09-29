export const topics = ["全部", "Equity 直覺", "Combo 與頻率", "Range 加權", "Pot odds 與 EV", "實戰修正"] as const;
export type Topic = typeof topics[number];
export type Question = {
  id: string; type: "preflop" | "postflop" | "advanced";
  spot: string; position: string; hand: string; board?: string;
  pot?: string; stack?: string; villain?: string;
  prompt: string; options: string[]; answer: string; mix?: string;
  concept: string; leak: string; tags: string[];
  topic?: Topic; assumptions?: string; steps?: string[];
};

// Equity inputs in calculation drills are stated assumptions, not solver outputs.
// Stable IDs preserve the existing browser-local mistake history.
function q(id: number, topic: Topic, hand: string, prompt: string, options: string[], correct: number, steps: string[], concept: string, extra: Partial<Question> = {}): Question {
  return {
    id: `adv-${String(id).padStart(3, "0")}`, type: "advanced", topic,
    spot: topic, position: "練習", hand, prompt, options, answer: options[correct],
    steps, concept, leak: topic, tags: [topic],
    assumptions: "單挑現金局；數學題忽略抽水與 ICM。題目給定的 equity 是練習用輸入，不是精確牌力表。",
    ...extra,
  };
}

export const advancedQuestions: Question[] = [
  q(1, "Equity 直覺", "As 5s", "A5s 對 AK。沒有指定 AK 花色，最合理的勝率記憶方式是？", ["必定精確等於 28%", "約三成的區間，再依花色確認", "A 高牌所以接近 75%", "被壓制，所以完全沒有勝率"], 1,
    ["共同的 A 讓較弱 kicker 處於劣勢。", "5、順子與同花等路徑仍可能反超；具體花色會改變結果。"], "背 matchup 的區間，而不是把聊天中的示意數字當成固定答案。"),
  q(2, "Equity 直覺", "As 5s", "與 AA、KK、AK 相比，A5s 面對哪類手牌通常最有利？", ["AA", "KK", "AK", "KQ 這類不含 A 的高牌"], 3,
    ["AA 與強 Ax 壓制你的 A。", "對 KQ 時，你的 A 高牌目前領先，但兩邊仍有改善路徑。"], "先辨認壓制關係，再估區間；不能把所有『大牌』放在同一桶。"),
  q(3, "Equity 直覺", "Qs Qh", "QQ 對 AK，最適合用來建立翻前直覺的描述是？", ["QQ 幾乎必勝", "AK 約有 80%", "接近五五開，QQ 通常略優", "兩張高牌必定領先一對"], 2,
    ["QQ 已經是一對；AK 有兩張 overcards 與其他成牌路徑。", "精確 equity 受花色影響，不能把接近 coin flip 誤解成剛好 50%。"], "把 pair vs two overcards 與 overpair vs underpair 分成不同模板。"),
  q(4, "Equity 直覺", "As 5s", "模擬 1,000 次：贏 300 次、平手 100 次、輸 600 次。單挑 equity 是？", ["30%", "35%", "40%", "50%"], 1,
    ["平手時平均分到一半底池：100 × 0.5 = 50。", "Equity = (300 + 50) ÷ 1,000 = 35%。"], "Equity 是平均底池份額；不只是 outright win 的比例。"),
  q(5, "Combo 與頻率", "As 5s", "已知你持有 A♠5♠，對手 AA 還有幾個合法 combo？", ["6", "4", "3", "1"], 2,
    ["剩下 A♥、A♦、A♣ 三張 A。", "任選兩張：3 × 2 ÷ 2 = 3。"], "先移除已知牌，再計算組合。"),
  q(6, "Combo 與頻率", "As 5s", "你拿 A♠5♠。對手 AKs 與 AKo 分別剩多少 combo？", ["4 與 12", "3 與 9", "3 與 12", "4 與 8"], 1,
    ["AK 合計：3 張 A × 4 張 K = 12。", "同花剩紅心、方塊、梅花三組；不同花 = 12 − 3 = 9。"], "AK、AKs、AKo 不可當成三個互不重疊的範圍相加。"),
  q(7, "Combo 與頻率", "As 5s", "對手有 12 個合法 AK combo，每個 combo 以 50% 頻率採取這條線。加權 combo 數是多少？", ["12", "50", "24", "6"], 3,
    ["有效權重 = 合法 combo 數 × 行動頻率。", "12 × 0.5 = 6。"], "不是刪除任意六手牌，而是每手各保留一半的權重。"),
  q(8, "Combo 與頻率", "As 5s", "你拿 A♠5♠，對手 range 為 AA、KK、AK、KQ（AK/KQ 含所有花色且全頻）。總 combo 數？", ["37", "50", "32", "41"], 0,
    ["AA = 3；KK = 6；AK = 3 × 4 = 12；KQ = 4 × 4 = 16。", "總數 = 3 + 6 + 12 + 16 = 37。"], "同一牌型的花色差異也可能帶來不同 equity；先數清楚範圍，再做加權。"),
  q(9, "Range 加權", "As 5s", "假設三桶權重為強 Ax 30%、口袋對 40%、Broadway 30%，你對各桶 equity 分別 30%、35%、55%。整體 equity？", ["40%", "35%", "39.5%", "55%"], 2,
    ["0.30 × 30% = 9%；0.40 × 35% = 14%；0.30 × 55% = 16.5%。", "總 equity = 9% + 14% + 16.5% = 39.5%。"], "每一桶的 equity 必須先按桶內 combo 與頻率平均；這裡直接給定作為練習。"),
  q(10, "Range 加權", "As 5s", "承接 AA/KK/AK/KQ 的 3/6/12/16 combo，題目指定各類平均 equity 為 13/33/31/56%。加權結果最接近？", ["33.25%", "40.68%", "56%", "25%"], 1,
    ["分子 = 3×13 + 6×33 + 12×31 + 16×56 = 1,505。", "1,505 ÷ 37 ≈ 40.68%。"], "直接平均四個百分比會錯估權重；以上 equity 為題設，不是計算器實測。"),
  q(11, "Range 加權", "As 5s", "同上，但 KQ 只以 25% 頻率採取這條線，其他全頻。你的 equity 約為多少？", ["40.68%", "25%", "56%", "33.32%"], 3,
    ["KQ 權重降為 16 × 25% = 4；總權重變為 3 + 6 + 12 + 4 = 25。", "(3×13 + 6×33 + 12×31 + 4×56) ÷ 25 = 33.32%。"], "頻率改變後，分子和分母都要重算。"),
  q(12, "Range 加權", "As 5s", "對強 Ax 的 equity 假設為 30%，對弱 Broadway 為 55%。把 20% 範圍權重從強 Ax 移到 Broadway，總 equity 如何變？", ["增加 5 個百分點", "增加 25 個百分點", "減少 5 個百分點", "完全不變"], 0,
    ["被替換部分的 equity 差 = 55% − 30% = 25%。", "整體變化 = 20% × 25% = 5 個百分點。"], "Range 的組成比『他可能有 AK』這一手猜測更能解釋決策。"),
  q(13, "Pot odds 與 EV", "As 5s", "下注前底池 40BB，對手 all-in 30BB，你需跟 30BB 且結束下注。損益兩平 equity？", ["30%", "42.9%", "75%", "23.1%"], 0,
    ["跟注後底池 = 40 + 30 + 30 = 100BB。", "門檻 = 30 ÷ 100 = 30%。"], "分母包含原底池、對手下注及你的跟注；已投入的錢不是新的跟注成本。", { pot: "下注前 40BB" }),
  q(14, "Pot odds 與 EV", "As 5s", "同一個 40BB 底池、對手 all-in 30BB 的局面，題設 equity 為 33.32%。相對棄牌，跟注 EV 是？", ["−3.32BB", "+3.32BB", "+33.32BB", "0BB"], 1,
    ["EV(call) = equity × 跟注後底池 − 跟注成本。", "0.3332 × 100 − 30 = +3.32BB。"], "只在題設範圍正確且沒有後續下注的模型下成立；不是 A5s 自動跟注的口訣。"),
  q(15, "Pot odds 與 EV", "Kc Qc", "河牌下注前底池 40BB，對手下注 30BB。你只贏詐唬，對手 12 個價值 combo、4 個詐唬 combo，全部全頻、無平手。如何選？", ["Call，因為沒擋住同花詐唬", "Raise，頂對一定強", "Fold，25% 小於 30%", "Call，因為 4 ÷ 12 = 33%"], 2,
    ["你贏的比例 = 4 ÷ (12 + 4) = 25%。", "跟注門檻 = 30 ÷ 100 = 30%；EV = 25 − 30 = −5BB。"], "詐唬占比的分母是整個下注範圍，不是只有價值牌。", { board: "Ks 7s 4d 2h 2c" }),
  q(16, "Pot odds 與 EV", "Kc Qc", "同樣面對 75% pot 河牌下注，價值牌固定 12 個 combo。要讓純抓詐唬跟注至少不虧，最少需要幾個全頻詐唬 combo？", ["3", "4", "5", "6"], 3,
    ["令 x ÷ (12 + x) ≥ 30%，得到 x ≥ 36/7 ≈ 5.143。", "整數 combo 至少 6 個；5/17 ≈ 29.41% 還不夠。"], "若含混合頻率可使用非整數有效權重；本題特別限定全頻整數 combo。"),
  q(17, "實戰修正", "As 5s", "翻前非 all-in：raw equity 39%，pot odds 門檻 30%，你在不利位置。能否直接宣稱 call 一定賺？", ["能，39 大於 30", "不能，還要考慮後續下注與 equity realization", "不能，所有 OOP 都要 fold", "能，A5s 有 blocker"], 1,
    ["Raw equity 假設把牌發完看攤牌份額。", "非 all-in 可能被迫棄牌或再投入；位置、範圍及後續策略影響實際 EV。"], "All-in 的直接公式不能原封不動套到多街牌局，也不能用固定折扣取代分析。"),
  q(18, "實戰修正", "As 5s", "單挑翻牌圈底池 20BB，Hero 剩 80BB、Villain 剩 50BB。SPR 是多少？", ["4", "6.5", "2.5", "0.4"], 2,
    ["有效剩餘籌碼 = min(80, 50) = 50BB。", "SPR = 50 ÷ 20 = 2.5。"], "較低 SPR 代表相對底池而言後續籌碼較少；它本身不構成任意頂對必須打光的理由。"),
  q(19, "實戰修正", "Ah Jh", "轉牌已知自己兩張牌與四張公共牌，對手牌未知。假設 9 張同花 outs 都乾淨，只看下一張，中花率約多少？", ["36%", "9/44 ≈ 20.45%", "50%", "9/46 ≈ 19.57%"], 3,
    ["依目前可見資訊，未知牌 = 52 − 2 − 4 = 46。", "簡化未知牌均勻模型：9 ÷ 46 ≈ 19.57%。"], "如果指定對手兩張手牌，分母與乾淨 outs 都須重算；完整 range 條件化還會改變河牌權重。", { board: "Kh 7h 2c 3d" }),
  q(20, "實戰修正", "8h 7h", "翻牌 9♥6♥2♣，8♥7♥ 同時聽花與兩頭順。改善為順或花的候選 outs 去重後多少張？", ["17", "15", "9", "8"], 1,
    ["同花 outs 9 張，順子 outs 為四張 T 與四張 5，共 8 張。", "T♥ 和 5♥ 重複計算，9 + 8 − 2 = 15。"], "候選 outs 不是全部保證獲勝；對手成花或葫蘆的 redraw 必須另外評估。", { board: "9h 6h 2c" }),
  q(21, "Equity 直覺", "As 5s", "已知 Hero 與 Villain 共四張不同手牌，翻前枚舉完整五張公共牌，有多少種不計順序的 board？", ["52⁵", "48 × 5", "C(48,5) = 1,712,304", "C(50,5)"], 2,
    ["四張手牌不再進入公共牌，剩 48 張。", "48×47×46×45×44 ÷ (5×4×3×2×1) = 1,712,304。"], "只求最終攤牌 equity 時，公共牌發牌次序不影響結果；多街策略分析則不能忽略次序。"),
  q(22, "Combo 與頻率", "As 5s", "翻牌 A♦K♣2♥，你拿 A♠5♠。對手 AA 與 AK（所有花色）分別剩幾個 combo？", ["1 與 6", "3 與 12", "1 與 8", "6 與 16"], 0,
    ["已知兩張 A，剩兩張 A；AA = C(2,2) = 1。", "K 剩三張，AK = 2 × 3 = 6。"], "Blocker 不只來自手牌，也包含每一張公共牌。", { board: "Ad Kc 2h" }),
  q(23, "Range 加權", "As 5s", "模型 A 得到 equity 29%，模型 B 得到 34%；all-in 跟注門檻是 30%。最正確的結論？", ["總是選 B，因為比較樂觀", "兩個模型都必須 call", "平均後就一定是真實勝率", "決策對範圍假設敏感，需辨識哪個模型較可信"], 3,
    ["模型 A：equity 低於門檻，call 的 EV 為負。", "模型 B：高於門檻，call 的 EV 為正。"], "在邊界附近，估計對手行動頻率的誤差可能比心算四捨五入更重要。"),
  q(24, "實戰修正", "Kc Qc", "河牌你沒拿黑桃，沒有阻擋未成的黑桃聽牌。這代表什麼？", ["必須 call 所有下注", "相較其他條件相同的牌，可能是較好的 bluff catcher，但仍需估詐唬頻率", "對手一定在 bluff", "可以忽略下注尺寸"], 1,
    ["Unblock missed draws 可能保留更多對手詐唬組合。", "但對手是否真的用那些牌下注，以及下注大小，仍決定跟注門檻與 EV。"], "Blocker 是改變範圍權重的線索，不是保證有足夠詐唬的證據。", { board: "Ks 7s 4d 2h 2c" }),
];

export function dailyQuestions(date: Date) {
  // Same local calendar day => same 20 unique questions; mixes all five topics.
  let seed = Number(`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`);
  const shuffled = [...advancedQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 20);
}
