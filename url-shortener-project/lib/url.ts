const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function makeShortCode(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return result;
}

export function parseHttpUrl(value: unknown): URL | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname) return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizedHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, "");
}

export function isOwnServiceUrl(
  original: URL,
  requestOrigin: string,
): boolean {
  const ownHosts = new Set<string>();

  try {
    ownHosts.add(normalizedHostname(new URL(requestOrigin).hostname));
  } catch {}

  const configuredBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (configuredBase) {
    try {
      ownHosts.add(normalizedHostname(new URL(configuredBase).hostname));
    } catch {}
  }

  // Vercel 환경변수는 프로토콜 없이 호스트명만 제공할 수 있습니다.
  for (const candidate of [
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    if (!candidate) continue;
    try {
      ownHosts.add(normalizedHostname(new URL(`https://${candidate}`).hostname));
    } catch {}
  }

  return ownHosts.has(normalizedHostname(original.hostname));
}
