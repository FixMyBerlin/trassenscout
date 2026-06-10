import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext } from "@tanstack/react-router"
import { RouteNotFoundPage } from "@/src/components/shared/errors/RouteNotFoundPage"
import { LayoutRoot } from "@/src/components/shared/layouts/LayoutRoot"
import { resolveRootHead } from "@/src/routeHead"

export type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  ssr: true,
  head: ({ matches }) => resolveRootHead(matches),
  notFoundComponent: RouteNotFoundPage,
  component: LayoutRoot,
})
