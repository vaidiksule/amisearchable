import type { Verdict } from "@/lib/crawlers";
import { formatBadgeAge } from "@/lib/time";

export function renderBadgeSvg(verdict: Verdict | "pending", checkedAt?: string): string {
  const age = formatBadgeAge(checkedAt);

  if (verdict === "pending") {
    return badge("AI Searchable", "pending", "pending");
  }
  if (verdict === "pass") {
    return badge("AI Searchable", `Ready · ${age}`, "ready");
  }
  return badge("AI Searchable", `Blocking · ${age}`, "blocked");
}

export function badgeLabel(verdict: Verdict, checkedAt?: string): string {
  const age = formatBadgeAge(checkedAt);
  return verdict === "pass" ? `AI-Search Ready · ${age}` : `Blocking AI Search · ${age}`;
}

export function badgeDataUri(verdict: Verdict | "pending", checkedAt?: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(renderBadgeSvg(verdict, checkedAt))}`;
}

function badge(label: string, status: string, tone: "ready" | "blocked" | "pending"): string {
  const colors = {
    ready: "#0d7a3c",
    blocked: "#c2410c",
    pending: "#57534e",
  };
  const statusWidth = Math.round(Math.max(72, status.length * 6.8 + 18));
  const labelWidth = Math.round(Math.max(92, label.length * 6.6 + 20));
  const width = labelWidth + statusWidth;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${status}">
  <title>${label}: ${status}</title>
  <rect rx="3" width="${width}" height="20" fill="#292524"/>
  <rect rx="3" x="${labelWidth}" width="${statusWidth}" height="20" fill="${colors[tone]}"/>
  <rect x="${labelWidth}" width="4" height="20" fill="${colors[tone]}"/>
  <g fill="#fff" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">
    <text x="${labelWidth / 2}" y="14">${escapeXml(label)}</text>
    <text x="${labelWidth + statusWidth / 2}" y="14">${escapeXml(status)}</text>
  </g>
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
