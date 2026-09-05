"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type NavLink = {
  href: string;
  label: string;
};

export function SiteNav({
  links,
  auth,
}: {
  links: NavLink[];
  auth: { kind: "guest" } | { kind: "user"; signOutAction: () => Promise<void> };
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative flex items-center gap-1 sm:gap-4">
      <ThemeToggle />

      <nav className="hidden items-center gap-5 text-sm text-muted sm:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-foreground">
            {link.label}
          </Link>
        ))}
        {auth.kind === "user" ? (
          <form action={auth.signOutAction}>
            <button type="submit" className="hover:text-foreground">
              Sign out
            </button>
          </form>
        ) : (
          <Link href="/login" className="hover:text-foreground">
            Sign in
          </Link>
        )}
      </nav>

      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-border/40 hover:text-foreground sm:hidden"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            id={menuId}
            className="absolute right-0 top-11 z-50 w-44 rounded-lg border border-border bg-surface p-2 shadow-lg sm:hidden"
          >
            <nav className="flex flex-col text-sm text-muted">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2.5 hover:bg-border/40 hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {auth.kind === "user" ? (
                <form action={auth.signOutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-md px-3 py-2.5 text-left hover:bg-border/40 hover:text-foreground"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2.5 hover:bg-border/40 hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
