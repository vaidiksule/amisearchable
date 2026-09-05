import { badgeDataUri, badgeLabel, type BadgeStyle } from "@/lib/badge-svg";
import type { Verdict } from "@/lib/crawlers";

export function StaticBadge({
  verdict,
  checkedAt,
  style = "shield",
  className = "h-5",
}: {
  verdict: Verdict | "pending";
  checkedAt?: string;
  style?: BadgeStyle;
  className?: string;
}) {
  const alt =
    verdict === "pending" ? "AI Searchable pending" : badgeLabel(verdict, checkedAt, style);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={badgeDataUri(verdict, checkedAt, style)} alt={alt} className={className} />
  );
}
