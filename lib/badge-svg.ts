export function renderBadgeSvg(label: string, status: string, tone: "ready" | "blocked" | "pending" = "pending"): string {
  const colors = {
    ready: "#166534",
    blocked: "#9a3412",
    pending: "#3f3f46",
  };
  const statusWidth = Math.max(72, status.length * 7.2 + 20);
  const labelWidth = Math.max(88, label.length * 6.6 + 20);
  const width = labelWidth + statusWidth;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${status}">
  <title>${label}: ${status}</title>
  <rect width="${labelWidth}" height="20" fill="#27272a"/>
  <rect x="${labelWidth}" width="${statusWidth}" height="20" fill="${colors[tone]}"/>
  <rect width="${width}" height="20" fill="url(#s)" rx="3"/>
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
