import { create } from "zustand"

interface TildaInfraLayerStore {
  visible: boolean
  actions: {
    toggle: () => void
  }
}

const useTildaInfraLayerStore = create<TildaInfraLayerStore>()((set) => ({
  visible: false,
  actions: {
    toggle: () => set((state) => ({ visible: !state.visible })),
  },
}))

export const useTildaInfraLayerVisible = () => useTildaInfraLayerStore((state) => state.visible)

export const useTildaInfraLayerActions = () => useTildaInfraLayerStore((state) => state.actions)
