// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import {
  useSubsubsectionSearchGroupOverrides,
  useSubsubsectionSearchGroupsActions,
} from "./subsubsection-search-groups-store"

function setup() {
  const { result: actions } = renderHook(() => useSubsubsectionSearchGroupsActions())
  const overridesFor = (searchterm: string) =>
    renderHook(() => useSubsubsectionSearchGroupOverrides(searchterm)).result.current
  return { actions: actions.current, overridesFor }
}

describe("subsubsection search groups store", () => {
  test("collects toggles within one search", () => {
    const { actions, overridesFor } = setup()

    act(() => actions.collapseGroups("radweg", ["pa1"]))
    act(() => actions.expandGroups("radweg", ["pa2"]))

    expect(overridesFor("radweg").get("pa1")).toBe(true)
    expect(overridesFor("radweg").get("pa2")).toBe(false)
  })

  test("does not apply toggles to another search", () => {
    const { actions, overridesFor } = setup()

    act(() => actions.collapseGroups("radweg", ["pa1"]))

    expect(overridesFor("belag").size).toBe(0)
  })

  test("drops earlier toggles when the next search toggles something", () => {
    const { actions, overridesFor } = setup()

    act(() => actions.collapseGroups("radweg", ["pa1"]))
    act(() => actions.expandGroups("belag", ["pa2"]))

    expect([...overridesFor("belag")]).toEqual([["pa2", false]])
    expect(overridesFor("radweg").size).toBe(0)
  })
})
