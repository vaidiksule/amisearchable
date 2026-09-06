"use client";

import { useMemo, useState } from "react";
import { StaticBadge } from "@/components/static-badge";
import {
  BADGE_STYLES,
  BADGE_VIEWS,
  type BadgeStyle,
  type BadgeView,
} from "@/lib/badge-svg";
import type { CitationSnapshot } from "@/lib/citations/types";
import { citationSummary } from "@/lib/citations/types";
import type { CheckResult, Verdict } from "@/lib/crawlers";
import { embedAgentPrompt, embedHtml, embedMarkdown } from "@/lib/domain";
import {
  PLATFORM_LABELS,
  PLATFORMS,
  platformVerdict,
  type Platform,
} from "@/lib/platforms";
import type { ScoreBreakdown } from "@/lib/score";

type Format = "html" | "markdown";

export function CopyEmbed({
  domain,
  result,
  score,
  citations,
}: {
  domain: string;
  result: CheckResult;
  score: ScoreBreakdown;
  citations: CitationSnapshot | null;
}) {
  const [format, setFormat] = useState<Format>("markdown");
  const [style, setStyle] = useState<BadgeStyle>("shield");
  const [view, setView] = useState<BadgeView>("ready");
  const [engine, setEngine] = useState<Platform | "all">("all");
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const opts = useMemo(() => ({ style, view, engine }), [style, view, engine]);

  const preview = useMemo(() => {
    const verdict: Verdict =
      engine === "all"
        ? result.verdict
        : platformVerdict(engine, {
            robotsTxtFound: result.robotsTxtFound,
            crawlers: result.crawlers,
          });
    const scoreValue = engine === "all" ? score.total : score.platforms[engine];
    return {
      verdict,
      checkedAt: result.checkedAt,
      score: scoreValue,
      citations: citationSummary(citations, engine),
      view,
      engine,
      style,
    };
  }, [citations, engine, result, score, style, view]);

  const snippet =
    format === "html" ? embedHtml(domain, opts) : embedMarkdown(domain, opts);
  const agentPrompt = embedAgentPrompt(domain, opts);

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

      <p className="mb-2 text-xs text-muted">Show</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {BADGE_VIEWS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setView(option)}
            className={`rounded-md border px-3 py-1.5 text-xs capitalize ${
              view === option ? "border-foreground" : "border-border hover:border-stone-400"
            }`}
          >
            {option === "age" ? "Last searched" : option}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs text-muted">Engine</p>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEngine("all")}
          className={`rounded-md border px-3 py-1.5 text-xs ${
            engine === "all" ? "border-foreground" : "border-border hover:border-stone-400"
          }`}
        >
          All
        </button>
        {PLATFORMS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setEngine(option)}
            className={`rounded-md border px-3 py-1.5 text-xs ${
              engine === option ? "border-foreground" : "border-border hover:border-stone-400"
            }`}
          >
            {PLATFORM_LABELS[option]}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs text-muted">Style</p>
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
              <StaticBadge {...preview} style={option} className="h-5" />
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <StaticBadge {...preview} className="h-6" />
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
