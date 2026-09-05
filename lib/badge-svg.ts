import type { Verdict } from "@/lib/crawlers";
import { formatBadgeAge } from "@/lib/time";

export const BADGE_STYLES = ["shield", "pill", "terminal", "outline"] as const;
export type BadgeStyle = (typeof BADGE_STYLES)[number];

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
    return verdict === "pass" ? `$ ai-search: ready · ${age}` : `$ ai-search: blocked · ${age}`;
  }
  if (style === "pill" || style === "outline") {
    return verdict === "pass" ? `AI Searchable · ${age}` : `Blocks AI Search · ${age}`;
  }
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
    verdict === "pending" ? "pending" : verdict === "pass" ? `ready · ${age}` : `blocked · ${age}`;
  const label = "ai search";
  const colors = {
    ready: "#16a34a",
    blocked: "#dc2626",
    pending: "#57534e",
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${status}">
  <title>${label}: ${status}</title>
  <rect rx="3" width="${width}" height="20" fill="#3f3f46"/>
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

function pillBadge(verdict: Verdict | "pending", age: string): string {
  const pass = verdict === "pass" || verdict === "pending";
  const label =
    verdict === "pending"
      ? "AI Searchable · pending"
      : pass
        ? `AI Searchable · ${age}`
        : `Blocks AI Search · ${age}`;
  const bg = pass ? "#dcfce7" : "#fee2e2";
  const fg = pass ? "#166534" : "#991b1b";
  const icon = pass ? "✓" : "×";
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
  const status =
    verdict === "pending" ? "pending" : verdict === "pass" ? "ready" : "blocked";
  const label = `$ ai-search: ${status}`;
  const width = Math.round(Math.max(138, label.length * 7.4 + 28));
  const height = 24;
  const color = verdict === "fail" ? "#f87171" : "#4ade80";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(label)} · ${age}">
  <title>${escapeXml(label)} · ${age}</title>
  <rect width="${width}" height="${height}" rx="4" fill="#111827"/>
  <text x="12" y="16" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" fill="${color}">${escapeXml(label)}</text>
</svg>`;
}

function outlineBadge(verdict: Verdict | "pending", age: string): string {
  const pass = verdict !== "fail";
  const title = pass ? "AI Searchable" : "Blocks AI Search";
  const ageLabel = `· ${age}`;
  const width = Math.round(Math.max(148, title.length * 7.2 + ageLabel.length * 6.2 + 40));
  const height = 28;
  const dot = pass ? "#16a34a" : "#dc2626";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${title} ${ageLabel}">
  <title>${title} ${ageLabel}</title>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="6" fill="#ffffff" stroke="#d4d4d8"/>
  <circle cx="14" cy="14" r="4" fill="${dot}"/>
  <text x="26" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="#18181b">${escapeXml(title)}</text>
  <text x="${26 + title.length * 7.2 + 6}" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" fill="#71717a">${escapeXml(ageLabel)}</text>
</svg>`;
}

function toneFrom(verdict: Verdict | "pending"): "ready" | "blocked" | "pending" {
  if (verdict === "pending") return "pending";
  return verdict === "pass" ? "ready" : "blocked";
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
