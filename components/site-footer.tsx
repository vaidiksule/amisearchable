import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { StaticBadge } from "@/components/static-badge";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex flex-wrap items-center gap-x-3 gap-y-2 hover:text-foreground"
        >
          <BrandMark className="h-5 w-5 shrink-0" />
          <StaticBadge verdict="pass" className="h-5" />
          <span>Built by Vaidik</span>
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/guides" className="hover:text-foreground">
            Guides
          </Link>
          <a href="/llms.txt" className="hover:text-foreground">
            llms.txt
          </a>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
        </nav>
      </div>
    </footer>
  );
}
