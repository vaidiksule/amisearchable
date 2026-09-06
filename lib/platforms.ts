import type { CheckResult, CrawlerName, CrawlerStatus, Verdict } from "@/lib/crawlers";
import { verdictFromCheck } from "@/lib/crawlers";

export const PLATFORMS = ["chatgpt", "claude", "perplexity", "gemini"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
  gemini: "Gemini",
};

/** Search/fetch bots that gate “ready” for each AI product. */
export const PLATFORM_SEARCH_BOTS: Record<Platform, readonly CrawlerName[]> = {
  chatgpt: ["OAI-SearchBot", "ChatGPT-User"],
  claude: ["Claude-SearchBot", "Claude-User"],
  perplexity: ["PerplexityBot"],
  gemini: ["Google-Extended"],
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
  const bots = PLATFORM_SEARCH_BOTS[platform];
  return bots.some((bot) => input.crawlers[bot] === "blocked") ? "fail" : "pass";
}

export function overallVerdict(result: Pick<CheckResult, "robotsTxtFound" | "crawlers">): Verdict {
  return verdictFromCheck(result);
}
