"use client";

import { useState, useTransition } from "react";
import { probeDomainCitations } from "@/app/actions/citations";

export function ProbeCitationsButton({ domain }: { domain: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onProbe() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await probeDomainCitations(domain);
      if (result.ok) {
        setMessage(`Probed — ${result.summary}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted">
        Citations stay “pending” until probed. Pro searches run probes
        automatically; weekly cron covers monitored domains; you can also probe
        now.
      </p>
      <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
        <button
          type="button"
          onClick={onProbe}
          disabled={pending}
          className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Probing…" : "Probe citations now"}
        </button>
        {message ? <p className="text-xs text-accent">{message}</p> : null}
        {error ? <p className="text-xs text-warn">{error}</p> : null}
      </div>
    </div>
  );
}
