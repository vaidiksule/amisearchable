import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { DomainForm } from "@/components/domain-form";
import { PageFrame } from "@/components/page-frame";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <PageFrame>
      <div className="flex items-center gap-3">
        <BrandMark className="h-8 w-8" />
        <p className="font-mono text-sm text-muted">404</p>
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        That URL isn’t here. Check a domain for AI crawler access, or head back home.
      </p>
      <div className="mt-8">
        <DomainForm />
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="underline underline-offset-4">
          Home
        </Link>
        <Link href="/guides" className="underline underline-offset-4">
          Guides
        </Link>
        <Link href="/pricing" className="underline underline-offset-4">
          Pricing
        </Link>
      </div>
    </PageFrame>
  );
}
