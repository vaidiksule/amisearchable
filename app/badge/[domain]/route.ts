import { renderBadgeSvg } from "@/lib/badge-svg";
import { normalizeDomain } from "@/lib/domain";

export async function GET(
  _request: Request,
  context: RouteContext<"/badge/[domain]">,
) {
  const raw = decodeURIComponent((await context.params).domain);
  const domain = normalizeDomain(raw);

  if (!domain) {
    return new Response("Invalid domain", { status: 400 });
  }

  const svg = renderBadgeSvg("AI Searchable", "pending", "pending");

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
