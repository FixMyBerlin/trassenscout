import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import { MapLayerMouseEvent } from "react-map-gl/maplibre"
import { useSlug } from "../../routes/usePagesDirectorySlug"
import { BaseMap } from "./BaseMap"
import { SubsubsectionMarkers } from "./markers/SubsubsectionMarkers"
import { UploadMarkers } from "./UploadMarkers"
import { geometriesBbox } from "./utils/bboxHelpers"
import { getSubsectionFeatures } from "./utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "./utils/getSubsubsectionFeatures"

type Props = {
  subsections: TGetSubsection[]
  selectedSubsection: TGetSubsection
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
          const bboxResult = geometriesBbox([
            selectedSubsection.geometry,
            clickedSubsubsection.geometry,
          ])

          // Fly to new bounds
          map.fitBounds(bboxResult, {
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
    const geometries: SupportedGeometry[] = [selectedSubsection.geometry]
    if (selectedSubsubsection) {
      geometries.push(selectedSubsubsection.geometry)
    }
    return geometriesBbox(geometries)
  }, [selectedSubsection.geometry, subsubsections, pageSubsubsectionSlug])

  const { lines: subsectionLines, polygons: subsectionPolygons } = useMemo(
    () =>
      getSubsectionFeatures({
        subsections,
        selectedSubsectionSlug: selectedSubsection.slug,
      }),
    [subsections, selectedSubsection.slug],
  )

  const { selectableLines, selectablePoints, selectablePolygons, dotsGeoms } = useMemo(
    () =>
      getSubsubsectionFeatures({
        subsubsections,
        selectedSubsubsectionSlug: pageSubsubsectionSlug,
        hoveredMap,
        hoveredMarker,
      }),
    [subsubsections, pageSubsubsectionSlug, hoveredMap, hoveredMarker],
  )

  return (
    <>
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: mapBbox,
          fitBoundsOptions: { padding: 60 },
        }}
        onClick={handleClickMap}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        lines={subsectionLines}
        polygons={subsectionPolygons}
        selectableLines={selectableLines}
        selectablePoints={selectablePoints}
        selectablePolygons={selectablePolygons}
        dots={dotsGeoms}
      >
        <SubsubsectionMarkers
          subsubsections={subsubsections}
          pageSubsectionSlug={pageSubsectionSlug}
          onSelect={handleSelect}
          onMarkerHover={setHoveredMarker}
        />
        <UploadMarkers projectSlug={projectSlug} interactive={true} />
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
