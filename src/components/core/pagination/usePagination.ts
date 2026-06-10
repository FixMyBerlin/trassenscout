import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { toPageSearchParams } from "@/src/shared/pagination/toPageSearchParams"

type PaginatedSearch = {
  page?: number
  pageSize?: number
  [key: string]: unknown
}

type UsePaginationOptions = {
  defaultPageSize?: number
}

type PaginatedNavigate = (options: {
  search: PaginatedSearch | ((previous: PaginatedSearch) => PaginatedSearch)
  replace?: boolean
  resetScroll?: boolean
}) => void

export function usePagination(
  search: PaginatedSearch,
  navigate: PaginatedNavigate,
  { defaultPageSize = 25 }: UsePaginationOptions = {},
) {
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? defaultPageSize

  const goToPage = (nextPage: number) => {
    navigate({
      search: (previous) => {
        const currentPageSize = previous.pageSize ?? defaultPageSize
        const pageParams = toPageSearchParams(
          { page: nextPage, pageSize: currentPageSize },
          { defaultPageSize },
        )
        const { page: _page, pageSize: _pageSize, ...rest } = previous

        return { ...rest, ...pageParams }
      },
      ...preserveScrollNavigateOptions,
    })
  }

  return { page, pageSize, goToPage, search }
}
