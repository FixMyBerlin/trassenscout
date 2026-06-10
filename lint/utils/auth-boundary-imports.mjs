/**
 * Auth modules that implement boundary checks — not importable outside `src/server/auth/`.
 * Prefer path-based enforcement over maintaining lists of retired symbol names.
 */

/** Suffixes matched against normalized import source (after alias resolution is not available — use path substrings). */
const AUTH_BOUNDARY_MODULE_MARKERS = ["/auth/session.server"]

/**
 * @param {string} source
 */
export function isAuthBoundaryModuleImport(source) {
  const normalized = source.replaceAll("\\", "/")
  return AUTH_BOUNDARY_MODULE_MARKERS.some((marker) => normalized.includes(marker))
}
