import type { Verdict } from "@/lib/crawlers";
import {
  PLATFORM_LABELS,
  PLATFORMS,
  type Platform,
} from "@/lib/platforms";
import { scoreTone } from "@/lib/score";
import { formatBadgeAge } from "@/lib/time";

export const BADGE_STYLES = ["shield", "pill", "terminal", "outline"] as const;
export type BadgeStyle = (typeof BADGE_STYLES)[number];

/** Layouts for the multi-engine composite badge. */
export const COMPOSITE_STYLES = ["classic", "compact", "mono"] as const;
export type CompositeStyle = (typeof COMPOSITE_STYLES)[number];

export const COMPOSITE_STYLE_LABELS: Record<CompositeStyle, string> = {
  classic: "Classic shields",
  compact: "Single shield",
  mono: "Dark panel",
};

export const BADGE_VIEWS = ["ready", "score", "age", "cited"] as const;
export type BadgeView = (typeof BADGE_VIEWS)[number];

export const BADGE_SHOW_FIELDS = ["ready", "score", "age", "cited"] as const;
export type BadgeShowField = (typeof BADGE_SHOW_FIELDS)[number];

/** Bump when badge artwork changes so browsers/CDNs drop stale SVGs. */
export const BADGE_ASSET_VERSION = "8";

export const BADGE_SHOW_LABELS: Record<BadgeShowField, string> = {
  ready: "Ready",
  score: "Score",
  age: "Last searched",
  cited: "Cited",
};

export type EngineBadgeRow = {
  id: Platform;
  label: string;
  verdict: Verdict | "pending";
  score: number;
  citations: { hits: number; probes: number } | null;
  comingSoon?: boolean;
};

export type CompositeBadgeModel = {
  checkedAt?: string;
  overallVerdict: Verdict | "pending";
  overallScore: number;
  overallCitations: { hits: number; probes: number } | null;
  /** When true, render the bordered “ai search” summary capsule. */
  includeOverall: boolean;
  engines: EngineBadgeRow[];
  show: BadgeShowField[];
  style?: CompositeStyle;
};

/** Legacy single-metric badge model (still used for homepage StaticBadge demos). */
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

export function parseCompositeStyle(value: string | null | undefined): CompositeStyle {
  if (value && (COMPOSITE_STYLES as readonly string[]).includes(value)) {
    return value as CompositeStyle;
  }
  // Legacy shield/pill map onto composite layouts.
  if (value === "terminal") return "mono";
  if (value === "pill" || value === "outline") return "compact";
  return "classic";
}

export function parseBadgeView(value: string | null | undefined): BadgeView {
  if (value && (BADGE_VIEWS as readonly string[]).includes(value)) {
    return value as BadgeView;
  }
  return "ready";
}

export function parseBadgeShow(value: string | null | undefined): BadgeShowField[] {
  if (!value?.trim()) return ["ready"];
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is BadgeShowField =>
      (BADGE_SHOW_FIELDS as readonly string[]).includes(part),
    );
  return parts.length > 0 ? parts : ["ready"];
}

export function parseBadgeEngines(value: string | null | undefined): Platform[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is Platform => (PLATFORMS as readonly string[]).includes(part));
}

export function renderCompositeBadgeSvg(model: CompositeBadgeModel): string {
  const style = model.style ?? "classic";
  if (style === "mono") return renderMonoComposite(model);
  if (style === "compact") return renderCompactComposite(model);
  return renderClassicComposite(model);
}

export function compositeBadgeLabel(model: CompositeBadgeModel): string {
  const showOverall = model.includeOverall || model.engines.length === 0;
  if (showOverall) {
    const summary = metricParts(
      model.overallVerdict,
      model.overallScore,
      model.overallCitations,
      model.show,
      model.checkedAt,
      false,
    ).join(" · ");
    const engines =
      model.engines.length > 0
        ? ` + ${model.engines.map((row) => PLATFORM_LABELS[row.id]).join(", ")}`
        : "";
    return `AI Searchable: ${summary}${engines}`;
  }
  const bits = model.engines.map((row) => {
    const metrics = metricParts(
      row.verdict,
      row.score,
      row.citations,
      model.show.filter((field) => field !== "age"),
      model.checkedAt,
      Boolean(row.comingSoon),
    ).join(" · ");
    return `${PLATFORM_LABELS[row.id]} ${metrics}`;
  });
  return `AI Searchable: ${bits.join("; ")}`;
}

