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
  const markSize = 14;
  const markPad = 3;
  const markBlock = markSize + markPad * 2;
  const statusWidth = Math.round(Math.max(72, status.length * 6.8 + 18));
  const labelWidth = Math.round(Math.max(92, label.length * 6.6 + 20 + markBlock));
  const width = labelWidth + statusWidth;
  const markX = markPad;
  const markY = (20 - markSize) / 2;
  const textX = markBlock + (labelWidth - markBlock) / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${status}">
  <title>${label}: ${status}</title>
  <rect rx="3" width="${width}" height="20" fill="#292524"/>
  <rect rx="3" x="${labelWidth}" width="${statusWidth}" height="20" fill="${colors[tone]}"/>
  <rect x="${labelWidth}" width="4" height="20" fill="${colors[tone]}"/>
  <g transform="translate(${markX} ${markY})">
    <rect width="${markSize}" height="${markSize}" rx="3.5" fill="#34D399"/>
    <path d="M3.5 7.2 L6 9.6 L10.6 4.4" stroke="#0B0D10" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">
    <text x="${textX}" y="14">${escapeXml(label)}</text>
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
