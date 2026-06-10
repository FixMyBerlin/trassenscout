import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type SubsectionStatusListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(projectSlug: string, search: SubsectionStatusListSearch = {}) {
  return {
    to: "/$projectSlug/subsection-status" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: SubsectionStatusListSearch = {}) {
  return {
    to: "/$projectSlug/subsection-status/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(projectSlug: string, id: number, search: SubsectionStatusListSearch = {}) {
  return {
    to: "/$projectSlug/subsection-status/$subsectionStatusId/edit" as const,
    params: { projectSlug, subsectionStatusId: String(id) },
    search: preserveFromSearch(search),
  }
}

export function buildSubsectionStatusListNavigateOptions(
  projectSlug: string,
  search: SubsectionStatusListSearch = {},
) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useSubsectionStatusRouteLinks(
  projectSlug: string,
  searchOverride?: SubsectionStatusListSearch,
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

export function useSubsectionStatusMutations(
  projectSlug: string,
  search: SubsectionStatusListSearch = {},
) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "subsectionStatuses",
    projectSlug,
    listNavigateOptions: buildSubsectionStatusListNavigateOptions(projectSlug, search),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["adminLookupRowsWithCount", { projectSlug, table: "subsectionStatuses" }],
      })
    },
  })
}
