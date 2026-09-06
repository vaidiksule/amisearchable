import {
  configuredCitationEngines,
  probeEngine,
} from "@/lib/citations/probes";
import {
  emptyCitationSnapshot,
  type CitationSnapshot,
  type EngineCitation,
} from "@/lib/citations/types";
import { PLATFORMS, type Platform } from "@/lib/platforms";
import { createAdminClient } from "@/lib/supabase/admin";

export async function runCitationProbes(domain: string): Promise<CitationSnapshot> {
  const snapshot = emptyCitationSnapshot(domain);
  const engines = configuredCitationEngines();

  for (const engine of PLATFORMS) {
    if (!engines.includes(engine)) {
      snapshot.engines[engine] = {
        engine,
        probes: 0,
        hits: 0,
        probedAt: snapshot.probedAt,
        matchedUrls: [],
        error: null,
        skipped: true,
      };
      continue;
    }
    snapshot.engines[engine] = await probeEngine(engine, domain);
  }

  snapshot.probedAt = new Date().toISOString();
  await saveCitationSnapshot(snapshot);
  return snapshot;
}

export async function saveCitationSnapshot(snapshot: CitationSnapshot): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: domainRow, error: domainError } = await admin
    .from("domains")
    .upsert({ hostname: snapshot.domain }, { onConflict: "hostname" })
    .select("id")
    .single();

  if (domainError || !domainRow) {
    console.error("Failed to upsert domain for citations", domainError);
    return;
  }

  for (const engine of PLATFORMS) {
    const row = snapshot.engines[engine];
    if (!row || row.skipped) continue;

    const { error } = await admin.from("citations").upsert(
      {
        domain_id: domainRow.id,
        engine,
        probes: row.probes,
        hits: row.hits,
        probed_at: row.probedAt,
        matched_urls: row.matchedUrls,
        error: row.error,
      },
      { onConflict: "domain_id,engine" },
    );

    if (error) {
      console.error("Failed to save citation", engine, {
        message: error.message,
        code: error.code,
      });
    }
  }
}

export async function getLatestCitations(domain: string): Promise<CitationSnapshot | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: domainRow } = await admin
    .from("domains")
    .select("id")
    .eq("hostname", domain)
    .maybeSingle();

  if (!domainRow) return null;

  const { data, error } = await admin
    .from("citations")
    .select("engine, probes, hits, probed_at, matched_urls, error")
    .eq("domain_id", domainRow.id);

  if (error || !data || data.length === 0) {
    if (error) console.error("Failed to load citations", error.message);
    return null;
  }

  const snapshot = emptyCitationSnapshot(domain);
  let latest = snapshot.probedAt;

  for (const row of data) {
    const engine = row.engine as Platform;
    if (!PLATFORMS.includes(engine)) continue;
    const citation: EngineCitation = {
      engine,
      probes: row.probes,
      hits: row.hits,
      probedAt: row.probed_at,
      matchedUrls: (row.matched_urls as string[]) ?? [],
      error: row.error,
      skipped: false,
    };
    snapshot.engines[engine] = citation;
    if (row.probed_at > latest) latest = row.probed_at;
  }

  snapshot.probedAt = latest;
  return snapshot;
}
