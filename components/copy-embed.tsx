"use client";

import { useState } from "react";
import { StaticBadge } from "@/components/static-badge";
import { BADGE_STYLES, type BadgeStyle } from "@/lib/badge-svg";
import type { Verdict } from "@/lib/crawlers";
import { embedAgentPrompt, embedHtml, embedMarkdown } from "@/lib/domain";

type Format = "html" | "markdown";

export function CopyEmbed({
  domain,
  verdict,
  checkedAt,
}: {
  domain: string;
  verdict: Verdict;
  checkedAt?: string;
}) {
  const [format, setFormat] = useState<Format>("markdown");
  const [style, setStyle] = useState<BadgeStyle>("shield");
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const snippet =
    format === "html" ? embedHtml(domain, style) : embedMarkdown(domain, style);
  const agentPrompt = embedAgentPrompt(domain, style);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(agentPrompt);
      setCopiedPrompt(true);
      window.setTimeout(() => setCopiedPrompt(false), 1600);
    } catch {
      setCopiedPrompt(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Embed</h2>
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

      <div className="mb-4 flex flex-wrap gap-2">
        {BADGE_STYLES.map((option) => {
          const selected = style === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setStyle(option)}
              className={`rounded-md border px-3 py-2 ${
                selected ? "border-foreground" : "border-border hover:border-stone-400"
              }`}
            >
              <StaticBadge
                verdict={verdict}
                checkedAt={checkedAt}
                style={option}
                className="h-5"
              />
            </button>
          );
        })}
      </div>

      <pre className="overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-6 text-code-text">
        {snippet}
      </pre>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={copyPrompt}
          className="h-10 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-background"
        >
          {copiedPrompt ? "Copied" : "Copy for Cursor"}
        </button>
      </div>
    </section>
  );
}