export function compositeBadgeDataUri(model: CompositeBadgeModel): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(renderCompositeBadgeSvg(model))}`;
}

/** Classic shields — optional bordered overall + engine rows. */
function renderClassicComposite(model: CompositeBadgeModel): string {
  const show = model.show.length > 0 ? model.show : (["ready"] as BadgeShowField[]);
  const lines: { label: string; status: string; tone: Tone; overall?: boolean }[] = [];

  if (model.includeOverall || model.engines.length === 0) {
    lines.push({
      label: "ai search",
      status: metricParts(
        model.overallVerdict,
        model.overallScore,
        model.overallCitations,
        show,
        model.checkedAt,
        false,
      ).join(" · "),
      tone: toneFrom(model.overallVerdict),
      overall: true,
    });
  }

  for (const row of model.engines) {
    lines.push({
      label: shortEngine(row.id),
      status: metricParts(
        row.verdict,
        row.score,
        row.citations,
        show.filter((field) => field !== "age"),
        model.checkedAt,
        Boolean(row.comingSoon),
      ).join(" · "),
      tone:
        row.comingSoon && show.includes("cited") && show.length === 1
          ? ("pending" as Tone)
          : toneFrom(row.verdict),
    });
  }

  if (lines.length === 0) {
    lines.push({
      label: "ai search",
      status: "pending",
      tone: "pending",
      overall: true,
    });
  }

  const gap = 6;
  const rowH = 20;
  const borderPad = 3;
  const parts = lines.map((line) => measureShield(line.label, line.status || "—"));
  const innerWidth = Math.max(...parts.map((part) => part.width));
  const width = innerWidth + (lines.some((line) => line.overall) ? borderPad * 2 : 0);

  let y = 0;
  const bodyParts: string[] = [];
  for (const line of lines) {
    if (line.overall) {
      const boxH = rowH + borderPad * 2;
      bodyParts.push(`
  <g transform="translate(0 ${y})">
    <rect x="0.5" y="0.5" width="${width - 1}" height="${boxH - 1}" rx="5" fill="none" stroke="#161412" stroke-width="1.5"/>
    <g transform="translate(${borderPad} ${borderPad})">${shieldBadgeInner(line.label, line.status || "—", line.tone, innerWidth)}</g>
  </g>`);
      y += boxH + gap;
    } else {
      const x = lines.some((l) => l.overall) ? borderPad : 0;
      bodyParts.push(
        `<g transform="translate(${x} ${y})">${shieldBadgeInner(line.label, line.status || "—", line.tone, innerWidth)}</g>`,
      );
      y += rowH + gap;
    }
  }

  const height = Math.max(rowH, y - gap);
  const aria = lines.map((line) => `${line.label}: ${line.status}`).join("; ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(aria)}">
  <title>${escapeXml(aria)}</title>
  ${bodyParts.join("\n")}
</svg>`;
}

