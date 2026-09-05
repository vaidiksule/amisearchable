import { sendStatusChangeEmail } from "@/lib/alerts";
import { getLatestCheck, listMonitoredHostnames, saveCheck } from "@/lib/checks";
import { runLiveCheck } from "@/lib/check-engine";
import { monitoringEmails } from "@/lib/monitors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const hostnames = await listMonitoredHostnames();
  let checked = 0;
  let alerted = 0;

  for (const hostname of hostnames) {
    const previous = await getLatestCheck(hostname);
    const next = await runLiveCheck(hostname);
    await saveCheck(next);
    checked += 1;

    if (previous && previous.verdict !== next.verdict) {
      const emails = await monitoringEmails(hostname);
      await Promise.all(emails.map((email) => sendStatusChangeEmail(email, previous, next)));
      alerted += emails.length;
    }
  }

  return Response.json({ ok: true, checked, alerted });
}
