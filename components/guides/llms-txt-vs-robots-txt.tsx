import Link from "next/link";
import { GuideSection } from "@/components/guide-layout";

export function LlmsTxtVsRobotsTxtGuide() {
  return (
    <>
      <GuideSection title="Different jobs">
        <p>
          <code className="font-mono text-foreground">robots.txt</code> is an access-control
          file. Crawlers look it up before fetching other paths and honor Allow / Disallow
          rules for their user agent. If PerplexityBot is disallowed, it should not crawl
          your pages no matter how good your llms.txt is.
        </p>
        <p>
          <code className="font-mono text-foreground">llms.txt</code> is a description file.
          Models that support it can read a short map of your site. It does not allow or
          block anyone. A beautiful llms.txt behind{" "}
          <code className="font-mono">Disallow: /</code> is a brochure on a locked door.
        </p>
      </GuideSection>

      <GuideSection title="Who reads each file">
        <p>
          Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot,
          and most other crawlers read robots.txt. That is a decades-old convention.
        </p>
        <p>
          llms.txt is newer and still optional. Some tools and agents look for it; many do
          not. Treat it as extra context, not as a substitute for crawler rules.{" "}
          <Link href="/guides/llms-txt" className="text-foreground underline underline-offset-4">
            More on whether you need llms.txt
          </Link>
          .
        </p>
      </GuideSection>

      <GuideSection title="A practical setup">
        <p>
          Keep robots.txt explicit for search/fetch bots you care about, and keep training
          tokens as a separate decision. Add llms.txt if you want a canonical explanation of
          the product, with links to docs, pricing, and this robots policy.
        </p>
        <p>
          amisearchable.cc ships both on purpose:{" "}
          <a href="/robots.txt" className="text-foreground underline underline-offset-4">
            /robots.txt
          </a>{" "}
          allows AI crawlers, and{" "}
          <a href="/llms.txt" className="text-foreground underline underline-offset-4">
            /llms.txt
          </a>{" "}
          describes the product. The checker reports both because people conflate them.
        </p>
      </GuideSection>

      <GuideSection title="What the report shows">
        <p>
          A domain report lists each crawler as allowed, blocked, or not specified, then
          shows whether llms.txt was found. “Not specified” means robots.txt has no rule for
          that bot, so most crawlers fall back to the <code className="font-mono">*</code>{" "}
          group or treat the path as allowed.
        </p>
      </GuideSection>
    </>
  );
}
