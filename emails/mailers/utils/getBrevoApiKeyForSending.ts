export function getBrevoApiKeyForSending() {
  if (process.env.VITE_APP_ENV === "development") return ""
  return process.env.BREVO_API_KEY!.trim()
}
