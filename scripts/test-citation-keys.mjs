#!/usr/bin/env node
/**
 * Smoke-test citation API keys from .env (never prints secrets).
 * Usage: node scripts/test-citation-keys.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

function present(name) {
  const v = process.env[name]?.trim();
  return Boolean(v);
}

function maskStatus(ok, detail) {
  return ok ? `OK — ${detail}` : `FAIL — ${detail}`;
}

async function testOpenAI() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { skip: true };
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
      input: "What is example.com?",
    }),
  });
  const text = await res.text();
  let urls = 0;
  try {
    const json = JSON.parse(text);
    urls = JSON.stringify(json).match(/https?:\/\//g)?.length ?? 0;
  } catch {
    /* ignore */
  }
  return {
    skip: false,
    ok: res.ok,
    detail: res.ok ? `HTTP ${res.status}, ~${urls} url refs` : `HTTP ${res.status}`,
  };
}

async function testAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return { skip: true };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: "What is example.com?" }],
    }),
  });
  const text = await res.text();
  let urls = 0;
  try {
    urls = text.match(/https?:\/\//g)?.length ?? 0;
  } catch {
    /* ignore */
  }
  return {
    skip: false,
    ok: res.ok,
    detail: res.ok ? `HTTP ${res.status}, ~${urls} url refs` : `HTTP ${res.status}`,
  };
}

async function testPerplexity() {
  const key = process.env.PERPLEXITY_API_KEY?.trim();
  if (!key) return { skip: true };
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: "What is example.com?" }],
      max_tokens: 200,
    }),
  });
  return {
    skip: false,
    ok: res.ok,
    detail: `HTTP ${res.status}`,
  };
}

async function testGemini() {
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();
  if (!key) return { skip: true };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "What is example.com?" }] }],
      tools: [{ google_search: {} }],
    }),
  });
  const text = await res.text();
  const urls = text.match(/https?:\/\//g)?.length ?? 0;
  return {
    skip: false,
    ok: res.ok,
    detail: res.ok ? `HTTP ${res.status}, ~${urls} url refs` : `HTTP ${res.status}`,
  };
}

async function testGrok() {
  const key = process.env.XAI_API_KEY?.trim();
  if (!key) return { skip: true };
  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-4-fast",
      tools: [{ type: "web_search" }],
      input: "What is example.com?",
    }),
  });
  const text = await res.text();
  const urls = text.match(/https?:\/\//g)?.length ?? 0;
  return {
    skip: false,
    ok: res.ok,
    detail: res.ok ? `HTTP ${res.status}, ~${urls} url refs` : `HTTP ${res.status}`,
  };
}

console.log("Citation API key smoke test (secrets not printed)\n");
console.log("Present in env:");
console.log(`  OPENAI_API_KEY: ${present("OPENAI_API_KEY") ? "yes" : "no"}`);
console.log(`  ANTHROPIC_API_KEY: ${present("ANTHROPIC_API_KEY") ? "yes" : "no"}`);
console.log(`  PERPLEXITY_API_KEY: ${present("PERPLEXITY_API_KEY") ? "yes" : "no"}`);
console.log(
  `  GEMINI (GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY): ${
    present("GEMINI_API_KEY") || present("GOOGLE_GENERATIVE_AI_API_KEY") ? "yes" : "no"
  }`,
);
console.log(`  XAI_API_KEY (Grok): ${present("XAI_API_KEY") ? "yes" : "no"}`);
console.log("");

const tests = [
  ["ChatGPT (OpenAI)", testOpenAI],
  ["Claude (Anthropic)", testAnthropic],
  ["Perplexity", testPerplexity],
  ["Gemini", testGemini],
  ["Grok (xAI)", testGrok],
];

for (const [name, fn] of tests) {
  process.stdout.write(`${name}… `);
  try {
    const result = await fn();
    if (result.skip) {
      console.log("skipped (no key)");
      continue;
    }
    console.log(maskStatus(result.ok, result.detail));
  } catch (error) {
    console.log(`FAIL — ${error instanceof Error ? error.message : "error"}`);
  }
}
