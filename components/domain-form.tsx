"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeDomain } from "@/lib/domain";

export function DomainForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const domain = normalizeDomain(value);
    if (!domain) {
      setError("Enter a valid domain, like example.com");
      return;
    }
    setError(null);
    router.push(`/report/${domain}?fresh=1`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          name="domain"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="example.com"
          autoComplete="url"
          spellCheck={false}
          className="h-12 flex-1 rounded-md border border-border bg-surface px-4 font-mono text-sm outline-none placeholder:text-muted focus:border-foreground"
        />
        <button
          type="submit"
          className="h-12 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
        >
          Check
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}
    </form>
  );
}
