"use client";

import { useMemo, useState, useTransition } from "react";
import { rotateDeployHookSecret } from "@/app/actions/hooks";

export function DeployHookPanel({
  secret: initialSecret,
  domains,
  siteOrigin,
}: {
  secret: string;
  domains: string[];
  siteOrigin: string;
}) {
  const [secret, setSecret] = useState(initialSecret);
  const [domain, setDomain] = useState(domains[0] ?? "");
  const [copied, setCopied] = useState<"url" | "curl" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hookUrl = useMemo(() => {
    if (!domain) return `${siteOrigin}/api/hooks/recheck?domain=YOUR_DOMAIN`;
    const url = new URL("/api/hooks/recheck", siteOrigin);
    url.searchParams.set("domain", domain);
    return url.toString();
  }, [domain, siteOrigin]);

  const curl = useMemo(() => {
    return `curl -X POST '${hookUrl}' \\\n  -H 'Authorization: Bearer ${secret}'`;
  }, [hookUrl, secret]);

  async function copy(kind: "url" | "curl", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  function rotate() {
    setError(null);
    startTransition(async () => {
      const result = await rotateDeployHookSecret();
      if (result.error || !result.secret) {
        setError(result.error ?? "Could not regenerate secret.");
        return;
      }
      setSecret(result.secret);
    });
  }

  return (
    <section className="mt-10 rounded-lg border border-border bg-surface p-6">
      <h2 className="text-sm font-medium">Deploy hook</h2>
      <p className="mt-2 text-sm text-muted">
        Optional. Hit this after a deploy (GitHub Action, Vercel deploy hook, etc.) to refresh a
        monitored domain immediately. Daily cron still runs either way.
      </p>

      {domains.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Add a monitored domain first.</p>
      ) : (
        <>
          <label className="mt-4 block text-sm text-muted">
            Domain
            <select
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              className="mt-1 block w-full max-w-md rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
            >
              {domains.map((hostname) => (
                <option key={hostname} value={hostname}>
                  {hostname}
                </option>
              ))}
            </select>
          </label>

          <p className="mt-4 text-xs text-muted">Endpoint</p>
          <pre className="mt-1 overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-6 text-code-text">
            {hookUrl}
          </pre>
          <button
            type="button"
            onClick={() => copy("url", hookUrl)}
            className="mt-2 text-sm underline underline-offset-4"
          >
            {copied === "url" ? "Copied" : "Copy URL"}
          </button>

          <p className="mt-5 text-xs text-muted">Example (secret in header)</p>
          <pre className="mt-1 overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-6 text-code-text">
            {curl}
          </pre>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <button
              type="button"
              onClick={() => copy("curl", curl)}
              className="underline underline-offset-4"
            >
              {copied === "curl" ? "Copied" : "Copy curl"}
            </button>
            <button
              type="button"
              onClick={rotate}
              disabled={pending}
              className="underline underline-offset-4 disabled:opacity-50"
            >
              {pending ? "Rotating…" : "Regenerate secret"}
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}
        </>
      )}
    </section>
  );
}
