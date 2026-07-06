import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type NetworkHierarchyListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(projectSlug: string, search: NetworkHierarchyListSearch = {}) {
  return {
    to: "/$projectSlug/network-hierarchy" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: NetworkHierarchyListSearch = {}) {
  return {
    to: "/$projectSlug/network-hierarchy/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(projectSlug: string, id: number, search: NetworkHierarchyListSearch = {}) {
  return {
    to: "/$projectSlug/network-hierarchy/$networkHierarchyId/edit" as const,
    params: { projectSlug, networkHierarchyId: String(id) },
    search: preserveFromSearch(search),
  }
}

function buildNetworkHierarchyListNavigateOptions(
  projectSlug: string,
  search: NetworkHierarchyListSearch = {},
) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useNetworkHierarchyRouteLinks(
  projectSlug: string,
  searchOverride?: NetworkHierarchyListSearch,
) {
  const router = useRouter()
  const routeSearch = useTryRouteSearch()
  const search = searchOverride ?? routeSearch ?? {}
  const listLink = buildListLink(projectSlug, search)

  return {
    search,
    listLink,
    newLink: buildNewLink(projectSlug, search),
    editLink: (id: number) => buildEditLink(projectSlug, id, search),
    listHref: router.buildLocation(listLink).href,
  }
}

export function useNetworkHierarchyMutations(
  projectSlug: string,
  search: NetworkHierarchyListSearch = {},
) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "networkHierarchies",
    projectSlug,
    listNavigateOptions: buildNetworkHierarchyListNavigateOptions(projectSlug, search),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["adminLookupRowsWithCount", { projectSlug, table: "networkHierarchies" }],
      })
    },
  })
}
