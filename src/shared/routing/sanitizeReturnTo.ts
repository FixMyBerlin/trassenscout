const decodeReturnPath = (value: string): string | undefined => {
  try {
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}

/** Open-redirect guard: browsers must resolve the path to our own site, also `//host` and `/\host`. */
const isSafeInternalReturnPath = (path: string): boolean => {
  if (!path.startsWith("/")) return false
  try {
    return new URL(path, "http://localhost").origin === "http://localhost"
  } catch {
    return false
  }
}

export const sanitizeInternalReturnPath = (value: string | undefined): string | undefined => {
  if (!value) return undefined

  const decoded = decodeReturnPath(value)
  if (!decoded || !isSafeInternalReturnPath(decoded)) return undefined

  return decoded
}
