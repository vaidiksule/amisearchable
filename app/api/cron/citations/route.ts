import { listMonitoredHostnames } from "@/lib/checks";
import { configuredCitationEngines } from "@/lib/citations/probes";
import { runCitationProbes } from "@/lib/citations/store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const engines = configuredCitationEngines();
  if (engines.length === 0) {
    return Response.json({
      ok: true,
      skipped: true,
      reason: "No citation API keys configured",
    });
  }

  const hostnames = await listMonitoredHostnames();
  let probed = 0;
  const errors: string[] = [];

  for (const hostname of hostnames) {
    try {
      await runCitationProbes(hostname);
      probed += 1;
    } catch (error) {
      errors.push(
        `${hostname}: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  return Response.json({
    ok: true,
    engines,
    probed,
    errors: errors.slice(0, 10),
  });
}
