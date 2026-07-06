import { create } from "zustand"

interface MapLoadedStore {
  loadedMapIds: Record<string, true>
  actions: {
    markMapLoaded: (mapId: string) => void
    resetMapLoaded: (mapId: string) => void
  }
}

const useMapLoadedStore = create<MapLoadedStore>()((set) => ({
  loadedMapIds: {},
  actions: {
    markMapLoaded: (mapId) =>
      set((state) =>
        state.loadedMapIds[mapId]
          ? state
          : { loadedMapIds: { ...state.loadedMapIds, [mapId]: true } },
      ),
    resetMapLoaded: (mapId) =>
      set((state) => {
        if (!state.loadedMapIds[mapId]) return state
        const { [mapId]: _removed, ...loadedMapIds } = state.loadedMapIds
        return { loadedMapIds }
      }),
  },
}))

export const useMapLoaded = (mapId: string) =>
  useMapLoadedStore((state) => state.loadedMapIds[mapId] === true)

export const useMapLoadedActions = () => useMapLoadedStore((state) => state.actions)
