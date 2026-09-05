import { badgeDataUri, badgeLabel } from "@/lib/badge-svg";
import type { Verdict } from "@/lib/crawlers";

export function StaticBadge({
  verdict,
  checkedAt,
  className = "h-5",
}: {
  verdict: Verdict | "pending";
  checkedAt?: string;
  className?: string;
}) {
  const alt = verdict === "pending" ? "AI Searchable pending" : badgeLabel(verdict, checkedAt);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={badgeDataUri(verdict, checkedAt)} alt={alt} className={className} />
  );
}
