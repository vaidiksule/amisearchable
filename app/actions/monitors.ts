"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { normalizeDomain } from "@/lib/domain";
import { addMonitor, removeMonitor } from "@/lib/monitors";

export async function addMonitoredDomain(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };
  if (profile.plan !== "pro") return { error: "Pro is required to monitor domains." };

  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  if (!domain) return { error: "Enter a valid domain." };

  const result = await addMonitor(profile.id, domain);
  if (!result.ok) return { error: result.error };

  revalidatePath("/dashboard");
  return {};
}

export async function removeMonitoredDomain(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile || profile.plan !== "pro") return;

  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  if (!domain) return;

  await removeMonitor(profile.id, domain);
  revalidatePath("/dashboard");
}
