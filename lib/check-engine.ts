import robotsParser from "robots-parser";
import {
  ALL_BOTS,
  emptyCrawlers,
  verdictFromCheck,
  type CheckResult,
  type CrawlerName,
  type CrawlerStatus,
} from "@/lib/crawlers";
import { safeFetchText } from "@/lib/safe-fetch";

export async function runLiveCheck(domain: string): Promise<CheckResult> {
  const httpsOrigin = `https://${domain}`;
  const robotsUrl = `${httpsOrigin}/robots.txt`;
  const llmsUrl = `${httpsOrigin}/llms.txt`;
  const llmsFullUrl = `${httpsOrigin}/llms-full.txt`;
  const sitemapUrl = `${httpsOrigin}/sitemap.xml`;

  const [robotsResult, llmsResult, llmsFullResult, sitemapResult] = await Promise.all([
    safeFetchText(robotsUrl),
    safeFetchText(llmsUrl),
    safeFetchText(llmsFullUrl),
    safeFetchText(sitemapUrl),
  ]);

  const crawlers = emptyCrawlers();
  let robotsTxtFound = false;
  let robotsError: string | null = null;

  if (robotsResult.ok && isRobotsTxt(robotsResult.text)) {
    robotsTxtFound = true;
    const robots = robotsParser(robotsUrl, robotsResult.text);
    const origin = `${httpsOrigin}/`;

    for (const bot of ALL_BOTS) {
      crawlers[bot] = statusForBot(robots, origin, bot);
    }
  } else if (robotsResult.ok && robotsResult.text.trim()) {
    robotsError = "robots.txt returned a webpage, not a robots.txt file";
  } else if (robotsResult.ok) {
    robotsTxtFound = true;
  } else if (robotsResult.status > 0 && robotsResult.status !== 404) {
    robotsError = `robots.txt returned ${robotsResult.status}`;
  } else if (!robotsResult.ok && robotsResult.status === 0) {
    robotsError = robotsResult.error;
  }

  const llmsTxtPresent = isLlmsTxt(llmsResult.ok ? llmsResult.text : "");
  const llmsFullTxtPresent = isLlmsTxt(llmsFullResult.ok ? llmsFullResult.text : "");
  const sitemapXmlPresent = isSitemapXml(sitemapResult.ok ? sitemapResult.text : "");

  return {
    domain,
    verdict: verdictFromCheck({ robotsTxtFound, crawlers }),
    crawlers,
    llmsTxtPresent,
    llmsTxtUrl: llmsTxtPresent ? llmsUrl : null,
    llmsFullTxtPresent,
    llmsFullTxtUrl: llmsFullTxtPresent ? llmsFullUrl : null,
    robotsTxtFound,
    robotsTxtUrl: robotsTxtFound ? robotsUrl : null,
    sitemapXmlPresent,
    sitemapXmlUrl: sitemapXmlPresent ? sitemapUrl : null,
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

/** Reject HTML soft-404s that many hosts serve as HTTP 200 for /robots.txt. */
export function isRobotsTxt(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed) return false;
  const head = trimmed.slice(0, 200).toLowerCase();
  if (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.startsWith("<head") ||
    head.includes("<html") ||
    head.startsWith("{")
  ) {
    return false;
  }
  // Any non-HTML plain text is acceptable; crawlers parse whatever is there.
  return true;
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

function isSitemapXml(body: string): boolean {
  const trimmed = body.trim();
  if (trimmed.length < 20) return false;
  const head = trimmed.slice(0, 200).toLowerCase();
  if (head.startsWith("<!doctype") || head.includes("<html")) return false;
  return head.includes("<urlset") || head.includes("<sitemapindex") || head.includes("<url>");
}
