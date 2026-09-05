import { EMBED_ORIGIN } from "@/lib/config";

const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal"]);

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

export function embedHtml(domain: string): string {
  return `<a href="${EMBED_ORIGIN}/report/${domain}">
  <img src="${EMBED_ORIGIN}/badge/${domain}" alt="AI Searchable">
</a>`;
}

export function embedMarkdown(domain: string): string {
  return `[![AI Searchable](${EMBED_ORIGIN}/badge/${domain})](${EMBED_ORIGIN}/report/${domain})`;
}
