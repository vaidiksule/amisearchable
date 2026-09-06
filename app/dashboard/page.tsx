import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { removeMonitoredDomain } from "@/app/actions/monitors";
import { AddDomainForm } from "@/components/add-domain-form";
import { DeployHookPanel } from "@/components/deploy-hook-panel";
import { PageFrame } from "@/components/page-frame";
import { getCurrentProfile } from "@/lib/auth";
import { syncUserPlanFromPolar } from "@/lib/billing";
import { PRO_DOMAIN_LIMIT, siteUrl } from "@/lib/config";
import { ensureHookSecret } from "@/lib/hooks";
import { listMonitors } from "@/lib/monitors";
import { formatCheckedAt } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  let profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/dashboard");
  }

  const searchParams = await props.searchParams;
  const checkoutSuccess = searchParams.checkout === "success";
  const checkoutId =
    typeof searchParams.checkout_id === "string"
      ? searchParams.checkout_id
      : typeof searchParams.checkoutId === "string"
        ? searchParams.checkoutId
        : null;
  const error = typeof searchParams.error === "string" ? searchParams.error : null;

  if (profile.plan !== "pro") {
    profile = await syncUserPlanFromPolar(profile, checkoutId);
  }

  if (checkoutSuccess && profile.plan === "pro") {
    redirect("/dashboard");
  }

  const monitors = profile.plan === "pro" ? await listMonitors(profile.id) : [];
  const hookSecret =
    profile.plan === "pro" ? ((await ensureHookSecret(profile.id)) ?? "") : "";

  return (
    <PageFrame>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{profile.email}</span>
            {profile.plan === "pro" ? (
              <span className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-foreground">
                Pro
              </span>
            ) : null}
          </div>
        </div>
        {profile.plan === "pro" ? (
          <Link href="/portal" className="text-sm underline underline-offset-4">
            Billing
          </Link>
        ) : null}
      </div>

      {checkoutSuccess && profile.plan !== "pro" ? (
        <p className="mt-6 text-sm text-muted">
          Payment received. Activating Pro… refresh this page in a few seconds if it
          doesn’t update.
        </p>
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
          <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-foreground">Monitored domains</p>
              <p className="mt-1 text-sm text-muted">
                {monitors.length} / {PRO_DOMAIN_LIMIT} used · daily refresh + email on change
              </p>
            </div>
          </div>

          {monitors.length === 0 ? (
            <div className="mt-6 rounded-lg border border-border bg-surface p-6">
              <p className="text-sm">Add your first domain</p>
              <p className="mt-2 text-sm text-muted">
                We’ll check robots.txt daily and keep your badge accurate.
              </p>
              <AddDomainForm />
            </div>
          ) : (
            <>
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
                          ) : monitor.verdict === "unclear" ? (
                            <span className="text-warn">Unclear</span>
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

              {monitors.length < PRO_DOMAIN_LIMIT ? (
                <div className="mt-6">
                  <p className="text-sm text-muted">
                    Add another domain ({PRO_DOMAIN_LIMIT - monitors.length} left)
                  </p>
                  <AddDomainForm />
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted">
                  You’ve used all {PRO_DOMAIN_LIMIT} Pro domain slots. Remove one to add another.
                </p>
              )}
            </>
          )}

          {hookSecret ? (
            <DeployHookPanel
              secret={hookSecret}
              domains={monitors.map((m) => m.hostname)}
              siteOrigin={siteUrl()}
            />
          ) : null}
        </>
      )}
    </PageFrame>
  );
}
