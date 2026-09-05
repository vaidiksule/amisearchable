import Link from "next/link";
import { GuideCode, GuideSection } from "@/components/guide-layout";

export function LlmsTxtGuide() {
  return (
    <>
      <GuideSection title="What llms.txt is">
        <p>
          <code className="font-mono text-foreground">llms.txt</code> is a markdown file
          served at <code className="font-mono">https://your-domain/llms.txt</code>. It
          describes the site for language models: what you do, which pages matter, and how
          you want to be cited. The emerging shape is a title, a one-line summary, then
          linked sections.
        </p>
        <p>
          It is optional. Most domains still do not ship one. That is why a clean explainer
          is useful now — adoption is early enough that a clear page can become the
          reference people bookmark.
        </p>
      </GuideSection>

      <GuideSection title="What it is not">
        <p>
          llms.txt does not grant crawl access. It does not replace robots.txt. It does not
          guarantee ChatGPT, Claude, or Perplexity will mention you. Think of it as a
          machine-readable homepage for models that choose to read it, the same way a
          sitemap helps crawlers that choose to use it.
        </p>
      </GuideSection>

      <GuideSection title="Do you need one?">
        <p>
          You need one if you want a single, stable URL that explains the product to AI
          systems and to humans who look for the file. You do not need one to pass an AI
          crawler check. amisearchable.cc treats llms.txt as informational: found or not
          found, never a badge fail.
        </p>
        <p>
          If you already care about AI search visibility, adding a short llms.txt is cheap
          and easy to keep honest. Ours is at{" "}
          <Link href="/llms.txt" className="text-foreground underline underline-offset-4">
            /llms.txt
          </Link>
          , with a longer version at{" "}
          <Link href="/llms-full.txt" className="text-foreground underline underline-offset-4">
            /llms-full.txt
          </Link>
          .
        </p>
      </GuideSection>

      <GuideSection title="A minimal file">
        <GuideCode>
          {`# Example

> One sentence about the product.

This site allows AI search crawlers. See /robots.txt.

## Docs
- [Home](https://example.com/): what the product does
- [Pricing](https://example.com/pricing): plans`}
        </GuideCode>
      </GuideSection>

      <GuideSection title="How this relates to robots.txt">
        <p>
          robots.txt answers “may this bot fetch the URL?” llms.txt answers “once a model
          is looking, what should it know?”{" "}
          <Link href="/guides/llms-txt-vs-robots-txt" className="text-foreground underline underline-offset-4">
            Compare the two files
          </Link>
          .
        </p>
      </GuideSection>
    </>
  );
}
