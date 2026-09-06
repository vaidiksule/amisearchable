import { configuredCitationEngines } from "@/lib/citations/probes";
import {
  getLatestCitations,
  runCitationProbes,
} from "@/lib/citations/store";
import type { CitationSnapshot } from "@/lib/citations/types";

/** Shared cooldown for auto + manual citation probes. */
export const MIN_CITATION_PROBE_INTERVAL_MS = 10 * 60 * 1000;

export function citationProbeConfigured(): boolean {
  return configuredCitationEngines().length > 0;
}

/** True when we should run probes (never probed, or past cooldown). */
export async function citationsNeedProbe(domain: string): Promise<boolean> {
  if (!citationProbeConfigured()) return false;
  const existing = await getLatestCitations(domain);
  if (!existing?.probedAt) return true;
  const age = Date.now() - new Date(existing.probedAt).getTime();
  return age < 0 || age >= MIN_CITATION_PROBE_INTERVAL_MS;
}

/**
 * Run citation probes if keys exist and cooldown allows.
 * Returns the new snapshot, or null if skipped.
 */
export async function maybeRunCitationProbes(
  domain: string,
): Promise<CitationSnapshot | null> {
  if (!(await citationsNeedProbe(domain))) return null;
  return runCitationProbes(domain);
}
