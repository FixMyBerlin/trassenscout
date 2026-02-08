import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { LineEndPointsLayer } from "@/src/core/components/Map/layers/LineEndPointsLayer"
import { LinesLayer } from "@/src/core/components/Map/layers/LinesLayer"
import { PointsLayer } from "@/src/core/components/Map/layers/PointsLayer"
import { PolygonsLayer } from "@/src/core/components/Map/layers/PolygonsLayer"
import { SubsectionHullsLayer } from "@/src/core/components/Map/layers/SubsectionHullsLayer"
import { getSubsectionFeatures } from "@/src/core/components/Map/utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import type { Geometry } from "geojson"
import { useMemo } from "react"
import type { LngLatBoundsLike } from "react-map-gl/maplibre"
import { useTerraDrawControl, type TerraDrawMode } from "./useTerraDrawControl"

type Props = {
  initialGeometry?: Geometry
  onChange?: (geometry: Geometry | null, geometryType: string | null) => void
  initialViewState?: {
    bounds: LngLatBoundsLike
    fitBoundsOptions?: { padding: number }
  }
  subsections?: TSubsections
  selectedSubsectionSlug?: string
  subsubsections?: SubsubsectionWithPosition[]
  selectedSubsubsectionSlug?: string
  children?: (api: {
    mode: TerraDrawMode
    setMode: (mode: TerraDrawMode) => void
    clear: () => void
    getSnapshot: () => Geometry[]
    updateFeatures: (geometry: Geometry | null) => void
    enabledButtons: {
      point: boolean
      linestring: boolean
      "freehand-linestring": boolean
      polygon: boolean
      edit: boolean
    }
  }) => React.ReactNode
}

/**
 * Internal component that uses the Terra Draw control inside the map context
 */
const TerraDrawControls = ({
  initialGeometry,
  onChange,
  children,
}: Pick<Props, "initialGeometry" | "onChange" | "children">) => {
  const control = useTerraDrawControl({
    initialGeometry,
    onChange,
  })

  // Note: initialGeometry is only used on mount (in the control's onAdd method).
  // Terra Draw manages its own state while actively drawing and submits changes via onChange.
  // The form state is the source of truth, but we don't sync form changes back to the map
  // during active drawing to avoid conflicts.

  return (
    <>
      {/* Render toolbar/controls at absolute position over the map */}
      {children && (
        <div className="absolute top-4 left-4 z-10">
          {children({
            mode: control.mode,
            setMode: control.setMode,
            clear: control.clear,
            getSnapshot: control.getSnapshot,
            updateFeatures: control.updateFeatures,
            enabledButtons: control.enabledButtons,
          })}
        </div>
      )}
    </>
  )
}

/**
 * Map component with Terra Draw integration using render props pattern
 * Usage:
 * <TerraDrawMap onChange={(geo, type) => {}}>
 *   {({ mode, setMode, clear }) => (
 *     <DrawingToolbar mode={mode} setMode={setMode} onClear={clear} />
 *   )}
 * </TerraDrawMap>
 */
