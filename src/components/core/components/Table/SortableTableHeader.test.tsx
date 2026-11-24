// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import type { TableSort } from "@/src/shared/tableSort/tableSort"
import { SortableTableHeader } from "./SortableTableHeader"

type Column = "slug" | "status"

const sort: TableSort<Column> = { column: "slug", direction: "asc" }

function renderHeaders(onSortChange?: (next: TableSort<Column>) => void) {
  render(
    <table>
      <thead>
        <tr>
          <SortableTableHeader column="slug" sort={sort} onSortChange={onSortChange}>
            Planungsabschnitt
          </SortableTableHeader>
          <SortableTableHeader column="status" sort={sort} onSortChange={onSortChange}>
            Status
          </SortableTableHeader>
        </tr>
      </thead>
    </table>,
  )
}

describe("SortableTableHeader", () => {
  afterEach(cleanup)

  test("marks only the active column", () => {
    renderHeaders(vi.fn())
    expect(screen.getByRole("columnheader", { name: "Planungsabschnitt" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    )
    expect(screen.getByRole("columnheader", { name: "Status" })).not.toHaveAttribute("aria-sort")
  })

  test("a new column sorts ascending, the active one flips", () => {
    const onSortChange = vi.fn()
    renderHeaders(onSortChange)
    fireEvent.click(screen.getByRole("button", { name: "Status" }))
    expect(onSortChange).toHaveBeenLastCalledWith({ column: "status", direction: "asc" })
    fireEvent.click(screen.getByRole("button", { name: "Planungsabschnitt" }))
    expect(onSortChange).toHaveBeenLastCalledWith({ column: "slug", direction: "desc" })
  })

  test("without onSortChange it is plain text but keeps aria-sort", () => {
    renderHeaders()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Planungsabschnitt" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    )
  })
})
