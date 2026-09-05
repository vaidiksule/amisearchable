import Link from "next/link";
import { GuideCode, GuideSection } from "@/components/guide-layout";

export function DoesBlockingAiCrawlersHurtGoogleGuide() {
  return (
    <>
      <GuideSection title="Short answer: no">
        <p>
          Blocking GPTBot, ClaudeBot, PerplexityBot, or Google-Extended does not change how
          Google Search ranks your pages. Google Search is crawled by{" "}
          <code className="font-mono text-foreground">Googlebot</code>. Google’s generative
          products use a different token:{" "}
          <code className="font-mono text-foreground">Google-Extended</code>.
        </p>
      </GuideSection>

      <GuideSection title="Googlebot vs Google-Extended">
        <p>
          <code className="font-mono text-foreground">Googlebot</code> discovers and indexes
          pages for google.com. If you block Googlebot, you will drop out of Google Search.
          That is ordinary SEO, not an AI-crawler question.
        </p>
        <p>
          <code className="font-mono text-foreground">Google-Extended</code> controls whether
          Google may use your content to train Gemini and related generative products. Google
          documents it as separate from Search and ranking. Blocking Google-Extended is a
          training-data choice, not a ranking penalty.
        </p>
      </GuideSection>

      <GuideSection title="Why this confusion exists">
        <p>
          “AI crawler” sounds like one switch. It is not. Training bots collect data for
          weights. Search and fetch bots retrieve pages for live answers. Search-engine bots
          like Googlebot still do classic indexing. You can allow Googlebot, block
          Google-Extended, and keep ranking in Google while opting out of Gemini training.
        </p>
      </GuideSection>

      <GuideSection title="A safe robots.txt pattern">
        <GuideCode>
          {`User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /`}
        </GuideCode>
        <p>
          This keeps Google Search open, opts out of Gemini training, and blocks OpenAI
          training. Add search/fetch bots separately if you want ChatGPT or Perplexity
          visibility.{" "}
          <Link href="/guides/gptbot-vs-chatgpt-user" className="text-foreground underline underline-offset-4">
            GPTBot is not ChatGPT-User
          </Link>
          .
        </p>
      </GuideSection>

      <GuideSection title="What can still go wrong">
        <p>
          A CDN, theme, or “SEO cleanup” sometimes ships{" "}
          <code className="font-mono">User-agent: *</code> with{" "}
          <code className="font-mono">Disallow: /</code>. That blocks Googlebot too, and that
          will hurt rankings. The failure is the blanket rule, not the AI-specific tokens.
        </p>
        <p>
          Check the live file before you assume a plugin “only blocked AI.”{" "}
          <Link href="/guides/ai-crawler-user-agents" className="text-foreground underline underline-offset-4">
            Use the user-agent list
          </Link>{" "}
          and a report for your domain.
        </p>
      </GuideSection>
    </>
  );
}
