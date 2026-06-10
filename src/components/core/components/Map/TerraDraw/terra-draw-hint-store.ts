import { create } from "zustand"
import type { TerraDrawMode } from "@/src/components/core/components/Map/TerraDraw/useTerraDrawControl"

interface TerraDrawHintStore {
  mode: TerraDrawMode | null
  geometryType: string | null
  dismissedIds: Set<string>
  actions: {
    syncMode: (mode: TerraDrawMode | null) => void
    syncGeometryType: (geometryType: string | null) => void
    dismiss: (hintId: string) => void
  }
}

const useTerraDrawHintStore = create<TerraDrawHintStore>()((set) => ({
  mode: null,
  geometryType: null,
  dismissedIds: new Set(),
  actions: {
    syncMode: (mode) => set({ mode }),
    syncGeometryType: (geometryType) => set({ geometryType }),
    dismiss: (hintId) =>
      set((state) => ({
        dismissedIds: new Set(state.dismissedIds).add(hintId),
      })),
  },
}))

export const useTerraDrawHintMode = () => useTerraDrawHintStore((state) => state.mode)

export const useTerraDrawHintGeometryType = () =>
  useTerraDrawHintStore((state) => state.geometryType)

export const useTerraDrawHintDismissedIds = () =>
  useTerraDrawHintStore((state) => state.dismissedIds)

export const useTerraDrawHintActions = () => useTerraDrawHintStore((state) => state.actions)
