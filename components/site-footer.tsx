import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Check if AI crawlers can see your site.</p>
        <p>
          Built by{" "}
          <Link href="/" className="font-mono text-foreground hover:underline">
            Vaidik
          </Link>
        </p>
      </div>
    </footer>
  );
}
