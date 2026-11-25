// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { useTildaInfraLayerActions, useTildaInfraLayerVisible } from "./tilda-infra-layer-store"

describe("tilda-infra-layer-store", () => {
  test("is off by default and toggles", () => {
    const { result } = renderHook(() => ({
      visible: useTildaInfraLayerVisible(),
      actions: useTildaInfraLayerActions(),
    }))

    expect(result.current.visible).toBe(false)
    act(() => result.current.actions.toggle())
    expect(result.current.visible).toBe(true)
    act(() => result.current.actions.toggle())
    expect(result.current.visible).toBe(false)
  })
})
