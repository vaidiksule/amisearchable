import type { Metadata } from "next";
import Link from "next/link";
import { DomainForm } from "@/components/domain-form";
import { JsonLd } from "@/components/json-ld";
import { StaticBadge } from "@/components/static-badge";
import { embedAlt } from "@/lib/domain";
import { GUIDES } from "@/lib/guides";
import { HOME_FAQS, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, absoluteUrl } from "@/lib/seo";

const EXAMPLES = [
  { domain: "amisearchable.cc", note: "This site" },
  { domain: "vercel.com", note: "Usually ready" },
  { domain: "nytimes.com", note: "Usually blocking" },
];

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: absoluteUrl("/"),
            description: SITE_DESCRIPTION,
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "AI Searchable",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            url: absoluteUrl("/"),
            description: SITE_DESCRIPTION,
            offers: [
              {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                name: "Free badge",
              },
              {
                "@type": "Offer",
                price: "5",
                priceCurrency: "USD",
                name: "Pro monitoring",
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: HOME_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          },
        ]}
      />

      <section className="pt-10 pb-10 sm:pt-14">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Is your site visible to AI search?
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
          Check in 5 seconds. This AI crawler checker reads robots.txt to see if GPTBot,
          ChatGPT-User, and PerplexityBot can access your site — then gives you a badge for
          your README.
        </p>
        <div className="mt-8">
          <DomainForm />
        </div>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
        <h2 className="text-sm font-medium">The badge</h2>
        <p className="mt-2 text-sm text-muted">
          Drop it in a README or footer. It shows whether search bots can cite you.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-xs text-muted">Pass</p>
            <div className="mt-3 overflow-x-auto">
              <StaticBadge verdict="pass" className="h-6" />
            </div>
            <p className="mt-3 text-sm">AI-Search Ready</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-xs text-muted">Fail</p>
            <div className="mt-3 overflow-x-auto">
              <StaticBadge verdict="fail" className="h-6" />
            </div>
            <p className="mt-3 text-sm">Blocking AI Search</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs text-muted">README.md</p>
          <p className="mt-3 text-sm font-medium">your-project</p>
          <p className="mt-1 text-sm text-muted">What it looks like on GitHub.</p>
          <div className="mt-3 overflow-x-auto">
            <StaticBadge verdict="pass" className="h-5" />
          </div>
        </div>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
        <h2 className="text-sm font-medium">Live examples</h2>
        <div className="mt-4 space-y-3">
          {EXAMPLES.map((example) => (
            <Link
              key={example.domain}
              href={`/report/${example.domain}`}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3 hover:border-stone-400 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-sm">{example.domain}</p>
                <p className="mt-1 text-xs text-muted">{example.note}</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/badge/${example.domain}`}
                alt={embedAlt(example.domain)}
                className="h-5 w-auto max-w-full self-start sm:self-center"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
        <h2 className="text-sm font-medium">What we check</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Search bots only: OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot,
          Claude-User. Training crawlers like GPTBot and ClaudeBot are listed on the report
          but do not fail the badge.{" "}
          <Link href="/guides/gptbot-vs-chatgpt-user" className="text-foreground underline underline-offset-4">
            Why that split matters
          </Link>
          . This site publishes{" "}
          <a href="/llms.txt" className="text-foreground underline underline-offset-4">
            its own llms.txt
          </a>
          .
        </p>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
        <h2 className="text-sm font-medium">Guides</h2>
        <p className="mt-2 text-sm text-muted">
          AI search visibility, crawler access, and llms.txt — written for the terms people
          actually search.
        </p>
        <ul className="mt-4 space-y-3">
          {GUIDES.slice(0, 4).map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="text-sm underline underline-offset-4"
              >
                {guide.title}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/guides" className="mt-4 inline-block text-sm text-muted underline underline-offset-4">
          All guides
        </Link>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
        <h2 className="text-sm font-medium">FAQ</h2>
        <dl className="mt-6 space-y-6">
          {HOME_FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="text-sm font-medium">{faq.question}</dt>
              <dd className="mt-2 text-sm leading-6 text-muted">
                {faq.answer}{" "}
                <Link href={faq.href} className="text-foreground underline underline-offset-4">
                  Read more
                </Link>
                .
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
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
