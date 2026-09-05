import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm tracking-tight text-foreground">
          amisearchable.cc
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
