import {
  SEARCH_BOTS,
  type CheckResult,
  type CrawlerName,
  type CrawlerStatus,
  type Verdict,
} from "@/lib/crawlers";
import { verdictFromCheck } from "@/lib/crawlers";

export const PLATFORMS = ["chatgpt", "gemini", "grok", "claude", "perplexity"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  chatgpt: "ChatGPT",
  claude: "Anthropic",
  perplexity: "Perplexity",
  gemini: "Gemini",
  grok: "Grok",
};

/** Citation probes not shipped yet (crawl readiness still shown). */
export const CITATION_COMING_SOON = new Set<Platform>(["claude", "perplexity"]);

/** Engines with live citation probes when API keys are set. */
export const CITATION_LIVE_PLATFORMS = PLATFORMS.filter(
  (platform) => !CITATION_COMING_SOON.has(platform),
);

/** Live engines first; coming-soon last (for UI lists). */
export const PLATFORMS_UI_ORDER = [
  ...CITATION_LIVE_PLATFORMS,
  ...PLATFORMS.filter((platform) => CITATION_COMING_SOON.has(platform)),
] as const;

export function isCitationComingSoon(platform: Platform): boolean {
  return CITATION_COMING_SOON.has(platform);
}

/**
 * Search/fetch bots that gate “ready” for each AI product.
 * Grok has no dedicated robots token yet — we fall back to overall search-bot access.
 */
export const PLATFORM_SEARCH_BOTS: Record<Platform, readonly CrawlerName[]> = {
  chatgpt: ["OAI-SearchBot", "ChatGPT-User"],
  claude: ["Claude-SearchBot", "Claude-User"],
  perplexity: ["PerplexityBot"],
  gemini: ["Google-Extended"],
  grok: [],
};

export function parsePlatform(value: string | null | undefined): Platform | "all" {
  if (!value || value === "all") return "all";
  if ((PLATFORMS as readonly string[]).includes(value)) return value as Platform;
  return "all";
}

export function platformVerdict(
  platform: Platform,
  input: {
    robotsTxtFound: boolean;
    crawlers: Record<CrawlerName, CrawlerStatus>;
  },
): Verdict {
  if (!input.robotsTxtFound) return "unclear";
  const bots = botsForPlatform(platform);
  return bots.some((bot) => input.crawlers[bot] === "blocked") ? "fail" : "pass";
}

export function botsForPlatform(platform: Platform): readonly CrawlerName[] {
  const bots = PLATFORM_SEARCH_BOTS[platform];
  return bots.length > 0 ? bots : SEARCH_BOTS;
}

export function overallVerdict(result: Pick<CheckResult, "robotsTxtFound" | "crawlers">): Verdict {
  return verdictFromCheck(result);
}