/** One classic shield — single engine, or bordered overall. */
function renderCompactComposite(model: CompositeBadgeModel): string {
  const show = model.show.length > 0 ? model.show : (["ready"] as BadgeShowField[]);

  if (model.engines.length >= 1 && !model.includeOverall) {
    if (model.engines.length > 1) return renderClassicComposite(model);
    const row = model.engines[0]!;
    const status = metricParts(
      row.verdict,
      row.score,
      row.citations,
      show.filter((field) => field !== "age"),
      model.checkedAt,
      Boolean(row.comingSoon),
    ).join(" · ");
    return shieldBadge(shortEngine(row.id), status || readyWord(row.verdict), toneFrom(row.verdict));
  }

  const status = metricParts(
    model.overallVerdict,
    model.overallScore,
    model.overallCitations,
    show,
    model.checkedAt,
    false,
  ).join(" · ");
  const measured = measureShield("ai search", status || readyWord(model.overallVerdict));
  const pad = 3;
  const width = measured.width + pad * 2;
  const height = 20 + pad * 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="ai search: ${escapeXml(status)}">
  <title>ai search: ${escapeXml(status)}</title>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="5" fill="none" stroke="#161412" stroke-width="1.5"/>
  <g transform="translate(${pad} ${pad})">${shieldBadgeInner("ai search", status || readyWord(model.overallVerdict), toneFrom(model.overallVerdict), measured.width)}</g>
</svg>`;
}

function renderMonoComposite(model: CompositeBadgeModel): string {
  const show = model.show.length > 0 ? model.show : (["ready"] as BadgeShowField[]);
  const rows = model.engines;
  const showOverall = model.includeOverall || rows.length === 0;
  const tone = worstTone([
    ...(showOverall ? [toneFrom(model.overallVerdict)] : []),
    ...rows.map((row) => toneFrom(row.verdict)),
  ]);
  const headerRight = metricParts(
    model.overallVerdict,
    model.overallScore,
    model.overallCitations,
    show,
    model.checkedAt,
    false,
  ).join(" · ");
  const rowH = 18;
  const padX = 12;
  const headerH = showOverall ? 28 : 0;
  const height = (showOverall ? headerH : 8) + (rows.length > 0 ? 6 + rows.length * rowH + 6 : 6);
  const labelCol = Math.max(64, ...rows.map((row) => shortEngine(row.id).length * 7 + 4), 72);
  const metricsWidth = Math.max(
    100,
    headerRight.length * 6.5 + 12,
    ...rows.map(
      (row) =>
        metricParts(
          row.verdict,
          row.score,
          row.citations,
          show.filter((field) => field !== "age"),
          model.checkedAt,
          Boolean(row.comingSoon),
        ).join(" · ").length *
          6.3 +
        12,
    ),
  );
  const width = Math.round(padX * 2 + labelCol + 12 + metricsWidth);
  const colors = toneColors(tone);

  const rowsSvg = rows
    .map((row, index) => {
      const y = (showOverall ? headerH : 8) + 6 + index * rowH + 13;
      const metrics = metricParts(
        row.verdict,
        row.score,
        row.citations,
        show.filter((field) => field !== "age"),
        model.checkedAt,
        Boolean(row.comingSoon),
      ).join(" · ");
      return `
  <text x="${padX}" y="${y}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="#e7e5e4">${escapeXml(shortEngine(row.id))}</text>
  <text x="${padX + labelCol + 12}" y="${y}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="${toneColors(toneFrom(row.verdict)).fg}">${escapeXml(metrics)}</text>`;
    })
    .join("");

  const overallBlock = showOverall
    ? `
  <rect x="6" y="4" width="${width - 12}" height="22" rx="4" fill="none" stroke="#a8a29e" stroke-width="1"/>
  <text x="${padX}" y="19" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" font-weight="600" fill="#fafaf9">ai search</text>
  <text x="${width - padX}" y="19" text-anchor="end" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="${colors.fg}">${escapeXml(headerRight)}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="ai search: ${escapeXml(headerRight)}">
  <title>ai search: ${escapeXml(headerRight)}</title>
  <rect width="${width}" height="${height}" rx="6" fill="#18181b"/>
  <rect x="0" y="0" width="4" height="${height}" fill="${colors.bar}"/>
  ${overallBlock}
  ${rows.length > 0 && showOverall ? `<line x1="${padX}" y1="${headerH}" x2="${width - padX}" y2="${headerH}" stroke="#3f3f46"/>` : ""}
  ${rowsSvg}
</svg>`;
}

function metricParts(
  verdict: Verdict | "pending",
  score: number,
  citations: { hits: number; probes: number } | null,
  show: BadgeShowField[],
  checkedAt: string | undefined,
  comingSoon: boolean,
): string[] {
  const parts: string[] = [];
  if (show.includes("ready")) parts.push(readyWord(verdict));
  if (show.includes("score")) parts.push(`${score}/100`);
  if (show.includes("age")) parts.push(formatBadgeAge(checkedAt));
  if (show.includes("cited")) {
    if (comingSoon) parts.push("cited soon");
    else if (citations && citations.probes > 0) parts.push(`cited ${citations.hits}/${citations.probes}`);
    else parts.push("cited pending");
  }
  return parts;
}

function measureShield(label: string, status: string): { width: number; labelWidth: number; statusWidth: number } {
  const markBlock = 20;
  const statusWidth = Math.round(Math.max(78, status.length * 6.5 + 18));
  const labelWidth = Math.round(Math.max(78, label.length * 6.4 + 16 + markBlock));
  return { width: labelWidth + statusWidth, labelWidth, statusWidth };
}

function shieldBadgeInner(label: string, status: string, tone: Tone, totalWidth: number): string {
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
  const measured = measureShield(label, status);
  const labelWidth = measured.labelWidth;
  const statusWidth = totalWidth - labelWidth;
  const markSize = 14;
  const markPad = 3;
  const markBlock = markSize + markPad * 2;
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

  return `
  <rect rx="3" width="${totalWidth}" height="20" fill="#3f3f46"/>
  <rect rx="3" x="${labelWidth}" width="${statusWidth}" height="20" fill="${colors[tone]}"/>
  <rect x="${labelWidth}" width="4" height="20" fill="${colors[tone]}"/>
  <g transform="translate(${markX} ${markY})">
    <rect width="${markSize}" height="${markSize}" rx="3.5" fill="${markFill[tone]}"/>
    ${markIcon}
  </g>
  <g fill="#fff" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">
    <text x="${textX}" y="14">${escapeXml(label)}</text>
    <text x="${labelWidth + statusWidth / 2}" y="14">${escapeXml(status)}</text>
  </g>`;
}

