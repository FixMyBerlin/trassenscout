import { create } from "zustand"

type GroupOverrides = ReadonlyMap<string, boolean>

interface SubsubsectionSearchGroupsStore {
  searchterm: string | null
  overrides: GroupOverrides
  actions: {
    collapseGroups: (searchterm: string, subsectionSlugs: string[]) => void
    expandGroups: (searchterm: string, subsectionSlugs: string[]) => void
  }
}

const NO_OVERRIDES: GroupOverrides = new Map()

const withGroups = (
  state: SubsubsectionSearchGroupsStore,
  searchterm: string,
  subsectionSlugs: string[],
  collapsed: boolean,
) => {
  const overrides = new Map(state.searchterm === searchterm ? state.overrides : NO_OVERRIDES)
  for (const subsectionSlug of subsectionSlugs) overrides.set(subsectionSlug, collapsed)
  return { searchterm, overrides }
}

const useSubsubsectionSearchGroupsStore = create<SubsubsectionSearchGroupsStore>()((set) => ({
  searchterm: null,
  overrides: NO_OVERRIDES,
  actions: {
    collapseGroups: (searchterm, subsectionSlugs) =>
      set((state) => withGroups(state, searchterm, subsectionSlugs, true)),
    expandGroups: (searchterm, subsectionSlugs) =>
      set((state) => withGroups(state, searchterm, subsectionSlugs, false)),
  },
}))

export const useSubsubsectionSearchGroupOverrides = (searchterm: string) =>
  useSubsubsectionSearchGroupsStore((state) =>
    state.searchterm === searchterm ? state.overrides : NO_OVERRIDES,
  )

export const useSubsubsectionSearchGroupsActions = () =>
  useSubsubsectionSearchGroupsStore((state) => state.actions)
