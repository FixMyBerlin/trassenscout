import { useNavigate } from "@tanstack/react-router"
import { featureCollection, point } from "@turf/helpers"
import { bbox } from "@turf/turf"
import type { FeatureCollection, Point } from "geojson"
import type { MapLayerMouseEvent } from "react-map-gl/maplibre"
import { BaseMap } from "@/src/components/core/components/Map/BaseMap"
import {
  getUnifiedClickTargetLayerIds,
  type UnifiedFeatureProperties,
} from "@/src/components/core/components/Map/layers/UnifiedFeaturesLayer"
import { ProjectMarkers } from "@/src/components/core/components/Map/markers/ProjectMarkers"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"

type Bbox2D = [number, number, number, number]

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

export const DashboardMap = ({ projects, classHeight }: Props) => {
  const navigate = useNavigate()
  const { boundingBox, projectPoints } = getDashboardMapFeatures(projects)

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

  return (
    <section className={classHeight ? "flex min-h-0 flex-1 flex-col" : "mt-3 mb-10"}>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: boundingBox,
          fitBoundsOptions: { padding: 60, maxZoom: 8 },
        }}
        onClick={handleClickMap}
        interactiveLayerIds={getUnifiedClickTargetLayerIds("")}
        points={projectPoints ?? undefined}
        colorSchema="subsection"
        restrictHighlightToLevel="project"
        classHeight={classHeight}
      >
        <ProjectMarkers projects={projects} onSelect={handleSelect} />
      </BaseMap>
    </section>
  )
}
