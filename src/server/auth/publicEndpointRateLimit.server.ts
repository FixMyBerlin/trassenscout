const buckets = new Map<string, { count: number; resetAt: number }>()

function getClientKey(headers: Headers, endpoint: string) {
  const forwardedFor = headers.get("x-forwarded-for")
  const ip = forwardedFor?.split(",")[0]?.trim() ?? headers.get("x-real-ip")?.trim() ?? "unknown"
  return `${endpoint}:${ip}`
}

class RateLimitError extends Error {
  readonly statusCode = 429

  constructor(message = "Too many requests") {
    super(message)
    this.name = "RateLimitError"
  }
}

export function enforcePublicEndpointRateLimit(
  headers: Headers,
  endpoint: string,
  { max = 30, windowMs = 60_000 }: { max?: number; windowMs?: number } = {},
) {
  const key = getClientKey(headers, endpoint)
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  bucket.count += 1
  if (bucket.count > max) {
    throw new RateLimitError()
  }
}
