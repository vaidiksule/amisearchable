"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import {
  MIN_CITATION_PROBE_INTERVAL_MS,
  citationProbeConfigured,
} from "@/lib/citations/auto-probe";
import { configuredCitationEngines } from "@/lib/citations/probes";
import { getLatestCitations, runCitationProbes } from "@/lib/citations/store";
import { normalizeDomain } from "@/lib/domain";
import { userMonitorsHostname } from "@/lib/monitors";

export type ProbeCitationsResult =
  | { ok: true; engines: string[]; summary: string }
  | { ok: false; error: string };

export async function probeDomainCitations(domainInput: string): Promise<ProbeCitationsResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Sign in first." };
  if (profile.plan !== "pro") {
    return { ok: false, error: "Pro is required to run citation probes." };
  }

  const domain = normalizeDomain(domainInput);
  if (!domain) return { ok: false, error: "Invalid domain." };

  const monitors = await userMonitorsHostname(profile.id, domain);
  if (!monitors) {
    return {
      ok: false,
      error: "Add this domain on the Dashboard first, then probe citations.",
    };
  }

  if (!citationProbeConfigured()) {
    return {
      ok: false,
      error: "No citation API keys configured on the server (OpenAI / Gemini / xAI).",
    };
  }

  const engines = configuredCitationEngines();
  const existing = await getLatestCitations(domain);
  if (existing?.probedAt) {
    const age = Date.now() - new Date(existing.probedAt).getTime();
    if (age >= 0 && age < MIN_CITATION_PROBE_INTERVAL_MS) {
      const mins = Math.ceil((MIN_CITATION_PROBE_INTERVAL_MS - age) / 60_000);
      return {
        ok: false,
        error: `Already probed recently — try again in ~${mins} min.`,
      };
    }
  }

  try {
    const snapshot = await runCitationProbes(domain);
    const bits = engines.map((engine) => {
      const row = snapshot.engines[engine];
      if (!row || row.skipped) return `${engine}: skipped`;
      return `${engine}: ${row.hits}/${row.probes}`;
    });
    revalidatePath(`/report/${domain}`);
    return {
      ok: true,
      engines,
      summary: bits.join(" · "),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Citation probe failed.",
    };
  }
}
