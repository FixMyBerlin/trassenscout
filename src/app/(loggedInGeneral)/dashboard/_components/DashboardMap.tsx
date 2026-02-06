"use client"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { ProjectMapIcon } from "@/src/core/components/Map/Icons/ProjectIcon"
import { StartEndLabel } from "@/src/core/components/Map/Labels/StartEndLabel"
import { TipMarker } from "@/src/core/components/Map/TipMarker"
import { getCentralPointOfGeometry } from "@/src/core/components/Map/utils/getCentralPointOfGeometry"
import {
  getSubsectionFeatures,
  type LineEndPointProperties,
  type LineProperties,
  type PolygonProperties,
} from "@/src/core/components/Map/utils/getSubsectionFeatures"
import { shortTitle } from "@/src/core/components/text/titles"
import type { TGetProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { featureCollection } from "@turf/helpers"
import { bbox } from "@turf/turf"
import { Feature } from "geojson"
import { LngLatBounds } from "maplibre-gl"
import type { Route } from "next"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { type MapLayerMouseEvent, Marker } from "react-map-gl/maplibre"

type Props = {
  projects: TGetProjectsWithGeometryWithMembershipRole
}

export const DashboardMap = ({ projects }: Props) => {
  const router = useRouter()

  // Map layer source IDs
  const lineSourceId = "layer_line_features"
  const polygonSourceId = "layer_polygon_features"
  const endPointsSourceId = "layer_line_endpoints"

  type HandleSelectProps = { projectSlug: string }
  const handleSelect = useCallback(
    ({ projectSlug }: HandleSelectProps) => {
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
      handleSelect({ projectSlug })
    }
  }

  // Flatten all subsections from all projects and create a map of subsection slug -> project slug
  const subsections = projects.flatMap((project) => project.subsections)
  const projectSlugMap = new Map<string, string>()
  projects.forEach((project) => {
    project.subsections.forEach((subsection) => {
      projectSlugMap.set(subsection.slug, project.slug)
    })
  })

  // Extract subsection features using helper - all subsections are active/interactive
  const { lines, polygons, lineEndPoints } = getSubsectionFeatures({
    subsections,
    highlight: "all",
  })

  // Add projectSlug to each feature and build projectFeatureMap for hover highlighting
  const featureMap = new Map<
    string,
    { lineIds: string[]; polygonIds: string[]; endPointIds: string[] }
  >()

  // Process lines and add projectSlug
  const processedLines = lines.features.map((feature) => {
    const projectSlug = projectSlugMap.get(feature.properties.subsectionSlug)
    const processedFeature = {
      ...feature,
      properties: {
        ...feature.properties,
        projectSlug,
      } as LineProperties & { projectSlug?: string },
    }

    // Add to feature map for hover highlighting
    if (projectSlug && feature.properties.featureId) {
      const featureIds = featureMap.get(projectSlug) ?? {
        lineIds: [],
        polygonIds: [],
        endPointIds: [],
      }
      featureIds.lineIds.push(feature.properties.featureId)
      featureMap.set(projectSlug, featureIds)
    }

    return processedFeature
  })

  // Process polygons and add projectSlug
  const processedPolygons = polygons.features.map((feature) => {
    const projectSlug = projectSlugMap.get(feature.properties.subsectionSlug)
    const processedFeature = {
      ...feature,
      properties: { ...feature.properties, projectSlug } as PolygonProperties & {
        projectSlug?: string
      },
    }

    // Add to feature map for hover highlighting
    // Use featureId property which is promoted by promoteId="featureId"
    if (projectSlug && feature.properties.featureId) {
      const featureIds = featureMap.get(projectSlug) ?? {
        lineIds: [],
        polygonIds: [],
        endPointIds: [],
      }
      featureIds.polygonIds.push(feature.properties.featureId)
      featureMap.set(projectSlug, featureIds)
    }

    return processedFeature
  })

  // Process line endpoints - match by subsectionSlug -> projectSlug
  lineEndPoints.features.forEach((feature) => {
    const properties = feature.properties as LineEndPointProperties
    if (properties.lineId && properties.featureId) {
      // Find projectSlug by matching subsectionSlug from lineId
      const matchingLine = processedLines.find(
        (f) => (f.properties as LineProperties).subsectionSlug === properties.lineId,
      )
      if (matchingLine) {
        const projectSlug = (matchingLine.properties as LineProperties & { projectSlug?: string })
          .projectSlug
        if (projectSlug) {
          const featureIds = featureMap.get(projectSlug) ?? {
            lineIds: [],
            polygonIds: [],
            endPointIds: [],
          }
          featureIds.endPointIds.push(properties.featureId)
          featureMap.set(projectSlug, featureIds)
        }
      }
    }
  })

  const selectableLines = featureCollection(processedLines)
  const selectablePolygons = featureCollection(processedPolygons)
  const projectFeatureMap = featureMap

  const handleMouseEnter = useCallback(
    (e: MapLayerMouseEvent) => {
      const map = e.target
      if (!map) return

      const feature = e.features?.at(0)
      if (!feature) return
      // Feature properties can be LineProperties, PolygonProperties, or LineEndPointProperties with projectSlug added
      const properties = feature.properties as
        | (LineProperties & { projectSlug?: string })
        | (PolygonProperties & { projectSlug?: string })
        | (LineEndPointProperties & { projectSlug?: string })
      if (!properties.projectSlug) return

      const featureIds = projectFeatureMap.get(properties.projectSlug)
      if (!featureIds) return

      // Set hover on all features from this project
      featureIds.lineIds.forEach((id) => {
        map.setFeatureState({ source: lineSourceId, id }, { hover: true })
      })

      featureIds.polygonIds.forEach((id) => {
        map.setFeatureState({ source: polygonSourceId, id }, { hover: true })
      })

      featureIds.endPointIds.forEach((id) => {
        map.setFeatureState({ source: endPointsSourceId, id }, { hover: true })
      })
    },
    [projectFeatureMap],
  )

  const handleMouseLeave = useCallback(
    (e: MapLayerMouseEvent) => {
      const map = e.target
      if (!map) return

      // Clear hover on all features
      selectableLines.features.forEach((feature) => {
        if (feature.properties.featureId) {
          map.setFeatureState(
            { source: lineSourceId, id: feature.properties.featureId },
            { hover: false },
          )
        }
      })

      selectablePolygons.features.forEach((feature) => {
        if (feature.properties.featureId) {
          map.setFeatureState(
            { source: polygonSourceId, id: feature.properties.featureId },
            { hover: false },
          )
        }
      })

      lineEndPoints.features.forEach((feature) => {
        if (feature.properties.featureId) {
          map.setFeatureState(
            { source: endPointsSourceId, id: feature.properties.featureId },
            { hover: false },
          )
        }
      })
    },
    [selectableLines, selectablePolygons, lineEndPoints],
  )

  const projectGeometries: {
    [key: string]: TGetProjectsWithGeometryWithMembershipRole[number]["subsections"]
  } = {}
  projects.forEach((project) => {
    projectGeometries[project.slug] = project.subsections
  })

  const markers = Object.entries(projectGeometries).map(([projectSlug, subsections]) => {
    if (subsections.length === 0) return null

    const firstSubsection = subsections[0]
    if (!firstSubsection) return null
    const center = getCentralPointOfGeometry(firstSubsection.geometry)

    return (
      <Marker
        key={projectSlug}
        longitude={center[0]}
        latitude={center[1]}
        anchor="center"
        onClick={() => handleSelect({ projectSlug })}
      >
        <TipMarker anchor="top">
          <StartEndLabel
            icon={<ProjectMapIcon label={shortTitle(projectSlug)} />}
            layout="compact"
          />
        </TipMarker>
      </Marker>
    )
  })

  const allFeatures: Feature[] = [...selectableLines.features, ...selectablePolygons.features]
  if (allFeatures.length === 0) return null

  const boundingBox = bbox(featureCollection(allFeatures))
  const bounds = new LngLatBounds(
    [boundingBox[0], boundingBox[1]],
    [boundingBox[2], boundingBox[3]],
  )

  return (
    <section className="mt-3">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        lines={selectableLines}
        polygons={selectablePolygons}
        lineEndPoints={lineEndPoints}
        colorSchema="subsection"
      >
        {markers}
      </BaseMap>
    </section>
  )
}
