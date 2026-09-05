export function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function logPolarError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : "unknown";
  const status =
    error && typeof error === "object" && "statusCode" in error
      ? String((error as { statusCode?: number }).statusCode)
      : "";
  console.error(context, status, message);
}
