"use client"

import { parseAsInteger, useQueryState } from "nuqs"

export const useAcquisitionAreaSelection = () => {
  const [acquisitionAreaId, setAcquisitionAreaId] = useQueryState(
    "acquisitionAreaId",
    parseAsInteger,
  )
  return { acquisitionAreaId, setAcquisitionAreaId }
}
