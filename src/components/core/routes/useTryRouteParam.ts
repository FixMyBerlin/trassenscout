import { useParams } from "@tanstack/react-router"
import type { RegisteredRouter, ResolveUseParams } from "@tanstack/router-core"

/**
 * Every path param across the route tree, each optional.
 * This is what `useParams({ strict: false })` resolves to.
 */
type OptionalRouteParams = ResolveUseParams<RegisteredRouter, undefined, false>

/**
 * Read a path param that may not exist on the active route — e.g. a breadcrumb
 * rendered under a parent route that reads a child route's slug.
 *
 * `strict: false` types params as a partial of every param in the route tree, so
 * `paramKey` is checked/autocompleted against the generated route tree and the
 * result is `string | undefined`. No `from` route id or casting required.
 */
export function useTryRouteParam<TKey extends keyof OptionalRouteParams>(paramKey: TKey) {
  return useParams({
    strict: false,
    shouldThrow: false,
    // Annotate the return type so TanStack infers a concrete `TSelected`. Indexing
    // with the generic `TKey` otherwise breaks `select` inference and the hook
    // would return the whole params object instead of the selected value.
    select: (params): string | undefined => params?.[paramKey],
  })
}
