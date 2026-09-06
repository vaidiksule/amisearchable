import Link from "next/link";
import { GuideCode, GuideSection } from "@/components/guide-layout";
import { StaticBadge } from "@/components/static-badge";
import { embedHtml, embedMarkdown } from "@/lib/domain";

export function AiReadyBadgeGuide() {
  return (
    <>
      <GuideSection title="An embeddable AI crawler badge">
        <p>
          An AI ready badge is a small image that states whether search bots can access a
          domain. Drop it in a GitHub README, docs footer, or portfolio. The image is the
          status; the link goes to the full crawler report.
        </p>
        <div className="flex flex-wrap gap-3">
          <StaticBadge verdict="pass" className="h-5" />
          <StaticBadge verdict="unclear" className="h-5" />
          <StaticBadge verdict="fail" className="h-5" />
          <StaticBadge verdict="pass" style="pill" className="h-6" />
          <StaticBadge verdict="pass" style="terminal" className="h-6" />
          <StaticBadge verdict="pass" style="outline" className="h-7" />
        </div>
      </GuideSection>

      <GuideSection title="Markdown for a README">
        <GuideCode>{embedMarkdown("example.com")}</GuideCode>
        <p>
          Other looks: append{" "}
          <code className="font-mono text-foreground">?style=pill</code>,{" "}
          <code className="font-mono text-foreground">terminal</code>, or{" "}
          <code className="font-mono text-foreground">outline</code> to the badge image URL.
          Pick a style on the report page to copy the exact snippet.
        </p>
        <p>
          The alt text is descriptive on purpose: every embed is a tiny SEO signal and
          should say this is an AI crawler access badge, not a generic image.
        </p>
      </GuideSection>

      <GuideSection title="HTML for a site footer">
        <GuideCode>{embedHtml("example.com")}</GuideCode>
      </GuideSection>

      <GuideSection title="Free vs monitored">
        <p>
          The badge URL does not change if you upgrade. Free snapshots the last check. Pro
          re-checks daily and emails you if robots.txt starts blocking ChatGPT-User,
          PerplexityBot, or the other search/fetch bots. That is the difference between a
          sticker and a monitor.
        </p>
        <p>
          <Link href="/pricing" className="text-foreground underline underline-offset-4">
            See pricing
          </Link>
          . The check itself stays free.
        </p>
      </GuideSection>

      <GuideSection title="Customize the badge">
        <p>
          On the report page, use the embed editor: pick engines (ChatGPT, Gemini, Grok,
          …) and what to show (ready, score, last searched, cited). That builds one
          composite badge. URL params look like{" "}
          <code className="font-mono text-foreground">
            ?engines=chatgpt,gemini,grok&amp;show=ready,score,age
          </code>
          . Anthropic and Perplexity citations are coming soon; crawl readiness still works.
        </p>
      </GuideSection>

      <GuideSection title="What “ready” means">
        <p>
          Ready means a valid robots.txt exists and search/fetch bots are not blocked. No
          robots.txt (or an HTML soft-404) is unclear — yellow — not green. The score is
          crawl readiness only (robots, bots, sitemap, llms.txt). Citation probes are a
          separate strip (“cited in N/M”) for monitored domains.{" "}
          <Link href="/guides/gptbot-vs-chatgpt-user" className="text-foreground underline underline-offset-4">
            Read the bot split
          </Link>
          .
        </p>
      </GuideSection>
    </>
  );
}
