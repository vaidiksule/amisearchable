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

export const CRAWLER_NOTES: Record<CrawlerName, string> = {
  "OAI-SearchBot": "Builds the ChatGPT search index. Blocking this hides you from ChatGPT search results.",
  "ChatGPT-User": "Fetches a page when someone asks ChatGPT about it. This is the live-answer bot, not the training crawler.",
  PerplexityBot: "Crawls for Perplexity search. Separate from user-initiated fetches inside Perplexity answers.",
  "Claude-SearchBot": "Indexes the web for Claude search / citations.",
  "Claude-User": "Fetches a page when Claude needs the live contents to answer.",
  GPTBot: "Collects data to train OpenAI models. Blocking it does not by itself hide you from ChatGPT answers.",
  ClaudeBot: "Collects data to train Anthropic models. Informational on the badge; blocking it is a common choice.",
  "Google-Extended": "Controls Gemini / Google AI training use. It is not Googlebot and does not control Google Search ranking.",
  CCBot: "Common Crawl. Many models train on Common Crawl snapshots. Not a live answer bot.",
};

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
