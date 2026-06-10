import { create } from "zustand"

interface ShowMembershipRoleCheckIndicatorStore {
  enabled: boolean
  actions: {
    toggleShowMembershipRoleCheckIndicator: () => void
  }
}

const useShowMembershipRoleCheckIndicatorStore = create<ShowMembershipRoleCheckIndicatorStore>()(
  (set) => ({
    enabled: true,
    actions: {
      toggleShowMembershipRoleCheckIndicator: () => set((state) => ({ enabled: !state.enabled })),
    },
  }),
)

export const showMembershipRoleCheckIndicatorState = () =>
  useShowMembershipRoleCheckIndicatorStore((state) => state.enabled)

export const showMembershipRoleCheckIndicatorCountActions = () =>
  useShowMembershipRoleCheckIndicatorStore((state) => state.actions)
