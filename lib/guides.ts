export type Guide = {
  slug: string;
  title: string;
  description: string;
  date: string;
  cluster: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "gptbot-vs-chatgpt-user",
    title: "GPTBot vs ChatGPT-User vs OAI-SearchBot: what's the difference",
    description:
      "GPTBot trains models. ChatGPT-User fetches pages for live answers. OAI-SearchBot builds ChatGPT search. Blocking the wrong one is a common mistake.",
    date: "2026-09-06",
    cluster: "long-tail",
  },
  {
    slug: "does-blocking-ai-crawlers-hurt-google",
    title: "Does blocking AI crawlers hurt your Google ranking?",
    description:
      "No. Googlebot and Google-Extended are separate. Blocking GPTBot, ClaudeBot, or Google-Extended does not change your Google Search ranking.",
    date: "2026-09-06",
    cluster: "long-tail",
  },
  {
    slug: "ai-crawler-user-agents",
    title: "The complete list of AI crawler user agents (2026)",
    description:
      "User agents for GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, and the other bots that decide AI search visibility.",
    date: "2026-09-06",
    cluster: "reference",
  },
  {
    slug: "llms-txt",
    title: "llms.txt explained: what it is, and whether you need one",
    description:
      "llms.txt is a markdown file at your site root that tells AI systems what your site is about. Here is what it does, what it does not do, and a real example.",
    date: "2026-09-06",
    cluster: "long-tail",
  },
  {
    slug: "llms-txt-vs-robots-txt",
    title: "llms.txt vs robots.txt",
    description:
      "robots.txt grants or blocks crawler access. llms.txt describes your site for language models. You usually want both, and they do not replace each other.",
    date: "2026-09-06",
    cluster: "long-tail",
  },
  {
    slug: "how-to-allow-perplexitybot",
    title: "How to allow PerplexityBot",
    description:
      "Paste-ready robots.txt rules so PerplexityBot can crawl your site, plus how to confirm the change with an AI crawler checker.",
    date: "2026-09-06",
    cluster: "long-tail",
  },
  {
    slug: "ai-ready-badge",
    title: "AI ready badge for your website or README",
    description:
      "Embed an AI search status badge that shows whether GPTBot, Claude, and Perplexity can access your site. Free HTML and Markdown snippets.",
    date: "2026-09-06",
    cluster: "badge",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function relatedGuides(slug: string, limit = 3): Guide[] {
  return GUIDES.filter((guide) => guide.slug !== slug).slice(0, limit);
}
