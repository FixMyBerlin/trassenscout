import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"
import { MapLayerMouseEvent } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import type { SubsectionMapEntities as TSubsections } from "./mapEntityTypes"
import { MapFooter } from "./MapFooter"
import { SubsectionMarkers } from "./markers/SubsectionMarkers"
import { projectLegendConfig } from "./ProjectMap.legendConfig"
import { getStaticOverlayForProject } from "./staticOverlay/getStaticOverlayForProject"
import { geometriesBbox } from "./utils/bboxHelpers"
import { getSubsectionFeatures } from "./utils/getSubsectionFeatures"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  subsections: TSubsections
}

export const ProjectMap = ({ subsections }: Props) => {
  const navigate = useNavigate()
  const { projectSlug } = loggedInProjectRouteApi.useParams()

  const boundingBox = geometriesBbox(subsections.map((ss) => ss.geometry))

  type HandleSelectProps = { subsectionSlug: string; edit: boolean }
  const handleSelect = ({ subsectionSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    void navigate({
      to: edit
        ? "/$projectSlug/abschnitte/$subsectionSlug/edit"
        : "/$projectSlug/abschnitte/$subsectionSlug",
      params: { projectSlug, subsectionSlug },
    })
  }

  const handleClickMap = (e: MapLayerMouseEvent) => {
    const subsectionSlug = e.features?.at(0)?.properties?.subsectionSlug
    if (subsectionSlug) {
      handleSelect({ subsectionSlug, edit: e.originalEvent?.altKey })
    }
  }

  const {
    lines: selectableLines,
    polygons: selectablePolygons,
    lineEndPoints: lineEndPointsGeoms,
  } = useMemo(() => getSubsectionFeatures({ subsections, highlight: "all" }), [subsections])

  return (
    <section className="mt-3">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: boundingBox,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        lines={selectableLines}
        polygons={selectablePolygons}
        lineEndPoints={lineEndPointsGeoms}
        colorSchema="subsection"
        staticOverlay={getStaticOverlayForProject(projectSlug)}
      >
        <SubsectionMarkers subsections={subsections} onSelect={handleSelect} />
      </BaseMap>
      <MapFooter legendItemsConfig={projectLegendConfig} />
    </section>
  )
}
