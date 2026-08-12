export const SIGNUP_HONEYPOT_FIELD = "newsletter" as const

export function isSignupHoneypotFilled(body: unknown) {
  const newsletter = (body as { newsletter?: string })?.newsletter
  return Boolean(newsletter?.trim())
}
