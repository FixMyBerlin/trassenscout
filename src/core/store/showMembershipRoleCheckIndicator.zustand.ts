import { create } from "zustand"
import { isProduction } from "../utils"

export type TShowMembershipRoleCheckIndicator = {
  showMembershipRoleCheckIndicator: boolean
  actions: { toggleShowMembershipRoleCheckIndicator: () => void }
}

const showMembershipRoleCheckIndicator = create<TShowMembershipRoleCheckIndicator>()((set) => ({
  showMembershipRoleCheckIndicator: !isProduction,
  actions: {
    toggleShowMembershipRoleCheckIndicator: () => {
      set((state) => ({
        showMembershipRoleCheckIndicator: !state.showMembershipRoleCheckIndicator,
      }))
    },
  },
}))

export const showMembershipRoleCheckIndicatorState = () =>
  showMembershipRoleCheckIndicator((state) => state.showMembershipRoleCheckIndicator)

export const showMembershipRoleCheckIndicatorCountActions = () =>
  showMembershipRoleCheckIndicator((state) => state.actions)
