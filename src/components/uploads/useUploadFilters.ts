import { getRouteApi } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { mergeSearchtermTagFilter } from "@/src/shared/tags/tagFilter"
import type { UploadFilter, UploadsSearch } from "@/src/shared/uploads/searchSchemas"

const uploadsRouteApi = getRouteApi("/_loggedInProjects/$projectSlug/uploads/")

export function useUploadFilters() {
  const search = uploadsRouteApi.useSearch()
  const navigate = uploadsRouteApi.useNavigate()
  const filter = search.filter

  /** Merges into the current filter; `undefined` resets it. */
  const setFilter = async (patch: Partial<UploadFilter> | undefined) => {
    await navigate({
      to: ".",
      search: (previous: UploadsSearch) => ({
        ...previous,
        filter: mergeSearchtermTagFilter(previous.filter, patch),
      }),
      ...preserveScrollNavigateOptions,
    })
  }

  return { filter, setFilter }
}
