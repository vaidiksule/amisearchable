import { sendStatusChangeEmail } from "@/lib/alerts";
import { getLatestCheck, saveCheck } from "@/lib/checks";
import { runLiveCheck } from "@/lib/check-engine";
import { MIN_RECHECK_MS } from "@/lib/config";
import type { CheckResult } from "@/lib/crawlers";
import { monitoringEmails } from "@/lib/monitors";

export type RecheckOutcome = {
  previous: CheckResult | null;
  next: CheckResult;
  alerted: number;
  skipped: boolean;
};

/** Live recheck + persist. Emails Pro monitors when the verdict changes. */
export async function recheckHostname(
  hostname: string,
  options: { force?: boolean } = {},
): Promise<RecheckOutcome> {
  const previous = await getLatestCheck(hostname);

  if (previous && !options.force) {
    const age = Date.now() - new Date(previous.checkedAt).getTime();
    if (age < MIN_RECHECK_MS) {
      return { previous, next: previous, alerted: 0, skipped: true };
    }
  }

  const next = await runLiveCheck(hostname);
  await saveCheck(next);

  let alerted = 0;
  if (previous && previous.verdict !== next.verdict) {
    const emails = await monitoringEmails(hostname);
    await Promise.all(emails.map((email) => sendStatusChangeEmail(email, previous, next)));
    alerted = emails.length;
  }

  return { previous, next, alerted, skipped: false };
}
