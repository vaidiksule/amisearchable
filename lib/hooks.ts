import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export function generateHookSecret(): string {
  return randomBytes(24).toString("base64url");
}

export async function getHookSecret(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data } = await admin.from("users").select("hook_secret").eq("id", userId).maybeSingle();
  return (data?.hook_secret as string | null | undefined) ?? null;
}

/** Ensure a Pro user has a deploy-hook secret; create one if missing. */
export async function ensureHookSecret(userId: string): Promise<string | null> {
  const existing = await getHookSecret(userId);
  if (existing) return existing;

  const admin = createAdminClient();
  if (!admin) return null;

  const secret = generateHookSecret();
  const { data, error } = await admin
    .from("users")
    .update({ hook_secret: secret })
    .eq("id", userId)
    .select("hook_secret")
    .single();

  if (error || !data?.hook_secret) {
    console.error("Failed to create hook secret", error);
    return null;
  }
  return data.hook_secret as string;
}

export async function regenerateHookSecret(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const secret = generateHookSecret();
  const { data, error } = await admin
    .from("users")
    .update({ hook_secret: secret })
    .eq("id", userId)
    .select("hook_secret")
    .single();

  if (error || !data?.hook_secret) {
    console.error("Failed to regenerate hook secret", error);
    return null;
  }
  return data.hook_secret as string;
}

export type HookOwner = {
  id: string;
  email: string;
  plan: "free" | "pro";
};

export async function findProUserByHookSecret(secret: string): Promise<HookOwner | null> {
  if (!secret) return null;
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("users")
    .select("id, email, plan")
    .eq("hook_secret", secret)
    .eq("plan", "pro")
    .maybeSingle();

  if (error || !data) return null;
  return data as HookOwner;
}

export async function userMonitorsDomain(userId: string, hostname: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { data: domainRow } = await admin
    .from("domains")
    .select("id")
    .eq("hostname", hostname)
    .maybeSingle();

  if (!domainRow) return false;

  const { data } = await admin
    .from("monitors")
    .select("id")
    .eq("user_id", userId)
    .eq("domain_id", domainRow.id)
    .maybeSingle();

  return Boolean(data);
}
