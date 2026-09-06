import type { Verdict } from "@/lib/crawlers";
import type { Platform } from "@/lib/platforms";
import { scoreTone } from "@/lib/score";
import { formatBadgeAge } from "@/lib/time";

export const BADGE_STYLES = ["shield", "pill", "terminal", "outline"] as const;
export type BadgeStyle = (typeof BADGE_STYLES)[number];

export const BADGE_VIEWS = ["ready", "score", "age", "cited"] as const;
export type BadgeView = (typeof BADGE_VIEWS)[number];

/** Bump when badge artwork changes so browsers/CDNs drop stale SVGs. */
export const BADGE_ASSET_VERSION = "4";

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

export type BadgeModel = {
  verdict: Verdict | "pending";
  checkedAt?: string;
  score?: number;
  citations?: { hits: number; probes: number } | null;
  view?: BadgeView;
  engine?: Platform | "all";
  style?: BadgeStyle;
};

export function parseBadgeStyle(value: string | null | undefined): BadgeStyle {
  if (value && (BADGE_STYLES as readonly string[]).includes(value)) {
    return value as BadgeStyle;
  }
  return "shield";
}

export function parseBadgeView(value: string | null | undefined): BadgeView {
  if (value && (BADGE_VIEWS as readonly string[]).includes(value)) {
    return value as BadgeView;
  }
  return "ready";
}

export function renderBadgeSvg(model: BadgeModel): string {
  const style = model.style ?? "shield";
  const view = model.view ?? "ready";
  const { label, value, tone } = resolveBadgeCopy(model, view);
  const age = formatBadgeAge(model.checkedAt);

  switch (style) {
    case "pill":
      return pillBadge(label, value, tone, age);
    case "terminal":
      return terminalBadge(label, value, tone, age);
    case "outline":
      return outlineBadge(label, value, tone, age);
    default:
      return shieldBadge(label, value, tone);
  }
}

export function badgeLabel(model: BadgeModel): string {
  const view = model.view ?? "ready";
  const { label, value } = resolveBadgeCopy(model, view);
  return `${label}: ${value}`;
}

export function badgeDataUri(model: BadgeModel): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(renderBadgeSvg(model))}`;
}

function resolveBadgeCopy(
  model: BadgeModel,
  view: BadgeView,
): { label: string; value: string; tone: Tone } {
  const enginePrefix =
    model.engine && model.engine !== "all" ? `${shortEngine(model.engine)} ` : "";

  if (view === "score") {
    const score = model.score ?? 0;
    return {
      label: `${enginePrefix}ai score`.trim(),
      value: `${score}/100`,
      tone: scoreTone(score),
    };
  }

  if (view === "age") {
    return {
      label: `${enginePrefix}last search`.trim(),
      value: formatBadgeAge(model.checkedAt),
      tone: toneFrom(model.verdict),
    };
  }

  if (view === "cited") {
    const c = model.citations;
    if (!c || c.probes === 0) {
      return {
        label: `${enginePrefix}cited`.trim(),
        value: "pending",
        tone: "pending",
      };
    }
    return {
      label: `${enginePrefix}cited`.trim(),
      value: `${c.hits}/${c.probes}`,
      tone: c.hits > 0 ? "ready" : "blocked",
    };
  }

  // ready
  const tone = toneFrom(model.verdict);
  const value =
    tone === "unclear"
      ? "unclear"
      : tone === "pending"
        ? "pending"
        : tone === "ready"
          ? "ready"
          : "blocked";
  return {
    label: `${enginePrefix}ai search`.trim(),
    value: view === "ready" && model.checkedAt ? `${value} · ${formatBadgeAge(model.checkedAt)}` : value,
    tone,
  };
}

function shortEngine(engine: Platform): string {
  if (engine === "chatgpt") return "gpt";
  if (engine === "perplexity") return "pplx";
  if (engine === "gemini") return "gem";
  return engine;
}

type Tone = "ready" | "blocked" | "unclear" | "pending";

function shieldBadge(label: string, status: string, tone: Tone): string {
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
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${escapeXml(label)}: ${escapeXml(status)}">
  <title>${escapeXml(label)}: ${escapeXml(status)}</title>
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

function pillBadge(label: string, value: string, tone: Tone, _age: string): string {
  const text = `${label} ${value}`;
  const bg =
    tone === "unclear" ? "#fef9c3" : tone === "blocked" ? "#fee2e2" : tone === "pending" ? "#f5f5f4" : "#dcfce7";
  const fg =
    tone === "unclear" ? "#854d0e" : tone === "blocked" ? "#991b1b" : tone === "pending" ? "#57534e" : "#166534";
  const icon = tone === "blocked" ? "×" : tone === "unclear" ? "●" : tone === "pending" ? "…" : "✓";
  const width = Math.round(Math.max(128, text.length * 7.1 + 42));
  const height = 24;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(text)}">
  <title>${escapeXml(text)}</title>
  <rect width="${width}" height="${height}" rx="12" fill="${bg}"/>
  <text x="14" y="16" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="${fg}">${icon}</text>
  <text x="30" y="16" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="${fg}">${escapeXml(text)}</text>
</svg>`;
}

function terminalBadge(label: string, value: string, tone: Tone, age: string): string {
  const text = `$ ${label}: ${value}`;
  const width = Math.round(Math.max(138, text.length * 7.4 + 28));
  const height = 24;
  const color =
    tone === "blocked" ? "#f87171" : tone === "unclear" ? "#facc15" : tone === "pending" ? "#a8a29e" : "#4ade80";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(text)} · ${age}">
  <title>${escapeXml(text)} · ${age}</title>
  <rect width="${width}" height="${height}" rx="4" fill="#111827"/>
  <text x="12" y="16" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" fill="${color}">${escapeXml(text)}</text>
</svg>`;
}

function outlineBadge(label: string, value: string, tone: Tone, _age: string): string {
  const title = label;
  const valueLabel = `· ${value}`;
  const width = Math.round(Math.max(148, title.length * 7.2 + valueLabel.length * 6.2 + 40));
  const height = 28;
  const dot =
    tone === "unclear" ? "#ca8a04" : tone === "blocked" ? "#dc2626" : tone === "pending" ? "#a8a29e" : "#16a34a";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)} ${escapeXml(valueLabel)}">
  <title>${escapeXml(title)} ${escapeXml(valueLabel)}</title>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="6" fill="#ffffff" stroke="#d4d4d8"/>
  <circle cx="14" cy="14" r="4" fill="${dot}"/>
  <text x="26" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="#18181b">${escapeXml(title)}</text>
  <text x="${26 + title.length * 7.2 + 6}" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" fill="#71717a">${escapeXml(valueLabel)}</text>
</svg>`;
}

function toneFrom(verdict: Verdict | "pending"): Tone {
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
