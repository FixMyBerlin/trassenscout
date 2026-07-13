import { getRouteApi } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"

const landAcquisitionRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard/land-acquisition/",
)

export function useAcquisitionAreaSelection() {
  const { acquisitionAreaId: urlAcquisitionAreaId } = landAcquisitionRouteApi.useSearch()
  const navigate = landAcquisitionRouteApi.useNavigate()
  const [stickyAcquisitionAreaId, setStickyAcquisitionAreaId] = useState<number | undefined>(
    urlAcquisitionAreaId,
  )

  useEffect(() => {
    if (urlAcquisitionAreaId !== undefined) {
      setStickyAcquisitionAreaId(urlAcquisitionAreaId)
    }
  }, [urlAcquisitionAreaId])

  const setAcquisitionAreaId = async (value: number | null) => {
    const next = value ?? undefined
    setStickyAcquisitionAreaId(next)
    await navigate({
      search: { acquisitionAreaId: next },
      ...preserveScrollNavigateOptions,
    })
  }

  return {
    acquisitionAreaId: urlAcquisitionAreaId ?? stickyAcquisitionAreaId,
    setAcquisitionAreaId,
  }
}
