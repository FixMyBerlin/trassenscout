import { getRouteApi } from "@tanstack/react-router"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { BaseMap } from "./BaseMap"
import { GERMANY_VIEW_BOUNDS } from "./germanyViewBounds"
import type { SubsectionMapEntities as TSubsections } from "./mapEntityTypes"
import { getStaticOverlayForProject } from "./staticOverlay/getStaticOverlayForProject"
import { geometriesBbox } from "./utils/bboxHelpers"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = { subsections: TSubsections }

export const ProjectMapFallback = ({ subsections }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const bounds = geometriesBbox(subsections.map((ss) => ss.geometry))

  return (
    <section className="relative mt-3 mb-10">
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
