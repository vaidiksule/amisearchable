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
  const error = typeof searchParams.error === "string" ? searchParams.error : null;

  return (
    <PageFrame>
      <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
      <p className="mt-3 text-sm text-muted">The badge is free. Pro keeps it correct.</p>

      {error ? <CheckoutErrorBanner reason={error} /> : null}

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
            <li>Daily auto refresh (no action needed)</li>
            <li>Email when status changes</li>
            <li>Optional GitHub Action for instant post-push refresh</li>
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
          <StaticBadge verdict="unclear" className="h-5" />
          <StaticBadge verdict="fail" className="h-5" />
        </div>
      </div>
    </PageFrame>
  );
}

function CheckoutErrorBanner({ reason }: { reason: string }) {
  const copy: Record<string, string> = {
    polar:
      "Polar is not configured. Set POLAR_ACCESS_TOKEN and POLAR_PRODUCT_MONTHLY_ID / POLAR_PRODUCT_ANNUAL_ID in Vercel, then redeploy.",
    token:
      "Polar rejected the access token (401/403). Create a new organization token, paste it into Vercel as POLAR_ACCESS_TOKEN, and redeploy. Updating scopes on an old token is not enough if Vercel still has the old secret.",
    token_checkout:
      "Token is missing checkouts:write. Create a new Polar organization access token with checkouts:write, put it in Vercel as POLAR_ACCESS_TOKEN, redeploy.",
    token_sessions:
      "Token is missing customer_sessions:write (needed for the billing portal). Create a new token including that scope, update Vercel, redeploy.",
    product:
      "Polar product id looks wrong or not found. Check POLAR_PRODUCT_MONTHLY_ID and POLAR_PRODUCT_ANNUAL_ID match your Polar products, and POLAR_SERVER matches that environment (production vs sandbox).",
    server:
      "Polar server mismatch. If your products are on polar.sh production, set POLAR_SERVER=production in Vercel (or remove POLAR_SERVER=sandbox).",
    checkout:
      "Checkout session could not be created. This is the Polar API token/product config — not webhooks. Webhooks only run after a payment. Check Vercel logs for “Polar checkout failed”.",
  };

  return (
    <div className="mt-6 space-y-2 text-sm text-warn">
      <p>{copy[reason] ?? copy.checkout}</p>
      <p className="text-muted">
        Webhooks do not affect this error. Tick subscription events so Pro activates after
        payment — they are separate from opening checkout.
      </p>
    </div>
  );
}
