import { createAdminClient } from "@/lib/supabase/admin";

/** Best-effort badge hit log. Never throws; caller should not await for latency. */
export function recordBadgeHit(input: {
  domain: string;
  referer: string | null;
  userAgent: string | null;
}): void {
  const admin = createAdminClient();
  if (!admin) return;

  void Promise.resolve(
    admin.from("badge_hits").insert({
      domain: input.domain,
      referer: input.referer,
      user_agent: input.userAgent,
    }),
  )
    .then((result) => {
      if (result.error) console.error("badge_hits insert failed", result.error.message);
    })
    .catch((error: unknown) => {
      console.error(
        "badge_hits insert failed",
        error instanceof Error ? error.message : error,
      );
    });
}
