import { getRouteApi } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import {
  type ProjectRecordFilter,
  type ProjectRecordsSearch,
} from "@/src/shared/projectRecords/searchSchemas"

const projectRecordsRouteApi = getRouteApi("/_loggedInProjects/$projectSlug/project-records")

type FilterUpdater =
  | ProjectRecordFilter
  | undefined
  | ((previous: ProjectRecordFilter | undefined) => ProjectRecordFilter | undefined)

export function useProjectRecordFilters() {
  const search = projectRecordsRouteApi.useSearch()
  const navigate = projectRecordsRouteApi.useNavigate()
  const filter = search.filter

  const setFilter = async (updater: FilterUpdater) => {
    await navigate({
      to: ".",
      search: (previous: ProjectRecordsSearch) => {
        const next = typeof updater === "function" ? updater(previous.filter) : updater
        return {
          ...previous,
          filter: next,
        }
      },
      ...preserveScrollNavigateOptions,
    })
  }

  return { filter, setFilter }
}
