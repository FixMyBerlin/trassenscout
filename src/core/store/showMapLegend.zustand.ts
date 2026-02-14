import { create } from "zustand"

export type TShowMapLegend = {
  showMapLegend: boolean
  actions: { toggleShowMapLegend: () => void }
}

const showMapLegend = create<TShowMapLegend>()((set) => ({
  showMapLegend: true,
  actions: {
    toggleShowMapLegend: () => {
      set((state) => ({
        showMapLegend: !state.showMapLegend,
      }))
    },
  },
}))

export const showMapLegendState = () => showMapLegend((state) => state.showMapLegend)

export const showMapLegendActions = () => showMapLegend((state) => state.actions)
