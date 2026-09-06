import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { polarProductId, polarRedirectUrl, polarServer } from "@/lib/config";
import { normalizeDomain } from "@/lib/domain";
import { createPolarClient } from "@/lib/polar";
import { isNextRedirect, logPolarError, polarFailureReason } from "@/lib/polar-error";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  const url = new URL(request.url);
  const interval = url.searchParams.get("interval") === "year" ? "year" : "month";
  const domain = normalizeDomain(url.searchParams.get("domain") ?? "");
  const next = `/checkout?interval=${interval}${domain ? `&domain=${domain}` : ""}`;

  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (profile.plan === "pro") {
    redirect(domain ? `/monitor?domain=${domain}` : "/dashboard");
  }

  const productId = polarProductId(interval);
  const polar = createPolarClient();
  if (!polar || !productId) {
    console.error("Polar misconfigured", {
      hasClient: Boolean(polar),
      productId,
      interval,
      server: polarServer(),
    });
    redirect("/pricing?error=polar");
  }

  const appUrl = polarRedirectUrl();
  const metadata: Record<string, string> = { userId: profile.id };
  if (domain) metadata.domain = domain;

  try {
    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: profile.email,
      externalCustomerId: profile.id,
      successUrl: `${appUrl}/dashboard?checkout=success&checkout_id={CHECKOUT_ID}`,
      returnUrl: `${appUrl}/pricing`,
      metadata,
    });

    if (!checkout.url) {
      redirect("/pricing?error=checkout");
    }

    redirect(checkout.url);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    logPolarError("Polar checkout failed", error);
    console.error("Polar checkout context", {
      interval,
      productId,
      server: polarServer(),
      hasDomain: Boolean(domain),
    });
    redirect(`/pricing?error=${polarFailureReason(error)}`);
  }
}
