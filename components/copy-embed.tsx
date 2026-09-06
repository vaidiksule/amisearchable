"use client";

import { useMemo, useState } from "react";
import {
  BADGE_SHOW_FIELDS,
  BADGE_SHOW_LABELS,
  COMPOSITE_STYLES,
  COMPOSITE_STYLE_LABELS,
  compositeBadgeDataUri,
  compositeBadgeLabel,
  type BadgeShowField,
  type CompositeStyle,
} from "@/lib/badge-svg";
import { buildCompositeBadgeModel } from "@/lib/badge-model";
import type { CitationSnapshot } from "@/lib/citations/types";
import type { CheckResult } from "@/lib/crawlers";
import {
  badgeSrc,
  embedAgentPrompt,
  embedHtml,
  embedMarkdown,
} from "@/lib/domain";
import {
  CITATION_LIVE_PLATFORMS,
  PLATFORM_LABELS,
  PLATFORMS,
  isCitationComingSoon,
  type Platform,
} from "@/lib/platforms";
import type { ScoreBreakdown } from "@/lib/score";

type Format = "html" | "markdown";

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

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
  const [engines, setEngines] = useState<Platform[]>([...CITATION_LIVE_PLATFORMS]);
  const [show, setShow] = useState<BadgeShowField[]>(["ready", "score"]);
  const [style, setStyle] = useState<CompositeStyle>("classic");
  const [copied, setCopied] = useState<"snippet" | "link" | "prompt" | null>(null);

  const opts = useMemo(() => ({ show, engines, style }), [show, engines, style]);

  const composite = useMemo(
    () =>
      buildCompositeBadgeModel({
        result,
        score,
        citations,
        engines,
        show: show.length > 0 ? show : ["ready"],
        style,
      }),
    [citations, engines, result, score, show, style],
  );

  const previewSrc = useMemo(() => compositeBadgeDataUri(composite), [composite]);
  const previewAlt = useMemo(() => compositeBadgeLabel(composite), [composite]);
  const imageUrl = useMemo(() => badgeSrc(domain, opts), [domain, opts]);

  const snippet =
    format === "html" ? embedHtml(domain, opts) : embedMarkdown(domain, opts);
  const agentPrompt = embedAgentPrompt(domain, opts);

  async function copyText(kind: "snippet" | "link" | "prompt", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  function toggleEngine(platform: Platform) {
    setEngines((current) => toggleInList(current, platform));
  }

  function toggleShow(field: BadgeShowField) {
    setShow((current) => {
      const next = toggleInList(current, field);
      return next.length > 0 ? next : current;
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Embed</h2>

      {/* Two towers */}
      <div className="grid gap-3 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
        {/* Left: filters */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                1 · Engines
              </p>
              <ul className="mt-3 divide-y divide-border">
                {PLATFORMS.map((platform) => {
                  const soon = isCitationComingSoon(platform);
                  const checked = engines.includes(platform);
                  return (
                    <li key={platform}>
                      <label className="flex cursor-pointer items-center justify-between gap-3 py-2.5 text-sm">
                        <span className={soon ? "text-muted" : "text-foreground"}>
                          {PLATFORM_LABELS[platform]}
                          {soon ? " · soon" : null}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEngine(platform)}
                          className="h-4 w-4 accent-foreground"
                        />
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                2 · Show
              </p>
              <ul className="mt-3 divide-y divide-border">
                {BADGE_SHOW_FIELDS.map((field) => (
                  <li key={field}>
                    <label className="flex cursor-pointer items-center justify-between gap-3 py-2.5 text-sm">
                      <span>{BADGE_SHOW_LABELS[field]}</span>
                      <input
                        type="checkbox"
                        checked={show.includes(field)}
                        onChange={() => toggleShow(field)}
                        className="h-4 w-4 accent-foreground"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: live preview + style at X */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Live preview
            </p>
            <label className="flex items-center gap-2 text-xs text-muted">
              Style
              <select
                value={style}
                onChange={(event) => setStyle(event.target.value as CompositeStyle)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-foreground"
              >
                {COMPOSITE_STYLES.map((option) => (
                  <option key={option} value={option}>
                    {COMPOSITE_STYLE_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex min-h-28 items-center justify-center rounded-md border border-border bg-background p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt={previewAlt} className="h-auto max-w-full" />
          </div>

          <p className="mt-3 text-xs text-muted">
            Badge updates when you change engines, metrics, or style.
          </p>
        </div>
      </div>

      {/* Base: copy */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Embed code
          </p>
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

        <pre className="mt-3 overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-6 text-code-text">
          {snippet}
        </pre>

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => copyText("snippet", snippet)}
            className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
          >
            {copied === "snippet" ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => copyText("prompt", agentPrompt)}
            className="h-10 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-background"
          >
            {copied === "prompt" ? "Copied" : "Copy for Cursor"}
          </button>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs text-muted">Direct image URL</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-md bg-code px-3 py-2 font-mono text-xs text-code-text">
              {imageUrl}
            </code>
            <button
              type="button"
              onClick={() => copyText("link", imageUrl)}
              className="h-9 shrink-0 rounded-md border border-border px-3 text-sm text-foreground hover:bg-background"
            >
              {copied === "link" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
