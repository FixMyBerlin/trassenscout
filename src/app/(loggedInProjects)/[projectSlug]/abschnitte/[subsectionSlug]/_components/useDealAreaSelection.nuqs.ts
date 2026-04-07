"use client"

import { parseAsInteger, useQueryState } from "nuqs"

export const useDealAreaSelection = () => {
  const [dealAreaId, setDealAreaId] = useQueryState("dealAreaId", parseAsInteger)
  return { dealAreaId, setDealAreaId }
}
