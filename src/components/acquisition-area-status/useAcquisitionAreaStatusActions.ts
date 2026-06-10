import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type AcquisitionAreaStatusListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(projectSlug: string, search: AcquisitionAreaStatusListSearch = {}) {
  return {
    to: "/$projectSlug/acquisition-area-status" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: AcquisitionAreaStatusListSearch = {}) {
  return {
    to: "/$projectSlug/acquisition-area-status/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(
  projectSlug: string,
  id: number,
  search: AcquisitionAreaStatusListSearch = {},
) {
  return {
    to: "/$projectSlug/acquisition-area-status/$acquisitionAreaStatusId/edit" as const,
    params: { projectSlug, acquisitionAreaStatusId: String(id) },
    search: preserveFromSearch(search),
  }
}

export function buildAcquisitionAreaStatusListNavigateOptions(
  projectSlug: string,
  search: AcquisitionAreaStatusListSearch = {},
) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useAcquisitionAreaStatusRouteLinks(
  projectSlug: string,
  searchOverride?: AcquisitionAreaStatusListSearch,
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

export function useAcquisitionAreaStatusMutations(
  projectSlug: string,
  search: AcquisitionAreaStatusListSearch = {},
) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "acquisitionAreaStatuses",
    projectSlug,
    listNavigateOptions: buildAcquisitionAreaStatusListNavigateOptions(projectSlug, search),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["adminLookupRowsWithCount", { projectSlug, table: "acquisitionAreaStatuses" }],
      })
    },
  })
}
