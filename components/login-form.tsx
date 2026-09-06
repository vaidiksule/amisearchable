"use client";

import { useActionState } from "react";
import { requestMagicLink, signInWithGoogle } from "@/app/actions/auth";

export function LoginForm({
  next,
  error,
}: {
  next: string;
  error?: string | null;
}) {
  const [state, action, pending] = useActionState(requestMagicLink, null);

  const banner =
    error === "google"
      ? "Google sign-in failed. Try again, or use a magic link."
      : error === "auth"
        ? "Auth is not configured yet."
        : null;

  return (
    <div className="mt-8">
      {banner ? <p className="mb-4 text-sm text-warn">{banner}</p> : null}

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-5 text-sm font-medium text-foreground hover:bg-background"
        >
          <GoogleMark />
          Continue with Google
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        or email a magic link
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={action}>
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
            className="h-12 flex-1 rounded-md border border-border bg-surface px-4 text-sm outline-none placeholder:text-muted focus:border-foreground"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-12 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send link"}
          </button>
        </div>
        {state?.error ? <p className="mt-3 text-sm text-warn">{state.error}</p> : null}
        {state?.sent ? (
          <p className="mt-3 text-sm text-accent">Check your inbox for the sign-in link.</p>
        ) : null}
      </form>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
