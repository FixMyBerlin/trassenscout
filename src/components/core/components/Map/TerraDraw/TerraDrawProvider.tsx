import { useTerraDrawHintActions } from "@/src/components/core/components/Map/TerraDraw/terra-draw-hint-store"
import { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"
import type { TerraDrawModeConfig } from "./terraDrawConfig"
import type { TerraDrawMode } from "./useTerraDrawControl"
import { useTerraDrawControl } from "./useTerraDrawControl"

type Props = {
  initialGeometry?: SupportedGeometry
  onChange?: (geometry: SupportedGeometry | null, geometryType: string | null) => void
  modeConfig?: TerraDrawModeConfig
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
export const TerraDrawProvider = ({ initialGeometry, onChange, modeConfig, children }: Props) => {
  const { syncMode, syncGeometryType } = useTerraDrawHintActions()

  const control = useTerraDrawControl({
    initialGeometry,
    onChange,
    onModeChange: syncMode,
    onGeometryTypeChange: syncGeometryType,
    modeConfig,
  })

  const setMode = (mode: TerraDrawMode) => {
    control.setMode(mode)
    syncMode(mode)
  }

  if (!children) return null

  return children({
    mode: control.mode,
    setMode,
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
