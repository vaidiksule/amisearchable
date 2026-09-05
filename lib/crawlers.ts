export const CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "Amazonbot",
  "Bytespider",
] as const;

export type CrawlerName = (typeof CRAWLERS)[number];
export type CrawlerStatus = "allowed" | "blocked" | "unspecified";

export type CheckResult = {
  domain: string;
  score: number | null;
  llmsTxtPresent: boolean | null;
  crawlers: Record<CrawlerName, CrawlerStatus | null>;
};

export function emptyCheckResult(domain: string): CheckResult {
  return {
    domain,
    score: null,
    llmsTxtPresent: null,
    crawlers: Object.fromEntries(CRAWLERS.map((name) => [name, null])) as CheckResult["crawlers"],
  };
}
