import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DomainForm } from "@/components/domain-form";
import { JsonLd } from "@/components/json-ld";
import { StaticBadge } from "@/components/static-badge";
import { embedAlt, localBadgeSrc } from "@/lib/domain";
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
          A README badge for AI search readiness
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
          Put it in your README. It shows whether AI search can reach your site — so you
          don&apos;t re-check robots.txt after every deploy.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StaticBadge verdict="pass" className="h-6" />
          <StaticBadge verdict="unclear" className="h-6" />
          <StaticBadge verdict="fail" className="h-6" />
        </div>
        <div className="mt-8">
          <DomainForm />
        </div>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
        <h2 className="text-sm font-medium">In a real README</h2>
        <figure className="mt-4 overflow-hidden rounded-lg border border-border bg-[#0d1117]">
          <Image
            src="/proof/github-readme-badge.png"
            alt="GitHub README showing a live AI Searchable badge: ai search ready"
            width={996}
            height={608}
            className="h-auto w-full"
            priority={false}
          />
        </figure>
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
              <p className="truncate font-mono text-sm">{example.domain}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={localBadgeSrc(example.domain)}
                alt={embedAlt(example.domain)}
                className="h-5 w-auto max-w-full self-start sm:self-center"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
        <h2 className="text-sm font-medium">Styles</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <StaticBadge verdict="pass" className="h-5" />
          <StaticBadge verdict="pass" style="pill" className="h-6" />
          <StaticBadge verdict="pass" style="terminal" className="h-6" />
          <StaticBadge verdict="pass" style="outline" className="h-6" />
        </div>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
        <h2 className="text-sm font-medium">How it works</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>Check your domain — we read robots.txt, llms.txt, and sitemap.</li>
          <li>Copy the badge into your README.</li>
          <li>
            Optional Pro: we re-check daily and email on change — nothing else to run.
          </li>
        </ol>
      </section>

      <section className="border-t border-border py-10 sm:py-14">
        <h2 className="text-sm font-medium">Guides</h2>
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
          <p className="text-sm text-muted">Free badge. Pro keeps it updated — $5/mo.</p>
          <Link href="/pricing" className="text-sm text-foreground underline underline-offset-4">
            Pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
