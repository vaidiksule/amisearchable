import type { MetadataRoute } from "next";
import { ALL_BOTS } from "@/lib/crawlers";
import { EMBED_ORIGIN } from "@/lib/config";

const PRIVATE_PATHS = [
  "/dashboard",
  "/login",
  "/checkout",
  "/portal",
  "/monitor",
  "/api/",
  "/auth/",
];

const AI_CRAWLERS = [...ALL_BOTS, "Googlebot", "Bingbot"] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: [...AI_CRAWLERS],
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${EMBED_ORIGIN}/sitemap.xml`,
    host: "amisearchable.cc",
  };
}
