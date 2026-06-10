import { useSearch } from "@tanstack/react-router"
import type { RegisteredRouter, ResolveUseSearch } from "@tanstack/router-core"

/**
 * Every search param across the route tree, each optional.
 * This is what `useSearch({ strict: false })` resolves to.
 */
type OptionalRouteSearch = ResolveUseSearch<RegisteredRouter, undefined, false>

/**
 * Read search params from the active route without binding to a specific route id.
 * Safe on list/new/edit sibling routes in admin CRUD flows.
 */
export function useTryRouteSearch(): OptionalRouteSearch | undefined {
  return useSearch({
    strict: false,
    shouldThrow: false,
  })
}

/**
 * Read one search param that may exist on the active route — e.g. `from` on a list
 * page reached from a form, without tying the hook to that list route's id.
 *
 * `strict: false` types search as a partial of every search key in the route tree, so
 * `searchKey` is checked/autocompleted against the generated route tree and the
 * result is typed as that key's value or `undefined`. No `from` route id or casting.
 */
export function useTryRouteSearchKey<TKey extends keyof OptionalRouteSearch>(searchKey: TKey) {
  return useSearch({
    strict: false,
    shouldThrow: false,
    // Annotate the return type so TanStack infers a concrete `TSelected`. Indexing
    // with the generic `TKey` otherwise breaks `select` inference and the hook
    // would return the whole search object instead of the selected value.
    select: (search): OptionalRouteSearch[TKey] | undefined => search?.[searchKey],
  })
}
