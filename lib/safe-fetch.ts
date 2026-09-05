import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

const MAX_BYTES = 64 * 1024;
const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;

const privateNets = new BlockList();
privateNets.addSubnet("0.0.0.0", 8, "ipv4");
privateNets.addSubnet("10.0.0.0", 8, "ipv4");
privateNets.addSubnet("100.64.0.0", 10, "ipv4");
privateNets.addSubnet("127.0.0.0", 8, "ipv4");
privateNets.addSubnet("169.254.0.0", 16, "ipv4");
privateNets.addSubnet("172.16.0.0", 12, "ipv4");
privateNets.addSubnet("192.168.0.0", 16, "ipv4");
privateNets.addAddress("::1", "ipv6");
privateNets.addSubnet("fc00::", 7, "ipv6");
privateNets.addSubnet("fe80::", 10, "ipv6");

const FETCH_HEADERS = {
  "User-Agent": "AmISearchable/1.0 (+https://amisearchable.cc)",
  Accept: "text/plain, text/*, */*;q=0.1",
};

export type SafeFetchResult =
  | { ok: true; status: number; text: string; finalUrl: string }
  | { ok: false; status: number; error: string; finalUrl: string };

export async function safeFetchText(rawUrl: string): Promise<SafeFetchResult> {
  let current = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const url = parsePublicHttpUrl(current);
    if (!url) {
      return { ok: false, status: 0, error: "Blocked URL", finalUrl: current };
    }

    const blocked = await hostnameIsPrivate(url.hostname);
    if (blocked) {
      return { ok: false, status: 0, error: "Private address blocked", finalUrl: url.href };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        headers: FETCH_HEADERS,
        signal: controller.signal,
        cache: "no-store",
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location || hop === MAX_REDIRECTS) {
          return {
            ok: false,
            status: response.status,
            error: "Too many redirects",
            finalUrl: url.href,
          };
        }
        current = new URL(location, url).href;
        continue;
      }

      const text = await readLimitedText(response);
      if (response.ok) {
        return { ok: true, status: response.status, text, finalUrl: url.href };
      }
      return {
        ok: false,
        status: response.status,
        error: `HTTP ${response.status}`,
        finalUrl: url.href,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fetch failed";
      return { ok: false, status: 0, error: message, finalUrl: url.href };
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, status: 0, error: "Too many redirects", finalUrl: current };
}

function parsePublicHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    if (url.port && url.port !== "80" && url.port !== "443") return null;
    return url;
  } catch {
    return null;
  }
}

async function hostnameIsPrivate(hostname: string): Promise<boolean> {
  if (isIP(hostname)) {
    return isPrivateIp(hostname);
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  return records.some((record) => isPrivateIp(record.address));
}

function isPrivateIp(ip: string): boolean {
  const mapped = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  const family = mapped.includes(":") ? "ipv6" : "ipv4";
  return privateNets.check(mapped, family);
}

async function readLimitedText(response: Response): Promise<string> {
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = "";

  while (received.length < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    received += decoder.decode(value, { stream: true });
    if (received.length >= MAX_BYTES) {
      received = received.slice(0, MAX_BYTES);
      await reader.cancel();
      break;
    }
  }

  return received;
}
