// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import { SubsubsectionSearchMapNotice } from "./SubsubsectionSearchMapNotice"

describe("SubsubsectionSearchMapNotice", () => {
  afterEach(cleanup)

  test("shows only the message without a list action", () => {
    render(<SubsubsectionSearchMapNotice>Keine passenden Maßnahmen</SubsubsectionSearchMapNotice>)

    expect(screen.getByRole("status").textContent).toBe("Keine passenden Maßnahmen")
    expect(screen.queryByRole("button")).toBeNull()
  })

  test("offers the list when there is one to show", () => {
    const onShowList = vi.fn()
    render(
      <SubsubsectionSearchMapNotice onShowList={onShowList}>
        2 Treffer ohne Geometrie
      </SubsubsectionSearchMapNotice>,
    )

    fireEvent.click(screen.getByRole("button", { name: "In der Liste ansehen" }))
    expect(onShowList).toHaveBeenCalledOnce()
  })
})
