export const PRO_DOMAIN_LIMIT = 5;
export const MIN_RECHECK_MS = 60_000;
export const EMBED_ORIGIN = "https://amisearchable.cc";
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-440EEFRNG7";

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured && !isLocalhost(configured)) return configured;
  if (process.env.VERCEL_ENV === "production") return EMBED_ORIGIN;
  return configured ?? "http://localhost:3000";
}

export function polarRedirectUrl(): string {
  if (polarServer() === "production") {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    if (configured && !isLocalhost(configured)) return configured;
    return EMBED_ORIGIN;
  }
  return siteUrl();
}

function isLocalhost(value: string): boolean {
  return /localhost|127\.0\.0\.1/.test(value);
}

export function polarServer(): "sandbox" | "production" {
  return process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production";
}

export function polarProductId(interval: "month" | "year"): string | null {
  if (interval === "year") {
    return process.env.POLAR_PRODUCT_ANNUAL_ID ?? process.env.POLAR_PRODUCT_ID ?? null;
  }
  return process.env.POLAR_PRODUCT_MONTHLY_ID ?? process.env.POLAR_PRODUCT_ID ?? null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function supabaseUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return value.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function supabaseAnonKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    null
  );
}

export function supabaseServiceKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? null;
}
