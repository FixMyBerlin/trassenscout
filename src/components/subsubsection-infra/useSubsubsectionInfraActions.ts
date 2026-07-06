import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type SubsubsectionInfraListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(projectSlug: string, search: SubsubsectionInfraListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-infra" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: SubsubsectionInfraListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-infra/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(projectSlug: string, id: number, search: SubsubsectionInfraListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-infra/$subsubsectionInfraId/edit" as const,
    params: { projectSlug, subsubsectionInfraId: String(id) },
    search: preserveFromSearch(search),
  }
}

function buildSubsubsectionInfraListNavigateOptions(
  projectSlug: string,
  search: SubsubsectionInfraListSearch = {},
) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useSubsubsectionInfraRouteLinks(
  projectSlug: string,
  searchOverride?: SubsubsectionInfraListSearch,
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

export function useSubsubsectionInfraMutations(
  projectSlug: string,
  search: SubsubsectionInfraListSearch = {},
) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "subsubsectionInfras",
    projectSlug,
    listNavigateOptions: buildSubsubsectionInfraListNavigateOptions(projectSlug, search),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["adminLookupRowsWithCount", { projectSlug, table: "subsubsectionInfras" }],
      })
    },
  })
}
