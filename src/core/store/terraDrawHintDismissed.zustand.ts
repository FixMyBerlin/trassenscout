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
  actions: { dismissTerraDrawHint: (mode: TerraDrawHintMode) => void }
}

const terraDrawHintDismissed = create<TTerraDrawHintDismissed>()((set) => ({
  dismissedModes: new Set(),
  actions: {
    dismissTerraDrawHint: (mode) => {
      set((state) => ({
        dismissedModes: new Set(state.dismissedModes).add(mode),
      }))
    },
  },
}))

export const terraDrawHintDismissedState = () =>
  terraDrawHintDismissed((state) => state.dismissedModes)

export const terraDrawHintDismissedActions = () =>
  terraDrawHintDismissed((state) => state.actions)
