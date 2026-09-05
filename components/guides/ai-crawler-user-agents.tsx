import { CRAWLER_NOTES, SEARCH_BOTS, TRAINING_BOTS } from "@/lib/crawlers";
import { GuideSection } from "@/components/guide-layout";

export function AiCrawlerUserAgentsGuide() {
  return (
    <>
      <GuideSection title="How to read this list">
        <p>
          These are the AI crawler user agents amisearchable.cc checks in robots.txt. Search
          and fetch bots decide whether a site can be retrieved for live answers. Training
          crawlers are informational. The table is generated from the same list the checker
          uses, so it cannot drift from the product.
        </p>
      </GuideSection>

      <GuideSection title="Search and fetch bots">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="px-4 py-3 font-medium">User-agent</th>
                <th className="px-4 py-3 font-medium">What it does</th>
              </tr>
            </thead>
            <tbody>
              {SEARCH_BOTS.map((bot) => (
                <tr key={bot} className="border-t border-border first:border-t-0">
                  <td className="px-4 py-3 align-top font-mono text-foreground">{bot}</td>
                  <td className="px-4 py-3 text-muted">{CRAWLER_NOTES[bot]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GuideSection>

      <GuideSection title="Training crawlers">
        <p>
          Blocking these does not fail the AI-Search Ready badge. Many sites block training
          and still want to appear in live answers.
        </p>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="px-4 py-3 font-medium">User-agent</th>
                <th className="px-4 py-3 font-medium">What it does</th>
              </tr>
            </thead>
            <tbody>
              {TRAINING_BOTS.map((bot) => (
                <tr key={bot} className="border-t border-border first:border-t-0">
                  <td className="px-4 py-3 align-top font-mono text-foreground">{bot}</td>
                  <td className="px-4 py-3 text-muted">{CRAWLER_NOTES[bot]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GuideSection>

      <GuideSection title="Not on this list, on purpose">
        <p>
          Googlebot is a search-engine crawler, not an AI training token. Amazonbot and
          Bytespider exist, but they are outside the pass/fail rule this product uses today.
          If a vendor publishes a new search-fetch user agent, this page updates when the
          checker does.
        </p>
      </GuideSection>
    </>
  );
}
