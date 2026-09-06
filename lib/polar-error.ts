export function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export type PolarFailure = {
  message: string;
  status?: string;
  detail?: string;
  code?: string;
};

export function describePolarError(error: unknown): PolarFailure {
  if (!(error instanceof Error) && (typeof error !== "object" || error === null)) {
    return { message: "unknown" };
  }

  const err = error as {
    message?: string;
    statusCode?: number;
    body?: unknown;
    detail?: unknown;
    data?: unknown;
  };

  const message = err.message ?? "unknown";
  const status = err.statusCode != null ? String(err.statusCode) : undefined;
  const body = err.body ?? err.detail ?? err.data;
  let detail: string | undefined;
  let code: string | undefined;

  if (typeof body === "string") {
    detail = body.slice(0, 300);
  } else if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.detail === "string") detail = record.detail.slice(0, 300);
    else if (typeof record.message === "string") detail = record.message.slice(0, 300);
    else detail = JSON.stringify(body).slice(0, 300);
    if (typeof record.error === "string") code = record.error;
    if (typeof record.type === "string") code = record.type;
  }

  return { message, status, detail, code };
}

export function logPolarError(context: string, error: unknown): PolarFailure {
  const described = describePolarError(error);
  console.error(context, described);
  return described;
}

/** Safe short reason for redirect query params. */
export function polarFailureReason(error: unknown): string {
  const described = describePolarError(error);
  const haystack = `${described.message} ${described.detail ?? ""} ${described.code ?? ""}`.toLowerCase();

  if (haystack.includes("customer_sessions") || haystack.includes("customer session")) {
    return "token_sessions";
  }
  if (haystack.includes("checkout") && (haystack.includes("scope") || haystack.includes("permission") || haystack.includes("forbidden") || haystack.includes("401") || haystack.includes("403"))) {
    return "token_checkout";
  }
  if (described.status === "401" || described.status === "403" || haystack.includes("unauthorized") || haystack.includes("forbidden")) {
    return "token";
  }
  if (haystack.includes("product") || haystack.includes("not found") || described.status === "404") {
    return "product";
  }
  if (haystack.includes("sandbox") || haystack.includes("server")) {
    return "server";
  }
  return "checkout";
}
