import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageFrame } from "@/components/page-frame";
import { GUIDES } from "@/lib/guides";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guides to AI search visibility, GEO, and AEO",
  description:
    "Guides on generative engine optimization, answer engine optimization, AI crawler access, llms.txt, and embeddable AI search badges.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <PageFrame>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Guides to AI search visibility, GEO, and AEO",
          url: absoluteUrl("/guides"),
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
        }}
      />
      <h1 className="text-3xl font-semibold tracking-tight">
        Guides to AI search visibility
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        Generative engine optimization (GEO), answer engine optimization (AEO), and AI
        crawler optimization are still unsettled names for the same job: making sure AI
        search systems are allowed to read you, then giving them something worth citing.
      </p>
      <ul className="mt-10 space-y-4">
        {GUIDES.map((guide) => (
          <li key={guide.slug} className="rounded-lg border border-border bg-surface p-5">
            <Link href={`/guides/${guide.slug}`} className="text-sm font-medium underline underline-offset-4">
              {guide.title}
            </Link>
            <p className="mt-2 text-sm leading-6 text-muted">{guide.description}</p>
          </li>
        ))}
      </ul>
    </PageFrame>
  );
}
