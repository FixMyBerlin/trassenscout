import { describe, expect, test, vi } from "vitest"
import { assertSubsubsectionHasGeometry } from "./validateAcquisitionAreaInput"

vi.mock("@/src/server/db.server", () => ({ default: {} }))

describe("assertSubsubsectionHasGeometry", () => {
  test("refuses Verhandlungsflächen for a Maßnahme ohne Geometrie", () => {
    expect(() => assertSubsubsectionHasGeometry({ type: null })).toThrow("Geometrie")
  })

  test("lets a Maßnahme with geometry through", () => {
    expect(() => assertSubsubsectionHasGeometry({ type: "POLYGON" })).not.toThrow()
  })
})
