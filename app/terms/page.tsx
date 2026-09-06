import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using amisearchable.cc — AI crawler checks, badges, accounts, and Pro monitoring.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms govern your use of amisearchable.cc, including free checks, badges, accounts, and Pro monitoring."
      updated="September 6, 2026"
    >
      <LegalSection title="The service">
        <p>
          amisearchable.cc lets you check whether AI crawlers appear allowed or blocked in a
          site’s public <code className="font-mono text-foreground">robots.txt</code>,
          optionally see <code className="font-mono text-foreground">llms.txt</code>, and
          embed a status badge. Pro adds scheduled re-checks and email alerts.
        </p>
        <p>
          A “pass” or “AI-Search Ready” badge means search/fetch bots are not blocked in
          robots.txt at check time. It does <strong className="font-medium text-foreground">not</strong>{" "}
          guarantee citation in ChatGPT, Claude, Perplexity, or any other AI answer.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the tool only on publicly reachable domains</li>
          <li>Not abuse checks, badges, auth, or APIs (including rate abuse or scraping our service)</li>
          <li>Not use the service for illegal activity or to harass others</li>
          <li>Keep account credentials and magic links confidential</li>
        </ul>
        <p>
          Checking a domain only reads public robots.txt / llms.txt the same way other
          public checkers do. No ownership verification is required.
        </p>
      </LegalSection>

      <LegalSection title="Accounts and billing">
        <p>
          Free features do not require an account. Pro requires sign-in and a paid Polar
          subscription. Prices are shown on the{" "}
          <Link href="/pricing" className="text-foreground underline underline-offset-4">
            pricing page
          </Link>
          . Polar handles taxes and payment processing. Subscription changes and
          cancellations are managed through Polar’s customer portal when available.
        </p>
      </LegalSection>

      <LegalSection title="Badges and embeds">
        <p>
          You may embed our badge on your sites and READMEs. Badge images are served from
          amisearchable.cc and may be cached. Do not misrepresent a badge as official
          certification by OpenAI, Anthropic, Google, Perplexity, or any third party.
        </p>
      </LegalSection>

      <LegalSection title="Availability and accuracy">
        <p>
          We aim for reliable checks but do not warrant uninterrupted uptime or perfect
          accuracy. robots.txt can change, CDNs can cache old files, and crawler behavior
          can differ from what robots.txt declares. Results are informational.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          The site, brand, and software are owned by us. You keep rights to your own
          content. You grant us a limited license to store and display domains and check
          results as needed to run the product.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer">
        <p>
          The service is provided “as is” without warranties of any kind, express or
          implied, including fitness for a particular purpose or non-infringement. To the
          fullest extent allowed by law, we are not liable for indirect, incidental, or
          consequential damages, or for lost rankings, citations, or revenue related to AI
          search.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          We may suspend or terminate access for abuse or violation of these terms. You may
          stop using the service and cancel Pro at any time.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms. The “Last updated” date will change when we do.
          Continued use after an update means you accept the revised terms.
        </p>
        <p>
          Privacy details are in our{" "}
          <Link href="/privacy" className="text-foreground underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
