import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { LngLatBoundsLike } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import type { StaticOverlayConfig } from "./staticOverlay/staticOverlay.types"
import { geometriesBbox } from "./utils/bboxHelpers"

type Props = { subsections: TSubsections; staticOverlay?: StaticOverlayConfig }

export const ProjectMapFallback = ({ subsections, staticOverlay }: Props) => {
  const bounds = geometriesBbox(subsections.map((ss) => ss.geometry))
  const fallbackBoundsGermany = [
    5.98865807458, 47.3024876979, 15.0169958839, 54.983104153,
  ] as LngLatBoundsLike

  return (
    <section className="relative mt-3">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: subsections.length ? bounds : fallbackBoundsGermany,
          fitBoundsOptions: { padding: 60 },
        }}
        colorSchema="subsection"
        staticOverlay={staticOverlay}
      />
      <ZeroCase visible name="Planungsabschnitte" />
    </section>
  )
}
