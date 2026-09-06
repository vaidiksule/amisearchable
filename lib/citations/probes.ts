import {
  defaultProbeQueries,
  urlMatchesDomain,
  type EngineCitation,
} from "@/lib/citations/types";
import type { Platform } from "@/lib/platforms";

type ProbeFn = (domain: string, query: string) => Promise<string[]>;

export function configuredCitationEngines(): Platform[] {
  const engines: Platform[] = [];
  if (process.env.OPENAI_API_KEY?.trim()) engines.push("chatgpt");
  if (process.env.ANTHROPIC_API_KEY?.trim()) engines.push("claude");
  if (process.env.PERPLEXITY_API_KEY?.trim()) engines.push("perplexity");
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim()) {
    engines.push("gemini");
  }
  if (process.env.XAI_API_KEY?.trim()) engines.push("grok");
  return engines;
}

export async function probeEngine(
  engine: Platform,
  domain: string,
): Promise<EngineCitation> {
  const probedAt = new Date().toISOString();
  const runner = runners[engine];
  if (!runner) {
    return {
      engine,
      probes: 0,
      hits: 0,
      probedAt,
      matchedUrls: [],
      error: "Engine not configured",
      skipped: true,
    };
  }

  const queries = defaultProbeQueries(domain);
  let hits = 0;
  const matchedUrls: string[] = [];
  let lastError: string | null = null;

  for (const query of queries) {
    try {
      const urls = await runner(domain, query);
      const matched = urls.filter((url) => urlMatchesDomain(url, domain));
      if (matched.length > 0) {
        hits += 1;
        for (const url of matched.slice(0, 3)) {
          if (!matchedUrls.includes(url)) matchedUrls.push(url);
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Probe failed";
    }
  }

  return {
    engine,
    probes: queries.length,
    hits,
    probedAt,
    matchedUrls: matchedUrls.slice(0, 8),
    error: hits === 0 && lastError ? lastError : null,
    skipped: false,
  };
}

const runners: Partial<Record<Platform, ProbeFn>> = {
  chatgpt: probeChatgpt,
  claude: probeClaude,
  perplexity: probePerplexity,
  gemini: probeGemini,
  grok: probeGrok,
};

async function probePerplexity(_domain: string, query: string): Promise<string[]> {
  const key = process.env.PERPLEXITY_API_KEY?.trim();
  if (!key) throw new Error("PERPLEXITY_API_KEY missing");

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: query }],
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity ${res.status}`);
  }

  const data = (await res.json()) as {
    citations?: string[];
    search_results?: { url?: string }[];
  };

  const urls = [
    ...(data.citations ?? []),
    ...(data.search_results?.map((r) => r.url).filter(Boolean) as string[]),
  ];
  return [...new Set(urls)];
}

async function probeChatgpt(_domain: string, query: string): Promise<string[]> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY missing");

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      tools: [{ type: "web_search_preview" }],
      include: ["web_search_call.action.sources"],
      input: query,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}`);
  }

  const data = (await res.json()) as unknown;
  return extractUrlsDeep(data);
}

async function probeClaude(_domain: string, query: string): Promise<string[]> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) throw new Error("ANTHROPIC_API_KEY missing");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: query }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}`);
  }

  const data = (await res.json()) as unknown;
  return extractUrlsDeep(data);
}

async function probeGemini(_domain: string, query: string): Promise<string[]> {
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: query }] }],
      tools: [{ google_search: {} }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini ${res.status}`);
  }

  const data = (await res.json()) as unknown;
  return extractUrlsDeep(data);
}

async function probeGrok(_domain: string, query: string): Promise<string[]> {
  const key = process.env.XAI_API_KEY?.trim();
  if (!key) throw new Error("XAI_API_KEY missing");

  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-4-fast",
      tools: [{ type: "web_search" }],
      input: query,
    }),
  });

  if (!res.ok) {
    throw new Error(`Grok ${res.status}`);
  }

  const data = (await res.json()) as unknown;
  return extractUrlsDeep(data);
}

function extractUrlsDeep(value: unknown, out: string[] = []): string[] {
  if (!value) return out;
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) extractUrlsDeep(item, out);
    return out;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (
        key === "url" ||
        key === "uri" ||
        key === "href" ||
        key === "citations" ||
        key === "citation"
      ) {
        extractUrlsDeep(child, out);
      } else {
        extractUrlsDeep(child, out);
      }
    }
  }
  return [...new Set(out)];
}
