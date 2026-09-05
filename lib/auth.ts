import { createAdminClient } from "@/lib/supabase/admin";
import { createUserClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string;
  polar_customer_id: string | null;
  plan: "free" | "pro";
};

export async function getCurrentUser() {
  const supabase = await createUserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  return data.user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user?.email) return null;
  return upsertProfile(user.id, user.email);
}

export async function upsertProfile(id: string, email: string): Promise<Profile | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("users")
    .upsert({ id, email }, { onConflict: "id" })
    .select("id, email, polar_customer_id, plan")
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function isProUser(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.plan === "pro";
}
