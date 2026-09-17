import { useSearch } from "@tanstack/react-router"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"

/** The path wins, so a stale `modalProjectSlug` cannot point the overlay at another project. */
export function useProjectModalSlug() {
  const routeProjectSlug = useTryRouteParam("projectSlug")
  const searchProjectSlug = useSearch({
    strict: false,
    shouldThrow: false,
    select: (search): string | undefined => search?.modalProjectSlug,
  })

  return routeProjectSlug ?? searchProjectSlug
}
