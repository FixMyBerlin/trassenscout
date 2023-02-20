import { Routes, useParam } from "@blitzjs/next"
import { Section, Subsection } from "@prisma/client"
import { lineString } from "@turf/helpers"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useRouter } from "next/router"
import React, { useState } from "react"
import Map, { Layer, NavigationControl, ScaleControl, Source } from "react-map-gl"
import { BackgroundSwitcher, LayerType } from "./BackgroundSwitcher/BackgroundSwitcher"
import { geometryStartEndPoint, sectionsBbox } from "./utils"

export type BaseMapSections = (Section & {
  subsections: Pick<Subsection, "id" | "slug" | "geometry">[]
})[]

export type BaseMapViewProps = {
  sections: BaseMapSections
  isInteractive: boolean
  selectedSection?: BaseMapSections[number]
  className?: string
  children?: React.ReactNode
}

export const BaseMapView: React.FC<BaseMapViewProps> = ({
  sections,
  isInteractive,
  selectedSection,
  className,
  children,
}) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")

  const [hoveredSectionIds, setHoveredSectionIds] = useState<number[]>([])

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `https://api.maptiler.com/maps/a4824657-3edd-4fbd-925e-1af40ab06e9c/style.json?key=${maptilerApiKey}`
  const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

  // Layer style for segments depending on selected section and segment (if
  // enableHover is true).
  type PickLineColor = {
    section: Section
  }
  const pickLineColor = ({ section }: PickLineColor) => {
    let lineColor = "#979797"

    if (hoveredSectionIds.includes(section.id)) {
      lineColor = "#EAB308"
    }

    if (selectedSection && section.id === selectedSection.id) {
      lineColor = "#EAB308" // #0A64AE
    }

    return lineColor
  }

  const handleClick = async (e: mapboxgl.MapLayerMouseEvent) => {
    if (!isInteractive) return
    const sectionSlug = e?.features?.[0]?.properties?.sectionSlug
    if (sectionSlug) {
      await router.push(Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug }))
    }
  }

  const interactiveLayerIds = sections
    .map((s) => s.subsections.map((ss) => `layer_${ss.id}`))
    .flat()
  // TODO re-evaluate previous code:
  // selectedSection?.subSegments
  //   .filter((segment) => segment !== selectedSegment)
  //   .map((segment) => String(segment.id)) || [];

  const [cursorStyle, setCursorStyle] = useState("grab")
  const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!isInteractive) return
    setCursorStyle("pointer")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore TODO find out why TS is unhappy
    setHoveredSectionIds(e.features.map((f) => f?.properties?.sectionId))
  }
  const handleMouseLeave = () => {
    if (!isInteractive) return
    setCursorStyle("grab")
    setHoveredSectionIds([])
  }

  const [minX, minY, maxX, maxY] = sectionsBbox(selectedSection ? [selectedSection] : sections)

  if (!minX || !minY || !maxX || !maxY) return null

  return (
    <>
      <Map
        id="mainMap"
        mapLib={maplibregl}
        initialViewState={{
          bounds: [minX, minY, maxX, maxY],
          fitBoundsOptions: {
            padding: 60,
          },
        }}
        scrollZoom={false}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        onClick={handleClick}
        cursor={cursorStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={interactiveLayerIds}
      >
        {children}

        {sections.map((section) => {
          // Rendering the lines
          return section.subsections.map((subsection) => {
            return (
              <Source
                key={subsection.id}
                type="geojson"
                data={lineString(JSON.parse(subsection.geometry), {
                  sectionSlug: section.slug,
                  sectionId: section.id,
                })}
              >
                <Layer
                  id={`layer_${subsection.id}`}
                  type="line"
                  paint={{
                    "line-width": 7,
                    "line-color": pickLineColor({
                      section,
                    }),
                  }}
                />
              </Source>
            )
          })
        })}

        {sections
          // Rednering the dots
          // TODO re-evaluate this old code; I think we don't need this…
          // .filter((section) => section === selectedSection)
          .map((section) => {
            return section.subsections.map((subsection) => (
              <Source
                key={`layer_dots_${subsection.id}`}
                type="geojson"
                data={geometryStartEndPoint(subsection.geometry)}
              >
                <Layer
                  id={`layer_dots_${subsection.id}`}
                  type="circle"
                  paint={{
                    "circle-color": "RGB(15, 23, 42)",
                    "circle-radius": 6,
                  }}
                />
              </Source>
            ))
          })}

        <NavigationControl showCompass={false} />
        <ScaleControl />
      </Map>
      <BackgroundSwitcher
        className="absolute top-4 left-4"
        value={selectedLayer}
        onChange={handleLayerSwitch}
      />
    </>
  )
}
