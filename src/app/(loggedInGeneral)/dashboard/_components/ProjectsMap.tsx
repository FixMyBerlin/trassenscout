"use client"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { ProjectMapIcon } from "@/src/core/components/Map/Icons/ProjectIcon"
import { StartEndLabel } from "@/src/core/components/Map/Labels/StartEndLabel"
import { layerColors } from "@/src/core/components/Map/layerColors"
import { TipMarker } from "@/src/core/components/Map/TipMarker"
import { extractLineEndpoints } from "@/src/core/components/Map/utils/extractLineEndpoints"
import { getCenterOfMass } from "@/src/core/components/Map/utils/getCenterOfMass"
import { lineStringToGeoJSON } from "@/src/core/components/Map/utils/lineStringToGeoJSON"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import { shortTitle } from "@/src/core/components/text/titles"
import { TGetProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { useSession } from "@blitzjs/auth"
import { featureCollection } from "@turf/helpers"
import { bbox } from "@turf/turf"
import type { Feature, Position } from "geojson"
import { LngLatBounds } from "maplibre-gl"
import type { Route } from "next"
import { useRouter } from "next/router"
import { useCallback, useMemo, useState } from "react"
import { MapLayerMouseEvent, Marker } from "react-map-gl/maplibre"

type Props = {
  projects: TGetProjectsWithGeometryWithMembershipRole
}

export const ProjectsMap = ({ projects }: Props) => {
  const router = useRouter()
  const session = useSession()

  type HandleSelectProps = { projectSlug: string; edit: boolean }
  const handleSelect = useCallback(
    ({ projectSlug, edit }: HandleSelectProps) => {
      if (!projectSlug) return
      if (!session) return
      if (!session.memberships) return
      const userCanEdit = session.memberships
        .filter((m) => m.role === "EDITOR")
        .some((m) => m.project.slug === projectSlug)
      // alt+click
      const url = userCanEdit && edit ? `/${projectSlug}/edit` : `/${projectSlug}`
      void router.push(url as Route)
    },
    [router, session],
  )

  const handleClickMap = (e: MapLayerMouseEvent) => {
    const projectSlug = e.features?.at(0)?.properties?.slug
    if (projectSlug) {
      handleSelect({ projectSlug, edit: e.originalEvent?.altKey })
    }
  }

  // We need to separate the state to work around the issue when a marker overlaps a line and both interact
  const [hoveredMap, setHoveredMap] = useState<string | null>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)
  const handleMouseEnter = (e: MapLayerMouseEvent) => {
    setHoveredMap(e.features?.at(0)?.properties?.subsectionSlug || null)
  }
  const handleMouseLeave = () => {
    setHoveredMap(null)
  }

  const selectableLines = useMemo(() => {
    return featureCollection(
      projects.flatMap((project) =>
        project.subsections
          .filter((subsection) => subsection.type === "LINE")
          .flatMap((subsection) => {
            const properties = {
              projectSlug: project.slug,
              color:
                hoveredMap === project.slug || hoveredMarker === project.slug
                  ? layerColors.hovered
                  : layerColors.selectable,
            }
            return lineStringToGeoJSON<typeof properties>(subsection.geometry, properties)
          }),
      ),
    )
  }, [projects, hoveredMap, hoveredMarker])

  const selectablePolygons = useMemo(() => {
    return featureCollection(
      projects.flatMap((project) =>
        project.subsections
          .filter((subsection) => subsection.type === "POLYGON")
          .flatMap((subsection) => {
            const properties = {
              projectSlug: project.slug,
              color:
                hoveredMap === project.slug || hoveredMarker === project.slug
                  ? layerColors.hovered
                  : layerColors.selectable,
            }
            return polygonToGeoJSON<typeof properties>(subsection.geometry, properties)
          })
          .filter(Boolean),
      ),
    )
  }, [projects, hoveredMap, hoveredMarker])

  const dotsGeoms = useMemo(() => {
    const lineDots: Position[] = []
    selectableLines.features.forEach((line) => {
      const endpoints = extractLineEndpoints(line.geometry)
      lineDots.push(...endpoints)
    })
    return lineDots
  }, [selectableLines])

  const markers = useMemo(() => {
    const projectGeometries: {
      [key: string]: TGetProjectsWithGeometryWithMembershipRole[number]["subsections"]
    } = {}
    projects.forEach((project) => {
      projectGeometries[project.slug] = project.subsections
    })

    return Object.entries(projectGeometries).map(([projectSlug, subsections]) => {
      if (subsections.length === 0) return null

      const center = getCenterOfMass(subsections[0]!.geometry)

      return (
        <Marker
          key={projectSlug}
          longitude={center[0]}
          latitude={center[1]}
          anchor="center"
          onClick={(e) => handleSelect({ projectSlug, edit: e.originalEvent.altKey })}
        >
          <TipMarker
            anchor="top"
            onMouseEnter={() => setHoveredMarker(projectSlug)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            <StartEndLabel
              icon={<ProjectMapIcon label={shortTitle(projectSlug)} />}
              layout="compact"
            />
          </TipMarker>
        </Marker>
      )
    })
  }, [projects, handleSelect])

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
        selectableLines={selectableLines}
        selectablePolygons={selectablePolygons}
        dots={dotsGeoms}
      >
        {markers}
      </BaseMap>
    </section>
  )
}
