import { PRO_DOMAIN_LIMIT } from "@/lib/config";
import type { Verdict } from "@/lib/crawlers";
import { createAdminClient } from "@/lib/supabase/admin";

export type MonitorRow = {
  hostname: string;
  createdAt: string;
  verdict: Verdict | null;
  checkedAt: string | null;
};

export async function listMonitors(userId: string): Promise<MonitorRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("monitors")
    .select("created_at, domains!inner(hostname)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const rows = await Promise.all(
    data.map(async (row) => {
      const hostname = nestedHostname(row.domains);
      if (!hostname) return null;

      const { data: domainRow } = await admin
        .from("domains")
        .select("id")
        .eq("hostname", hostname)
        .maybeSingle();

      if (!domainRow) {
        return { hostname, createdAt: row.created_at, verdict: null, checkedAt: null };
      }

      const { data: check } = await admin
        .from("checks")
        .select("verdict, checked_at")
        .eq("domain_id", domainRow.id)
        .order("checked_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        hostname,
        createdAt: row.created_at,
        verdict: (check?.verdict as Verdict | undefined) ?? null,
        checkedAt: check?.checked_at ?? null,
      };
    }),
  );

  return rows.filter((row): row is MonitorRow => row !== null);
}

export async function addMonitor(
  userId: string,
  hostname: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Database is not configured." };

  const existing = await listMonitors(userId);
  if (existing.some((row) => row.hostname === hostname)) {
    return { ok: true };
  }
  if (existing.length >= PRO_DOMAIN_LIMIT) {
    return { ok: false, error: `Pro covers ${PRO_DOMAIN_LIMIT} domains per seat.` };
  }

  const { data: domainRow, error: domainError } = await admin
    .from("domains")
    .upsert({ hostname }, { onConflict: "hostname" })
    .select("id")
    .single();

  if (domainError || !domainRow) {
    return { ok: false, error: "Could not save that domain." };
  }

  const { error } = await admin.from("monitors").insert({
    user_id: userId,
    domain_id: domainRow.id,
  });

  if (error) {
    return { ok: false, error: "Could not start monitoring." };
  }

  return { ok: true };
}

export async function removeMonitor(userId: string, hostname: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: domainRow } = await admin
    .from("domains")
    .select("id")
    .eq("hostname", hostname)
    .maybeSingle();

  if (!domainRow) return;

  await admin.from("monitors").delete().eq("user_id", userId).eq("domain_id", domainRow.id);
}

export async function monitoringEmails(hostname: string): Promise<string[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("monitors")
    .select("users!inner(email, plan), domains!inner(hostname)")
    .eq("domains.hostname", hostname)
    .eq("users.plan", "pro");

  if (error || !data) return [];

  return data
    .map((row) => {
      const user = row.users as { email?: string } | { email?: string }[] | null;
      if (Array.isArray(user)) return user[0]?.email;
      return user?.email;
    })
    .filter((value): value is string => Boolean(value));
}

function nestedHostname(value: unknown): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0] as { hostname?: string } | undefined;
    return first?.hostname ?? null;
  }
  return (value as { hostname?: string }).hostname ?? null;
}
