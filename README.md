# GTO Review Trainer

A lightweight Poker GTO review app for daily No-Limit Hold'em practice.

Live app:

https://gto-review-trainer.billwang-investor.chatgpt.site

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

This project is currently deployed with ChatGPT Sites.

GitHub stores the source code. To make the app available from a GitHub-connected URL, connect this repository to a deployment service such as Vercel, Cloudflare Pages, or a static GitHub Pages build.
