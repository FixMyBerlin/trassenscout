import { create } from "zustand"
import type { TerraDrawMode } from "@/src/core/components/Map/TerraDraw/useTerraDrawControl"

type State = {
  mode: TerraDrawMode | null
  setMode: (mode: TerraDrawMode | null) => void
  geometryType: string | null
  setGeometryType: (t: string | null) => void
  dismissedIds: Set<string>
  dismiss: (hintId: string) => void
}

export const useTerraDrawHint = create<State>()((set) => ({
  mode: null,
  setMode: (mode) => set({ mode }),
  geometryType: null,
  setGeometryType: (geometryType) => set({ geometryType }),
  dismissedIds: new Set(),
  dismiss: (hintId) =>
    set((state) => ({
      dismissedIds: new Set(state.dismissedIds).add(hintId),
    })),
}))

export const useTerraDrawHintModeState = () => useTerraDrawHint((s) => s.mode)
export const useTerraDrawHintSetMode = () => useTerraDrawHint((s) => s.setMode)

export const useTerraDrawHintGeometryTypeState = () => useTerraDrawHint((s) => s.geometryType)
export const useTerraDrawHintSetGeometryType = () => useTerraDrawHint((s) => s.setGeometryType)

export const useTerraDrawHintDismissedState = () => useTerraDrawHint((s) => s.dismissedIds)
export const useTerraDrawHintDismiss = () => useTerraDrawHint((s) => s.dismiss)
