const normalizeAppOrigin = (rawOrigin: string) => {
  const isLocalPreview =
    process.env.NODE_ENV === "development" || process.env.npm_lifecycle_event === "mail-preview"

  if (isLocalPreview) {
    return rawOrigin
  }

  return rawOrigin.replace(/^http:/, "https:")
}

export const getPrdOrStgDomain = () => {
  const rawOrigin = import.meta.env.VITE_APP_ORIGIN ?? process.env.VITE_APP_ORIGIN

  if (rawOrigin) {
    return normalizeAppOrigin(rawOrigin)
  }

  return "https://staging.trassenscout.de"
}

export const getOriginFromHeaders = (headers: Headers) => {
  const host = headers.get("x-forwarded-host") ?? headers.get("host")
  if (!host) return undefined

  const forwardedProto = headers.get("x-forwarded-proto")
  const proto = forwardedProto ?? (process.env.NODE_ENV === "development" ? "http" : "https")

  return `${proto}://${host}`
}
