import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmbed } from "@/components/copy-embed";
import { CRAWLERS, emptyCheckResult } from "@/lib/crawlers";
import { normalizeDomain } from "@/lib/domain";

export async function generateMetadata(
  props: PageProps<"/report/[domain]">,
): Promise<Metadata> {
  const { domain } = await props.params;
  return {
    title: `${decodeURIComponent(domain)} crawler report`,
  };
}

function statusLabel(status: string | null) {
  if (status === "allowed") return "Allowed";
  if (status === "blocked") return "Blocked";
  if (status === "unspecified") return "Not specified";
  return "Pending";
}

export default async function ReportPage(props: PageProps<"/report/[domain]">) {
  const raw = decodeURIComponent((await props.params).domain);
  const domain = normalizeDomain(raw) ?? raw;
  const result = emptyCheckResult(domain);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Report</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{domain}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Checker logic is not wired yet. This page is the report skeleton: badge preview,
        crawler table, llms.txt, and embed snippet.
      </p>

      <div className="mt-10 rounded-xl border border-border bg-surface p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/badge/${domain}`}
          alt={`AI Searchable badge for ${domain}`}
          className="h-5"
        />
        <p className="mt-4 font-mono text-xs text-muted">/badge/{domain}</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Crawler</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {CRAWLERS.map((crawler) => (
              <tr key={crawler} className="border-t border-border">
                <td className="px-4 py-3 font-mono">{crawler}</td>
                <td className="px-4 py-3 text-muted">{statusLabel(result.crawlers[crawler])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-xl border border-border p-5">
        <h2 className="text-sm font-medium">llms.txt</h2>
        <p className="mt-2 text-sm text-muted">Presence check pending.</p>
      </div>

      <div className="mt-8">
        <CopyEmbed domain={domain} />
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-zinc-700 p-5">
        <p className="text-sm">Get notified if this changes.</p>
        <p className="mt-1 text-sm text-muted">Start monitoring — $6/mo. Auth and Polar checkout come next.</p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex h-10 items-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-zinc-200"
        >
          Keep this monitored
        </Link>
      </div>
    </div>
  );
}
