"use client";

import { useActionState } from "react";
import { requestMagicLink } from "@/app/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(requestMagicLink, null);

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm text-muted" htmlFor="email">
        Email
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="h-12 flex-1 rounded-md border border-border bg-surface px-4 text-sm outline-none placeholder:text-stone-400 focus:border-foreground"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:bg-stone-800 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send link"}
        </button>
      </div>
      {state?.error ? <p className="mt-3 text-sm text-warn">{state.error}</p> : null}
      {state?.sent ? (
        <p className="mt-3 text-sm text-accent">Check your inbox for the sign-in link.</p>
      ) : null}
    </form>
  );
}
