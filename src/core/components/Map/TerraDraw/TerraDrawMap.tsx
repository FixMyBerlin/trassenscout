import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import type { LngLatBoundsLike } from "react-map-gl/maplibre"
import { TerraDrawContextLayers } from "./TerraDrawContextLayers"
import { TerraDrawProvider } from "./TerraDrawProvider"
import type { TerraDrawMode } from "./useTerraDrawControl"

type Props = {
  initialGeometry?: SupportedGeometry
  onChange?: (geometry: SupportedGeometry | null, geometryType: string | null) => void
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
    getSnapshot: () => SupportedGeometry[]
    updateFeatures: (geometry: SupportedGeometry | null) => void
    getSelectedIds: () => string[]
    deleteSelected: () => void
    selectedIds: string[]
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
        <TerraDrawContextLayers
          subsections={subsections}
          selectedSubsectionSlug={selectedSubsectionSlug}
          subsubsections={subsubsections}
          selectedSubsubsectionSlug={selectedSubsubsectionSlug}
        />

        <TerraDrawProvider initialGeometry={initialGeometry} onChange={onChange}>
          {children}
        </TerraDrawProvider>
      </BaseMap>
    </div>
  )
}
