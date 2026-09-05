import Link from "next/link";
import { GuideCode, GuideSection } from "@/components/guide-layout";

export function HowToAllowPerplexityBotGuide() {
  return (
    <>
      <GuideSection title="Add a PerplexityBot group">
        <p>
          Perplexity uses <code className="font-mono text-foreground">PerplexityBot</code> to
          crawl the web for search. If your robots.txt blocks{" "}
          <code className="font-mono">User-agent: *</code> or names PerplexityBot under
          Disallow, Perplexity should not index those paths.
        </p>
        <p>Put a specific group in robots.txt:</p>
        <GuideCode>
          {`User-agent: PerplexityBot
Allow: /`}
        </GuideCode>
        <p>
          The most specific matching user-agent group applies. A dedicated PerplexityBot
          group overrides a blanket <code className="font-mono">*</code> disallow for that
          bot.
        </p>
      </GuideSection>

      <GuideSection title="If you currently block all bots">
        <p>
          A common accidental block looks like this:
        </p>
        <GuideCode>
          {`User-agent: *
Disallow: /`}
        </GuideCode>
        <p>
          That hides the site from PerplexityBot and from Googlebot. Do not “fix AI” by
          opening <code className="font-mono">*</code> unless you mean to open every crawler.
          Prefer named groups for the bots you want.
        </p>
        <GuideCode>
          {`User-agent: *
Disallow: /

User-agent: Googlebot
Allow: /

User-agent: PerplexityBot
Allow: /`}
        </GuideCode>
      </GuideSection>

      <GuideSection title="Confirm the change">
        <p>
          Deploy robots.txt at the site root —{" "}
          <code className="font-mono">https://example.com/robots.txt</code> — then run a
          check. The report should show PerplexityBot as Allowed. If it still says Blocked,
          you likely have another Disallow in the same group, a CDN-cached file, or a
          different host (www vs apex).
        </p>
        <p>
          Allowing PerplexityBot does not guarantee a citation. It only removes the access
          block.{" "}
          <Link href="/guides/ai-crawler-user-agents" className="text-foreground underline underline-offset-4">
            See the other search bots
          </Link>{" "}
          if you also want ChatGPT and Claude fetch access.
        </p>
      </GuideSection>
    </>
  );
}
