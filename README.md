# amisearchable.cc

Shareable badge that shows whether a website is visible to AI search bots. Free one-time checks. Pro monitoring keeps the badge accurate.

[![AI Searchable — AI crawler access badge for lazur.app](https://amisearchable.cc/badge/lazur.app?v=12&show=ready%2Cscore&overall=1)](https://amisearchable.cc/report/lazur.app)
## Stack

Next.js (App Router) · Supabase · Polar · Vercel · Resend

## Local

```bash
npm install
cp .env.example .env.local
npm run dev
```

The check engine and badge work without env vars. Auth, caching, billing, cron, and email need the keys below.

## Setup

1. **Supabase** — create a project, run `supabase/schema.sql` in the SQL editor, enable magic-link email auth, and add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://amisearchable.cc/auth/callback`
2. **Polar** — create product “AI-Ready Pro Monitoring” with $6/mo and $50/yr prices. Point a webhook at `/api/webhooks/polar` for subscription events.
3. **Resend** — add a from-address for status-change alerts.
4. **Vercel** — set the same env vars, deploy, and keep the daily cron in `vercel.json`.

## Routes

| Path | Purpose |
|---|---|
| `/` | Landing page + domain check |
| `/report/[domain]` | Results, badge preview, embed snippet |
| `/badge/[domain]` | SVG badge (cached check, live only if unseen) |
| `/pricing` | Free vs Pro |
| `/login` | Magic-link auth |
| `/dashboard` | Monitored domains (Pro) |
| `/checkout` | Polar checkout |
| `/portal` | Polar customer portal |
| `/api/webhooks/polar` | Subscription sync |
| `/api/cron/recheck` | Daily re-check + alerts |
