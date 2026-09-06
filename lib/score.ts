import type { CheckResult, CrawlerName, CrawlerStatus } from "@/lib/crawlers";
import {
  botsForPlatform,
  PLATFORM_SEARCH_BOTS,
  PLATFORMS,
  type Platform,
} from "@/lib/platforms";

export type ScoreBreakdown = {
  total: number;
  platforms: Record<Platform, number>;
  parts: {
    robots: number;
    searchBots: number;
    sitemap: number;
    llmsTxt: number;
    llmsFull: number;
  };
};

const WEIGHTS = {
  robots: 25,
  searchBots: 40,
  sitemap: 10,
  llmsTxt: 15,
  llmsFull: 10,
} as const;

export function scoreFromCheck(result: CheckResult): ScoreBreakdown {
  const robots = result.robotsTxtFound ? WEIGHTS.robots : 0;
  const searchBots = searchBotPoints(
    result.crawlers,
    [...new Set(Object.values(PLATFORM_SEARCH_BOTS).flat())],
  );
  const sitemap = result.sitemapXmlPresent ? WEIGHTS.sitemap : 0;
  const llmsTxt = result.llmsTxtPresent ? WEIGHTS.llmsTxt : 0;
  const llmsFull = result.llmsFullTxtPresent ? WEIGHTS.llmsFull : 0;

  let total = robots + searchBots + sitemap + llmsTxt + llmsFull;
  if (!result.robotsTxtFound) {
    total = Math.min(total, 35);
  }

  const platforms = Object.fromEntries(
    PLATFORMS.map((platform) => [platform, platformScore(result, platform)]),
  ) as Record<Platform, number>;

  return {
    total: clamp(Math.round(total)),
    platforms,
    parts: {
      robots,
      searchBots: Math.round(searchBots),
      sitemap,
      llmsTxt,
      llmsFull,
    },
  };
}

function platformScore(result: CheckResult, platform: Platform): number {
  const robots = result.robotsTxtFound ? WEIGHTS.robots : 0;
  const searchBots = searchBotPoints(result.crawlers, botsForPlatform(platform));
  const sitemap = result.sitemapXmlPresent ? WEIGHTS.sitemap : 0;
  const llmsTxt = result.llmsTxtPresent ? WEIGHTS.llmsTxt : 0;
  const llmsFull = result.llmsFullTxtPresent ? WEIGHTS.llmsFull : 0;

  let total = robots + searchBots + sitemap + llmsTxt + llmsFull;
  if (!result.robotsTxtFound) total = Math.min(total, 35);
  return clamp(Math.round(total));
}

function searchBotPoints(
  crawlers: Record<CrawlerName, CrawlerStatus>,
  bots: readonly CrawlerName[],
): number {
  if (bots.length === 0) return 0;
  const unique = [...new Set(bots)];
  let allowed = 0;
  for (const bot of unique) {
    if (crawlers[bot] === "blocked") continue;
    allowed += 1;
  }
  return (allowed / unique.length) * WEIGHTS.searchBots;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function scoreTone(score: number): "ready" | "unclear" | "blocked" {
  if (score >= 70) return "ready";
  if (score >= 40) return "unclear";
  return "blocked";
}
