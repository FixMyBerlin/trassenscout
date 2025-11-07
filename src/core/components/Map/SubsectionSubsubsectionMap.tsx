import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { Routes } from "@blitzjs/next"
import { lineString } from "@turf/helpers"
import { bbox, featureCollection } from "@turf/turf"
import { Feature, Geometry } from "geojson"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import { MapLayerMouseEvent, Marker } from "react-map-gl/maplibre"
import { useSlug } from "../../routes/usePagesDirectorySlug"
import { shortTitle } from "../text"
import { BaseMap } from "./BaseMap"
import { SubsubsectionMapIcon } from "./Icons"
import { TitleLabel } from "./Labels"
import { TipMarker } from "./TipMarker"
import { layerColors } from "./layerColors"
import { getCenterOfMass } from "./utils/getCenterOfMass"
import { lineStringToGeoJSON } from "./utils/lineStringToGeoJSON"
import { pointToGeoJSON } from "./utils/pointToGeoJSON"
import { polygonToGeoJSON } from "./utils/polygonToGeoJSON"

type Props = {
  subsections: SubsectionWithPosition[]
  selectedSubsection: SubsectionWithPosition
  subsubsections: SubsubsectionWithPosition[]
}

export const SubsectionSubsubsectionMap = ({
  subsections,
  selectedSubsection,
  subsubsections,
}: Props) => {
  const pageSubsectionSlug = useSlug("subsectionSlug")
  const pageSubsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()
  const router = useRouter()

  /**
   * Calculates bbox including subsection and optionally a subsubsection
   */
  const calculateBbox = (
    subsectionGeometry: number[][],
    subsubsection: SubsubsectionWithPosition | undefined,
  ) => {
    const geometriesToInclude: Feature<Geometry>[] = [lineString(subsectionGeometry)]

    if (subsubsection) {
      // Convert subsubsection geometry to features using existing helpers
      switch (subsubsection.geometry.type) {
        case "Point": {
          const feature = pointToGeoJSON(subsubsection.geometry)
          if (feature) geometriesToInclude.push(feature)
          break
        }
        case "LineString":
        case "MultiLineString": {
          const features = lineStringToGeoJSON(subsubsection.geometry)
          if (features) geometriesToInclude.push(...features)
          break
        }
        case "Polygon":
        case "MultiPolygon": {
          const features = polygonToGeoJSON(subsubsection.geometry)
          if (features) geometriesToInclude.push(...features)
          break
        }
      }
    }

    // Calculate combined bbox from all geometries
    const combinedFeatures = featureCollection(geometriesToInclude)
    return bbox(combinedFeatures)
  }

  type HandleSelectProps = { subsectionSlug: string; subsubsectionSlug: string; edit: boolean }
  const handleSelect = ({ subsectionSlug, subsubsectionSlug, edit }: HandleSelectProps) => {
    if (!projectSlug) return
    const url = edit
      ? subsubsectionSlug
        ? Routes.EditSubsubsectionPage({ projectSlug, subsectionSlug, subsubsectionSlug })
        : Routes.EditSubsectionPage({ projectSlug, subsectionSlug })
      : subsubsectionSlug
        ? Routes.SubsubsectionDashboardPage({ projectSlug, subsectionSlug, subsubsectionSlug })
        : Routes.SubsectionDashboardPage({ projectSlug, subsectionSlug })

    void router.push(url, undefined, { scroll: edit ? true : false })
  }

  const handleClickMap = (e: MapLayerMouseEvent) => {
    const subsectionSlug = e.features?.at(0)?.properties?.subsectionSlug
    const subsubsectionSlug = e.features?.at(0)?.properties?.subsubsectionSlug
    if (subsectionSlug && subsubsectionSlug) {
      handleSelect({ subsectionSlug, subsubsectionSlug, edit: e.originalEvent?.altKey })

      // Fly to bounds of clicked subsubsection
      const map = e.target
      if (map) {
        const clickedSubsubsection = subsubsections.find(
          (subsub) => subsub.slug === subsubsectionSlug,
        )
        if (clickedSubsubsection) {
          const bboxResult = calculateBbox(selectedSubsection.geometry, clickedSubsubsection)

          // Fly to new bounds
          map.fitBounds([bboxResult[0], bboxResult[1], bboxResult[2], bboxResult[3]], {
            padding: 60,
            duration: 1000,
            linear: false, // Use easeInOut animation
          })
        }
      }
    }
  }

  // We need to separate the state to work around the issue when a marker overlaps a line and both interact
  const [hoveredMap, setHoveredMap] = useState<string | number | null>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | number | null>(null)
  const handleMouseEnter = (e: MapLayerMouseEvent) => {
    setHoveredMap(e.features?.at(0)?.properties?.subsubsectionSlug || null)
  }
  const handleMouseLeave = () => {
    setHoveredMap(null)
  }

  // Calculate bbox including subsection and selected subsubsection if present (for initial view)
  const mapBbox = useMemo(() => {
    const selectedSubsubsection = subsubsections.find(
      (subsub) => subsub.slug === pageSubsubsectionSlug,
    )
    return calculateBbox(selectedSubsection.geometry, selectedSubsubsection)
  }, [selectedSubsection.geometry, subsubsections, pageSubsubsectionSlug])

  const lines = featureCollection(
    subsections
      .map((subsection) =>
        lineString(subsection.geometry, {
          color:
            subsection.slug === selectedSubsection.slug
              ? layerColors.unselectableCurrent
              : layerColors.unselectable,
          // opacity: subsection.slug === selectedSubsection.slug ? 0.4 : 0.35,
        }),
      )
      .filter(Boolean),
  )

  const selectableLines = featureCollection(
    subsubsections
      .filter((sec) => sec.type === "LINE")
      .flatMap((sec) => {
        const properties = {
          subsectionSlug: sec.subsection.slug,
          subsubsectionSlug: sec.slug,
          color:
            sec.slug === pageSubsubsectionSlug
              ? layerColors.selected
              : hoveredMap === sec.slug || hoveredMarker === sec.slug
                ? layerColors.hovered
                : layerColors.selectable,
        }
        return lineStringToGeoJSON<typeof properties>(sec.geometry, properties) ?? []
      }),
  )

  const selectablePoints = featureCollection(
    subsubsections
      .filter((sec) => sec.type === "POINT")
      .map((sec) => {
        const properties = {
          subsectionSlug: sec.subsection.slug,
          subsubsectionSlug: sec.slug,
          opacity: 0.3,
          color:
            sec.slug === pageSubsubsectionSlug
              ? layerColors.selected
              : hoveredMap === sec.slug || hoveredMarker === sec.slug
                ? layerColors.hovered
                : layerColors.selectable,
          radius: 10,
          "border-width": 3,
          "border-color":
            sec.slug === pageSubsubsectionSlug
              ? layerColors.selected
              : hoveredMap === sec.slug || hoveredMarker === sec.slug
                ? layerColors.hovered
                : layerColors.selectable,
        }
        return pointToGeoJSON<typeof properties>(sec.geometry, properties)
      })
      .filter(Boolean),
  )

  const selectablePolygons = featureCollection(
    subsubsections
      .filter((sec) => sec.type === "POLYGON")
      .flatMap((sec) => {
        const properties = {
          subsectionSlug: sec.subsection.slug,
          subsubsectionSlug: sec.slug,
          color:
            sec.slug === pageSubsubsectionSlug
              ? layerColors.selected
              : hoveredMap === sec.slug || hoveredMarker === sec.slug
                ? layerColors.hovered
                : layerColors.selectable,
        }
        return polygonToGeoJSON<typeof properties>(sec.geometry, properties)
      })
      .filter(Boolean),
  )

  // Dots are only for Subsubsections of type LINE
  // Collect start and end points from all lines (including all lines in MultiLineString)
  const dotsGeoms = subsubsections
    .flatMap((sec) => {
      if (sec.type !== "LINE") return []
      if (sec.geometry.type === "LineString") {
        return [sec.geometry.coordinates[0], sec.geometry.coordinates.at(-1)]
      } else if (sec.geometry.type === "MultiLineString") {
        // Collect start and end points from all lines in MultiLineString
        return sec.geometry.coordinates.flatMap((line) => {
          if (!line || line.length === 0) return []
          return [line[0], line.at(-1)]
        })
      }
      return []
    })
    .filter(Boolean)

  const markers = subsubsections.map((subsub) => {
    const [longitude, latitude] = getCenterOfMass(subsub.geometry)

    return (
      <Marker
        key={subsub.id}
        longitude={longitude as number}
        latitude={latitude as number}
        anchor="center"
        onClick={(e) => {
          handleSelect({
            subsectionSlug: subsub.subsection.slug,
            subsubsectionSlug: subsub.slug,
            edit: e.originalEvent.altKey,
          })
        }}
      >
        <TipMarker
          anchor={subsub.labelPos}
          onMouseEnter={() => setHoveredMarker(subsub.slug)}
          onMouseLeave={() => setHoveredMarker(null)}
          className={
            // We display all subsubsections, but those of other subsections are faded out
            subsub.subsection.slug === pageSubsectionSlug
              ? "opacity-100"
              : "opacity-50 hover:opacity-100"
          }
        >
          <TitleLabel
            icon={<SubsubsectionMapIcon label={shortTitle(subsub.slug)} />}
            // title={subsub.subTitle} // subTitle is now UNUSED
            subtitle={subsub.SubsubsectionTask?.title}
          />
        </TipMarker>
      </Marker>
    )
  })

  return (
    <>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: [mapBbox[0], mapBbox[1], mapBbox[2], mapBbox[3]],
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        lines={lines}
        selectableLines={selectableLines}
        selectablePoints={selectablePoints}
        selectablePolygons={selectablePolygons}
        dots={dotsGeoms}
      >
        {markers}
      </BaseMap>
      {/* MapLegend temporarily hidden */}
      {/* <MapLegend
        legendItemsConfig={
          pageSubsubsectionSlug ? legendItemsConfig.subsubsection : legendItemsConfig.subsection
        }
      /> */}
      <p className="mt-2 text-right text-xs text-gray-400">
        Schnellzugriff zum Bearbeiten über option+click (Mac) / alt+click (Windows)
      </p>
    </>
  )
}
