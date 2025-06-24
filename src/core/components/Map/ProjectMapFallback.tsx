import { SubsectionWithPositionAndStatus } from "@/src/server/subsections/queries/getSubsections"
import { LngLatBoundsLike } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import { subsectionsBbox } from "./utils"

type Props = { subsections: SubsectionWithPositionAndStatus[] }

export const ProjectMapFallback: React.FC<Props> = ({ subsections }) => {
  // germany
  const fallbackBounds = [
    5.98865807458, 47.3024876979, 15.0169958839, 54.983104153,
  ] as LngLatBoundsLike
  return (
    <section className="relative mt-3">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: subsections.length ? subsectionsBbox(subsections) : fallbackBounds,
          fitBoundsOptions: { padding: 60 },
        }}
      />
      <div className="absolute inset-x-0 bottom-12 mx-4 bg-white/80 p-4 px-8 text-center font-sans">
        Noch keine Planungsabschnitte angelegt
      </div>
    </section>
  )
}
