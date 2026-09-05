import Link from "next/link";
import { DomainForm } from "@/components/domain-form";
import { StaticBadge } from "@/components/static-badge";

const EXAMPLES = [
  { domain: "vercel.com", note: "Usually ready" },
  { domain: "nytimes.com", note: "Usually blocking" },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <section className="pt-14 pb-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Is your site visible to AI search?
        </h1>
        <p className="mt-4 max-w-lg text-muted">
          Check robots.txt. Get a badge for your README. No account needed.
        </p>
        <div className="mt-8">
          <DomainForm />
        </div>
      </section>

      <section className="border-t border-border py-14">
        <h2 className="text-sm font-medium">The badge</h2>
        <p className="mt-2 text-sm text-muted">
          Drop it in a README or footer. It shows whether search bots can cite you.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-xs text-muted">Pass</p>
            <div className="mt-3">
              <StaticBadge verdict="pass" className="h-6" />
            </div>
            <p className="mt-3 text-sm">AI-Search Ready</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-xs text-muted">Fail</p>
            <div className="mt-3">
              <StaticBadge verdict="fail" className="h-6" />
            </div>
            <p className="mt-3 text-sm">Blocking AI Search</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs text-muted">README.md</p>
          <p className="mt-3 text-sm font-medium">your-project</p>
          <p className="mt-1 text-sm text-muted">What it looks like on GitHub.</p>
          <div className="mt-3">
            <StaticBadge verdict="pass" className="h-5" />
          </div>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <h2 className="text-sm font-medium">Live examples</h2>
        <div className="mt-4 space-y-3">
          {EXAMPLES.map((example) => (
            <Link
              key={example.domain}
              href={`/report/${example.domain}`}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 hover:border-stone-400"
            >
              <span className="font-mono text-sm">{example.domain}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-muted">{example.note}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/badge/${example.domain}`}
                  alt={`Badge for ${example.domain}`}
                  className="h-5"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-14">
        <h2 className="text-sm font-medium">What we check</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Search bots only: OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot,
          Claude-User. Training crawlers are listed on the report but do not fail the badge.
        </p>
      </section>

      <section className="border-t border-border py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Badge is free. Pro is $5/mo to keep it fresh.
          </p>
          <Link href="/pricing" className="text-sm text-foreground underline underline-offset-4">
            Pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
