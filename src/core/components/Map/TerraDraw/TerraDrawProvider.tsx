import { terraDrawHintDismissedActions } from "@/src/core/store/terraDrawHintDismissed.zustand"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { useEffect } from "react"
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
    hasGeometries: boolean
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

  // The TerraDrawHint needs the initial and setMode
  const { setTerraDrawMode } = terraDrawHintDismissedActions()
  useEffect(() => {
    setTerraDrawMode(control.mode)
  }, [control.mode, setTerraDrawMode])

  if (!children) return null

  return children({
    mode: control.mode,
    setMode: control.setMode,
    clear: control.clear,
    getSnapshot: control.getSnapshot,
    updateFeatures: control.updateFeatures,
    getSelectedIds: control.getSelectedIds,
    deleteSelected: control.deleteSelected,
    selectedIds: control.selectedIds,
    hasGeometries: control.getSnapshot().length > 0,
    enabledButtons: control.enabledButtons,
  })
}
