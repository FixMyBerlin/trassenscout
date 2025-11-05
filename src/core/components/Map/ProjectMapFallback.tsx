import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { SubsectionWithPositionAndStatus } from "@/src/server/subsections/queries/getSubsections"
import { LngLatBoundsLike } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import { subsectionsBbox } from "./utils/subsectionsBbox"

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
      <ZeroCase visible name="Planungsabschnitte" />
    </section>
  )
}
