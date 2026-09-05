import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { siteUrl } from "@/lib/config";
import { createPolarClient } from "@/lib/polar";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/portal");
  }

  const polar = createPolarClient();
  if (!polar) {
    redirect("/dashboard?error=polar");
  }

  const session = await polar.customerSessions.create({
    externalCustomerId: profile.id,
    returnUrl: `${siteUrl()}/dashboard`,
  });

  redirect(session.customerPortalUrl);
}
