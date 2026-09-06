import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmbed } from "@/components/copy-embed";
import { JsonLd } from "@/components/json-ld";
import { PageFrame } from "@/components/page-frame";
import { badgeLabel } from "@/lib/badge-svg";
import { getLatestCheck, getOrCreateCheck } from "@/lib/checks";
import { SEARCH_BOTS, TRAINING_BOTS, type CrawlerStatus } from "@/lib/crawlers";
import { normalizeDomain } from "@/lib/domain";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import { formatCheckedAt } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/report/[domain]">,
): Promise<Metadata> {
  const raw = decodeURIComponent((await props.params).domain);
  const domain = normalizeDomain(raw);

  if (!domain) {
    return {
      title: "Invalid domain",
      robots: { index: false, follow: false },
    };
  }

  const cached = await getLatestCheck(domain);
  const verdictLine =
    cached?.verdict === "fail"
      ? `${domain} is blocking at least one AI search bot.`
      : cached?.verdict === "pass"
        ? `${domain} allows AI search bots.`
        : `AI crawler access report for ${domain}.`;
  const llmsLine = cached
    ? cached.llmsTxtPresent
      ? " llms.txt was found."
      : " llms.txt was not found."
    : "";

  return {
    title: `Is ${domain} blocked from ChatGPT, Claude and Perplexity?`,
    description: `${verdictLine}${llmsLine} Check GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, and PerplexityBot in robots.txt.`,
    alternates: { canonical: `/report/${domain}` },
    openGraph: {
      title: `Is ${domain} blocked from ChatGPT, Claude and Perplexity?`,
      description: `${verdictLine}${llmsLine}`,
      url: `/report/${domain}`,
      type: "website",
    },
  };
}

function statusLabel(status: CrawlerStatus) {
  if (status === "allowed") return "Allowed";
  if (status === "blocked") return "Blocked";
  return "Not specified";
}

function StatusTone({ status }: { status: CrawlerStatus }) {
  const color =
    status === "allowed" ? "text-accent" : status === "blocked" ? "text-warn" : "text-muted";
  return <span className={color}>{statusLabel(status)}</span>;
}

function BotTable({
  bots,
  crawlers,
}: {
  bots: readonly string[];
  crawlers: Record<string, CrawlerStatus>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <tbody>
          {bots.map((crawler) => (
            <tr key={crawler} className="border-t border-border first:border-t-0">
              <td className="px-4 py-3 font-mono">{crawler}</td>
              <td className="px-4 py-3 text-right">
                <StatusTone status={crawlers[crawler]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FileRow({
  label,
  found,
  href,
}: {
  label: string;
  found: boolean;
  href: string | null;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="font-mono text-muted">{label}</span>
      {found && href ? (
        <a href={href} className="text-accent underline underline-offset-4" target="_blank" rel="noreferrer">
          found
        </a>
      ) : (
        <span className="text-muted">not found</span>
      )}
    </li>
  );
}

export default async function ReportPage(props: PageProps<"/report/[domain]">) {
  const raw = decodeURIComponent((await props.params).domain);
  const domain = normalizeDomain(raw);
  const searchParams = await props.searchParams;
  const fresh = searchParams.fresh === "1";

  if (!domain) {
    return (
      <PageFrame>
        <h1 className="text-3xl font-semibold tracking-tight">Invalid domain</h1>
        <p className="mt-3 text-sm text-muted">Try something like example.com.</p>
      </PageFrame>
    );
  }

  const result = await getOrCreateCheck(domain, { fresh });
  const passed = result.verdict === "pass";

  return (
    <PageFrame>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `Is ${domain} blocked from ChatGPT, Claude and Perplexity?`,
            url: absoluteUrl(`/report/${domain}`),
            isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: absoluteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: `${domain} report`,
                item: absoluteUrl(`/report/${domain}`),
              },
            ],
          },
        ]}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{domain}</h1>
          <p className="mt-2 text-sm text-muted">{formatCheckedAt(result.checkedAt)}</p>
        </div>
        <Link href={`/report/${domain}?fresh=1`} className="text-sm underline underline-offset-4">
          Re-check
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6">
        <p className={`text-sm font-medium ${passed ? "text-accent" : "text-warn"}`}>
          {passed ? "AI-Search Ready" : "Blocking AI Search"}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/badge/${domain}?t=${encodeURIComponent(result.checkedAt)}`}
          alt={badgeLabel(result.verdict, result.checkedAt)}
          className="mt-4 h-6"
        />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium">AI search bots</h2>
        <div className="mt-3">
          <BotTable bots={SEARCH_BOTS} crawlers={result.crawlers} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium">Training crawlers</h2>
        <div className="mt-3">
          <BotTable bots={TRAINING_BOTS} crawlers={result.crawlers} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium">Files</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <FileRow
            label="robots.txt"
            found={result.robotsTxtFound}
            href={result.robotsTxtUrl}
          />
          <FileRow
            label="llms.txt"
            found={result.llmsTxtPresent}
            href={result.llmsTxtUrl}
          />
          <FileRow
            label="llms-full.txt"
            found={Boolean(result.llmsFullTxtPresent)}
            href={result.llmsFullTxtUrl ?? null}
          />
          <FileRow
            label="sitemap.xml"
            found={Boolean(result.sitemapXmlPresent)}
            href={result.sitemapXmlUrl ?? null}
          />
        </ul>
      </section>

      {result.error ? <p className="mt-4 text-sm text-warn">{result.error}</p> : null}

      <div className="mt-8">
        <CopyEmbed domain={domain} verdict={result.verdict} checkedAt={result.checkedAt} />
      </div>

      <div className="mt-8">
        <Link
          href={`/monitor?domain=${domain}`}
          className="inline-flex h-10 items-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
        >
          Keep monitored · $5/mo
        </Link>
      </div>
    </PageFrame>
  );
}
