import { Resend } from "resend";
import { badgeLabel } from "@/lib/badge-svg";
import type { CheckResult } from "@/lib/crawlers";
import { siteUrl } from "@/lib/config";

export async function sendStatusChangeEmail(
  to: string,
  previous: CheckResult,
  next: CheckResult,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("Resend is not configured; skipped alert to", to);
    return;
  }

  const resend = new Resend(apiKey);
  const reportUrl = `${siteUrl()}/report/${next.domain}`;
  const { error } = await resend.emails.send({
    from,
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
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
