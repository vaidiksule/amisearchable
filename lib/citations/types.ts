import type { Platform } from "@/lib/platforms";

export type EngineCitation = {
  engine: Platform;
  probes: number;
  hits: number;
  probedAt: string;
  /** Sample citation URLs that matched the domain. */
  matchedUrls: string[];
  error: string | null;
  skipped: boolean;
};

export type CitationSnapshot = {
  domain: string;
  probedAt: string;
  engines: Record<Platform, EngineCitation | null>;
};

export function emptyCitationSnapshot(domain: string): CitationSnapshot {
  return {
    domain,
    probedAt: new Date().toISOString(),
    engines: {
      chatgpt: null,
      claude: null,
      perplexity: null,
      gemini: null,
    },
  };
}

export function citationSummary(
  snapshot: CitationSnapshot | null,
  engine: Platform | "all",
): { hits: number; probes: number; probedAt: string | null } | null {
  if (!snapshot) return null;

  if (engine !== "all") {
    const row = snapshot.engines[engine];
    if (!row || row.skipped || row.probes === 0) return null;
    return { hits: row.hits, probes: row.probes, probedAt: row.probedAt };
  }

  let hits = 0;
  let probes = 0;
  let probedAt: string | null = null;
  for (const row of Object.values(snapshot.engines)) {
    if (!row || row.skipped || row.probes === 0) continue;
    hits += row.hits;
    probes += row.probes;
    if (!probedAt || row.probedAt > probedAt) probedAt = row.probedAt;
  }
  if (probes === 0) return null;
  return { hits, probes, probedAt };
}

export function brandFromDomain(domain: string): string {
  const host = domain.replace(/^www\./, "");
  const parts = host.split(".");
  if (parts.length >= 3 && parts[parts.length - 1].length <= 3) {
    // e.g. example.co.uk → example
    return parts[0] ?? host;
  }
  return parts[0] ?? host;
}

export function defaultProbeQueries(domain: string): string[] {
  const brand = brandFromDomain(domain);
  return [
    `What is ${domain}?`,
    `Tell me about ${brand}`,
    `${domain} official website`,
  ];
}

/** True if a citation URL belongs to the monitored hostname. */
export function urlMatchesDomain(url: string, domain: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/\.$/, "").toLowerCase();
    const target = domain.toLowerCase().replace(/^www\./, "");
    const bare = host.replace(/^www\./, "");
    return bare === target || bare.endsWith(`.${target}`);
  } catch {
    return false;
  }
}
