import { describe, expect, test } from "vitest"
import { toCursorPage } from "./cursorPage.server"

describe("toCursorPage", () => {
  test("returns no next cursor when the page is not full", () => {
    const page = toCursorPage([1, 2], 3, (item) => item)

    expect(page).toEqual({ items: [1, 2], nextCursor: null })
  })

  test("trims the extra row and takes the cursor from the last kept row", () => {
    const page = toCursorPage([1, 2, 3, 4], 3, (item) => item)

    expect(page).toEqual({ items: [1, 2, 3], nextCursor: 3 })
  })
})
