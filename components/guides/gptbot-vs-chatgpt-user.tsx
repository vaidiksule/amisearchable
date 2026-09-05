import Link from "next/link";
import { GuideCode, GuideSection } from "@/components/guide-layout";

export function GptbotVsChatgptUserGuide() {
  return (
    <>
      <GuideSection title="They are three different OpenAI bots">
        <p>
          People search “is my site blocked from ChatGPT” and then block{" "}
          <code className="font-mono text-foreground">GPTBot</code>. That is the wrong lever
          for live answers. OpenAI publishes separate user agents for training, live fetches,
          and search indexing.
        </p>
      </GuideSection>

      <GuideSection title="GPTBot trains models">
        <p>
          <code className="font-mono text-foreground">GPTBot</code> crawls the public web to
          collect training data. If you do not want your pages in future model weights, block
          GPTBot in robots.txt. That choice is common and legitimate. It does not, by itself,
          stop ChatGPT from fetching your page when a user asks about it.
        </p>
      </GuideSection>

      <GuideSection title="ChatGPT-User is the live fetch">
        <p>
          <code className="font-mono text-foreground">ChatGPT-User</code> retrieves a URL
          during a conversation. If this bot is blocked, ChatGPT can still talk about you from
          memory or other sources, but it cannot pull the current page. For “can ChatGPT open
          my site right now?”, this is the bot that matters.
        </p>
      </GuideSection>

      <GuideSection title="OAI-SearchBot vs GPTBot">
        <p>
          <code className="font-mono text-foreground">OAI-SearchBot</code> builds the ChatGPT
          search index. GPTBot does not. Blocking GPTBot and leaving OAI-SearchBot allowed is
          a coherent policy: no training corpus, still eligible for ChatGPT search. Blocking
          OAI-SearchBot while allowing GPTBot does the opposite — you may feed training data
          and still stay out of search.
        </p>
        <p>
          If you want to show up in ChatGPT search, allow OAI-SearchBot. If you only care
          about live browsing in a chat, allow ChatGPT-User. If you want neither, block both
          search/fetch agents and treat GPTBot as a separate training decision.
        </p>
      </GuideSection>

      <GuideSection title="Why the badge only fails on search and fetch bots">
        <p>
          amisearchable.cc marks a site “AI-Search Ready” when{" "}
          <code className="font-mono text-foreground">OAI-SearchBot</code>,{" "}
          <code className="font-mono text-foreground">ChatGPT-User</code>,{" "}
          <code className="font-mono text-foreground">PerplexityBot</code>,{" "}
          <code className="font-mono text-foreground">Claude-SearchBot</code>, and{" "}
          <code className="font-mono text-foreground">Claude-User</code> are not blocked.
          GPTBot and other training crawlers appear on the report but do not fail the badge.
        </p>
        <p>
          A pass still only means crawlers are allowed. It does not mean ChatGPT will cite
          you.{" "}
          <Link href="/guides/ai-crawler-user-agents" className="text-foreground underline underline-offset-4">
            See the full user-agent list
          </Link>
          .
        </p>
      </GuideSection>

      <GuideSection title="A clear robots.txt split">
        <GuideCode>
          {`User-agent: GPTBot
Disallow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /`}
        </GuideCode>
        <p>
          Put more specific groups above or beside your <code className="font-mono">User-agent: *</code>{" "}
          rules. The matching user-agent group wins for that bot.
        </p>
      </GuideSection>
    </>
  );
}
