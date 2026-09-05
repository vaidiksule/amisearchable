import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm text-foreground">
          amisearchable.cc
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <ThemeToggle />
          <Link href="/guides" className="hover:text-foreground">
            Guides
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <form action={signOut}>
                <button type="submit" className="hover:text-foreground">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
