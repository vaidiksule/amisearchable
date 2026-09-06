/**
 * Iconify icon ids + SVG bodies for badge embeds.
 * Source: https://iconify.design / https://api.iconify.design
 * Bodies are embedded so standalone badge SVGs work without external fetches
 * (GitHub/CDN image proxies often strip remote <image> hrefs).
 */
import type { Platform } from "@/lib/platforms";

export type IconifyId = `${string}:${string}`;

export type MetricIconKey = "overall" | "ready" | "score" | "age" | "cited";

export const PLATFORM_ICONIFY: Record<Platform, IconifyId> = {
  chatgpt: "simple-icons:openai",
  gemini: "simple-icons:googlegemini",
  grok: "bxl:grok",
  claude: "simple-icons:anthropic",
  perplexity: "simple-icons:perplexity",
};

/** Metric / summary icons for show toggles and overall capsule. */
export const METRIC_ICONIFY: Record<MetricIconKey, IconifyId> = {
  overall: "mdi:shield-check",
  ready: "mdi:check-bold",
  score: "mdi:speedometer",
  age: "mdi:clock-outline",
  cited: "mdi:comment-quote-outline",
};

/** Public Iconify SVG URL (UI embeds — not stored in the repo). */
export function iconifyCdnUrl(
  id: IconifyId,
  opts: { color?: string; width?: number; height?: number } = {},
): string {
  const [prefix, name] = id.split(":") as [string, string];
  const params = new URLSearchParams();
  if (opts.color) params.set("color", opts.color);
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  const qs = params.toString();
  return `https://api.iconify.design/${prefix}/${name}.svg${qs ? `?${qs}` : ""}`;
}

type IconBody = { body: string; width: number; height: number };

/** ViewBox 24 bodies from Iconify API (simple-icons / mdi / bxl). */
const ICON_BODIES: Record<string, IconBody> = {
  "simple-icons:openai": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="M22.282 9.821a6 6 0 0 0-.516-4.91a6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9a6.05 6.05 0 0 0 .743 7.097a5.98 5.98 0 0 0 .51 4.911a6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206a6 6 0 0 0 3.997-2.9a6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081l4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085l4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354l-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023l-.141-.085l-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365l2.602-1.5l2.607 1.5v2.999l-2.597 1.5l-2.607-1.5Z"/>`,
  },
  "simple-icons:googlegemini": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68q.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58a12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68q-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96q2.19.93 3.81 2.55t2.55 3.81"/>`,
  },
  "simple-icons:anthropic": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="M17.304 3.541h-3.672l6.696 16.918H24Zm-10.608 0L0 20.459h3.744l1.37-3.553h7.005l1.369 3.553h3.744L10.536 3.541Zm-.371 10.223L8.616 7.82l2.291 5.945Z"/>`,
  },
  "simple-icons:perplexity": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="M22.398 7.09h-2.31V.068l-7.51 6.354V.158h-1.156v6.196L4.49 0v7.09H1.602v10.397H4.49V24l6.933-6.36v6.201h1.155v-6.047l6.932 6.181v-6.488h2.888zm-3.466-4.531v4.53h-5.355zm-13.286.067l4.869 4.464h-4.87zM2.758 16.332V8.245h7.847L4.49 14.36v1.972zm2.888 5.04v-6.534l5.776-5.776v7.011zm12.708.025l-5.776-5.15V9.061l5.776 5.776zm2.889-5.065H19.51V14.36l-6.115-6.115h7.848z"/>`,
  },
  "bxl:grok": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="m19.25 5.08l-9.52 9.67l6.64-4.96c.33-.24.79-.15.95.23c.82 1.99.45 4.39-1.17 6.03c-1.63 1.64-3.89 2.01-5.96 1.18l-2.26 1.06c3.24 2.24 7.18 1.69 9.64-.8c1.95-1.97 2.56-4.66 1.99-7.09c-.82-3.56.2-4.98 2.29-7.89L22 2.3zm-9.53 9.67h.01zm-1.37 1.21c-2.33-2.25-1.92-5.72.06-7.73c1.47-1.48 3.87-2.09 5.97-1.2l2.25-1.05c-.41-.3-.93-.62-1.52-.84a7.45 7.45 0 0 0-8.13 1.65c-2.11 2.14-2.78 5.42-1.63 8.22c.85 2.09-.54 3.57-1.95 5.07c-.5.53-1 1.06-1.4 1.62z"/>`,
  },
  "mdi:check-bold": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="m9 20.42l-6.21-6.21l2.83-2.83L9 14.77l9.88-9.89l2.83 2.83z"/>`,
  },
  "mdi:speedometer": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="M12 16a3 3 0 0 1-3-3c0-1.12.61-2.1 1.5-2.61l9.71-5.62l-5.53 9.58c-.5.98-1.51 1.65-2.68 1.65m0-13c1.81 0 3.5.5 4.97 1.32l-2.1 1.21C14 5.19 13 5 12 5a8 8 0 0 0-8 8c0 2.21.89 4.21 2.34 5.65h.01c.39.39.39 1.02 0 1.41s-1.03.39-1.42.01A9.97 9.97 0 0 1 2 13A10 10 0 0 1 12 3m10 10c0 2.76-1.12 5.26-2.93 7.07c-.39.38-1.02.38-1.41-.01a.996.996 0 0 1 0-1.41A7.95 7.95 0 0 0 20 13c0-1-.19-2-.54-2.9L20.67 8C21.5 9.5 22 11.18 22 13"/>`,
  },
  "mdi:clock-outline": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z"/>`,
  },
  "mdi:comment-quote-outline": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="M9 22c-.6 0-1-.4-1-1v-3H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-6.1l-3.7 3.7c-.2.2-.4.3-.7.3zm1-6v3.1l3.1-3.1H20V4H4v12zm6.3-10l-1.4 3H17v4h-4V8.8L14.3 6zm-6 0L8.9 9H11v4H7V8.8L8.3 6z"/>`,
  },
  "mdi:shield-check": {
    width: 24,
    height: 24,
    body: `<path fill="currentColor" d="m10 17l-4-4l1.41-1.41L10 14.17l6.59-6.59L18 9m-6-8L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5z"/>`,
  },
};

/** Inline Iconify glyph for badge SVGs (scaled into a square). */
export function iconifyGlyph(
  id: IconifyId,
  opts: { size?: number; color?: string; x?: number; y?: number } = {},
): string {
  const size = opts.size ?? 12;
  const color = opts.color ?? "#ffffff";
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;
  const icon = ICON_BODIES[id];
  if (!icon) {
    return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 3}" fill="${color}"/>`;
  }
  const sx = size / icon.width;
  const sy = size / icon.height;
  const body = icon.body.replaceAll("currentColor", color);
  return `<g transform="translate(${x} ${y}) scale(${sx} ${sy})">${body}</g>`;
}

export function platformIconify(platform: Platform): IconifyId {
  return PLATFORM_ICONIFY[platform];
}

export function metricIconify(field: MetricIconKey): IconifyId {
  return METRIC_ICONIFY[field];
}
