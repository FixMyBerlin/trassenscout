import "@/src/components/shared/zodDeLocale"
import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { RoutePagePending } from "@/src/components/pages/RoutePagePending"
import { RouteErrorPage } from "@/src/components/shared/errors/RouteErrorPage"
import { RouteNotFoundPage } from "@/src/components/shared/errors/RouteNotFoundPage"
import * as TanstackQuery from "@/src/components/shared/providers/tanstack-query/root-provider"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const rqContext = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    trailingSlash: "never",
    context: {
      ...rqContext,
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultErrorComponent: RouteErrorPage,
    defaultPendingComponent: RoutePagePending,
    defaultNotFoundComponent: RouteNotFoundPage,
    notFoundMode: "fuzzy",
  })

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

  return router
}

export type Router = ReturnType<typeof getRouter>
