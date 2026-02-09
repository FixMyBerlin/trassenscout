import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import type { TerraDrawMode } from "./useTerraDrawControl"
import { useTerraDrawControl } from "./useTerraDrawControl"

type Props = {
  initialGeometry?: SupportedGeometry
  onChange?: (geometry: SupportedGeometry | null, geometryType: string | null) => void
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

// Provides Terra Draw API to children via render props
// Actual feature rendering happens in Terra Draw (MapLibre canvas), not React
export const TerraDrawProvider = ({ initialGeometry, onChange, children }: Props) => {
  const control = useTerraDrawControl({
    initialGeometry,
    onChange,
  })

  // Note: initialGeometry only used on mount. Terra Draw manages state while drawing.
  // Form state is source of truth, but we don't sync changes back during active drawing.

  return (
    <>
      {children && (
        <div className="absolute top-4 left-4 z-10">
          {children({
            mode: control.mode,
            setMode: control.setMode,
            clear: control.clear,
            getSnapshot: control.getSnapshot,
            updateFeatures: control.updateFeatures,
            getSelectedIds: control.getSelectedIds,
            deleteSelected: control.deleteSelected,
            selectedIds: control.selectedIds,
            enabledButtons: control.enabledButtons,
          })}
        </div>
      )}
    </>
  )
}
