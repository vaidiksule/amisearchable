import { MIN_RECHECK_MS } from "@/lib/config";
import { runLiveCheck } from "@/lib/check-engine";
import { verdictFromCheck, type CheckResult } from "@/lib/crawlers";
import { createAdminClient } from "@/lib/supabase/admin";

export type LoadedCheck = CheckResult & {
  fromCache: boolean;
  rateLimited: boolean;
};

export async function getLatestCheck(domain: string): Promise<CheckResult | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: domainRow } = await admin
    .from("domains")
    .select("id")
    .eq("hostname", domain)
    .maybeSingle();

  if (!domainRow) return null;

  const { data: check } = await admin
    .from("checks")
    .select("results")
    .eq("domain_id", domainRow.id)
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const raw = check?.results as CheckResult | undefined;
  return raw ? normalizeCheckResult(raw) : null;
}

/** Older cached checks may omit newer file fields or use a pre-unclear verdict. */
export function normalizeCheckResult(result: CheckResult): CheckResult {
  const origin = `https://${result.domain}`;
  return {
    ...result,
    verdict: verdictFromCheck({
      robotsTxtFound: result.robotsTxtFound,
      crawlers: result.crawlers,
    }),
    llmsFullTxtPresent: result.llmsFullTxtPresent ?? false,
    llmsFullTxtUrl: result.llmsFullTxtUrl ?? null,
    sitemapXmlPresent: result.sitemapXmlPresent ?? false,
    sitemapXmlUrl: result.sitemapXmlUrl ?? null,
    robotsTxtUrl: result.robotsTxtUrl ?? (result.robotsTxtFound ? `${origin}/robots.txt` : null),
    llmsTxtUrl: result.llmsTxtUrl ?? (result.llmsTxtPresent ? `${origin}/llms.txt` : null),
  };
}

export async function saveCheck(result: CheckResult): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: domainRow, error: domainError } = await admin
    .from("domains")
    .upsert({ hostname: result.domain }, { onConflict: "hostname" })
    .select("id")
    .single();

  if (domainError || !domainRow) {
    console.error("Failed to upsert domain", domainError);
    return;
  }

  const { error } = await admin.from("checks").insert({
    domain_id: domainRow.id,
    checked_at: result.checkedAt,
    results: result,
    verdict: result.verdict,
    llms_txt_present: result.llmsTxtPresent,
    robots_txt_found: result.robotsTxtFound,
  });

  if (error) {
    console.error("Failed to save check", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      verdict: result.verdict,
      domain: result.domain,
    });
  }
}

export async function getOrCreateCheck(
  domain: string,
  options: { fresh?: boolean } = {},
): Promise<LoadedCheck> {
  const cached = await getLatestCheck(domain);
  const fresh = options.fresh === true;

  if (cached && !fresh) {
    return { ...cached, fromCache: true, rateLimited: false };
  }

  if (cached && fresh) {
    const age = Date.now() - new Date(cached.checkedAt).getTime();
    if (age < MIN_RECHECK_MS) {
      return { ...cached, fromCache: true, rateLimited: true };
    }
  }

  const live = await runLiveCheck(domain);
  await saveCheck(live);
  return { ...live, fromCache: false, rateLimited: false };
}

export async function listRecentCheckedDomains(
  limit = 200,
): Promise<{ hostname: string; checkedAt: string }[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("checks")
    .select("checked_at, domains!inner(hostname)")
    .order("checked_at", { ascending: false })
    .limit(limit * 3);

  if (error || !data) {
    console.error("Failed to list recent checked domains", error);
    return [];
  }

  const seen = new Set<string>();
  const recent: { hostname: string; checkedAt: string }[] = [];

  for (const row of data) {
    const domain = row.domains as { hostname?: string } | { hostname?: string }[] | null;
    const hostname = Array.isArray(domain) ? domain[0]?.hostname : domain?.hostname;
    if (!hostname || seen.has(hostname)) continue;
    seen.add(hostname);
    recent.push({ hostname, checkedAt: row.checked_at });
    if (recent.length >= limit) break;
  }

  return recent;
}

export async function listMonitoredHostnames(): Promise<string[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("monitors")
    .select("domains!inner(hostname), users!inner(plan)")
    .eq("users.plan", "pro");

  if (error || !data) {
    console.error("Failed to list monitored domains", error);
    return [];
  }

  const hostnames = data
    .map((row) => {
      const domain = row.domains as { hostname?: string } | { hostname?: string }[] | null;
      if (Array.isArray(domain)) return domain[0]?.hostname;
      return domain?.hostname;
    })
    .filter((value): value is string => Boolean(value));

  return [...new Set(hostnames)];
}
