import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmbed } from "@/components/copy-embed";
import { PageFrame } from "@/components/page-frame";
import { badgeLabel } from "@/lib/badge-svg";
import { getOrCreateCheck } from "@/lib/checks";
import { SEARCH_BOTS, TRAINING_BOTS, type CrawlerStatus } from "@/lib/crawlers";
import { normalizeDomain } from "@/lib/domain";
import { formatCheckedAt } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/report/[domain]">,
): Promise<Metadata> {
  const { domain } = await props.params;
  return {
    title: `${decodeURIComponent(domain)} crawler report`,
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{domain}</h1>
          <p className="mt-2 text-sm text-muted">
            {formatCheckedAt(result.checkedAt)}
            {result.rateLimited ? " · wait a minute to refresh" : ""}
          </p>
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
        <p className="mt-4 text-sm text-muted">
          Search and fetch bots only. Blocking training crawlers does not fail this badge.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium">AI search bots</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <tbody>
              {SEARCH_BOTS.map((crawler) => (
                <tr key={crawler} className="border-t border-border first:border-t-0">
                  <td className="px-4 py-3 font-mono">{crawler}</td>
                  <td className="px-4 py-3">
                    <StatusTone status={result.crawlers[crawler]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium">Training crawlers</h2>
        <p className="mt-1 text-xs text-muted">Informational. Blocking these is fine.</p>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <tbody>
              {TRAINING_BOTS.map((crawler) => (
                <tr key={crawler} className="border-t border-border first:border-t-0">
                  <td className="px-4 py-3 font-mono">{crawler}</td>
                  <td className="px-4 py-3">
                    <StatusTone status={result.crawlers[crawler]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-8 text-sm leading-6 text-muted">
        This confirms whether AI crawlers can access your site — it doesn&apos;t guarantee your
        content is cited in AI-generated answers, which also depends on content quality, competing
        sources, and each engine&apos;s own ranking.
      </p>

      <div className="mt-8 text-sm">
        <span className="font-medium">llms.txt</span>
        {result.llmsTxtPresent && result.llmsTxtUrl ? (
          <>
            {" "}
            <a href={result.llmsTxtUrl} className="text-accent underline" target="_blank" rel="noreferrer">
              found
            </a>
          </>
        ) : (
          <span className="text-muted"> — not found</span>
        )}
      </div>

      {result.error ? <p className="mt-4 text-sm text-warn">{result.error}</p> : null}

      <div className="mt-8">
        <CopyEmbed domain={domain} verdict={result.verdict} checkedAt={result.checkedAt} />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-5">
        <p className="text-sm">Keep this badge accurate.</p>
        <p className="mt-1 text-sm text-muted">Pro re-checks daily and emails you if it changes. $5/mo.</p>
        <Link
          href={`/monitor?domain=${domain}`}
          className="mt-4 inline-flex h-10 items-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-stone-800"
        >
          Keep this monitored
        </Link>
      </div>

      <p className="mt-8 text-xs text-muted">
        Reads public robots.txt and llms.txt only. Anyone can check any public domain.
      </p>
    </PageFrame>
  );
}
