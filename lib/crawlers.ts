export const SEARCH_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Claude-SearchBot",
  "Claude-User",
] as const;

export const TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "CCBot",
] as const;

export const ALL_BOTS = [...SEARCH_BOTS, ...TRAINING_BOTS] as const;

export type SearchBot = (typeof SEARCH_BOTS)[number];
export type TrainingBot = (typeof TRAINING_BOTS)[number];
export type CrawlerName = (typeof ALL_BOTS)[number];
export type CrawlerStatus = "allowed" | "blocked" | "unspecified";
export type Verdict = "pass" | "fail";

export type CheckResult = {
  domain: string;
  verdict: Verdict;
  crawlers: Record<CrawlerName, CrawlerStatus>;
  llmsTxtPresent: boolean;
  llmsTxtUrl: string | null;
  robotsTxtFound: boolean;
  robotsTxtUrl: string | null;
  checkedAt: string;
  error: string | null;
};

export function verdictFromCrawlers(crawlers: Record<CrawlerName, CrawlerStatus>): Verdict {
  return SEARCH_BOTS.some((bot) => crawlers[bot] === "blocked") ? "fail" : "pass";
}

export function emptyCrawlers(): Record<CrawlerName, CrawlerStatus> {
  return Object.fromEntries(ALL_BOTS.map((name) => [name, "unspecified"])) as Record<
    CrawlerName,
    CrawlerStatus
  >;
}
