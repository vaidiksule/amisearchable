import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/page-frame";
import { StaticBadge } from "@/components/static-badge";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Pricing for AI crawler monitoring and the AI search status badge",
  description:
    "The AI ready badge is free. Pro monitors robots.txt daily and emails you if GPTBot, ChatGPT-User, or PerplexityBot access changes.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage(props: PageProps<"/pricing">) {
  const profile = await getCurrentProfile();
  const searchParams = await props.searchParams;
  const checkoutError = searchParams.error === "checkout";
  const polarError = searchParams.error === "polar";

  return (
    <PageFrame>
      <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
      <p className="mt-3 text-sm text-muted">The badge is free. Pro keeps it correct.</p>

      {polarError ? (
        <p className="mt-6 text-sm text-warn">Polar is not configured yet.</p>
      ) : null}
      {checkoutError ? (
        <p className="mt-6 text-sm text-warn">
          Checkout failed. In Polar, create a new organization access token with{" "}
          <span className="font-mono">checkouts:write</span> and{" "}
          <span className="font-mono">customer_sessions:write</span>, then put it in Vercel as{" "}
          <span className="font-mono">POLAR_ACCESS_TOKEN</span>.
        </p>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted">Free</p>
          <p className="mt-2 text-2xl font-semibold">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>One-time check</li>
            <li>Embeddable badge</li>
            <li>Manual re-check</li>
          </ul>
          <Link href="/" className="mt-6 inline-block text-sm underline underline-offset-4">
            Check a domain
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted">Pro</p>
          <p className="mt-2 text-2xl font-semibold">$5/mo</p>
          <p className="text-sm text-muted">or $40/yr · 5 domains</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Daily auto refresh</li>
            <li>Email when status changes</li>
            <li>Same badge URL</li>
          </ul>
          {profile?.plan === "pro" ? (
            <Link href="/dashboard" className="mt-6 inline-block text-sm underline underline-offset-4">
              Dashboard
            </Link>
          ) : (
            <div className="mt-6 flex gap-4 text-sm">
              <Link href="/checkout?interval=month" className="underline underline-offset-4">
                Monthly
              </Link>
              <Link href="/checkout?interval=year" className="underline underline-offset-4">
                Yearly
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-5">
        <p className="text-xs text-muted">Badge stays the same after upgrade</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <StaticBadge verdict="pass" className="h-5" />
          <StaticBadge verdict="fail" className="h-5" />
        </div>
      </div>
    </PageFrame>
  );
}
