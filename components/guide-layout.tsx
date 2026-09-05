import Link from "next/link";
import { DomainForm } from "@/components/domain-form";
import { PageFrame } from "@/components/page-frame";
import type { Guide } from "@/lib/guides";

export function GuideLayout({
  guide,
  related,
  children,
}: {
  guide: Guide;
  related: Guide[];
  children: React.ReactNode;
}) {
  return (
    <PageFrame>
      <p className="text-xs text-muted">
        <Link href="/guides" className="underline underline-offset-4">
          Guides
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{guide.title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{guide.description}</p>
      <p className="mt-2 text-xs text-muted">Updated {guide.date}</p>
      <article className="mt-2">{children}</article>

      <section className="mt-12 rounded-lg border border-border bg-surface p-5">
        <p className="text-sm font-medium">Check your domain</p>
        <p className="mt-1 text-sm text-muted">
          See which of these bots can reach you. No account needed.
        </p>
        <div className="mt-4">
          <DomainForm />
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-sm font-medium">Related guides</h2>
          <ul className="mt-3 space-y-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/guides/${item.slug}`} className="text-sm underline underline-offset-4">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageFrame>
  );
}

export function GuideSection({
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

export function GuideCode({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-code p-4 font-mono text-xs leading-5 text-code-text">
      <code>{children}</code>
    </pre>
  );
}
