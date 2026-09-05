import { EMBED_ORIGIN } from "@/lib/config";

export const SITE_NAME = "amisearchable.cc";
export const SITE_TITLE =
  "AI Searchable — Check if GPTBot, ClaudeBot and PerplexityBot can access your site";
export const SITE_DESCRIPTION =
  "Free AI crawler checker. See if GPTBot, ChatGPT-User, ClaudeBot, and PerplexityBot are blocked in robots.txt, then embed an AI search status badge in your README.";

export const CURATED_REPORT_DOMAINS = [
  "amisearchable.cc",
  "vercel.com",
  "nytimes.com",
  "openai.com",
  "anthropic.com",
  "perplexity.ai",
] as const;

export const HOME_FAQS = [
  {
    question: "What is an AI crawler checker?",
    answer:
      "An AI crawler checker reads a site's public robots.txt and llms.txt to see whether bots like GPTBot, ChatGPT-User, OAI-SearchBot, Claude-SearchBot, and PerplexityBot are allowed. It does not fetch your whole site or change Google ranking.",
    href: "/guides/ai-crawler-user-agents",
  },
  {
    question: "Does blocking GPTBot hurt Google ranking?",
    answer:
      "No. Google Search uses Googlebot. Google-Extended is a separate token for Gemini training. Blocking GPTBot, ClaudeBot, or Google-Extended does not by itself change your Google ranking.",
    href: "/guides/does-blocking-ai-crawlers-hurt-google",
  },
  {
    question: "What is llms.txt?",
    answer:
      "llms.txt is an optional markdown file at your site root that describes the site for language models. It complements robots.txt and does not grant crawl access by itself.",
    href: "/guides/llms-txt",
  },
  {
    question: "What is the difference between GPTBot and ChatGPT-User?",
    answer:
      "GPTBot is used to collect training data. ChatGPT-User fetches a page when someone asks ChatGPT about it. OAI-SearchBot builds the ChatGPT search index. Blocking training bots is common; blocking search and fetch bots is what hides you from live answers.",
    href: "/guides/gptbot-vs-chatgpt-user",
  },
  {
    question: "How do I embed an AI ready badge?",
    answer:
      "Check a domain, then copy the HTML or Markdown snippet. The image URL stays the same if you later turn on monitoring. The badge alt text names the domain so embeds stay descriptive.",
    href: "/guides/ai-ready-badge",
  },
] as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${EMBED_ORIGIN}${normalized}`;
}
