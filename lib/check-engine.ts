import robotsParser from "robots-parser";
import {
  ALL_BOTS,
  emptyCrawlers,
  verdictFromCrawlers,
  type CheckResult,
  type CrawlerName,
  type CrawlerStatus,
} from "@/lib/crawlers";
import { safeFetchText } from "@/lib/safe-fetch";

export async function runLiveCheck(domain: string): Promise<CheckResult> {
  const httpsOrigin = `https://${domain}`;
  const robotsUrl = `${httpsOrigin}/robots.txt`;
  const llmsUrl = `${httpsOrigin}/llms.txt`;

  const [robotsResult, llmsResult] = await Promise.all([
    safeFetchText(robotsUrl),
    safeFetchText(llmsUrl),
  ]);

  const crawlers = emptyCrawlers();
  let robotsTxtFound = false;
  let robotsError: string | null = null;

  if (robotsResult.ok && robotsResult.text.trim()) {
    robotsTxtFound = true;
    const robots = robotsParser(robotsUrl, robotsResult.text);
    const origin = `${httpsOrigin}/`;

    for (const bot of ALL_BOTS) {
      crawlers[bot] = statusForBot(robots, origin, bot);
    }
  } else if (robotsResult.ok) {
    robotsTxtFound = true;
  } else if (robotsResult.status > 0 && robotsResult.status !== 404) {
    robotsError = `robots.txt returned ${robotsResult.status}`;
  } else if (!robotsResult.ok && robotsResult.status === 0) {
    robotsError = robotsResult.error;
  }

  const llmsTxtPresent = isLlmsTxt(llmsResult.ok ? llmsResult.text : "");

  return {
    domain,
    verdict: verdictFromCrawlers(crawlers),
    crawlers,
    llmsTxtPresent,
    llmsTxtUrl: llmsTxtPresent ? llmsUrl : null,
    robotsTxtFound,
    robotsTxtUrl: robotsTxtFound ? robotsUrl : null,
    checkedAt: new Date().toISOString(),
    error: robotsError,
  };
}

function statusForBot(
  robots: { isAllowed: (url: string, ua?: string) => boolean | undefined },
  url: string,
  bot: CrawlerName,
): CrawlerStatus {
  const allowed = robots.isAllowed(url, bot);
  if (allowed === false) return "blocked";
  if (allowed === true) return "allowed";
  return "unspecified";
}

function isLlmsTxt(body: string): boolean {
  const trimmed = body.trim();
  if (trimmed.length < 8) return false;
  const head = trimmed.slice(0, 80).toLowerCase();
  if (head.startsWith("<!doctype") || head.startsWith("<html") || head.startsWith("<head")) {
    return false;
  }
  return true;
}
