import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { polarRedirectUrl } from "@/lib/config";
import { createPolarClient } from "@/lib/polar";
import { isNextRedirect, logPolarError } from "@/lib/polar-error";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/portal");
  }

  const polar = createPolarClient();
  if (!polar) {
    redirect("/dashboard?error=polar");
  }

  try {
    const session = await polar.customerSessions.create({
      externalCustomerId: profile.id,
      returnUrl: `${polarRedirectUrl()}/dashboard`,
    });

    redirect(session.customerPortalUrl);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    logPolarError("Polar portal failed", error);
    redirect("/dashboard?error=portal");
  }
}
