import { useNavigate } from "@tanstack/react-router"
import { featureCollection } from "@turf/helpers"
import { bbox } from "@turf/turf"
import type { Feature } from "geojson"
import { LngLatBounds } from "maplibre-gl"
import { useMemo } from "react"
import type { MapLayerMouseEvent } from "react-map-gl/maplibre"
import { BaseMap } from "@/src/components/core/components/Map/BaseMap"
import { ProjectMarkers } from "@/src/components/core/components/Map/markers/ProjectMarkers"
import {
  getSubsectionFeatures,
  type LineProperties,
  type PolygonProperties,
} from "@/src/components/core/components/Map/utils/getSubsectionFeatures"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
}

export const DashboardMap = ({ projects }: Props) => {
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

  const { lines, polygons, lineEndPoints, bounds } = useMemo(() => {
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
        bounds: null,
      }
    }

    const boundingBox = bbox(featureCollection(allFeatures))
    const bounds = new LngLatBounds(
      [boundingBox[0], boundingBox[1]],
      [boundingBox[2], boundingBox[3]],
    )

    return {
      lines: selectableLines,
      polygons: selectablePolygons,
      lineEndPoints: selectableLineEndPoints,
      bounds,
    }
  }, [projects, projectSlugMap])

  if (!bounds) return null

  return (
    <section className="mt-3 mb-10">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        lines={lines}
        polygons={polygons}
        lineEndPoints={lineEndPoints}
        colorSchema="subsection"
        restrictHighlightToLevel="project"
      >
        <ProjectMarkers projects={projects} onSelect={handleSelect} />
      </BaseMap>
    </section>
  )
}
