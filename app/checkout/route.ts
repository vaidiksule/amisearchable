import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { polarProductId, siteUrl } from "@/lib/config";
import { normalizeDomain } from "@/lib/domain";
import { createPolarClient } from "@/lib/polar";

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
    redirect("/pricing?error=polar");
  }

  const checkout = await polar.checkouts.create({
    products: [productId],
    customerEmail: profile.email,
    externalCustomerId: profile.id,
    successUrl: `${siteUrl()}/dashboard?checkout=success`,
    returnUrl: `${siteUrl()}/pricing`,
    metadata: {
      userId: profile.id,
      domain: domain ?? "",
    },
  });

  if (!checkout.url) {
    redirect("/pricing?error=polar");
  }

  redirect(checkout.url);
}
