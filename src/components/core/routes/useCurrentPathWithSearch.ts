import { useLocation } from "@tanstack/react-router"

/**
 * Current pathname + search string for `returnTo` / back-navigation search props.
 *
 * TanStack native: `useLocation()` exposes `pathname`, `searchStr`, and `href`.
 * We compose `pathname + searchStr` (not `href`) to omit hash fragments from return URLs.
 * There is no router helper for “current location as internal return path”; callers pass
 * this value via typed `<Link search={{ returnTo: ... }} />` instead of string-built URLs.
 */
export const useCurrentReturnTo = () =>
  useLocation({
    select: (location) => {
      if (!location.pathname) return undefined
      return `${location.pathname}${location.searchStr}`
    },
  })
