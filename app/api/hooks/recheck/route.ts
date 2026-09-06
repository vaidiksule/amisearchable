import { findProUserByHookSecret, userMonitorsDomain } from "@/lib/hooks";
import { normalizeDomain } from "@/lib/domain";
import { recheckHostname } from "@/lib/recheck";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function extractSecret(request: Request, url: URL): string | null {
  const fromQuery = url.searchParams.get("secret")?.trim();
  if (fromQuery) return fromQuery;

  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim() || null;
  }

  return request.headers.get("x-hook-secret")?.trim() || null;
}

async function handle(request: Request) {
  const url = new URL(request.url);
  const secret = extractSecret(request, url);
  if (!secret) {
    return Response.json({ ok: false, error: "Missing hook secret." }, { status: 401 });
  }

  const owner = await findProUserByHookSecret(secret);
  if (!owner) {
    return Response.json({ ok: false, error: "Invalid hook secret." }, { status: 401 });
  }

  const domain = normalizeDomain(url.searchParams.get("domain") ?? "");
  if (!domain) {
    return Response.json({ ok: false, error: "Missing or invalid domain." }, { status: 400 });
  }

  const monitored = await userMonitorsDomain(owner.id, domain);
  if (!monitored) {
    return Response.json(
      { ok: false, error: "Domain is not monitored on this Pro account." },
      { status: 403 },
    );
  }

  const outcome = await recheckHostname(domain);

  return Response.json({
    ok: true,
    domain,
    skipped: outcome.skipped,
    verdict: outcome.next.verdict,
    checkedAt: outcome.next.checkedAt,
    previousVerdict: outcome.previous?.verdict ?? null,
    alerted: outcome.alerted,
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
