import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type QualityLevelListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(projectSlug: string, search: QualityLevelListSearch = {}) {
  return {
    to: "/$projectSlug/quality-levels" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: QualityLevelListSearch = {}) {
  return {
    to: "/$projectSlug/quality-levels/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(projectSlug: string, id: number, search: QualityLevelListSearch = {}) {
  return {
    to: "/$projectSlug/quality-levels/$qualityLevelId/edit" as const,
    params: { projectSlug, qualityLevelId: String(id) },
    search: preserveFromSearch(search),
  }
}

function buildQualityLevelListNavigateOptions(
  projectSlug: string,
  search: QualityLevelListSearch = {},
) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useQualityLevelRouteLinks(
  projectSlug: string,
  searchOverride?: QualityLevelListSearch,
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

export function useQualityLevelMutations(projectSlug: string, search: QualityLevelListSearch = {}) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "qualityLevels",
    projectSlug,
    listNavigateOptions: buildQualityLevelListNavigateOptions(projectSlug, search),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["adminLookupRowsWithCount", { projectSlug, table: "qualityLevels" }],
      })
    },
  })
}
