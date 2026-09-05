"use client";

import { useState } from "react";
import { StaticBadge } from "@/components/static-badge";
import {
  BADGE_STYLES,
  BADGE_STYLE_META,
  type BadgeStyle,
} from "@/lib/badge-svg";
import { embedAgentPrompt, embedHtml, embedMarkdown } from "@/lib/domain";

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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="mb-4">
        <p className="text-xs text-muted">Badge style</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {BADGE_STYLES.map((option) => {
            const meta = BADGE_STYLE_META[option];
            const selected = style === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setStyle(option)}
                className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                  selected
                    ? "border-foreground bg-background"
                    : "border-border bg-background/60 hover:border-stone-400"
                }`}
              >
                <div className="overflow-x-auto">
                  <StaticBadge
                    verdict={verdict}
                    checkedAt={checkedAt}
                    style={option}
                    className={option === "outline" || option === "pill" || option === "terminal" ? "h-6" : "h-5"}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-foreground">{meta.label}</p>
                <p className="mt-0.5 text-xs text-muted">{meta.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 rounded-md border border-border bg-background p-4">
        <p className="font-mono text-xs text-muted">README.md</p>
        <p className="mt-3 text-sm font-medium">my-site</p>
        <p className="mt-1 text-sm text-muted">A short project description.</p>
        <div className="mt-3 overflow-x-auto">
          <StaticBadge
            verdict={verdict}
            checkedAt={checkedAt}
            style={style}
            className={style === "shield" ? "h-5" : "h-6"}
          />
        </div>
      </div>

      <pre className="overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-6 text-code-text">
        {snippet}
      </pre>
      <p className="mt-3 text-xs text-muted">
        Paste this into Cursor or Claude Code and it will add the badge for you.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
        >
          {copied ? "Copied" : "Copy embed code"}
        </button>
        <button
          type="button"
          onClick={copyPrompt}
          className="h-10 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-surface"
        >
          {copiedPrompt ? "Copied" : "Copy prompt for Cursor / Claude Code"}
        </button>
      </div>
    </section>
  );
}
