import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { featureCollection, point } from "@turf/helpers"
import { bbox } from "@turf/turf"
import type { FeatureCollection, LineString, Polygon } from "geojson"
import type { MapLibreEvent } from "maplibre-gl"
import { useEffect, useEffectEvent, useRef, useState } from "react"
import type { MapLayerMouseEvent, MapProps } from "react-map-gl/maplibre"
import { useMap } from "react-map-gl/maplibre"
import { BaseMap } from "@/src/components/core/components/Map/BaseMap"
import { type UnifiedFeatureProperties } from "@/src/components/core/components/Map/layers/UnifiedFeaturesLayer"
import { useMapLoaded } from "@/src/components/core/components/Map/map-loaded-store"
import { ProjectMarkers } from "@/src/components/core/components/Map/markers/ProjectMarkers"
import type { Bbox2D } from "@/src/components/core/components/Map/utils/bboxHelpers"
import { projectDashboardGeometriesQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"

const DASHBOARD_LABEL_MIN_ZOOM = 5
/** Overview of every project. maxZoom keeps a tight cluster of preview points from filling the map. */
const DASHBOARD_FIT_BOUNDS_OPTIONS = { padding: 60, maxZoom: 8 }
/**
 * Single-project focus. The project page fits an operator filter with 60px of padding;
 * the dashboard leaves about four times that around the project.
 */
const DASHBOARD_PROJECT_FIT_PADDING = 60 * 4

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
  classHeight?: string
}

function getDashboardMapFeatures(projects: ProjectsWithGeometryWithMembershipRole) {
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
          style: "REGULAR" as const,
        }),
      ),
    ),
  }
}

function geometryBoundingBoxForProjects(
  projects: ProjectsWithGeometryWithMembershipRole,
  geometries: {
    lines: FeatureCollection<LineString, UnifiedFeatureProperties>
    polygons: FeatureCollection<Polygon, UnifiedFeatureProperties>
  },
) {
  const slugs = new Set(projects.map((project) => project.slug))
  const features = [...geometries.lines.features, ...geometries.polygons.features].filter(
    (feature) =>
      feature.properties?.projectSlug ? slugs.has(feature.properties.projectSlug) : false,
  )
  if (features.length === 0) return null
  return bbox({ type: "FeatureCollection", features }) as Bbox2D
}

function DashboardGeometryAutoFit({
  boundingBox,
  projectFilterKey,
  padding,
  maxZoom,
}: {
  boundingBox: Bbox2D | null
  projectFilterKey: string
  padding: number
  maxZoom?: number
}) {
  const { mainMap } = useMap()
  const mapLoaded = useMapLoaded("mainMap")
  const userInteractedRef = useRef(false)
  const projectFilterKeyRef = useRef(projectFilterKey)
  const fittedKeyRef = useRef<string | null>(null)
  // Turf returns a new bbox array every render. The key is the values, so a refetch does not refit.
  const boundingBoxKey = boundingBox?.join(",") ?? ""

  useEffect(
    function trackUserMapInteraction() {
      if (!mainMap) return

      const handleMoveStart = (event: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent>) => {
        if (event.originalEvent) userInteractedRef.current = true
      }

      mainMap.on("movestart", handleMoveStart)
      return function stopTrackingUserMapInteraction() {
        mainMap.off("movestart", handleMoveStart)
      }
    },
    [mainMap],
  )

  const fitMapToBoundingBox = useEffectEvent(function fitMapToBoundingBox(animate: boolean) {
    if (!boundingBox || !mainMap) return
    const canvas = mainMap.getMap().getCanvas()
    const maxPadding = Math.floor(Math.min(canvas.clientWidth, canvas.clientHeight) / 2) - 1
    mainMap.fitBounds(boundingBox, {
      padding: Math.min(padding, Math.max(0, maxPadding)),
      ...(maxZoom == null ? {} : { maxZoom }),
      ...(animate ? {} : { duration: 0 }),
    })
  })

  useEffect(
    function fitMapToDashboardProject() {
      if (!boundingBoxKey || !mapLoaded) return

      const projectChanged = projectFilterKeyRef.current !== projectFilterKey
      if (projectChanged) {
        projectFilterKeyRef.current = projectFilterKey
        userInteractedRef.current = false
      }

      // Preview points set the first frame. Geometry replaces them once, unless the user already
      // panned. Switching the project always frames that project.
      if (!projectChanged && userInteractedRef.current) return

      const fitKey = `${projectFilterKey}:${boundingBoxKey}`
      if (fittedKeyRef.current === fitKey) return

      fittedKeyRef.current = fitKey
      fitMapToBoundingBox(projectChanged)
    },
    [boundingBoxKey, mapLoaded, projectFilterKey],
  )

  return null
}

export const DashboardMap = ({ projects, classHeight }: Props) => {
  const navigate = useNavigate()
  const [dotMode, setDotMode] = useState<boolean | null>(null)
  const { data: dashboardGeometries } = useQuery(projectDashboardGeometriesQueryOptions())
  const { boundingBox, projectPoints } = getDashboardMapFeatures(projects)
  const geometryBoundingBox = dashboardGeometries
    ? geometryBoundingBoxForProjects(projects, dashboardGeometries)
    : null
  const fitBoundingBox = geometryBoundingBox ?? boundingBox
  const framesOneProject = geometryBoundingBox != null && projects.length === 1
  const fitBoundsOptions = framesOneProject
    ? { padding: DASHBOARD_PROJECT_FIT_PADDING }
    : DASHBOARD_FIT_BOUNDS_OPTIONS
  const projectFilterKey = projects.map((project) => project.slug).join("\0")
  const lines = dashboardGeometries?.lines.features.length ? dashboardGeometries.lines : undefined
  const polygons = dashboardGeometries?.polygons.features.length
    ? dashboardGeometries.polygons
    : undefined
  const hasDashboardGeometry = Boolean(lines || polygons)

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

  const handleZoomEnd: NonNullable<MapProps["onZoomEnd"]> = (event) => {
    setDotMode(event.viewState.zoom < DASHBOARD_LABEL_MIN_ZOOM)
  }

  return (
    <section className={classHeight ? "flex min-h-0 flex-1 flex-col" : "mt-3 mb-10"}>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: fitBoundingBox ?? boundingBox,
          fitBoundsOptions,
        }}
        onClick={handleClickMap}
        onLoad={handleLoad}
        onZoomEnd={handleZoomEnd}
        lines={lines}
        polygons={polygons}
        points={hasDashboardGeometry ? undefined : (projectPoints ?? undefined)}
        colorSchema="subsection"
        restrictHighlightToLevel="project"
        classHeight={classHeight}
      >
        <DashboardGeometryAutoFit
          boundingBox={fitBoundingBox}
          projectFilterKey={projectFilterKey}
          padding={fitBoundsOptions.padding}
          maxZoom={framesOneProject ? undefined : DASHBOARD_FIT_BOUNDS_OPTIONS.maxZoom}
        />
        <ProjectMarkers projects={projects} dotMode={dotMode} onSelect={handleSelect} />
      </BaseMap>
    </section>
  )
}
