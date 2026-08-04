import { getRouteApi } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import type { UploadFilter, UploadsSearch } from "@/src/shared/uploads/searchSchemas"

const uploadsRouteApi = getRouteApi("/_loggedInProjects/$projectSlug/uploads/")

type FilterUpdater =
  | UploadFilter
  | undefined
  | ((previous: UploadFilter | undefined) => UploadFilter | undefined)

export function useUploadFilters() {
  const search = uploadsRouteApi.useSearch()
  const navigate = uploadsRouteApi.useNavigate()
  const filter = search.filter

  const setFilter = async (updater: FilterUpdater) => {
    await navigate({
      to: ".",
      search: (previous: UploadsSearch) => {
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
