import { PageFrame } from "@/components/page-frame";

export default function ReportLoading() {
  return (
    <PageFrame>
      <h1 className="text-3xl font-semibold tracking-tight">Checking…</h1>
      <p className="mt-3 text-sm text-muted">Reading robots.txt, llms.txt, and sitemap.</p>
    </PageFrame>
  );
}
