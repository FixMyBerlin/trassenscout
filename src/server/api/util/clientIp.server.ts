/**
 * Resolve the client IP from proxy headers — used for the admin-API auth rate limiter.
 *
 * We take the rightmost `X-Forwarded-For` entry (written by the nearest trusted proxy), not the
 * leftmost (client-spoofable). See TILDA `clientIp.server.ts` for the full rationale.
 */
export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
    const nearestProxyHop = parts.at(-1)
    if (nearestProxyHop) return nearestProxyHop
  }
  return headers.get("x-real-ip")
}
