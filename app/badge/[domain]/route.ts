import {
  parseBadgeEngines,
  parseBadgeShow,
  parseBadgeStyle,
  parseBadgeView,
  renderBadgeSvg,
  renderCompositeBadgeSvg,
} from "@/lib/badge-svg";
import { buildCompositeBadgeModel } from "@/lib/badge-model";
import { getLatestCitations } from "@/lib/citations/store";
import { citationSummary } from "@/lib/citations/types";
import { getOrCreateCheck } from "@/lib/checks";
import { normalizeDomain } from "@/lib/domain";
import { parsePlatform, platformVerdict } from "@/lib/platforms";
import { scoreFromCheck } from "@/lib/score";

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

  const params = new URL(request.url).searchParams;
  const style = parseBadgeStyle(params.get("style"));
  const showParam = params.get("show");
  const enginesParam = params.get("engines");
  const useComposite = showParam !== null || enginesParam !== null;

  const check = await getOrCreateCheck(domain);
  const score = scoreFromCheck(check);
  const citations = await getLatestCitations(domain);

  let svg: string;

  if (useComposite) {
    const show = parseBadgeShow(showParam);
    const engines = parseBadgeEngines(enginesParam);
    const model = buildCompositeBadgeModel({
      result: check,
      score,
      citations,
      engines,
      show,
    });
    svg = renderCompositeBadgeSvg(model);
  } else {
    const view = parseBadgeView(params.get("view"));
    const engine = parsePlatform(params.get("engine"));
    const verdict =
      engine === "all"
        ? check.verdict
        : platformVerdict(engine, {
            robotsTxtFound: check.robotsTxtFound,
            crawlers: check.crawlers,
          });
    const scoreValue = engine === "all" ? score.total : score.platforms[engine];
    svg = renderBadgeSvg({
      verdict,
      checkedAt: check.checkedAt,
      score: scoreValue,
      citations: citationSummary(citations, engine),
      view,
      engine,
      style,
    });
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
