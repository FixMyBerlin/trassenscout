import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { featureCollection, point } from "@turf/helpers"
import { bbox } from "@turf/turf"
import type { FeatureCollection, Point } from "geojson"
import { RefObject, useEffect, useRef, useState } from "react"
import type { MapLayerMouseEvent, MapProps } from "react-map-gl/maplibre"
import { useMap } from "react-map-gl/maplibre"
import { BaseMap } from "@/src/components/core/components/Map/BaseMap"
import { type UnifiedFeatureProperties } from "@/src/components/core/components/Map/layers/UnifiedFeaturesLayer"
import { useMapLoaded } from "@/src/components/core/components/Map/map-loaded-store"
import { ProjectMarkers } from "@/src/components/core/components/Map/markers/ProjectMarkers"
import { projectDashboardGeometriesQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"

type Bbox2D = [number, number, number, number]
const DASHBOARD_LABEL_MIN_ZOOM = 5

type DashboardMapFeatures = {
  boundingBox: Bbox2D | null
  projectPoints: FeatureCollection<Point, UnifiedFeatureProperties> | null
}

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
  classHeight?: string
}

function getDashboardMapFeatures(
  projects: ProjectsWithGeometryWithMembershipRole,
): DashboardMapFeatures {
  const previewPoints = projects.flatMap((project) =>
    project.previewPoint ? [{ slug: project.slug, coordinates: project.previewPoint }] : [],
  )

  if (previewPoints.length === 0) {
    return { boundingBox: null, projectPoints: null }
  }

  return {
    boundingBox: bbox(
      featureCollection(previewPoints.map(({ coordinates }) => point(coordinates))),
    ) as Bbox2D,
    projectPoints: featureCollection(
      previewPoints.map(({ slug, coordinates }) =>
        point(coordinates, {
          projectSlug: slug,
          featureId: slug,
          style: "REGULAR",
        }),
      ),
    ),
  }
}

function DashboardGeometryAutoFit({
  boundingBox,
  userInteractedWithMapRef,
}: {
  boundingBox: Bbox2D | null | undefined
  userInteractedWithMapRef: RefObject<boolean>
}) {
  const { mainMap } = useMap()
  const mapLoaded = useMapLoaded("mainMap")
  const didFitRef = useRef(false)

  useEffect(
    function fitDeferredDashboardGeometryBounds() {
      if (
        !boundingBox ||
        !mainMap ||
        !mapLoaded ||
        userInteractedWithMapRef.current ||
        didFitRef.current
      ) {
        return
      }

      didFitRef.current = true
      mainMap.fitBounds(
        [
          [boundingBox[0], boundingBox[1]],
          [boundingBox[2], boundingBox[3]],
        ],
        { padding: 60, maxZoom: 8, duration: 0 },
      )
    },
    [boundingBox, mainMap, mapLoaded, userInteractedWithMapRef],
  )

  return null
}

export const DashboardMap = ({ projects, classHeight }: Props) => {
  const navigate = useNavigate()
  const [dotMode, setDotMode] = useState<boolean | null>(null)
  const userInteractedWithMapRef = useRef(false)
  const { data: dashboardGeometries } = useQuery(projectDashboardGeometriesQueryOptions())
  const { boundingBox, projectPoints } = getDashboardMapFeatures(projects)
  const hasDashboardGeometry = Boolean(
    (dashboardGeometries?.lines.features.length ?? 0) +
    (dashboardGeometries?.polygons.features.length ?? 0),
  )

  const handleSelect = (projectSlug: string) => {
    if (!projectSlug) return
    void navigate({ to: "/$projectSlug", params: { projectSlug } })
  }

  const handleClickMap = (event: MapLayerMouseEvent) => {
    const properties = event.features?.at(0)?.properties as UnifiedFeatureProperties | undefined
    if (properties?.projectSlug) {
      handleSelect(properties.projectSlug)
    }
  }

  if (!boundingBox) return null

  const handleLoad: NonNullable<MapProps["onLoad"]> = (event) => {
    setDotMode(event.target.getZoom() < DASHBOARD_LABEL_MIN_ZOOM)
  }

  const handleMoveStart: NonNullable<MapProps["onMoveStart"]> = (event) => {
    if (event.originalEvent) {
      userInteractedWithMapRef.current = true
    }
  }

  const handleZoomEnd: NonNullable<MapProps["onZoomEnd"]> = (event) => {
    setDotMode(event.viewState.zoom < DASHBOARD_LABEL_MIN_ZOOM)
  }

  return (
    <section className={classHeight ? "flex min-h-0 flex-1 flex-col" : "mt-3 mb-10"}>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: boundingBox,
          fitBoundsOptions: { padding: 60, maxZoom: 8 },
        }}
        onClick={handleClickMap}
        onLoad={handleLoad}
        onMoveStart={handleMoveStart}
        onZoomEnd={handleZoomEnd}
        lines={dashboardGeometries?.lines.features.length ? dashboardGeometries.lines : undefined}
        polygons={
          dashboardGeometries?.polygons.features.length ? dashboardGeometries.polygons : undefined
        }
        points={hasDashboardGeometry ? undefined : (projectPoints ?? undefined)}
        colorSchema="subsection"
        restrictHighlightToLevel="project"
        classHeight={classHeight}
      >
        <DashboardGeometryAutoFit
          boundingBox={dashboardGeometries?.boundingBox}
          userInteractedWithMapRef={userInteractedWithMapRef}
        />
        <ProjectMarkers projects={projects} dotMode={dotMode} onSelect={handleSelect} />
      </BaseMap>
    </section>
  )
}
