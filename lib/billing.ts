import type { Profile } from "@/lib/auth";
import { sendProWelcomeEmail } from "@/lib/alerts";
import { normalizeDomain } from "@/lib/domain";
import { addMonitor } from "@/lib/monitors";
import { createPolarClient, isProSubscriptionStatus } from "@/lib/polar";
import { createAdminClient } from "@/lib/supabase/admin";

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

type PolarCheckout = {
  id: string;
  status: string;
  customerId: string | null;
  externalCustomerId: string | null;
  customerEmail: string | null;
  subscriptionId: string | null;
  metadata: Record<string, string | number | boolean>;
};

function metadataUserId(
  metadata: Record<string, string | number | boolean> | null | undefined,
): string | null {
  if (!metadata) return null;
  const value = metadata.userId ?? metadata.user_id;
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function resolveUserId(input: {
  externalId?: string | null;
  metadata?: Record<string, string | number | boolean> | null;
  email?: string | null;
  polarCustomerId?: string | null;
}): Promise<string | null> {
  const fromExternal = input.externalId?.trim();
  if (fromExternal) return fromExternal;

  const fromMetadata = metadataUserId(input.metadata);
  if (fromMetadata) return fromMetadata;

  const admin = createAdminClient();
  if (!admin) return null;

  if (input.polarCustomerId) {
    const { data } = await admin
      .from("users")
      .select("id")
      .eq("polar_customer_id", input.polarCustomerId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  const email = input.email?.trim().toLowerCase();
  if (email) {
    const { data } = await admin.from("users").select("id").eq("email", email).maybeSingle();
    if (data?.id) return data.id;
  }

  return null;
}

async function setUserPlan(input: {
  userId: string;
  plan: "free" | "pro";
  polarCustomerId?: string | null;
}): Promise<{ ok: boolean; upgradedToPro: boolean; email: string | null }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, upgradedToPro: false, email: null };

  const { data: existing } = await admin
    .from("users")
    .select("plan, email")
    .eq("id", input.userId)
    .maybeSingle();

  const patch: { plan: "free" | "pro"; polar_customer_id?: string } = {
    plan: input.plan,
  };
  if (input.polarCustomerId) {
    patch.polar_customer_id = input.polarCustomerId;
  }

  const { error } = await admin.from("users").update(patch).eq("id", input.userId);
  if (error) {
    console.error("Failed to update user plan", error);
    return { ok: false, upgradedToPro: false, email: null };
  }

  const upgradedToPro = input.plan === "pro" && existing?.plan !== "pro";
  return {
    ok: true,
    upgradedToPro,
    email: typeof existing?.email === "string" ? existing.email : null,
  };
}

export async function applySubscription(subscription: PolarSubscription): Promise<void> {
  const userId = await resolveUserId({
    externalId: subscription.customer.externalId,
    metadata: subscription.metadata,
    email: subscription.customer.email,
    polarCustomerId: subscription.customerId,
  });

  if (!userId) {
    console.error("Polar subscription had no matching user", {
      customerId: subscription.customerId,
      externalId: subscription.customer.externalId,
      email: subscription.customer.email,
      metadata: subscription.metadata,
    });
    return;
  }

  const plan = isProSubscriptionStatus(subscription.status) ? "pro" : "free";
  const result = await setUserPlan({
    userId,
    plan,
    polarCustomerId: subscription.customerId,
  });
  if (!result.ok || plan !== "pro") return;

  if (result.upgradedToPro) {
    await sendProWelcomeEmail(result.email ?? subscription.customer.email ?? "");
  }

  const rawDomain = subscription.metadata.domain;
  const domain = typeof rawDomain === "string" ? normalizeDomain(rawDomain) : null;
  if (domain) {
    await addMonitor(userId, domain);
  }
}

async function applyPaidCheckout(checkout: PolarCheckout): Promise<string | null> {
  const userId = await resolveUserId({
    externalId: checkout.externalCustomerId,
    metadata: checkout.metadata,
    email: checkout.customerEmail,
    polarCustomerId: checkout.customerId,
  });

  if (!userId) {
    console.error("Polar checkout had no matching user", {
      checkoutId: checkout.id,
      externalCustomerId: checkout.externalCustomerId,
      customerEmail: checkout.customerEmail,
      metadata: checkout.metadata,
    });
    return null;
  }

  const polar = createPolarClient();
  if (polar && checkout.subscriptionId) {
    try {
      const subscription = await polar.subscriptions.get({ id: checkout.subscriptionId });
      await applySubscription(subscription);
      return userId;
    } catch (error) {
      console.error("Failed to load subscription for checkout", checkout.id, error);
    }
  }

  if (checkout.status === "succeeded" || checkout.status === "confirmed") {
    const result = await setUserPlan({
      userId,
      plan: "pro",
      polarCustomerId: checkout.customerId,
    });
    if (result.ok && result.upgradedToPro) {
      await sendProWelcomeEmail(result.email ?? checkout.customerEmail ?? "");
    }

    const rawDomain = checkout.metadata.domain;
    const domain = typeof rawDomain === "string" ? normalizeDomain(rawDomain) : null;
    if (domain) {
      await addMonitor(userId, domain);
    }
  }

  return userId;
}

async function listSubscriptionsForUser(
  polar: NonNullable<ReturnType<typeof createPolarClient>>,
  profile: Profile,
): Promise<PolarSubscription[]> {
  try {
    const pages = await polar.subscriptions.list({
      externalCustomerId: profile.id,
      limit: 20,
    });
    return pages.result.items;
  } catch (error) {
    console.error("subscriptions.list by externalCustomerId failed", error);
  }

  if (profile.polar_customer_id) {
    try {
      const pages = await polar.subscriptions.list({
        customerId: profile.polar_customer_id,
        limit: 20,
      });
      return pages.result.items;
    } catch (error) {
      console.error("subscriptions.list by customerId failed", error);
    }
  }

  try {
    const customer = await polar.customers.getExternal({ externalId: profile.id });
    const pages = await polar.subscriptions.list({
      customerId: customer.id,
      limit: 20,
    });
    return pages.result.items;
  } catch (error) {
    console.error("customers.getExternal / subscriptions.list failed", error);
  }

  return [];
}

/** Activate Pro from Polar after payment — used by webhooks and dashboard return. */
export async function syncUserPlanFromPolar(
  profile: Profile,
  checkoutId?: string | null,
): Promise<Profile> {
  if (profile.plan === "pro") return profile;

  const polar = createPolarClient();
  if (!polar) return profile;

  try {
    if (checkoutId) {
      const checkout = await polar.checkouts.get({ id: checkoutId });
      const checkoutUser =
        checkout.externalCustomerId ?? metadataUserId(checkout.metadata);
      if (checkoutUser && checkoutUser !== profile.id) {
        console.error("Checkout does not belong to current user", {
          checkoutId,
          checkoutUser,
          userId: profile.id,
        });
      } else {
        await applyPaidCheckout(checkout);
      }
    }

    const subscriptions = await listSubscriptionsForUser(polar, profile);
    for (const subscription of subscriptions) {
      if (isProSubscriptionStatus(subscription.status)) {
        await applySubscription(subscription);
        break;
      }
    }
  } catch (error) {
    console.error("Failed to sync Polar plan for user", profile.id, error);
    return profile;
  }

  const admin = createAdminClient();
  if (!admin) return profile;

  const { data } = await admin
    .from("users")
    .select("id, email, polar_customer_id, plan")
    .eq("id", profile.id)
    .maybeSingle();

  return (data as Profile | null) ?? profile;
}

export async function applyCheckoutWebhook(checkout: PolarCheckout): Promise<void> {
  if (checkout.status !== "succeeded" && checkout.status !== "confirmed") return;
  await applyPaidCheckout(checkout);
}
