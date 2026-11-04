import { useNavigate } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"

export function useSubsubsectionSearch() {
  const navigate = useNavigate()
  const searchterm = useTryRouteSearchKey("searchterm") ?? ""

  const setSearchterm = (next: string) => {
    void navigate({
      to: ".",
      search: (previous) => ({ ...previous, searchterm: next || undefined }),
      ...preserveScrollNavigateOptions,
    })
  }

  return {
    searchterm,
    isSearching: Boolean(normalizeSearchterm(searchterm)),
    setSearchterm,
  }
}
