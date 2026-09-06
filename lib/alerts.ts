import { Resend } from "resend";
import { badgeLabel } from "@/lib/badge-svg";
import type { CheckResult } from "@/lib/crawlers";
import { siteUrl } from "@/lib/config";

function resendClient(): { resend: Resend; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const rawFrom = process.env.ALERT_FROM_EMAIL?.trim();
  if (!apiKey || !rawFrom) {
    console.warn("Resend is not configured");
    return null;
  }
  // Prefer a real display name — bare addresses look more like spam.
  const from = rawFrom.includes("<") ? rawFrom : `Am I Searchable <${rawFrom}>`;
  return { resend: new Resend(apiKey), from };
}

export async function sendStatusChangeEmail(
  to: string,
  previous: CheckResult,
  next: CheckResult,
): Promise<boolean> {
  const client = resendClient();
  if (!client) {
    console.warn("Skipped status alert to", to);
    return false;
  }

  const reportUrl = `${siteUrl()}/report/${next.domain}`;
  const { error } = await client.resend.emails.send({
    from: client.from,
    to,
    subject: `${next.domain} is now ${badgeLabel(next.verdict)}`,
    html: `
      <p>The AI-search status for <strong>${escapeHtml(next.domain)}</strong> changed.</p>
      <p>
        Before: <strong>${escapeHtml(badgeLabel(previous.verdict))}</strong><br>
        Now: <strong>${escapeHtml(badgeLabel(next.verdict))}</strong>
      </p>
      <p><a href="${reportUrl}">Open the report</a></p>
    `,
  });

  if (error) {
    console.error("Failed to send alert email", error);
    return false;
  }
  return true;
}

export async function sendProWelcomeEmail(to: string): Promise<boolean> {
  const trimmed = to.trim();
  if (!trimmed) return false;

  const client = resendClient();
  if (!client) {
    console.warn("Skipped Pro welcome email to", trimmed);
    return false;
  }

  const dashboardUrl = `${siteUrl()}/dashboard`;
  const { error } = await client.resend.emails.send({
    from: client.from,
    to: trimmed,
    subject: "You're on Pro — we'll email you if AI search access changes",
    html: `
      <p>You're on <strong>Am I Searchable Pro</strong>.</p>
      <p>
        We'll re-check your monitored domains daily. If robots.txt starts blocking
        (or unblocking) AI search bots, you'll get an email.
      </p>
      <p>
        Add up to 5 domains on your
        <a href="${dashboardUrl}">dashboard</a>.
      </p>
      <p style="color:#666;font-size:14px">
        Badge URLs stay the same — Pro just keeps them accurate.
      </p>
    `,
  });

  if (error) {
    console.error("Failed to send Pro welcome email", error);
    return false;
  }
  return true;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
