import type { Verdict } from "@/lib/crawlers";
import { formatBadgeAge } from "@/lib/time";

export const BADGE_STYLES = ["shield", "pill", "terminal", "outline"] as const;
export type BadgeStyle = (typeof BADGE_STYLES)[number];

/** Bump when badge artwork changes so browsers/CDNs drop stale SVGs. */
export const BADGE_ASSET_VERSION = "3";

export const BADGE_STYLE_META: Record<
  BadgeStyle,
  { label: string; description: string }
> = {
  shield: {
    label: "Classic",
    description: "Shields-style split badge",
  },
  pill: {
    label: "Pill",
    description: "Single-tone rounded pill",
  },
  terminal: {
    label: "Terminal",
    description: "Monospace $ ai-search prompt",
  },
  outline: {
    label: "Outline",
    description: "Border + status dot + age",
  },
};

export function parseBadgeStyle(value: string | null | undefined): BadgeStyle {
  if (value && (BADGE_STYLES as readonly string[]).includes(value)) {
    return value as BadgeStyle;
  }
  return "shield";
}

export function renderBadgeSvg(
  verdict: Verdict | "pending",
  checkedAt?: string,
  style: BadgeStyle = "shield",
): string {
  const age = formatBadgeAge(checkedAt);
  switch (style) {
    case "pill":
      return pillBadge(verdict, age);
    case "terminal":
      return terminalBadge(verdict, age);
    case "outline":
      return outlineBadge(verdict, age);
    default:
      return shieldBadge(verdict, age);
  }
}

export function badgeLabel(
  verdict: Verdict,
  checkedAt?: string,
  style: BadgeStyle = "shield",
): string {
  const age = formatBadgeAge(checkedAt);
  if (style === "terminal") {
    if (verdict === "unclear") return `$ ai-search: unclear · ${age}`;
    return verdict === "pass" ? `$ ai-search: ready · ${age}` : `$ ai-search: blocked · ${age}`;
  }
  if (style === "pill" || style === "outline") {
    if (verdict === "unclear") return `No robots.txt · ${age}`;
    return verdict === "pass" ? `AI Searchable · ${age}` : `Blocks AI Search · ${age}`;
  }
  if (verdict === "unclear") return `AI Searchable: unclear · ${age}`;
  return verdict === "pass" ? `AI Searchable: ready · ${age}` : `AI Searchable: blocked · ${age}`;
}

export function badgeDataUri(
  verdict: Verdict | "pending",
  checkedAt?: string,
  style: BadgeStyle = "shield",
): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(renderBadgeSvg(verdict, checkedAt, style))}`;
}

function shieldBadge(verdict: Verdict | "pending", age: string): string {
  const tone = toneFrom(verdict);
  const status =
    tone === "unclear"
      ? `unclear · ${age}`
      : tone === "pending"
        ? "pending"
        : tone === "ready"
          ? `ready · ${age}`
          : `blocked · ${age}`;
  const label = "ai search";
  const colors = {
    ready: "#16a34a",
    blocked: "#dc2626",
    unclear: "#ca8a04",
    pending: "#57534e",
  };
  const markFill = {
    ready: "#34D399",
    blocked: "#F87171",
    unclear: "#FACC15",
    pending: "#A8A29E",
  };
  const markSize = 14;
  const markPad = 3;
  const markBlock = markSize + markPad * 2;
  const statusWidth = Math.round(Math.max(78, status.length * 6.5 + 18));
  const labelWidth = Math.round(Math.max(78, label.length * 6.4 + 16 + markBlock));
  const width = labelWidth + statusWidth;
  const markX = markPad;
  const markY = (20 - markSize) / 2;
  const textX = markBlock + (labelWidth - markBlock) / 2;
  const markIcon =
    tone === "blocked"
      ? `<path d="M4.2 4.2 L9.8 9.8 M9.8 4.2 L4.2 9.8" stroke="#450a0a" stroke-width="1.7" stroke-linecap="round"/>`
      : tone === "unclear"
        ? `<circle cx="7" cy="7" r="2.4" fill="#713f12"/>`
        : tone === "pending"
          ? `<path d="M4 7 H10" stroke="#1c1917" stroke-width="1.7" stroke-linecap="round"/>`
          : `<path d="M3.5 7.2 L6 9.6 L10.6 4.4" stroke="#0B0D10" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${status}">
  <title>${label}: ${status}</title>
  <rect rx="3" width="${width}" height="20" fill="#3f3f46"/>
  <rect rx="3" x="${labelWidth}" width="${statusWidth}" height="20" fill="${colors[tone]}"/>
  <rect x="${labelWidth}" width="4" height="20" fill="${colors[tone]}"/>
  <g transform="translate(${markX} ${markY})">
    <rect width="${markSize}" height="${markSize}" rx="3.5" fill="${markFill[tone]}"/>
    ${markIcon}
  </g>
  <g fill="#fff" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">
    <text x="${textX}" y="14">${escapeXml(label)}</text>
    <text x="${labelWidth + statusWidth / 2}" y="14">${escapeXml(status)}</text>
  </g>
