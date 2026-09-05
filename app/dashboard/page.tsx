import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { removeMonitoredDomain } from "@/app/actions/monitors";
import { AddDomainForm } from "@/components/add-domain-form";
import { PageFrame } from "@/components/page-frame";
import { getCurrentProfile } from "@/lib/auth";
import { PRO_DOMAIN_LIMIT } from "@/lib/config";
import { listMonitors } from "@/lib/monitors";
import { formatCheckedAt } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/dashboard");
  }

  const searchParams = await props.searchParams;
  const checkoutSuccess = searchParams.checkout === "success";
  const error = typeof searchParams.error === "string" ? searchParams.error : null;
  const monitors = profile.plan === "pro" ? await listMonitors(profile.id) : [];

  return (
    <PageFrame>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-muted">{profile.email}</p>
        </div>
        {profile.plan === "pro" ? (
          <Link href="/portal" className="text-sm underline underline-offset-4">
            Billing
          </Link>
        ) : null}
      </div>

      {checkoutSuccess && profile.plan !== "pro" ? (
        <p className="mt-6 text-sm text-muted">Payment received. Refresh in a few seconds.</p>
      ) : null}

      {error ? <p className="mt-6 text-sm text-warn">{error}</p> : null}

      {profile.plan !== "pro" ? (
        <div className="mt-10 rounded-lg border border-border bg-surface p-6">
          <p className="text-sm">Monitoring is Pro.</p>
          <p className="mt-2 text-sm text-muted">
            $5/mo or $40/yr. Up to {PRO_DOMAIN_LIMIT} domains.
          </p>
          <div className="mt-5 flex gap-4 text-sm">
            <Link href="/checkout?interval=month" className="underline underline-offset-4">
              Monthly
            </Link>
            <Link href="/checkout?interval=year" className="underline underline-offset-4">
              Yearly
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted">
            {monitors.length} / {PRO_DOMAIN_LIMIT} domains
          </p>

          {monitors.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No domains yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Domain</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Checked</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {monitors.map((monitor) => (
                    <tr key={monitor.hostname} className="border-t border-border">
                      <td className="px-4 py-3 font-mono">
                        <Link href={`/report/${monitor.hostname}`} className="hover:underline">
                          {monitor.hostname}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {monitor.verdict === "pass" ? (
                          <span className="text-accent">Ready</span>
                        ) : monitor.verdict === "fail" ? (
                          <span className="text-warn">Blocking</span>
                        ) : (
                          <span className="text-muted">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {monitor.checkedAt ? formatCheckedAt(monitor.checkedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={removeMonitoredDomain}>
                          <input type="hidden" name="domain" value={monitor.hostname} />
                          <button type="submit" className="text-muted hover:text-foreground">
                            Remove
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {monitors.length < PRO_DOMAIN_LIMIT ? <AddDomainForm /> : null}
        </>
      )}
    </PageFrame>
  );
}
