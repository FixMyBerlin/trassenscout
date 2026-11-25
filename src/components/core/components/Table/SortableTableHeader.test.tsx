// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import type { TableSort } from "@/src/shared/tableSort/tableSort"
import { SortableTableHeader } from "./SortableTableHeader"

type Column = "slug" | "status"

const sort: TableSort<Column> = { column: "slug", direction: "asc" }

function renderHeaders(onSortClick?: (column: Column) => void) {
  render(
    <table>
      <thead>
        <tr>
          <SortableTableHeader column="slug" sort={sort} onSortClick={onSortClick}>
            Planungsabschnitt
          </SortableTableHeader>
          <SortableTableHeader column="status" sort={sort} onSortClick={onSortClick}>
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

  test("a click reports its column", () => {
    const onSortClick = vi.fn()
    renderHeaders(onSortClick)
    fireEvent.click(screen.getByRole("button", { name: "Status" }))
    expect(onSortClick).toHaveBeenLastCalledWith("status")
    fireEvent.click(screen.getByRole("button", { name: "Planungsabschnitt" }))
    expect(onSortClick).toHaveBeenLastCalledWith("slug")
  })

  test("without onSortClick it is plain text but keeps aria-sort", () => {
    renderHeaders()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Planungsabschnitt" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    )
  })
})
