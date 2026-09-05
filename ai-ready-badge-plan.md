# amisearchable.cc — Product Plan

*A shareable, embeddable badge that shows whether a website is accessible to AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.), with optional monitoring so the badge stays accurate over time.*

**Domain:** `amisearchable.cc` ✅ bought

---

## 0. Confirmed Stack & Flow

**Stack:**

```
Next.js
  ↓
Supabase
  ├── Auth
  └── Postgres
  ↓
Polar
  └── Payments
```

One Next.js app. No separate frontend/backend. Supabase provides both the database and auth (magic link). Polar handles payments and is only reached after auth.

**User flow:**

```
Check → Get result → Get badge → "Keep this monitored" → Auth → Pay
```

1. Anyone pastes a domain, no login required.
2. They land on the report page and immediately get a **static badge** — free, forever, no account needed.
3. If they want it to stay accurate, "Keep this monitored" prompts Supabase Auth (magic link).
4. After auth, Polar checkout for the Pro subscription.
5. Once paid, the **same badge URL** switches from static to dynamically-refreshed — the embed code on their site/README never has to change.

**Embed snippet (confirmed):**

```html
<a href="https://amisearchable.cc/report/example.com">
  <img src="https://amisearchable.cc/badge/example.com" alt="AI Searchable">
</a>
```

The `<img>` src is the badge Route Handler (§6); wrapping it in an `<a>` to the report page is what drives return traffic and conversions to Pro — don't ship the badge without the link.

---



## 1. The Core Idea

Every existing "AI crawler checker" tool is a one-off report page: paste a domain, get a score, leave. Nobody has turned this into an **embeddable, living badge** — the same viral mechanic that made shields.io badges, "Deployed on Vercel" buttons, and Netlify status badges spread organically across every README and portfolio site on the internet.

**The wedge:** a badge you drop into your GitHub README, blog footer, or portfolio that says:

```
✅ AI-Search Ready        or        ⚠️ Blocking GPTBot & ClaudeBot
```

Every embed is free distribution in front of other developers — the exact audience that would use the tool themselves.

---



## 2. What the Website Should Look Like

Keep it to **4 screens**, all achievable in a single Next.js app.

### 2.1 Landing page (`/`)

- One-line headline: *"Is your site visible to AI search? Check in 5 seconds."*
- A single input field: domain name → **Check now** button (no signup required)
- Below the fold: 3–4 example badges (real domains, e.g. a news site that blocks AI, one that allows it) so visitors instantly understand the output
- Short explainer section: what GPTBot / ClaudeBot / PerplexityBot are, why it matters (3 short blocks, not a wall of text — this audience skims)
- Pricing section (see §4)
- Footer with "Built by [you]" — this itself is a badge-in-the-wild example



### 2.2 Results page (`/report/[domain]`)

