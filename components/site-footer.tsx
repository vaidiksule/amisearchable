import Link from "next/link";
import { StaticBadge } from "@/components/static-badge";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="inline-flex items-center gap-3 hover:text-foreground">
          <StaticBadge verdict="pass" />
          <span>Built by Vaidik</span>
        </Link>
        <p>Public robots.txt only.</p>
      </div>
    </footer>
  );
}
