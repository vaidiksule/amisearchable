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
  const [copied, setCopied] = useState<"workflow" | "secret" | "curl" | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hookUrl = useMemo(() => {
    if (!domain) return `${siteOrigin}/api/hooks/recheck?domain=YOUR_DOMAIN`;
    const url = new URL("/api/hooks/recheck", siteOrigin);
    url.searchParams.set("domain", domain);
    return url.toString();
  }, [domain, siteOrigin]);

  const workflow = useMemo(() => {
    return `name: Refresh AI Searchable badge
on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Recheck ${domain || "your-domain.com"}
        run: |
          curl -fsS -X POST \\
            '${hookUrl}' \\
            -H 'Authorization: Bearer \${{ secrets.AMISEARCHABLE_HOOK_SECRET }}'
`;
  }, [domain, hookUrl]);

  const curl = useMemo(() => {
    return `curl -X POST '${hookUrl}' \\\n  -H 'Authorization: Bearer ${secret}'`;
  }, [hookUrl, secret]);

  async function copy(kind: "workflow" | "secret" | "curl", value: string) {
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
    <section className="mt-10 space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-medium">Automatic monitoring</h2>
        <p className="mt-2 text-sm text-muted">
          You don&apos;t need to run anything. We re-check every monitored domain once a day
          and email you if the badge status changes.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-sm font-medium">Optional: refresh on every push</h2>
        <p className="mt-2 text-sm text-muted">
          Want the badge to update right after you ship, instead of waiting for the daily
          check? Add this GitHub Action once — then forget it.
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

            <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
              <li>
                In your repo, create{" "}
                <code className="font-mono text-foreground">
                  .github/workflows/amisearchable.yml
                </code>{" "}
                with the file below.
              </li>
              <li>
                Repo → Settings → Secrets → Actions → New secret named{" "}
                <code className="font-mono text-foreground">AMISEARCHABLE_HOOK_SECRET</code>,
                value = your hook secret.
              </li>
              <li>Push once. After that, every push to main/master refreshes the badge.</li>
            </ol>

            <p className="mt-5 text-xs text-muted">Workflow file</p>
            <pre className="mt-1 overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-6 text-code-text">
              {workflow}
            </pre>
            <button
              type="button"
              onClick={() => copy("workflow", workflow)}
              className="mt-2 text-sm underline underline-offset-4"
            >
              {copied === "workflow" ? "Copied" : "Copy workflow"}
            </button>

            <p className="mt-5 text-xs text-muted">Hook secret (paste into GitHub secret)</p>
            <pre className="mt-1 overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-6 text-code-text">
              {secret}
            </pre>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <button
                type="button"
                onClick={() => copy("secret", secret)}
                className="underline underline-offset-4"
              >
                {copied === "secret" ? "Copied" : "Copy secret"}
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

            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="mt-6 text-sm text-muted underline underline-offset-4"
            >
              {showAdvanced ? "Hide curl / other CI" : "Show curl for other CI"}
            </button>

            {showAdvanced ? (
              <div className="mt-3">
                <p className="text-xs text-muted">
                  Same endpoint — Vercel deploy hooks, other CI, or a one-off test.
                </p>
                <pre className="mt-2 overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-6 text-code-text">
                  {curl}
                </pre>
                <button
                  type="button"
                  onClick={() => copy("curl", curl)}
                  className="mt-2 text-sm underline underline-offset-4"
                >
                  {copied === "curl" ? "Copied" : "Copy curl"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
