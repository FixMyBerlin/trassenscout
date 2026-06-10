import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type SubsubsectionStatusListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(projectSlug: string, search: SubsubsectionStatusListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-status" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: SubsubsectionStatusListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-status/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(
  projectSlug: string,
  id: number,
  search: SubsubsectionStatusListSearch = {},
) {
  return {
    to: "/$projectSlug/subsubsection-status/$subsubsectionStatusId/edit" as const,
    params: { projectSlug, subsubsectionStatusId: String(id) },
    search: preserveFromSearch(search),
  }
}

export function buildSubsubsectionStatusListNavigateOptions(
  projectSlug: string,
  search: SubsubsectionStatusListSearch = {},
) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useSubsubsectionStatusRouteLinks(
  projectSlug: string,
  searchOverride?: SubsubsectionStatusListSearch,
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

export function useSubsubsectionStatusMutations(
  projectSlug: string,
  search: SubsubsectionStatusListSearch = {},
) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "subsubsectionStatuses",
    projectSlug,
    listNavigateOptions: buildSubsubsectionStatusListNavigateOptions(projectSlug, search),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["adminLookupRowsWithCount", { projectSlug, table: "subsubsectionStatuses" }],
      })
    },
  })
}
