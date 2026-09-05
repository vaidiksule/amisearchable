import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { BrandLogo } from "@/components/brand-mark";
import { SiteNav } from "@/components/site-nav";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  const links = [
    { href: "/guides", label: "Guides" },
    { href: "/pricing", label: "Pricing" },
    ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="min-w-0 shrink hover:opacity-90">
          <BrandLogo />
        </Link>
        <SiteNav
          links={links}
          auth={user ? { kind: "user", signOutAction: signOut } : { kind: "guest" }}
        />
      </div>
    </header>
  );
}
