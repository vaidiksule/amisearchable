import Link from "next/link";
import { PageFrame } from "@/components/page-frame";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-4 text-sm leading-6 text-muted">{children}</div>
    </section>
  );
}

export function LegalPage({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <PageFrame>
      <p className="text-xs text-muted">
        <Link href="/" className="underline underline-offset-4">
          Home
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      <p className="mt-2 text-xs text-muted">Last updated {updated}</p>
      <article>{children}</article>
    </PageFrame>
  );
}
