import { parseBadgeStyle, renderBadgeSvg } from "@/lib/badge-svg";
import { getOrCreateCheck } from "@/lib/checks";
import { normalizeDomain } from "@/lib/domain";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/badge/[domain]">,
) {
  const raw = decodeURIComponent((await context.params).domain);
  const domain = normalizeDomain(raw);

  if (!domain) {
    return new Response("Invalid domain", { status: 400 });
  }

  const style = parseBadgeStyle(new URL(request.url).searchParams.get("style"));
  const check = await getOrCreateCheck(domain);
  const svg = renderBadgeSvg(check.verdict, check.checkedAt, style);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
