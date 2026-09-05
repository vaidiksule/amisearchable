"use client";

import { useActionState } from "react";
import { addMonitoredDomain } from "@/app/actions/monitors";

export function AddDomainForm() {
  const [state, action, pending] = useActionState(addMonitoredDomain, null);

  return (
    <form action={action} className="mt-6">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="domain"
          type="text"
          required
          placeholder="example.com"
          spellCheck={false}
          className="h-11 flex-1 rounded-md border border-border bg-surface px-4 font-mono text-sm outline-none placeholder:text-muted focus:border-foreground"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {state?.error ? <p className="mt-3 text-sm text-warn">{state.error}</p> : null}
    </form>
  );
}
