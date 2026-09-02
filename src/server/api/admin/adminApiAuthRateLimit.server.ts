import { clientIpFromHeaders } from "@/src/server/api/util/clientIp.server"

const WINDOW_MS = 60_000
const MAX_FAILED_ATTEMPTS = 20

type RateLimitEntry = { count: number; windowStart: number }

const failedAttemptsByIp = new Map<string, RateLimitEntry>()

export function getClientIp(request: Request) {
  return clientIpFromHeaders(request.headers) ?? "unknown"
}

function pruneExpiredEntries(now: number) {
  if (failedAttemptsByIp.size < 500) return
  for (const [ip, entry] of failedAttemptsByIp) {
    if (now - entry.windowStart > WINDOW_MS) failedAttemptsByIp.delete(ip)
  }
}

export function isAdminApiAuthRateLimited(ip: string) {
  const now = Date.now()
  const entry = failedAttemptsByIp.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) return false
  return entry.count >= MAX_FAILED_ATTEMPTS
}

export function recordFailedAdminApiAuth(ip: string) {
  const now = Date.now()
  pruneExpiredEntries(now)
  const entry = failedAttemptsByIp.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    failedAttemptsByIp.set(ip, { count: 1, windowStart: now })
    return
  }
  entry.count += 1
}
