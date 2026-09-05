import { Webhooks } from "@polar-sh/nextjs";
import { applySubscription } from "@/lib/billing";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "unconfigured",
  onSubscriptionCreated: async (payload) => {
    await applySubscription(payload.data);
  },
  onSubscriptionUpdated: async (payload) => {
    await applySubscription(payload.data);
  },
  onSubscriptionActive: async (payload) => {
    await applySubscription(payload.data);
  },
  onSubscriptionCanceled: async (payload) => {
    await applySubscription(payload.data);
  },
  onSubscriptionRevoked: async (payload) => {
    await applySubscription(payload.data);
  },
  onSubscriptionUncanceled: async (payload) => {
    await applySubscription(payload.data);
  },
});
