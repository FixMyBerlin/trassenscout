import { BaseMap } from "@/src/core/components/Map/BaseMap"
import type { Geometry } from "geojson"
import type { LngLatBoundsLike } from "react-map-gl/maplibre"
import { useTerraDrawControl, type TerraDrawMode } from "./useTerraDrawControl"

type Props = {
  initialGeometry?: Geometry
  onChange?: (geometry: Geometry | null, geometryType: string | null) => void
  initialViewState?: {
    bounds: LngLatBoundsLike
    fitBoundsOptions?: { padding: number }
  }
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
export const TerraDrawMap = ({ initialGeometry, onChange, initialViewState, children }: Props) => {
  // TODO: Optimize initial view state
  // Current: Default to Berlin when no initialViewState provided
  // Better: Use bbox of all project subsections when available
  // Implementation:
  // 1. In SubsectionGeometryInput: fetch all subsections for the project
  // 2. Calculate bbox using turf.js bbox() over all subsection geometries
  // 3. Pass calculated bounds as initialViewState prop
  // 4. For edit mode: zoom to current subsection geometry
  // 5. For new mode in empty project: keep this default
  const defaultViewState = {
    longitude: 13.404954,
    latitude: 52.520008,
    zoom: 11,
  }

  return (
    <div className="relative h-[500px] w-full overflow-clip rounded-md border border-gray-200">
      <BaseMap
        id="terra-draw-map"
        initialViewState={initialViewState || defaultViewState}
        backgroundSwitcherPosition="bottom-left"
        colorSchema="subsection"
      >
        <TerraDrawControls initialGeometry={initialGeometry} onChange={onChange}>
          {children}
        </TerraDrawControls>
      </BaseMap>
    </div>
  )
}
