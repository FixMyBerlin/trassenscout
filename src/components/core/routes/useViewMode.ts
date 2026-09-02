import { useNavigate } from "@tanstack/react-router"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { parseViewMode, type ViewMode } from "@/src/shared/routing/viewModeSearch"

export function useViewMode() {
  const navigate = useNavigate()
  const viewMode = parseViewMode(useTryRouteSearchKey("view"))

  const setViewMode = (view: ViewMode) => {
    void navigate({
      to: ".",
      search: (previous) => ({ ...previous, view }),
      resetScroll: false,
    })
  }

  return { viewMode, setViewMode }
}