</svg>`;
}

function pillBadge(verdict: Verdict | "pending", age: string): string {
  const tone = toneFrom(verdict);
  const label =
    tone === "unclear"
      ? `No robots.txt · ${age}`
      : tone === "pending"
        ? "AI Searchable · pending"
        : tone === "ready"
          ? `AI Searchable · ${age}`
          : `Blocks AI Search · ${age}`;
  const bg =
    tone === "unclear" ? "#fef9c3" : tone === "blocked" ? "#fee2e2" : "#dcfce7";
  const fg =
    tone === "unclear" ? "#854d0e" : tone === "blocked" ? "#991b1b" : "#166534";
  const icon = tone === "blocked" ? "×" : tone === "unclear" ? "●" : "✓";
  const width = Math.round(Math.max(128, label.length * 7.1 + 42));
  const height = 24;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(label)}">
  <title>${escapeXml(label)}</title>
  <rect width="${width}" height="${height}" rx="12" fill="${bg}"/>
  <text x="14" y="16" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="${fg}">${icon}</text>
  <text x="30" y="16" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="${fg}">${escapeXml(label)}</text>
</svg>`;
}

function terminalBadge(verdict: Verdict | "pending", age: string): string {
  const tone = toneFrom(verdict);
  const status =
    tone === "unclear" ? "unclear" : tone === "pending" ? "pending" : tone === "ready" ? "ready" : "blocked";
  const label = `$ ai-search: ${status}`;
  const width = Math.round(Math.max(138, label.length * 7.4 + 28));
  const height = 24;
  const color =
    tone === "blocked" ? "#f87171" : tone === "unclear" ? "#facc15" : "#4ade80";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(label)} · ${age}">
  <title>${escapeXml(label)} · ${age}</title>
  <rect width="${width}" height="${height}" rx="4" fill="#111827"/>
  <text x="12" y="16" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" fill="${color}">${escapeXml(label)}</text>
</svg>`;
}

function outlineBadge(verdict: Verdict | "pending", age: string): string {
  const tone = toneFrom(verdict);
  const title =
    tone === "unclear" ? "No robots.txt" : tone === "blocked" ? "Blocks AI Search" : "AI Searchable";
  const ageLabel = `· ${age}`;
  const width = Math.round(Math.max(148, title.length * 7.2 + ageLabel.length * 6.2 + 40));
  const height = 28;
  const dot =
    tone === "unclear" ? "#ca8a04" : tone === "blocked" ? "#dc2626" : "#16a34a";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${title} ${ageLabel}">
  <title>${title} ${ageLabel}</title>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="6" fill="#ffffff" stroke="#d4d4d8"/>
  <circle cx="14" cy="14" r="4" fill="${dot}"/>
  <text x="26" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="#18181b">${escapeXml(title)}</text>
  <text x="${26 + title.length * 7.2 + 6}" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" fill="#71717a">${escapeXml(ageLabel)}</text>
</svg>`;
}

function toneFrom(verdict: Verdict | "pending"): "ready" | "blocked" | "unclear" | "pending" {
  if (verdict === "pending") return "pending";
  if (verdict === "unclear") return "unclear";
  return verdict === "pass" ? "ready" : "blocked";
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
