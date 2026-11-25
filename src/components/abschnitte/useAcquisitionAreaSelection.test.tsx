// @vitest-environment jsdom

import { renderHook } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"
import { useAcquisitionAreaSelection } from "./useAcquisitionAreaSelection"

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock("@tanstack/react-router", () => ({
  getRouteApi: () => ({
    useSearch: () => ({ acquisitionAreaId: 5 }),
    useNavigate: () => navigate,
  }),
}))

describe("useAcquisitionAreaSelection", () => {
  test("choosing another area keeps the other search params", async () => {
    const { result } = renderHook(() => useAcquisitionAreaSelection([{ id: 5 }, { id: 7 }]))

    await result.current.setAcquisitionAreaId(7)

    const { search } = navigate.mock.calls[0]?.[0] ?? {}
    const previous = { acquisitionAreaId: 5, view: "map" }
    expect(typeof search === "function" ? search(previous) : search).toEqual({
      ...previous,
      acquisitionAreaId: 7,
    })
  })
})
