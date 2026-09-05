import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { normalizeDomain } from "@/lib/domain";
import { addMonitor } from "@/lib/monitors";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const domain = normalizeDomain(url.searchParams.get("domain") ?? "");
  const next = domain ? `/monitor?domain=${domain}` : "/dashboard";

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (profile.plan !== "pro") {
    redirect(domain ? `/checkout?domain=${domain}` : "/pricing");
  }

  if (domain) {
    const result = await addMonitor(profile.id, domain);
    if (!result.ok) {
      redirect(`/dashboard?error=${encodeURIComponent(result.error)}`);
    }
  }

  redirect("/dashboard");
}
