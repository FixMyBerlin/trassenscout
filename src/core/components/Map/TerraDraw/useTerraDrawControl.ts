import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { useState } from "react"
import { useControl } from "react-map-gl/maplibre"
import { TerraDrawControl } from "./TerraDrawControl"
import { calculateEnabledButtons, getDefaultModeForGeometry } from "./utils/buttonState"

export type TerraDrawMode = "point" | "linestring" | "freehand-linestring" | "polygon" | "select"

type Props = {
  initialGeometry?: SupportedGeometry
  onChange?: (geometry: SupportedGeometry | null, geometryType: string | null) => void
}

// Custom hook to integrate Terra Draw with react-map-gl using the useControl pattern
// Manages terra-draw lifecycle internally without exposing refs or requiring useEffect in consumers
export const useTerraDrawControl = ({ initialGeometry, onChange }: Props) => {
  const [mode, setModeState] = useState<TerraDrawMode>(() =>
    getDefaultModeForGeometry(initialGeometry),
  )

  // Initialize button state based on initial geometry type
  // Use the same logic as getEnabledButtons for consistency
  const getInitialButtonState = () => {
    if (!initialGeometry) {
      return {
        point: true,
        linestring: true,
        "freehand-linestring": true,
        polygon: true,
        edit: false,
      }
    }
    const geometryTypes = new Set([initialGeometry.type])
    return calculateEnabledButtons(geometryTypes, true)
  }

  const [enabledButtons, setEnabledButtons] = useState(getInitialButtonState())
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const control = useControl<TerraDrawControl>(
    () => {
      const wrappedOnChange = (geometry: SupportedGeometry | null, geometryType: string | null) => {
        // Update enabled buttons based on new state
        if (control) {
          setEnabledButtons(control.getEnabledButtons())
        }
        // Call original onChange
        if (onChange) {
          onChange(geometry, geometryType)
        }
      }

      const ctrl = new TerraDrawControl(wrappedOnChange, initialGeometry)
      ctrl.setOnModeChange(setModeState)
      ctrl.setOnButtonsChange(() => {
        if (ctrl) {
          setEnabledButtons(ctrl.getEnabledButtons())
        }
      })
      ctrl.setOnSelectionChange(() => {
        if (ctrl) {
          setSelectedIds(ctrl.getSelectedIds())
        }
      })
      return ctrl
    },
    { position: "top-left" },
  )

  const setMode = (newMode: TerraDrawMode) => {
    if (control) {
      control.setMode(newMode)
    }
  }

  const clear = () => {
    if (control) {
      control.clear()
      setEnabledButtons({
        point: true,
        linestring: true,
        "freehand-linestring": true,
        polygon: true,
        edit: false,
      })
    }
  }

  const getSnapshot = () => {
    if (control) {
      return control.getSnapshot()
    }
    return []
  }

  const updateFeatures = (geometry: SupportedGeometry | null, ignoreChangeEvents = true) => {
    if (control) {
      control.updateFeatures(geometry, ignoreChangeEvents)
      setEnabledButtons(control.getEnabledButtons())
    }
  }

  const getSelectedIds = () => {
    if (control) {
      return control.getSelectedIds()
    }
    return []
  }

  const deleteSelected = () => {
    if (control) {
      control.deleteSelected()
      setEnabledButtons(control.getEnabledButtons())
      setSelectedIds(control.getSelectedIds())
    }
  }

  return {
    mode,
    setMode,
    clear,
    getSnapshot,
    updateFeatures,
    enabledButtons,
    getSelectedIds,
    deleteSelected,
    selectedIds,
  }
}
