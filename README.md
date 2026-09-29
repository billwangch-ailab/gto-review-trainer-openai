# GTO Review Trainer

A lightweight Poker GTO review app for daily No-Limit Hold'em practice.

Live app:

https://gto-review-trainer-openai.vercel.app

## What It Does

- Preflop range drills by position and action
- Postflop spot training with board texture, sizing, and blocker logic
- Daily 20-question practice mode
- Automatic mistake review notebook
- Local hand-history notes
- Browser-local progress tracking

## Local Development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Deployment Notes

The linked Vercel project uses `npx next build`, as configured in `vercel.json`. The original Sites/Vinext configuration is retained.

## Advanced curriculum

24 Traditional Chinese drills follow the learning sequence: matchup equity intuition, card removal and combo frequency, range-weighted equity, pot odds and call EV, then equity realization / SPR / clean outs. Calculation inputs are explicit teaching assumptions, not solver results. Existing introductory strategy questions are labeled as illustrative recommendations.

Daily practice selects 20 unique advanced questions and ends with a score. Topic filters support focused practice; the mistake notebook allows retries. Daily-session progress resets on reload; attempts and hand notes remain browser-local using the existing storage keys. Different browsers and site domains have separate progress.

Validation: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build:vercel`. The tests cover worked arithmetic, unique daily questions, answer concealment, topic selection, retry behavior, session completion, and preservation of prior local records.

Concept references: [PokerStars pot odds](https://www.pokerstars.com/poker/learn/lesson/pot-odds/) and [outs](https://www.pokerstars.com/poker/learn/lesson/calculating-outs/). Questions and worked examples are original; no solver frequency tables are claimed.
