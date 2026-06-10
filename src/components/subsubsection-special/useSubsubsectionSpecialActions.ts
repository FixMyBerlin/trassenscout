import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type SubsubsectionSpecialListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(projectSlug: string, search: SubsubsectionSpecialListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-special" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: SubsubsectionSpecialListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-special/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(
  projectSlug: string,
  id: number,
  search: SubsubsectionSpecialListSearch = {},
) {
  return {
    to: "/$projectSlug/subsubsection-special/$subsubsectionSpecialId/edit" as const,
    params: { projectSlug, subsubsectionSpecialId: String(id) },
    search: preserveFromSearch(search),
  }
}

export function buildSubsubsectionSpecialListNavigateOptions(
  projectSlug: string,
  search: SubsubsectionSpecialListSearch = {},
) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useSubsubsectionSpecialRouteLinks(
  projectSlug: string,
  searchOverride?: SubsubsectionSpecialListSearch,
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

export function useSubsubsectionSpecialMutations(
  projectSlug: string,
  search: SubsubsectionSpecialListSearch = {},
) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "subsubsectionSpecials",
    projectSlug,
    listNavigateOptions: buildSubsubsectionSpecialListNavigateOptions(projectSlug, search),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["adminLookupRowsWithCount", { projectSlug, table: "subsubsectionSpecials" }],
      })
    },
  })
}
