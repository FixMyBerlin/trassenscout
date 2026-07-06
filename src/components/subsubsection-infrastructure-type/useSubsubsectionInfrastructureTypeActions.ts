import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type SubsubsectionInfrastructureTypeListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(
  projectSlug: string,
  search: SubsubsectionInfrastructureTypeListSearch = {},
) {
  return {
    to: "/$projectSlug/subsubsection-infrastructure-type" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: SubsubsectionInfrastructureTypeListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-infrastructure-type/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(
  projectSlug: string,
  id: number,
  search: SubsubsectionInfrastructureTypeListSearch = {},
) {
  return {
    to: "/$projectSlug/subsubsection-infrastructure-type/$subsubsectionInfrastructureTypeId/edit" as const,
    params: { projectSlug, subsubsectionInfrastructureTypeId: String(id) },
    search: preserveFromSearch(search),
  }
}

function buildSubsubsectionInfrastructureTypeListNavigateOptions(
  projectSlug: string,
  search: SubsubsectionInfrastructureTypeListSearch = {},
) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useSubsubsectionInfrastructureTypeRouteLinks(
  projectSlug: string,
  searchOverride?: SubsubsectionInfrastructureTypeListSearch,
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

export function useSubsubsectionInfrastructureTypeMutations(
  projectSlug: string,
  search: SubsubsectionInfrastructureTypeListSearch = {},
) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "subsubsectionInfrastructureTypes",
    projectSlug,
    listNavigateOptions: buildSubsubsectionInfrastructureTypeListNavigateOptions(
      projectSlug,
      search,
    ),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: [
          "adminLookupRowsWithCount",
          { projectSlug, table: "subsubsectionInfrastructureTypes" },
        ],
      })
    },
  })
}
