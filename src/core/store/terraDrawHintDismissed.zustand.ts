import { create } from "zustand"

/** Modes that can show a hint; must match TerraDrawMode from useTerraDrawControl. */
export type TerraDrawHintMode =
  | "point"
  | "linestring"
  | "freehand-linestring"
  | "polygon"
  | "select"

export type TTerraDrawHintDismissed = {
  dismissedModes: Set<TerraDrawHintMode>
  mode: TerraDrawHintMode | null
  actions: {
    dismissTerraDrawHint: (mode: TerraDrawHintMode) => void
    setTerraDrawMode: (mode: TerraDrawHintMode | null) => void
  }
}

const terraDrawHintDismissed = create<TTerraDrawHintDismissed>()((set) => ({
  dismissedModes: new Set(),
  mode: null,
  actions: {
    dismissTerraDrawHint: (mode) => {
      set((state) => ({
        dismissedModes: new Set(state.dismissedModes).add(mode),
      }))
    },
    setTerraDrawMode: (mode) => set({ mode }),
  },
}))

export const terraDrawHintDismissedState = () =>
  terraDrawHintDismissed((state) => state.dismissedModes)

export const terraDrawModeState = () => terraDrawHintDismissed((state) => state.mode)

export const terraDrawHintDismissedActions = () => terraDrawHintDismissed((state) => state.actions)
