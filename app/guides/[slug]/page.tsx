import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AiCrawlerUserAgentsGuide } from "@/components/guides/ai-crawler-user-agents";
import { AiReadyBadgeGuide } from "@/components/guides/ai-ready-badge";
import { DoesBlockingAiCrawlersHurtGoogleGuide } from "@/components/guides/does-blocking-ai-crawlers-hurt-google";
import { GptbotVsChatgptUserGuide } from "@/components/guides/gptbot-vs-chatgpt-user";
import { HowToAllowPerplexityBotGuide } from "@/components/guides/how-to-allow-perplexitybot";
import { LlmsTxtGuide } from "@/components/guides/llms-txt";
import { LlmsTxtVsRobotsTxtGuide } from "@/components/guides/llms-txt-vs-robots-txt";
import { GuideLayout } from "@/components/guide-layout";
import { JsonLd } from "@/components/json-ld";
import { GUIDES, getGuide, relatedGuides } from "@/lib/guides";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const BODIES: Record<string, ComponentType> = {
  "gptbot-vs-chatgpt-user": GptbotVsChatgptUserGuide,
  "does-blocking-ai-crawlers-hurt-google": DoesBlockingAiCrawlersHurtGoogleGuide,
  "ai-crawler-user-agents": AiCrawlerUserAgentsGuide,
  "llms-txt": LlmsTxtGuide,
  "llms-txt-vs-robots-txt": LlmsTxtVsRobotsTxtGuide,
  "how-to-allow-perplexitybot": HowToAllowPerplexityBotGuide,
  "ai-ready-badge": AiReadyBadgeGuide,
};

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata(
  props: PageProps<"/guides/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) {
    return { title: "Guide", robots: { index: false, follow: false } };
  }

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      publishedTime: guide.date,
    },
  };
}

export default async function GuidePage(props: PageProps<"/guides/[slug]">) {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  const Body = BODIES[slug];

  if (!guide || !Body) {
    notFound();
  }

  const related = relatedGuides(guide.slug);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            datePublished: guide.date,
            dateModified: guide.date,
            mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
            publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: absoluteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Guides",
                item: absoluteUrl("/guides"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: guide.title,
                item: absoluteUrl(`/guides/${guide.slug}`),
              },
            ],
          },
        ]}
      />
      <GuideLayout guide={guide} related={related}>
        <Body />
      </GuideLayout>
    </>
  );
}
