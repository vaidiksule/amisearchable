import type { MetadataRoute } from "next";
import { listRecentCheckedDomains } from "@/lib/checks";
import { GUIDES } from "@/lib/guides";
import { CURATED_REPORT_DOMAINS, absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const recent = await listRecentCheckedDomains(200);
  const reportEntries = new Map<string, Date>();

  for (const domain of CURATED_REPORT_DOMAINS) {
    reportEntries.set(domain, now);
  }
  for (const row of recent) {
    if (!reportEntries.has(row.hostname)) {
      reportEntries.set(row.hostname, new Date(row.checkedAt));
    }
  }

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/pricing"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/guides"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...GUIDES.map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: new Date(guide.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...[...reportEntries.entries()].map(([hostname, lastModified]) => ({
      url: absoluteUrl(`/report/${hostname}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: hostname === "amisearchable.cc" ? 0.7 : 0.4,
    })),
  ];
}
