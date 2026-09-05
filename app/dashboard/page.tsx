import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Dashboard</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Monitored domains</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        Paid users will land here after Supabase auth. Domain list, last-checked
        timestamps, alerts, and the Polar customer portal will plug in later.
      </p>

      <div className="mt-10 rounded-xl border border-dashed border-zinc-700 p-8 text-sm text-muted">
        No domains yet. Auth, Polar, and monitoring are not wired in this skeleton.
      </div>

      <Link
        href="/pricing"
        className="mt-8 inline-flex h-11 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:bg-zinc-200"
      >
        View pricing
      </Link>
    </div>
  );
}
