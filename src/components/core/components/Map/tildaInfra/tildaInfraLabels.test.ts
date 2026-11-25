import { describe, expect, test } from "vitest"
import { getTildaInfraHoverContent } from "./tildaInfraLabels"

describe("getTildaInfraHoverContent", () => {
  test("uses TILDA's German labels and the width in metres", () => {
    expect(
      getTildaInfraHoverContent({
        category: "cyclewayOnHighway_advisory",
        width: 1.45,
        surface: "asphalt",
      }),
    ).toEqual({ category: "Schutzstreifen", width: "1,45 m", surface: "Asphalt" })
  })

  test("keeps unknown values and labels without soft hyphens", () => {
    expect(
      getTildaInfraHoverContent({ category: "someNewCategory", surface: "paving_stones" }),
    ).toEqual({
      category: "someNewCategory",
      width: "keine Angabe",
      surface: "Verbundpflastersteine",
    })
  })

  test("says keine Angabe for missing values", () => {
    const noValues = { category: "keine Angabe", width: "keine Angabe", surface: "keine Angabe" }
    expect(getTildaInfraHoverContent({})).toEqual(noValues)
    expect(getTildaInfraHoverContent(null)).toEqual(noValues)
    expect(getTildaInfraHoverContent({ width: 0 }).width).toBe("keine Angabe")
  })
})
