"use server";

import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/config";
import { safeNextPath } from "@/lib/domain";
import { createUserClient } from "@/lib/supabase/server";

export async function requestMagicLink(
  _prev: { error?: string; sent?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; sent?: boolean }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNextPath(String(formData.get("next") ?? "/dashboard"));

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createUserClient();
  if (!supabase) {
    return { error: "Auth is not configured yet. Add Supabase keys to .env.local." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { sent: true };
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNextPath(String(formData.get("next") ?? "/dashboard"));
  const supabase = await createUserClient();
  if (!supabase) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=auth`);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=google`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createUserClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
