# amisearchable.cc

Shareable badge that shows whether a website is accessible to AI crawlers (GPTBot, ClaudeBot, PerplexityBot, and others). Free one-time checks. Optional Pro monitoring so the badge stays accurate.

## Stack

Next.js (App Router) · Supabase · Polar · Vercel · Resend

## Routes

| Path | Purpose |
|---|---|
| `/` | Landing page + domain check |
| `/report/[domain]` | Results, badge preview, embed snippet |
| `/badge/[domain]` | SVG badge |
| `/pricing` | Free vs Pro |
| `/dashboard` | Monitored domains (Pro) |
| `/api/webhooks/polar` | Polar subscription sync |
| `/api/cron/recheck` | Daily re-check for monitored domains |

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

This repo is a UI and route skeleton. Robots.txt parsing, auth, payments, and alerts are not wired yet.