export function renderBadgeSvg(model: BadgeModel): string {
  const style = model.style ?? "shield";
  const view = model.view ?? "ready";
  const { label, value, tone } = resolveBadgeCopy(model, view);

  switch (style) {
    case "pill":
      return pillBadge(label, value, tone);
    case "terminal":
      return terminalBadge(label, value, tone);
    case "outline":
      return outlineBadge(label, value, tone);
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

function readyWord(verdict: Verdict | "pending"): string {
  if (verdict === "pass") return "ready";
  if (verdict === "unclear") return "unclear";
  if (verdict === "pending") return "pending";
  return "blocked";
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

  const tone = toneFrom(model.verdict);
  const value = readyWord(model.verdict);
  return {
    label: `${enginePrefix}ai search`.trim(),
    value:
      view === "ready" && model.checkedAt
        ? `${value} · ${formatBadgeAge(model.checkedAt)}`
        : value,
    tone,
  };
}

function shortEngine(engine: Platform): string {
  if (engine === "chatgpt") return "openai";
  if (engine === "claude") return "anthropic";
  if (engine === "perplexity") return "pplx";
  if (engine === "gemini") return "gemini";
  return engine;
}

type Tone = "ready" | "blocked" | "unclear" | "pending";

function toneFrom(verdict: Verdict | "pending"): Tone {
  if (verdict === "pending") return "pending";
  if (verdict === "unclear") return "unclear";
  return verdict === "pass" ? "ready" : "blocked";
}

function worstTone(tones: Tone[]): Tone {
  if (tones.includes("blocked")) return "blocked";
  if (tones.includes("unclear")) return "unclear";
  if (tones.includes("pending")) return "pending";
  return "ready";
}

function toneColors(tone: Tone): { bar: string; fg: string } {
  if (tone === "blocked") return { bar: "#dc2626", fg: "#fca5a5" };
  if (tone === "unclear") return { bar: "#ca8a04", fg: "#fde047" };
  if (tone === "pending") return { bar: "#57534e", fg: "#a8a29e" };
  return { bar: "#16a34a", fg: "#86efac" };
}

function toneIcon(tone: Tone): string {
  if (tone === "blocked") return "×";
  if (tone === "unclear") return "●";
  if (tone === "pending") return "…";
  return "✓";
}

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

function pillBadge(label: string, value: string, tone: Tone): string {
  const text = `${label} ${value}`;
  const bg =
    tone === "unclear"
      ? "#fef9c3"
      : tone === "blocked"
        ? "#fee2e2"
        : tone === "pending"
          ? "#f5f5f4"
          : "#dcfce7";
  const fg =
    tone === "unclear"
      ? "#854d0e"
      : tone === "blocked"
        ? "#991b1b"
        : tone === "pending"
          ? "#57534e"
          : "#166534";
  const icon = toneIcon(tone);
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

function terminalBadge(label: string, value: string, tone: Tone): string {
  const text = `$ ${label}: ${value}`;
  const width = Math.round(Math.max(138, text.length * 7.4 + 28));
  const height = 24;
  const color = toneColors(tone).fg;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(text)}">
  <title>${escapeXml(text)}</title>
  <rect width="${width}" height="${height}" rx="4" fill="#111827"/>
  <text x="12" y="16" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" fill="${color}">${escapeXml(text)}</text>
</svg>`;
}

function outlineBadge(label: string, value: string, tone: Tone): string {
  const title = label;
  const valueLabel = `· ${value}`;
  const width = Math.round(Math.max(148, title.length * 7.2 + valueLabel.length * 6.2 + 40));
  const height = 28;
  const dot = toneColors(tone).bar;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)} ${escapeXml(valueLabel)}">
  <title>${escapeXml(title)} ${escapeXml(valueLabel)}</title>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="6" fill="#ffffff" stroke="#d4d4d8"/>
  <circle cx="14" cy="14" r="4" fill="${dot}"/>
  <text x="26" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="600" fill="#18181b">${escapeXml(title)}</text>
  <text x="${26 + title.length * 7.2 + 6}" y="18" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" fill="#71717a">${escapeXml(valueLabel)}</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
