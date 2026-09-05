import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { StaticBadge } from "@/components/static-badge";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="inline-flex items-center gap-3 hover:text-foreground">
          <BrandMark className="h-5 w-5" />
          <StaticBadge verdict="pass" />
          <span>Built by Vaidik</span>
        </Link>
        <nav className="flex flex-wrap gap-4">
          <Link href="/guides" className="hover:text-foreground">
            Guides
          </Link>
          <Link href="/llms.txt" className="hover:text-foreground">
            llms.txt
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
        </nav>
      </div>
    </footer>
  );
}
