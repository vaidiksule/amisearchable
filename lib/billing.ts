import { addMonitor } from "@/lib/monitors";
import { createAdminClient } from "@/lib/supabase/admin";
import { isProSubscriptionStatus } from "@/lib/polar";
import { normalizeDomain } from "@/lib/domain";

type PolarCustomer = {
  id: string;
  email?: string | null;
  externalId?: string | null;
};

type PolarSubscription = {
  status: string;
  customerId: string;
  customer: PolarCustomer;
  metadata: Record<string, string | number | boolean>;
};

export async function applySubscription(subscription: PolarSubscription): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const userId =
    subscription.customer.externalId ??
    (typeof subscription.metadata.userId === "string" ? subscription.metadata.userId : null);

  if (!userId) {
    console.error("Polar subscription had no user id", subscription.customerId);
    return;
  }

  const plan = isProSubscriptionStatus(subscription.status) ? "pro" : "free";

  const { error } = await admin
    .from("users")
    .update({
      plan,
      polar_customer_id: subscription.customerId,
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update user plan", error);
    return;
  }

  if (plan !== "pro") return;

  const rawDomain = subscription.metadata.domain;
  const domain = typeof rawDomain === "string" ? normalizeDomain(rawDomain) : null;
  if (domain) {
    await addMonitor(userId, domain);
  }
}
