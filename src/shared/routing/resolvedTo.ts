import type { NavigateOptions } from "@tanstack/react-router"
import { routerSearch } from "@/src/shared/routing/routerSearch"

export type SplitResolvedTo = {
  to: string
  search: Record<string, unknown> | undefined
  hash: string | undefined
}

export function splitResolvedTo(to: string): SplitResolvedTo {
  const hashIndex = to.indexOf("#")
  const hash = hashIndex === -1 ? undefined : to.slice(hashIndex + 1)
  const withoutHash = hashIndex === -1 ? to : to.slice(0, hashIndex)

  const queryIndex = withoutHash.indexOf("?")
  const queryString = queryIndex === -1 ? "" : withoutHash.slice(queryIndex + 1)

  return {
    to: queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex),
    // An empty query must stay `undefined`: passing `{}` would clear the current search
    // instead of leaving it to the route's middlewares.
    search: queryString ? (routerSearch.parse(queryString) as Record<string, unknown>) : undefined,
    hash: hash || undefined,
  }
}

export const resolvedToNavigateOptions = (to: string) =>
  splitResolvedTo(to) as unknown as NavigateOptions
