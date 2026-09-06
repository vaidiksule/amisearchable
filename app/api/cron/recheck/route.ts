import { listMonitoredHostnames } from "@/lib/checks";
import { recheckHostname } from "@/lib/recheck";

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
  let skipped = 0;

  for (const hostname of hostnames) {
    const outcome = await recheckHostname(hostname, { force: true });
    if (outcome.skipped) {
      skipped += 1;
      continue;
    }
    checked += 1;
    alerted += outcome.alerted;
  }

  return Response.json({ ok: true, checked, alerted, skipped });
}
