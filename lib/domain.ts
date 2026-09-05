export function normalizeDomain(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/\.$/, "");
    if (!host || !host.includes(".")) return null;
    return host;
  } catch {
    return null;
  }
}

export function embedHtml(domain: string): string {
  return `<a href="https://amisearchable.cc/report/${domain}">
  <img src="https://amisearchable.cc/badge/${domain}" alt="AI Searchable">
</a>`;
}

export function embedMarkdown(domain: string): string {
  return `[![AI Searchable](https://amisearchable.cc/badge/${domain})](https://amisearchable.cc/report/${domain})`;
}
