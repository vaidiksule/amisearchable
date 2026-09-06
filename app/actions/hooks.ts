"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { ensureHookSecret, regenerateHookSecret } from "@/lib/hooks";

export async function ensureDeployHookSecret(): Promise<{ secret?: string; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };
  if (profile.plan !== "pro") return { error: "Pro is required." };

  const secret = await ensureHookSecret(profile.id);
  if (!secret) return { error: "Could not create hook secret." };
  return { secret };
}

export async function rotateDeployHookSecret(): Promise<{ secret?: string; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };
  if (profile.plan !== "pro") return { error: "Pro is required." };

  const secret = await regenerateHookSecret(profile.id);
  if (!secret) return { error: "Could not regenerate hook secret." };

  revalidatePath("/dashboard");
  return { secret };
}
