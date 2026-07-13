import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { useEffect, useEffectEvent, useMemo } from "react"
import { MapLayerMouseEvent, useMap } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import { useMapLoaded } from "./map-loaded-store"
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
  const { mainMap } = useMap()
  const mapLoaded = useMapLoaded("mainMap")

  // bundingBox only changes when subsections change / subsections array is created
  const boundingBox = useMemo(
    () => geometriesBbox(subsections.map((ss) => ss.geometry)),
    [subsections],
  )
  // stable string key so the effect below reacts to the bbox's values, not the array's identity
  // (tanstack query recreates `subsections`, and therefore `boundingBox`, on every window-focus refetch)
  const boundingBoxKey = boundingBox.join(",")

  const fitMapToBoundingBox = useEffectEvent(function fitMapToBoundingBox() {
    if (!mainMap || !mapLoaded) return
    mainMap.fitBounds(boundingBox, { padding: 60 })
  })

  useEffect(
    function fitMapToSelectedSubsections() {
      fitMapToBoundingBox()
    },
    [mapLoaded, boundingBoxKey],
  )

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
