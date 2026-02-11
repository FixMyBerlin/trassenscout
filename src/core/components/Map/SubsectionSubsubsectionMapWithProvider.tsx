"use client"
import type { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { MapProvider } from "react-map-gl/maplibre"
import { SubsectionSubsubsectionMap } from "./SubsectionSubsubsectionMap"
import type { StaticOverlayConfig } from "./staticOverlay/staticOverlay.types"

type Props = {
  subsections: TGetSubsection[]
  selectedSubsection: TGetSubsection
  subsubsections: SubsubsectionWithPosition[]
  staticOverlay?: StaticOverlayConfig
}

export const SubsectionSubsubsectionMapWithProvider = (props: Props) => {
  return (
    <MapProvider>
      <SubsectionSubsubsectionMap {...props} />
    </MapProvider>
  )
}
