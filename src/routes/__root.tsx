import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, redirect } from "@tanstack/react-router"
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
  beforeLoad: ({ location }) => {
    const { pathname, searchStr, hash } = location

    if (pathname.length <= 1 || !pathname.endsWith("/")) {
      return undefined as never
    }

    const strippedPath = pathname.replace(/\/+$/, "") || "/"

    throw redirect({
      href: `${strippedPath}${searchStr}${hash ? `#${hash}` : ""}`,
      replace: true,
    })
  },
  component: LayoutRoot,
})
