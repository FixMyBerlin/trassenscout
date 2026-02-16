import { useUserCan } from "@/src/app/_components/memberships/hooks/useUserCan"
import { subsectionDashboardRoute, subsectionEditRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { MapEvent, MapLayerMouseEvent, ViewStateChangeEvent, useMap } from "react-map-gl/maplibre"
import { BaseMap } from "./BaseMap"
import { MapFooter } from "./MapFooter"
import { projectLegendConfig } from "./ProjectMap.legendConfig"
import { SubsectionMarkers } from "./markers/SubsectionMarkers"
import type { StaticOverlayConfig } from "./staticOverlay/staticOverlay.types"
import { geometriesBbox } from "./utils/bboxHelpers"
import { getSubsectionFeatures } from "./utils/getSubsectionFeatures"

type Props = {
  subsections: TSubsections
  staticOverlay?: StaticOverlayConfig
}

export const ProjectMap = ({ subsections, staticOverlay }: Props) => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const { mainMap } = useMap()
  const userCan = useUserCan()

  // bundingBox only changes when subsections change / subsections array is created
  const boundingBox = useMemo(() => {
    const geometries = subsections.map((ss) => ss.geometry)
    return geometriesBbox(geometries)
  }, [subsections])

  // we do not want to fitBounds everytime the subsections array is created (tanstack query refetches subsections on window focus)
  // we could disable refetchOnWindowFocus, in [projectId]/index.tsx with {refetchOnWindowFocus: false} https://blitzjs.com/docs/query-usage
  // but then we would not get the latest data when the user comes back to the page

  // we spread boundingBox in the dependency array to make sure the effect runs when the values of boundingBox change (not everytime the array is created)
  useEffect(() => {
    mainMap?.fitBounds(boundingBox, { padding: 60 })
  }, [mainMap, boundingBox])

  type HandleSelectProps = { subsectionSlug: string; edit: boolean }
  const handleSelect = ({ subsectionSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    const url =
      userCan.edit && edit
        ? subsectionEditRoute(projectSlug, subsectionSlug)
        : subsectionDashboardRoute(projectSlug, subsectionSlug)

    router.push(url, { scroll: edit })
  }

  const handleClickMap = (e: MapLayerMouseEvent) => {
    const subsectionSlug = e.features?.at(0)?.properties?.subsectionSlug
    if (subsectionSlug) {
      handleSelect({ subsectionSlug, edit: e.originalEvent?.altKey })
    }
  }

  const [zoom, setZoom] = useState<number | null>(null)
  const handleZoomEnd = (e: ViewStateChangeEvent) => setZoom(e.viewState.zoom)
  const handleZoomOnLoad = (e: MapEvent) => setZoom(e.target.getZoom())

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
        onZoomEnd={handleZoomEnd}
        onLoad={handleZoomOnLoad}
        lines={selectableLines}
        polygons={selectablePolygons}
        lineEndPoints={lineEndPointsGeoms}
        colorSchema="subsection"
        staticOverlay={staticOverlay}
      >
        <SubsectionMarkers subsections={subsections} zoom={zoom} onSelect={handleSelect} />
      </BaseMap>
      <MapFooter legendItemsConfig={projectLegendConfig} />
    </section>
  )
}
