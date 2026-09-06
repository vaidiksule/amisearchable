import type { CitationSnapshot } from "@/lib/citations/types";
import { citationSummary } from "@/lib/citations/types";
import type { CheckResult } from "@/lib/crawlers";
import type {
  BadgeShowField,
  CompositeBadgeModel,
  EngineBadgeRow,
} from "@/lib/badge-svg";
import {
  PLATFORM_LABELS,
  isCitationComingSoon,
  platformVerdict,
  type Platform,
} from "@/lib/platforms";
import type { ScoreBreakdown } from "@/lib/score";

export function buildCompositeBadgeModel(input: {
  result: CheckResult;
  score: ScoreBreakdown;
  citations: CitationSnapshot | null;
  engines: Platform[];
  show: BadgeShowField[];
  style?: CompositeBadgeModel["style"];
}): CompositeBadgeModel {
  const { result, score, citations, engines, show, style } = input;
  const rows: EngineBadgeRow[] = engines.map((id) => {
    const verdict = platformVerdict(id, {
      robotsTxtFound: result.robotsTxtFound,
      crawlers: result.crawlers,
    });
    const cite = citationSummary(citations, id);
    return {
      id,
      label: PLATFORM_LABELS[id],
      verdict,
      score: score.platforms[id],
      citations: cite,
      comingSoon: isCitationComingSoon(id),
    };
  });

  return {
    checkedAt: result.checkedAt,
    overallVerdict: result.verdict,
    overallScore: score.total,
    overallCitations: citationSummary(citations, "all"),
    engines: rows,
    show: show.length > 0 ? show : ["ready"],
    style: style ?? "classic",
  };
}
