import Link from "next/link";
import { DomainForm } from "@/components/domain-form";

const EXAMPLE_BADGES = [
  { domain: "vercel.com", label: "Allows AI crawlers" },
  { domain: "nytimes.com", label: "Blocks some crawlers" },
  { domain: "openai.com", label: "Allows AI crawlers" },
];

const EXPLAINERS = [
  {
    title: "GPTBot",
    body: "OpenAI's crawler. If it is blocked, your pages are less likely to show up in ChatGPT search and browsing.",
  },
  {
    title: "ClaudeBot",
    body: "Anthropic's crawler. Same idea for Claude: a robots.txt block can quietly drop you from citations.",
  },
  {
    title: "PerplexityBot",
    body: "Perplexity uses this to fetch sources. Blocking it means your site cannot be cited as an answer.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto w-full max-w-5xl px-6 py-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          AI crawler check
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Is your site visible to AI search? Check in 5 seconds.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Paste a domain. Get a report and an embeddable badge. No account required.
        </p>
        <div className="mt-10 max-w-xl">
          <DomainForm />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3">
          {EXAMPLE_BADGES.map((example) => (
            <Link
              key={example.domain}
              href={`/report/${example.domain}`}
              className="rounded-xl border border-border bg-surface p-5 hover:border-zinc-600"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/badge/${example.domain}`}
                alt={`AI Searchable badge for ${example.domain}`}
                className="h-5"
              />
              <p className="mt-4 font-mono text-sm">{example.domain}</p>
              <p className="mt-1 text-sm text-muted">{example.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-16 sm:grid-cols-3">
          {EXPLAINERS.map((item) => (
            <div key={item.title}>
              <h2 className="font-mono text-sm">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Free check. Paid monitoring.</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
              The badge is free forever. Pro keeps it accurate when robots.txt changes.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:bg-zinc-200"
          >
            See pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
