import { Polar } from "@polar-sh/sdk";
import { polarServer } from "@/lib/config";

export function createPolarClient() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) return null;
  return new Polar({ accessToken, server: polarServer() });
}

export function isPolarConfigured(): boolean {
  return Boolean(process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_WEBHOOK_SECRET);
}

export function isProSubscriptionStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}
