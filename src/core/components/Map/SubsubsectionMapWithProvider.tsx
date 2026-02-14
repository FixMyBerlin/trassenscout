"use client"
import type { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { MapProvider } from "react-map-gl/maplibre"
import type { StaticOverlayConfig } from "./staticOverlay/staticOverlay.types"
import { SubsubsectionMap } from "./SubsubsectionMap"

type Props = {
  subsections: TGetSubsection[]
  selectedSubsection: TGetSubsection
  subsubsections: SubsubsectionWithPosition[]
  staticOverlay?: StaticOverlayConfig
}

export const SubsubsectionMapWithProvider = (props: Props) => {
  return (
    <MapProvider>
      <SubsubsectionMap {...props} />
    </MapProvider>
  )
}
