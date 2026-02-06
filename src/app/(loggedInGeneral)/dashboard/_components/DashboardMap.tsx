"use client"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { ProjectMarkers } from "@/src/core/components/Map/markers/ProjectMarkers"
import {
  getSubsectionFeatures,
  type LineProperties,
  type PolygonProperties,
} from "@/src/core/components/Map/utils/getSubsectionFeatures"
import type { TGetProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { featureCollection } from "@turf/helpers"
import { bbox } from "@turf/turf"
import { Feature } from "geojson"
import { LngLatBounds } from "maplibre-gl"
import type { Route } from "next"
import { useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"
import { type MapLayerMouseEvent } from "react-map-gl/maplibre"

type Props = {
  projects: TGetProjectsWithGeometryWithMembershipRole
}

export const DashboardMap = ({ projects }: Props) => {
  const router = useRouter()

  const handleSelect = useCallback(
    (projectSlug: string) => {
      if (!projectSlug) return
      const url = `/${projectSlug}`
      void router.push(url as Route<string>)
    },
    [router],
  )

  const handleClickMap = (e: MapLayerMouseEvent) => {
    const feature = e.features?.at(0)
    const projectSlug = feature?.properties?.projectSlug as string | undefined
    if (projectSlug) {
      handleSelect(projectSlug)
    }
  }

  // Create a map of subsection slug -> project slug for feature enrichment
  const projectSlugMap = useMemo(() => {
    const map = new Map<string, string>()
    projects.forEach((project) => {
      project.subsections.forEach((subsection) => {
        map.set(subsection.slug, project.slug)
      })
    })
    return map
  }, [projects])

  // Extract subsection features and enrich with projectSlug
  const { lines, polygons, lineEndPoints, bounds } = useMemo(() => {
    const subsections = projects.flatMap((project) => project.subsections)
    const { lines, polygons, lineEndPoints } = getSubsectionFeatures({
      subsections,
      highlight: "all",
    })

    // Add projectSlug to each feature
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

    // Add projectSlug to line endpoints based on lineId (which is the subsection slug)
    const processedLineEndPoints = lineEndPoints.features.map((feature) => {
      const projectSlug = feature.properties.lineId
        ? projectSlugMap.get(String(feature.properties.lineId))
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
    <section className="mt-3">
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
      >
        <ProjectMarkers projects={projects} onSelect={handleSelect} />
      </BaseMap>
    </section>
  )
}
