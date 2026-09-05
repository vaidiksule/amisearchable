import { BRAND_MARK_ARC, BRAND_MARK_CHECK, BRAND_MARK_COLOR } from "@/lib/brand";

type BrandMarkProps = {
  className?: string;
  title?: string;
  arc?: "light" | "dark";
};

export function BrandMark({ className, title = "amisearchable", arc = "light" }: BrandMarkProps) {
  const arcColor = arc === "dark" ? "#059669" : BRAND_MARK_ARC;

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="64" height="64" rx="16" fill={BRAND_MARK_COLOR} />
      <path
        d="M16 33 L27 44 L48 20"
        stroke={BRAND_MARK_CHECK}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M48 10 A16 16 0 0 1 58 22"
        stroke={arcColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M48 2 A24 24 0 0 1 64 22"
        stroke={arcColor}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <BrandMark className="h-6 w-6 shrink-0" />
      <span className="font-mono text-sm text-foreground">
        amisearchable<span className="text-muted">.cc</span>
      </span>
    </span>
  );
}
