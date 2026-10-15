// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { PageHeaderSearchFilter } from "./PageHeaderSearchFilter"

function renderFilter(props: { value: string; hasFilter: boolean; onChange: (v: string) => void }) {
  return render(<PageHeaderSearchFilter {...props} onReset={() => {}} placeholder="Suchen" />)
}

describe("PageHeaderSearchFilter", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  test("does not revive a committed search after an outside reset", () => {
    const onChange = vi.fn()
    const { rerender } = renderFilter({ value: "", hasFilter: false, onChange })

    fireEvent.change(screen.getByPlaceholderText("Suchen"), { target: { value: "abc" } })
    act(() => vi.advanceTimersByTime(300))
    expect(onChange).toHaveBeenCalledWith("abc")

    rerender(
      <PageHeaderSearchFilter
        value="abc"
        hasFilter
        onChange={onChange}
        onReset={() => {}}
        placeholder="Suchen"
      />,
    )
    rerender(
      <PageHeaderSearchFilter
        value=""
        hasFilter={false}
        onChange={onChange}
        onReset={() => {}}
        placeholder="Suchen"
      />,
    )
    act(() => vi.advanceTimersByTime(1000))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(screen.getByPlaceholderText<HTMLInputElement>("Suchen").value).toBe("")
  })

  test("shows the reset link only while a filter or search draft is set", () => {
    const onChange = vi.fn()
    const { rerender } = renderFilter({ value: "", hasFilter: false, onChange })
    expect(screen.queryByText("Filter zurücksetzen")).toBeNull()

    fireEvent.change(screen.getByPlaceholderText("Suchen"), { target: { value: "a" } })
    expect(screen.queryByText("Filter zurücksetzen")).not.toBeNull()

    fireEvent.change(screen.getByPlaceholderText("Suchen"), { target: { value: "" } })
    expect(screen.queryByText("Filter zurücksetzen")).toBeNull()

    rerender(
      <PageHeaderSearchFilter
        value=""
        hasFilter
        onChange={onChange}
        onReset={() => {}}
        placeholder="Suchen"
      />,
    )
    expect(screen.queryByText("Filter zurücksetzen")).not.toBeNull()
  })
})
