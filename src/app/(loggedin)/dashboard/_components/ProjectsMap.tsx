"use client"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { ProjectMapIcon } from "@/src/core/components/Map/Icons/ProjectIcon"
import { StartEndLabel } from "@/src/core/components/Map/Labels/StartEndLabel"
import { layerColors } from "@/src/core/components/Map/layerColors"
import { TipMarker } from "@/src/core/components/Map/TipMarker"
import { shortTitle } from "@/src/core/components/text/titles"
import { TGetProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { useSession } from "@blitzjs/auth"
import { lineString } from "@turf/helpers"
import { along, bbox, featureCollection, length } from "@turf/turf"
import { Feature, LineString, Point } from "geojson"
import { LngLatBounds } from "maplibre-gl"
import type { Route } from "next"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { MapLayerMouseEvent, Marker } from "react-map-gl/maplibre"

type Props = {
  projects: TGetProjectsWithGeometryWithMembershipRole
}

export const ProjectsMap = ({ projects }: Props) => {
  const router = useRouter()
  const session = useSession()

  type HandleSelectProps = { projectSlug: string; edit: boolean }
  const handleSelect = ({ projectSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    if (!session) return
    if (!session.memberships) return
    const userCanEdit = session.memberships
      .filter((m) => m.role === "EDITOR")
      .some((m) => m.project.slug === projectSlug)
    // alt+click
    const url = userCanEdit && edit ? `/${projectSlug}/edit` : `/${projectSlug}`
    void router.push(url as Route)
  }

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

  const selectableLines = featureCollection(
    projects
      .map((project) =>
        project.subsections.map((subsection) =>
          // @ts-expect-error TS issue where geometry is not the rigth type of [number, number]
          lineString(subsection.geometry, {
            projectSlug: project.slug,
            color:
              hoveredMap === project.slug || hoveredMarker === project.slug
                ? layerColors.hovered
                : layerColors.selectable,
          }),
        ),
      )
      .flat(),
  )

  const dotsGeomsBeginningOfLine = selectableLines.features.map(
    (line) => line.geometry.coordinates.at(1) as [number, number],
  )
  const dotGeomEndOfLastLine = selectableLines.features.at(-1)?.geometry?.coordinates?.at(-1) as [
    number,
    number,
  ]
  const dotsGeoms = [dotGeomEndOfLastLine, ...dotsGeomsBeginningOfLine].filter(Boolean)

  const groupedSubsections: { [key: string]: Feature<LineString>[] } = {}
  selectableLines.features.forEach((feature) => {
    const projectSlug = feature.properties.projectSlug

    if (!groupedSubsections[projectSlug]) {
      groupedSubsections[projectSlug] = []
    }
    groupedSubsections[projectSlug].push(feature)
  })

  const groupedSubsectionMiddles: { [key: string]: Feature<Point> } = {}
  Object.entries(groupedSubsections).map(([projectSlug, lineStrings]) => {
    let longestLineString = lineStrings[0]!
    let maxLength = 0

    lineStrings.forEach((lineString) => {
      const lineLength = length(lineString)
      if (lineLength > maxLength) {
        maxLength = lineLength
        longestLineString = lineString
      }
    })

    groupedSubsectionMiddles[projectSlug] = along(longestLineString, maxLength / 2)
  })

  const markers = Object.entries(groupedSubsectionMiddles).map(([projectSlug, midPoint]) => {
    return (
      <Marker
        key={projectSlug}
        longitude={midPoint.geometry.coordinates[0] as number}
        latitude={midPoint.geometry.coordinates[1] as number}
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

  const boundingBox = bbox(selectableLines)
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
        dots={dotsGeoms}
      >
        {markers}
      </BaseMap>
    </section>
  )
}
