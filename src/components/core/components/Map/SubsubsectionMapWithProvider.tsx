import { MapProvider } from "react-map-gl/maplibre"
import type { SubsectionMapEntity as TGetSubsection } from "./mapEntityTypes"
import type { SubsubsectionMapEntity as SubsubsectionWithPosition } from "./mapEntityTypes"
import { SubsubsectionMap } from "./SubsubsectionMap"

type Props = {
  projectSlug: string
  subsectionSlug: string
  subsections: TGetSubsection[]
  selectedSubsection: TGetSubsection
  subsubsections: SubsubsectionWithPosition[]
  selectedSubsubsectionSlug?: string
  clusterSubsubsections?: boolean
}

export const SubsubsectionMapWithProvider = (props: Props) => {
  return (
    <MapProvider>
      <SubsubsectionMap {...props} />
    </MapProvider>
  )
}
