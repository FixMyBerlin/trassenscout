import { getRouteApi } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"

const landAcquisitionRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard/land-acquisition/",
)

type SelectableAcquisitionArea = {
  id: number
}

export function useAcquisitionAreaSelection<TAcquisitionArea extends SelectableAcquisitionArea>(
  acquisitionAreas?: readonly TAcquisitionArea[],
) {
  const { acquisitionAreaId: urlAcquisitionAreaId } = landAcquisitionRouteApi.useSearch()
  const navigate = landAcquisitionRouteApi.useNavigate()

  const setAcquisitionAreaId = async (value: number | null) => {
    const next = value ?? undefined
    await navigate({
      search: { acquisitionAreaId: next },
      ...preserveScrollNavigateOptions,
    })
  }

  // An id that is not in the list (area deleted, link copied from another Maßnahme) is ignored
  // rather than left selected: with a single area the SelectListbox is not rendered, so a stale id
  // would strand the page on an empty selection with no way back except editing the URL.
  // Only once the areas have loaded — an empty list still means "unknown", not "not found".
  const areasLoaded = Boolean(acquisitionAreas?.length)
  const urlAcquisitionAreaExists = acquisitionAreas?.some(
    (acquisitionArea) => acquisitionArea.id === urlAcquisitionAreaId,
  )
  const knownUrlAcquisitionAreaId =
    !areasLoaded || urlAcquisitionAreaExists ? urlAcquisitionAreaId : undefined

  const fallbackAcquisitionAreaId =
    knownUrlAcquisitionAreaId === undefined && acquisitionAreas?.length === 1
      ? acquisitionAreas[0]?.id
      : undefined
  const effectiveAcquisitionAreaId = knownUrlAcquisitionAreaId ?? fallbackAcquisitionAreaId
  const selectedAcquisitionArea = acquisitionAreas?.find(
    (acquisitionArea) => acquisitionArea.id === effectiveAcquisitionAreaId,
  )

  return {
    acquisitionAreaId: effectiveAcquisitionAreaId,
    selectedAcquisitionArea,
    setAcquisitionAreaId,
  }
}
