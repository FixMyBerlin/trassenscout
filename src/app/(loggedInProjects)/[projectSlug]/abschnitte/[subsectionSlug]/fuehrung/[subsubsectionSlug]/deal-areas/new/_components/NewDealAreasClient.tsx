"use client"

import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { MapProvider } from "react-map-gl/maplibre"
import { DealAreaMap } from "./DealAreaMap"

type Props = {
  initialSubsubsection: Awaited<ReturnType<typeof getSubsubsection>>
}

export function NewDealAreasClient({ initialSubsubsection }: Props) {
  return (
    <MapProvider>
      <DealAreaMap subsubsection={initialSubsubsection} />
    </MapProvider>
  )
}