export const TerraDrawMap = ({
  initialGeometry,
  onChange,
  initialViewState,
  subsections,
  selectedSubsectionSlug,
  subsubsections,
  selectedSubsubsectionSlug,
  children,
}: Props) => {
  const defaultViewState = {
    longitude: 13.404954,
    latitude: 52.520008,
    zoom: 11,
  }

  // Determine if we're in subsection edit or subsubsection edit
  const isSubsubsectionEdit = Boolean(subsubsections && selectedSubsubsectionSlug)

  // Compute subsection features
  const subsectionFeatures = useMemo(() => {
    if (!subsections || !selectedSubsectionSlug) return null

    return getSubsectionFeatures({
      subsections,
      highlight: "currentSubsection",
      selectedSubsectionSlug,
    })
  }, [subsections, selectedSubsectionSlug])

  // For subsection edit: filter to only other subsections (isCurrent === false)
  const subsectionEditFeatures = useMemo(() => {
    if (!subsectionFeatures || isSubsubsectionEdit) return null

    const filteredLines = {
      ...subsectionFeatures.lines,
      features: subsectionFeatures.lines.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredPolygons = {
      ...subsectionFeatures.polygons,
      features: subsectionFeatures.polygons.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredLineEndPoints = {
      ...subsectionFeatures.lineEndPoints,
      features: subsectionFeatures.lineEndPoints.features.filter((f) => {
        // Filter endpoints based on their associated line's isCurrent status
        const lineSlug = f.properties.lineId
        const lineFeature = subsectionFeatures.lines.features.find(
          (lf) => lf.properties.subsectionSlug === lineSlug,
        )
        return lineFeature && !lineFeature.properties.isCurrent
      }),
    }

    return {
      lines: filteredLines,
      polygons: filteredPolygons,
      lineEndPoints: filteredLineEndPoints,
    }
  }, [subsectionFeatures, isSubsubsectionEdit])

  // For subsubsection edit: compute other subsubsection features (isCurrent === false)
  const otherSubsubsectionFeatures = useMemo(() => {
    if (!subsubsections || !selectedSubsubsectionSlug) return null

    const allFeatures = getSubsubsectionFeatures({
      subsubsections,
      selectedSubsubsectionSlug,
    })

    // Filter to only features where isCurrent === false
    const filteredLines = {
      ...allFeatures.lines,
      features: allFeatures.lines.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredPolygons = {
      ...allFeatures.polygons,
      features: allFeatures.polygons.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredPoints = {
      ...allFeatures.points,
      features: allFeatures.points.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredLineEndPoints = {
      ...allFeatures.lineEndPoints,
      features: allFeatures.lineEndPoints.features.filter((f) => {
        const lineSlug = f.properties.lineId
        const lineFeature = allFeatures.lines.features.find(
          (lf) => lf.properties.subsubsectionSlug === lineSlug,
        )
        return lineFeature && !lineFeature.properties.isCurrent
      }),
    }

    return {
      lines: filteredLines.features.length > 0 ? filteredLines : undefined,
      polygons: filteredPolygons.features.length > 0 ? filteredPolygons : undefined,
      points: filteredPoints.features.length > 0 ? filteredPoints : undefined,
      lineEndPoints: filteredLineEndPoints.features.length > 0 ? filteredLineEndPoints : undefined,
    }
  }, [subsubsections, selectedSubsubsectionSlug])

  return (
    <div className="relative h-[500px] w-full overflow-clip rounded-md border border-gray-200">
      <BaseMap
        id="terra-draw-map"
        // Kritikal to avoid a bug where the Terra Draw Geometries where hidden during navigaton between pages (Subsubsection => Subsubsection/Edit)
        reuseMaps={false}
        initialViewState={initialViewState || defaultViewState}
        backgroundSwitcherPosition="bottom-left"
        colorSchema="subsection"
      >
        {/* Subsection edit: use hulls for other subsections */}
        {subsectionEditFeatures && (
          <SubsectionHullsLayer
            lines={subsectionEditFeatures.lines}
            polygons={subsectionEditFeatures.polygons}
            layerIdSuffix="_terra_draw"
          />
        )}

        {/* Subsubsection edit: render subsection features as non-interactive layers */}
        {isSubsubsectionEdit && subsectionFeatures && (
          <>
            {subsectionFeatures.lines && subsectionFeatures.lines.features.length > 0 && (
              <LinesLayer
                lines={subsectionFeatures.lines}
                layerIdSuffix="_terra_draw_subsection"
                interactive={false}
                colorSchema="subsection"
              />
            )}
            {subsectionFeatures.polygons && subsectionFeatures.polygons.features.length > 0 && (
              <PolygonsLayer
                polygons={subsectionFeatures.polygons}
                layerIdSuffix="_terra_draw_subsection"
                interactive={false}
                colorSchema="subsection"
              />
            )}
            {subsectionFeatures.lineEndPoints &&
              subsectionFeatures.lineEndPoints.features.length > 0 && (
                <LineEndPointsLayer
                  lineEndPoints={subsectionFeatures.lineEndPoints}
                  layerIdSuffix="_terra_draw_subsection"
                  colorSchema="subsection"
                />
              )}
          </>
        )}

        {/* Subsubsection edit: add other subsubsections as separate layers (only when current is selected to avoid showing it here) */}
        {selectedSubsubsectionSlug && otherSubsubsectionFeatures && (
          <>
            {otherSubsubsectionFeatures.lines && (
              <LinesLayer
                lines={otherSubsubsectionFeatures.lines}
                layerIdSuffix="_terra_draw_other_subsubsection"
                interactive={false}
                colorSchema="subsubsection"
              />
            )}
            {otherSubsubsectionFeatures.polygons && (
              <PolygonsLayer
                polygons={otherSubsubsectionFeatures.polygons}
                layerIdSuffix="_terra_draw_other_subsubsection"
                interactive={false}
                colorSchema="subsubsection"
              />
            )}
            {otherSubsubsectionFeatures.points && (
              <PointsLayer
                points={otherSubsubsectionFeatures.points}
                layerIdSuffix="_terra_draw_other_subsubsection"
                interactive={false}
                colorSchema="subsubsection"
              />
            )}
            {otherSubsubsectionFeatures.lineEndPoints && (
              <LineEndPointsLayer
                lineEndPoints={otherSubsubsectionFeatures.lineEndPoints}
                layerIdSuffix="_terra_draw_other_subsubsection"
                colorSchema="subsubsection"
              />
            )}
          </>
        )}

        <TerraDrawControls initialGeometry={initialGeometry} onChange={onChange}>
          {children}
        </TerraDrawControls>
      </BaseMap>
    </div>
  )
}
