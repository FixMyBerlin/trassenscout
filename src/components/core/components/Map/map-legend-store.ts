import { create } from "zustand"

interface MapLegendStore {
  showMapLegend: boolean
  actions: {
    toggleShowMapLegend: () => void
  }
}

const useMapLegendStore = create<MapLegendStore>()((set) => ({
  showMapLegend: false,
  actions: {
    toggleShowMapLegend: () =>
      set((state) => ({
        showMapLegend: !state.showMapLegend,
      })),
  },
}))

export const useShowMapLegend = () => useMapLegendStore((state) => state.showMapLegend)

export const useMapLegendActions = () => useMapLegendStore((state) => state.actions)