- Big badge preview at the top (the actual SVG they'd embed)
- A pass/fail table: one row per crawler (GPTBot, ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, CCBot, Amazonbot, Bytespider) with Allowed / Blocked / Not specified
- `llms.txt` presence check (yes/no + link if found)
- "Copy embed code" button (Markdown + HTML snippet) — this is the single most important UI element on the whole site, make it impossible to miss
- Soft upsell: *"Get notified if this changes → Start monitoring ($5/mo)"*



### 2.3 Dashboard (`/dashboard`) — paid users only

- List of monitored domains
- Last-checked timestamp, current status, history sparkline (optional v2)
- Alert settings (email on change; Slack webhook as a v2 stretch goal)
- Manage subscription (link to Polar customer portal)



### 2.4 Pricing page (`/pricing`)

- Simple 2-column comparison: Free vs Pro
- Polar checkout button

**Design direction:** lean on your `frontend-design` conventions — this should feel like a dev-tool (Vercel/Resend/shields.io aesthetic: dark mode default, monospace accents for the badge/code snippets, generous whitespace), not a marketing SaaS page. Developers trust tools that look like tools.

---



## 3. Business Model

**Distribution engine:** the badge itself. Every free user who embeds it is doing your marketing. This is why the free tier must include the badge — gating the badge behind payment kills the entire growth loop.

**Monetization:** the badge is free forever (static, checked once). The subscription is for **staying correct**:

- Sites change robots.txt by accident (CDN migration, theme update, agency "SEO cleanup") and silently start blocking AI crawlers.
- Paid users get their badge auto-refreshed on a schedule and get alerted the moment their status changes — before it costs them AI-search visibility.

This is the same "monitoring, not one-time check" model that made things like UptimeRobot and SSL-expiry checkers into durable micro-SaaS businesses — the check is free, the peace of mind is the product.

**Secondary revenue (v2, don't build day one):**

- Agency/bulk tier: check 50+ client domains at once, white-labeled badges
- "AI Access" fix guide / paste-ready robots.txt snippets (content marketing + soft upsell)

---



## 4. Free vs Paid

**Free: Check → generate badge.**
**Pro: Monitor → dynamic badge + alerts.**


| Feature                            | Free                                | Pro ($5–9/mo)                 |
| ---------------------------------- | ----------------------------------- | ----------------------------- |
| One-time domain check              | ✅                                   | ✅                             |
| Embeddable badge                   | ✅ (static — snapshot at check time) | ✅ (dynamic — auto re-checked) |
| Per-crawler breakdown table        | ✅                                   | ✅                             |
| `llms.txt` presence check          | ✅                                   | ✅                             |
| Badge auto-refreshes on a schedule | ❌ (manual re-check only)            | ✅ (e.g. daily)                |
| Email alert when status changes    | ❌                                   | ✅                             |
| Multiple domains tracked           | ❌ (1 at a time, no save)            | ✅ (dashboard, saved list)     |
| Slack webhook alerts               | ❌                                   | ✅ (v2)                        |
| Bulk / agency checks               | ❌                                   | Higher tier (v2)              |


Important implementation detail: it's **the same badge URL** (`/badge/[domain]`) for both tiers. Upgrading to Pro doesn't change the embed code on the user's site — it just flips that domain's row in Postgres to `is_monitored = true`, and the Route Handler starts serving a freshly-checked SVG instead of a cached snapshot. This is what makes the upgrade frictionless: no need to ask them to re-embed anything.

Pricing: **$6/mo or $50/yr, covering up to 5 monitored domains per seat.** Both cadences live in Polar from day one (a second price object, no extra dev work). Don't add tiers beyond this until paying users specifically ask for more domains — that request is your signal to build the agency/bulk tier from §3.

---



## 5. Do We Need a Database? Yes — but a small one.

You need persistence for exactly three things:

1. **Monitored domains** (which domains belong to which paying user, and their check schedule)
2. **Check history** (so you can detect "did this change since last time" to trigger alerts)
3. **Subscription status** (synced from Polar via webhook)

**Recommendation: Postgres, via a serverless-friendly provider — Neon or Supabase.**

Why Postgres over a KV store:

- You'll want to query "all domains due for a re-check today," "all users on Pro," "history for domain X" — relational queries are the natural fit.
- Neon and Supabase both have generous free tiers, scale to zero, and work natively with Vercel/Next.js via simple connection strings — no separate server to manage.
- Supabase additionally gives you auth (magic link email login) for free, which you'll want for the dashboard — this alone can save you a day of work.

**Suggested schema (minimal):**

```
users            (id, email, polar_customer_id, plan, created_at)
domains          (id, user_id nullable, domain, is_monitored, created_at)
checks           (id, domain_id, checked_at, results_json, pass_fail, score, llms_txt_present)
```

Note: `domains.user_id` is nullable specifically because free/anonymous checks still create a row (per the caching logic in §6) — it only gets a real `user_id` once someone authenticates via "Keep this monitored." Enforce the 5-domain-per-seat cap (§4) with a simple count query on `domains where user_id = X and is_monitored = true` before allowing a new one to be added.

**Access policy:** any public domain can be checked or monitored by anyone — no ownership verification. The tool only ever reads public `robots.txt`/`llms.txt` files, the same way SSL checkers or uptime monitors work. Add a one-line disclaimer on the report page (e.g. "This reads public files only") to preempt the "can I check a competitor's site" question — the answer is yes, by design.

For the free/anonymous one-off check on the landing page, **every check still writes a row to the DB** — this is cheap (one row) and is what makes badges possible at all. What you must avoid is re-running the `robots.txt`/`llms.txt` fetch on every badge image request; the badge route reads the cached row instead. See §6 for the exact badge-serving logic this implies.

You do **not** need Redis/caching infrastructure for a day-one MVP. If badge-serving traffic grows large later, add a simple cache layer (Vercel Edge Config or Redis) in front of the SVG endpoint — not needed at launch.

---



## 6. One Next.js App — No Separate Backend Needed

Yes — a single Next.js app (App Router) covers everything:

- **Frontend:** the landing/results/dashboard pages, React Server Components
- **Backend:** Next.js Route Handlers (`app/api/.../route.ts`) act as your API — no separate Express/Fastify server required
- **Badge generation:** a Route Handler at `app/badge/[domain]/route.ts` with this exact logic:
  1. Look up the most recent `checks` row for this domain.
  2. If found → render the SVG from that cached row. Never re-fetch `robots.txt` on the image request itself.
  3. If not found (edge case — badge URL hit before any check ever ran) → run a live check synchronously, insert the row, then render. This should rarely trigger in normal use, since the report-page flow always creates the row first.
  4. For monitored (Pro) domains, a daily cron overwrites the row — the badge route logic above doesn't change, it just always has fresher data to read.
  - Returns SVG with `Content-Type: image/svg+xml`. This is what gets embedded via `<img src="https://amisearchable.cc/badge/example.com">`.
- **Pass/fail rule (what the badge actually shows):** Pass ("AI-Search Ready") requires the **search/fetch bots** to be allowed — `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`, `Claude-User`. These are the bots that determine whether the site can be cited in AI answers. Training-crawler status (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`) and `llms.txt` presence are shown as extra detail on the report page but do **not** affect pass/fail — blocking training crawlers is a legitimate, common, deliberate choice and shouldn't be penalized.
- **Scheduled re-checks (Pro users):** Vercel Cron Jobs (built into Vercel, defined in `vercel.json`) hitting an internal API route once a day to re-check monitored domains and fire alerts — no separate worker/queue service needed at this scale
- **Emails:** Resend (simple API, generous free tier, integrates in a few lines) for the "your AI-crawler status changed" alert

**Deployment: Vercel, single project, single deploy.** This is the right call specifically because:

- Route Handlers double as serverless/edge functions automatically
- Cron jobs are native
- Zero DevOps — `git push` deploys
- Free tier comfortably covers a launch-week traffic spike

You do not need separate hosting for frontend vs backend. That split matters for large teams with independent release cycles — not for a one-person, one-day-build micro-SaaS.

---



## 7. Payment Gateway: Polar

Good call on Polar over Stripe — Stripe's standard onboarding isn't available for Indian individual founders in the same self-serve way, while **Polar acts as a Merchant of Record**, meaning:

- Polar handles tax/VAT compliance globally, so you don't need a local Stripe-eligible business entity to start charging international customers.
- It's built specifically for indie devs/SaaS (funded partly by open-source/dev-tool ecosystem), with first-class Next.js support.

**Integration plan:**

1. Create a Polar organization + product ("AI-Ready Pro Monitoring," $6/mo).
2. Use Polar's hosted **Checkout Link** for the pricing page — no custom payment form needed, just redirect to Polar's checkout.
3. Set up a **Polar webhook** → a Next.js Route Handler (`app/api/webhooks/polar/route.ts`) that listens for `subscription.created`, `subscription.updated`, `subscription.canceled` events, and updates the `users.plan` field in Postgres accordingly.
4. Use Polar's **Customer Portal** link (they provide one out of the box) for the "Manage subscription" button in the dashboard — you don't need to build billing UI yourself.
5. Gate features (`isMonitored`, alert emails) behind a simple `user.plan === 'pro'` check read from your DB, kept in sync by the webhook.

This whole integration is realistically a 1–2 hour slice of your one-day build, since Polar's checkout + webhook pattern is close to a copy-paste for a single-product subscription.

---



## 8. One-Day Build Checklist

1. Next.js app scaffold + deploy to Vercel (empty project live) — 15 min
2. `robots.txt` + `llms.txt` fetch-and-parse logic (the core engine) — 1–2 hrs
3. Badge SVG Route Handler — 1 hr
4. Landing page + results page UI — 2–3 hrs
5. Polar product + checkout link + webhook — 1–2 hrs
6. Neon/Supabase Postgres setup + schema + save-domain-on-payment flow — 1 hr
7. Vercel Cron for daily re-checks + Resend alert email — 1 hr
8. Launch post for Twitter/X and relevant subreddits (e.g. r/SaaS, r/webdev, r/SEO) — 30 min

---



## 9. Decisions Locked So Far

- ✅ Domain: `amisearchable.cc`
- ✅ Stack: Next.js + Supabase (Auth + Postgres) + Polar, single app, single Vercel deploy
- ✅ Flow: Check → Result → Badge (free, no auth) → "Keep this monitored" → Supabase Auth → Polar checkout
- ✅ Badge caching: every check writes a DB row; badge route reads the cached row, never re-fetches live except as a fallback for an uncached domain
- ✅ Pass/fail rule: based on search/fetch bots only (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Claude-User); training bots and `llms.txt` are informational, not pass/fail
- ✅ Free tier: check → embed → done, no account, `user_id` stays null
- ✅ Pro: 5 domains per seat, $6/mo or $50/yr from day one
- ✅ Access policy: any public domain, no ownership proof required
- ✅ Day-one scope: full loop (check + badge + auth + Polar + cron + email), built in that order
- ✅ Embed snippet finalized (§0)



## 10. Open Questions for You

None blocking the build — the engine-level decisions (caching logic and pass/fail rule) are resolved. Remaining are just sequencing preferences:

1. Want me to draft the actual landing/report page copy and UI next, or start with the core badge-generation Route Handler (the fetch-and-parse + caching logic from §6) first?

