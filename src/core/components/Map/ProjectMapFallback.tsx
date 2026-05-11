import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { BaseMap } from "./BaseMap"
import { GERMANY_VIEW_BOUNDS } from "./germanyViewBounds"
import { getStaticOverlayForProject } from "./staticOverlay/getStaticOverlayForProject"
import { geometriesBbox } from "./utils/bboxHelpers"

type Props = { subsections: TSubsections }

export const ProjectMapFallback = ({ subsections }: Props) => {
  const projectSlug = useProjectSlug()
  const bounds = geometriesBbox(subsections.map((ss) => ss.geometry))

  return (
    <section className="relative mt-3">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: subsections.length ? bounds : GERMANY_VIEW_BOUNDS,
          fitBoundsOptions: { padding: 60 },
        }}
        colorSchema="subsection"
        staticOverlay={getStaticOverlayForProject(projectSlug)}
      />
      <ZeroCase visible name="Planungsabschnitte" />
    </section>
  )
}
