"use client"

import { parseAsInteger, useQueryState } from "nuqs"
import { useCallback, useEffect, useState } from "react"


export const useAcquisitionAreaSelection = () => {
  const [urlAcquisitionAreaId, setUrlAcquisitionAreaId] = useQueryState(
    "acquisitionAreaId",
    parseAsInteger,
  )
  const [stickyAcquisitionAreaId, setStickyAcquisitionAreaId] = useState<number | null>(
    urlAcquisitionAreaId,
  )

  useEffect(() => {
    if (urlAcquisitionAreaId !== null) {
      setStickyAcquisitionAreaId(urlAcquisitionAreaId)
    }
  }, [urlAcquisitionAreaId])

  const setAcquisitionAreaId = useCallback(
    async (value: number | null) => {
      setStickyAcquisitionAreaId(value)
      await setUrlAcquisitionAreaId(value)
    },
    [setUrlAcquisitionAreaId],
  )

  return {
    acquisitionAreaId: urlAcquisitionAreaId ?? stickyAcquisitionAreaId,
    setAcquisitionAreaId,
  }
}
