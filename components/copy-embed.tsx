"use client";

import { useState } from "react";
import { StaticBadge } from "@/components/static-badge";
import { embedHtml, embedMarkdown } from "@/lib/domain";

type Format = "html" | "markdown";

export function CopyEmbed({
  domain,
  verdict,
  checkedAt,
}: {
  domain: string;
  verdict: "pass" | "fail";
  checkedAt?: string;
}) {
  const [format, setFormat] = useState<Format>("markdown");
  const [copied, setCopied] = useState(false);
  const snippet = format === "html" ? embedHtml(domain) : embedMarkdown(domain);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Embed this</h2>
        <div className="flex text-xs">
          {(["markdown", "html"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormat(option)}
              className={`px-2 py-1 capitalize ${
                format === option ? "text-foreground" : "text-muted"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-md border border-border bg-background p-4">
        <p className="font-mono text-xs text-muted">README.md</p>
        <p className="mt-3 text-sm font-medium">my-site</p>
        <p className="mt-1 text-sm text-muted">A short project description.</p>
        <div className="mt-3">
          <StaticBadge verdict={verdict} checkedAt={checkedAt} className="h-5" />
        </div>
      </div>

      <pre className="overflow-x-auto rounded-md bg-stone-100 p-3 font-mono text-xs leading-6 text-stone-700">
        {snippet}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="mt-4 h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-stone-800"
      >
        {copied ? "Copied" : "Copy embed code"}
      </button>
    </section>
  );
}
