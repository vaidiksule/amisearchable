export const BRAND_MARK_COLOR = "#34D399";
export const BRAND_MARK_CHECK = "#0B0D10";
export const BRAND_MARK_ARC = "#A7F3D0";
export const BRAND_MARK_ARC_MUTED = "#059669";

/** Compact mark for inline SVG (favicon, badge left tile, header). */
export function brandMarkSvg(opts?: {
  size?: number;
  id?: string;
  arc?: "light" | "dark";
}): string {
  const size = opts?.size ?? 64;
  const arc = opts?.arc === "dark" ? BRAND_MARK_ARC_MUTED : BRAND_MARK_ARC;
  const id = opts?.id ? ` id="${opts.id}"` : "";
  return `<svg${id} xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" role="img" aria-hidden="true">
  <rect width="64" height="64" rx="16" fill="${BRAND_MARK_COLOR}"/>
  <path d="M16 33 L27 44 L48 20" stroke="${BRAND_MARK_CHECK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M48 10 A16 16 0 0 1 58 22" stroke="${arc}" stroke-width="3" stroke-linecap="round"/>
  <path d="M48 2 A24 24 0 0 1 64 22" stroke="${arc}" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
</svg>`;
}
