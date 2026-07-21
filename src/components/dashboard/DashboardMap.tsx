import { useNavigate } from "@tanstack/react-router"
import { featureCollection } from "@turf/helpers"
import type { Feature } from "geojson"
import { useMemo } from "react"
import type { MapLayerMouseEvent } from "react-map-gl/maplibre"
import { BaseMap } from "@/src/components/core/components/Map/BaseMap"
import { ProjectMarkers } from "@/src/components/core/components/Map/markers/ProjectMarkers"
import { geometriesBbox } from "@/src/components/core/components/Map/utils/bboxHelpers"
import {
  getSubsectionFeatures,
  type LineProperties,
  type PolygonProperties,
} from "@/src/components/core/components/Map/utils/getSubsectionFeatures"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
  classHeight?: string
}

export const DashboardMap = ({ projects, classHeight }: Props) => {
  const navigate = useNavigate()

  const handleSelect = (projectSlug: string) => {
    if (!projectSlug) return
    void navigate({ to: "/$projectSlug", params: { projectSlug } })
  }

  const handleClickMap = (e: MapLayerMouseEvent) => {
    const feature = e.features?.at(0)
    const projectSlug = feature?.properties?.projectSlug as string | undefined
    if (projectSlug) {
      handleSelect(projectSlug)
    }
  }

  const projectSlugMap = useMemo(() => {
    const map = new Map<string, string>()
    projects.forEach((project) => {
      project.subsections.forEach((subsection) => {
        map.set(subsection.slug, project.slug)
      })
    })
    return map
  }, [projects])

  const { lines, polygons, lineEndPoints, boundingBox } = useMemo(() => {
    const subsections = projects.flatMap((project) => project.subsections)
    const { lines, polygons, lineEndPoints } = getSubsectionFeatures({
      subsections,
      highlight: "all",
    })

    const processedLines = lines.features.map((feature) => {
      const projectSlug = projectSlugMap.get(feature.properties.subsectionSlug)
      return {
        ...feature,
        properties: {
          ...feature.properties,
          projectSlug,
        } as LineProperties & { projectSlug?: string },
      }
    })

    const processedPolygons = polygons.features.map((feature) => {
      const projectSlug = projectSlugMap.get(feature.properties.subsectionSlug)
      return {
        ...feature,
        properties: { ...feature.properties, projectSlug } as PolygonProperties & {
          projectSlug?: string
        },
      }
    })

    const processedLineEndPoints = lineEndPoints.features.map((feature) => {
      const projectSlug = feature.properties.subsectionSlug
        ? projectSlugMap.get(feature.properties.subsectionSlug)
        : undefined
      return {
        ...feature,
        properties: {
          ...feature.properties,
          projectSlug,
        },
      }
    })

    const selectableLines = featureCollection(processedLines)
    const selectablePolygons = featureCollection(processedPolygons)
    const selectableLineEndPoints = featureCollection(processedLineEndPoints)
    const allFeatures: Feature[] = [...selectableLines.features, ...selectablePolygons.features]

    if (allFeatures.length === 0) {
      return {
        lines: selectableLines,
        polygons: selectablePolygons,
        lineEndPoints: selectableLineEndPoints,
        boundingBox: null,
      }
    }

    return {
      lines: selectableLines,
      polygons: selectablePolygons,
      lineEndPoints: selectableLineEndPoints,
      boundingBox: geometriesBbox(subsections.map((subsection) => subsection.geometry)),
    }
  }, [projects, projectSlugMap])

  if (!boundingBox) return null

  return (
    <section className={classHeight ? "flex min-h-0 flex-1 flex-col" : "mt-3 mb-10"}>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: boundingBox,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        lines={lines}
        polygons={polygons}
        lineEndPoints={lineEndPoints}
        colorSchema="subsection"
        restrictHighlightToLevel="project"
        classHeight={classHeight}
      >
        <ProjectMarkers projects={projects} onSelect={handleSelect} />
      </BaseMap>
    </section>
  )
}
