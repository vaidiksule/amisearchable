import {
  BADGE_ASSET_VERSION,
  type BadgeShowField,
  type BadgeStyle,
  type BadgeView,
  type CompositeStyle,
} from "@/lib/badge-svg";
import { EMBED_ORIGIN } from "@/lib/config";
import type { Platform } from "@/lib/platforms";

const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal"]);

export type BadgeEmbedOptions = {
  style?: BadgeStyle | CompositeStyle;
  view?: BadgeView;
  engine?: Platform | "all";
  show?: BadgeShowField[];
  engines?: Platform[];
  /** Include bordered site-wide “ai search” summary above engine rows. */
  overall?: boolean;
  origin?: string;
  bust?: string;
};

export function normalizeDomain(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.username || url.password) return null;
    const host = url.hostname.replace(/\.$/, "");
    if (!host || !host.includes(".")) return null;
    if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local")) {
      return null;
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
    if (host.includes(":")) return null;
    return host;
  } catch {
    return null;
  }
}

export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export function embedAlt(domain: string): string {
  return `AI Searchable — AI crawler access badge for ${domain}`;
}

export function badgeSrc(domain: string, opts: BadgeEmbedOptions = {}): string {
  const origin = opts.origin ?? EMBED_ORIGIN;
  const params = new URLSearchParams();
  params.set("v", BADGE_ASSET_VERSION);

  const show = opts.show?.length ? opts.show : undefined;
  const engines = opts.engines?.length ? opts.engines : undefined;

  if (show) {
    params.set("show", show.join(","));
  } else if (opts.view && opts.view !== "ready") {
    params.set("view", opts.view);
  }

  if (engines) {
    params.set("engines", engines.join(","));
  } else if (opts.engine && opts.engine !== "all") {
    params.set("engine", opts.engine);
  }

  if (opts.overall === true) {
    params.set("overall", "1");
  }

  if (opts.style && opts.style !== "shield" && opts.style !== "classic") {
    params.set("style", opts.style);
  }
  if (opts.bust) params.set("t", opts.bust);
  return `${origin}/badge/${domain}?${params.toString()}`;
}

/** Same-origin badge URL for app pages (homepage, report). */
export function localBadgeSrc(
  domain: string,
  style: BadgeStyle = "shield",
  bust?: string,
): string {
  return badgeSrc(domain, { origin: "", style, bust });
}

export function embedHtml(domain: string, opts: BadgeEmbedOptions = {}): string {
  return `<a href="${EMBED_ORIGIN}/report/${domain}">
  <img src="${badgeSrc(domain, opts)}" alt="${embedAlt(domain)}">
</a>`;
}

export function embedMarkdown(domain: string, opts: BadgeEmbedOptions = {}): string {
  const alt = embedAlt(domain);
  return `[![${alt}](${badgeSrc(domain, opts)})](${EMBED_ORIGIN}/report/${domain})`;
}

export function embedAgentPrompt(domain: string, opts: BadgeEmbedOptions = {}): string {
  return `Add this AI-Searchable badge to my project.

If this is a GitHub repository, add it to README.md near the top,
in the same line as other badges (build status, license, etc.) if any exist.
Use this exact markdown, don't modify the URL:

${embedMarkdown(domain, opts)}

If this is a website codebase, add it to the site footer component
so it appears on every page. Use this exact HTML, don't modify the URL:

${embedHtml(domain, opts)}

Don't change any other content — just insert this badge in the
appropriate location.`;
}
