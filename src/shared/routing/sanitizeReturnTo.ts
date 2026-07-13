import { DEFAULT_PROTOCOL_ALLOWLIST, isDangerousProtocol } from "@tanstack/router-core"

const decodeReturnPath = (value: string): string | undefined => {
  try {
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}

/** TanStack Router open-redirect guard for internal hrefs (redirect + Link). */
const isSafeInternalReturnPath = (path: string): boolean => {
  if (!path.startsWith("/") || path.startsWith("//")) return false
  if (isDangerousProtocol(path, new Set(DEFAULT_PROTOCOL_ALLOWLIST))) return false
  return true
}

export const sanitizeInternalReturnPath = (value: string | undefined): string | undefined => {
  if (!value) return undefined

  const decoded = decodeReturnPath(value)
  if (!decoded || !isSafeInternalReturnPath(decoded)) return undefined

  return decoded
}

export const isProjectScopedReturnPath = (path: string, projectSlug: string): boolean => {
  const projectRoot = `/${projectSlug}`
  return path === projectRoot || path.startsWith(`${projectRoot}/`)
}
