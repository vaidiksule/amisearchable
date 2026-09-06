"use client";

import { useMemo, useState } from "react";
import {
  BADGE_SHOW_FIELDS,
  BADGE_SHOW_LABELS,
  compositeBadgeDataUri,
  compositeBadgeLabel,
  type BadgeShowField,
} from "@/lib/badge-svg";
import { buildCompositeBadgeModel } from "@/lib/badge-model";
import type { CitationSnapshot } from "@/lib/citations/types";
import type { CheckResult } from "@/lib/crawlers";
import { embedAgentPrompt, embedHtml, embedMarkdown } from "@/lib/domain";
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
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const opts = useMemo(() => ({ show, engines }), [show, engines]);

  const composite = useMemo(
    () =>
      buildCompositeBadgeModel({
        result,
        score,
        citations,
        engines,
        show: show.length > 0 ? show : ["ready"],
      }),
    [citations, engines, result, score, show],
  );

  const previewSrc = useMemo(() => compositeBadgeDataUri(composite), [composite]);
  const previewAlt = useMemo(() => compositeBadgeLabel(composite), [composite]);

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
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Embed editor</h2>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <div className="space-y-5">
          <fieldset>
            <legend className="text-xs text-muted">Engines</legend>
            <div className="mt-2 space-y-2">
              {PLATFORMS.map((platform) => {
                const soon = isCitationComingSoon(platform);
                const checked = engines.includes(platform);
                return (
                  <label
                    key={platform}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEngine(platform)}
                      className="accent-foreground"
                    />
                    <span>
                      {PLATFORM_LABELS[platform]}
                      {soon ? (
                        <span className="text-muted"> · coming soon</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs text-muted">Show</legend>
            <div className="mt-2 space-y-2">
              {BADGE_SHOW_FIELDS.map((field) => (
                <label
                  key={field}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={show.includes(field)}
                    onChange={() => toggleShow(field)}
                    className="accent-foreground"
                  />
                  <span>{BADGE_SHOW_LABELS[field]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-md border border-border bg-background p-4">
            <p className="mb-3 text-xs text-muted">Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt={previewAlt} className="h-auto max-w-full" />
          </div>

          <pre className="overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-6 text-code-text">
            {snippet}
          </pre>

          <div className="flex flex-wrap gap-3">
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
        </div>
      </div>
    </section>
  );
}
