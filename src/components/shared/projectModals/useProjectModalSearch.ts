import { useSearch } from "@tanstack/react-router"
import { parseProjectModalSearch } from "@/src/shared/projectModals/searchSchemas"

export function useProjectModalSearch() {
  const rawSearch = useSearch({ strict: false, shouldThrow: false })

  return parseProjectModalSearch(rawSearch)
}
