"use client";

import { useState } from "react";
import { embedHtml, embedMarkdown } from "@/lib/domain";

type Format = "html" | "markdown";

export function CopyEmbed({ domain }: { domain: string }) {
  const [format, setFormat] = useState<Format>("html");
  const [copied, setCopied] = useState(false);
  const snippet = format === "html" ? embedHtml(domain) : embedMarkdown(domain);

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Copy embed code</h2>
        <div className="flex rounded-md border border-border text-xs">
          {(["html", "markdown"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormat(option)}
              className={`px-3 py-1.5 capitalize ${
                format === option ? "bg-zinc-800 text-foreground" : "text-muted"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <pre className="overflow-x-auto rounded-md bg-zinc-950 p-4 font-mono text-xs leading-6 text-zinc-300">
        {snippet}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="mt-4 h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-zinc-200"
      >
        {copied ? "Copied" : "Copy embed code"}
      </button>
    </section>
  );
}
