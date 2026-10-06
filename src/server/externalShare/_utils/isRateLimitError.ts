export const isRateLimitError = (error: unknown) =>
  error instanceof Error && "statusCode" in error && error.statusCode === 429
