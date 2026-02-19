import { useEffect } from "react"
import {
  useTerraDrawHintSetGeometryType,
  useTerraDrawHintSetMode,
} from "@/src/core/store/terraDrawHint.zustand"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { useTerraDrawControl } from "./useTerraDrawControl"
import type { TerraDrawMode } from "./useTerraDrawControl"

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
  const setHintMode = useTerraDrawHintSetMode()
  const setHintGeometryType = useTerraDrawHintSetGeometryType()

  const control = useTerraDrawControl({
    initialGeometry,
    onChange,
    onModeChange: setHintMode,
  })

  useEffect(() => {
    setHintGeometryType(initialGeometry?.type ?? null)
  }, [initialGeometry?.type, setHintGeometryType])

  const setMode = (mode: TerraDrawMode) => {
    control.setMode(mode)
    setHintMode(mode)
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
