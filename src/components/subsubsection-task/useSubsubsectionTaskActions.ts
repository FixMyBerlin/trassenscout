import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { z } from "zod"
import { useLookupRowMutations } from "@/src/components/adminLookupTables/useLookupRowMutations"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"

export type SubsubsectionTaskListSearch = z.infer<typeof fromBackLinkSearchSchema>

function buildListLink(projectSlug: string, search: SubsubsectionTaskListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-task" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildNewLink(projectSlug: string, search: SubsubsectionTaskListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-task/new" as const,
    params: { projectSlug },
    search: preserveFromSearch(search),
  }
}

function buildEditLink(projectSlug: string, id: number, search: SubsubsectionTaskListSearch = {}) {
  return {
    to: "/$projectSlug/subsubsection-task/$subsubsectionTaskId/edit" as const,
    params: { projectSlug, subsubsectionTaskId: String(id) },
    search: preserveFromSearch(search),
  }
}

export function buildSubsubsectionTaskListNavigateOptions(
  projectSlug: string,
  search: SubsubsectionTaskListSearch = {},
) {
  return { ...buildListLink(projectSlug, search), replace: true as const }
}

export function useSubsubsectionTaskRouteLinks(
  projectSlug: string,
  searchOverride?: SubsubsectionTaskListSearch,
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

export function useSubsubsectionTaskMutations(
  projectSlug: string,
  search: SubsubsectionTaskListSearch = {},
) {
  const queryClient = useQueryClient()

  return useLookupRowMutations({
    table: "subsubsectionTasks",
    projectSlug,
    listNavigateOptions: buildSubsubsectionTaskListNavigateOptions(projectSlug, search),
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["adminLookupRowsWithCount", { projectSlug, table: "subsubsectionTasks" }],
      })
    },
  })
}
