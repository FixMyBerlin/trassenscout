import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { OPERATORS_DEFAULT_PAGE_SIZE } from "@/src/shared/operators/searchSchemas"
import {
  preserveFromSearch,
  preservePaginatedListSearch,
} from "@/src/shared/routing/preserveListSearch"

export type OperatorListSearch = {
  from?: string
  page?: number
  pageSize?: number
}

type OperatorLinkSearch = Record<string, string | undefined>

function preserveListSearch(search: OperatorListSearch): OperatorLinkSearch {
  return preservePaginatedListSearch(search, {
    defaultPageSize: OPERATORS_DEFAULT_PAGE_SIZE,
  }) as OperatorLinkSearch
}

function buildListLink(projectSlug: string, search: OperatorListSearch = {}) {
  return {
    to: "/$projectSlug/operators" as const,
    params: { projectSlug },
    search: preserveListSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: OperatorListSearch = {}) {
  return {
    to: "/$projectSlug/operators/new" as const,
    params: { projectSlug },
    search: preserveListSearch(search),
  }
}

function buildEditLink(projectSlug: string, id: number, search: OperatorListSearch = {}) {
  return {
    to: "/$projectSlug/operators/$operatorId/edit" as const,
    params: { projectSlug, operatorId: String(id) },
    search: preserveFromSearch(search),
  }
}

function buildOperatorListNavigateOptions(projectSlug: string, search: OperatorListSearch = {}) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useOperatorRouteLinks(projectSlug: string, searchOverride?: OperatorListSearch) {
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

export function useOperatorMutations(projectSlug: string, search: OperatorListSearch = {}) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "operators",
    projectSlug,
    listNavigateOptions: buildOperatorListNavigateOptions(projectSlug, search),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["operatorsPaginated", { projectSlug }],
      })
      void queryClient.invalidateQueries({
        queryKey: ["adminLookupRowsWithCount", { projectSlug, table: "operators" }],
      })
    },
  })
}
