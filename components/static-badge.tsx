import { badgeDataUri, badgeLabel, type BadgeModel } from "@/lib/badge-svg";

export function StaticBadge({
  className = "h-5",
  ...model
}: BadgeModel & { className?: string }) {
  const alt =
    model.verdict === "pending" ? "AI Searchable pending" : badgeLabel(model);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={badgeDataUri(model)} alt={alt} className={className} />
  );
}
