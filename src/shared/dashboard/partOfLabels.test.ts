import { polygon } from "@turf/helpers"
import type { Position } from "geojson"
import { describe, expect, it } from "vitest"
import { areaLabelAnchors, lineLabelAnchors, partOfGroupKey } from "./partOfLabels"

const TOLERANCE = 0.0003

const square = (x: number, y: number) =>
  polygon([
    [
      [x, y],
      [x + 1, y],
      [x + 1, y + 1],
      [x, y + 1],
      [x, y],
    ],
  ])

const eastWest: Position[] = [
  [13, 52],
  [13.1, 52],
]

describe("lineLabelAnchors", () => {
  it("places one anchor in the middle of touching lines", () => {
    const anchors = lineLabelAnchors(
      [
        eastWest,
        [
          [13.1, 52],
          [13.2, 52],
        ],
      ],
      TOLERANCE,
    )

    expect(anchors).toHaveLength(1)
    expect(anchors[0]?.coordinates[0]).toBeCloseTo(13.1, 3)
  })

  it("places one anchor per separate piece", () => {
    const anchors = lineLabelAnchors(
      [
        eastWest,
        [
          [14, 52],
          [14.1, 52],
        ],
      ],
      TOLERANCE,
    )

    expect(anchors).toHaveLength(2)
  })

  it("keeps the text upright along the line", () => {
    const [eastward] = lineLabelAnchors([eastWest], TOLERANCE)
    const [westward] = lineLabelAnchors([[...eastWest].reverse()], TOLERANCE)
    const [northward] = lineLabelAnchors(
      [
        [
          [13, 52],
          [13, 52.1],
        ],
      ],
      TOLERANCE,
    )

    expect(eastward?.rotate).toBeCloseTo(0, 0)
    expect(westward?.rotate).toBeCloseTo(0, 0)
    expect(northward?.rotate).toBeCloseTo(-90, 0)
  })
})

describe("areaLabelAnchors", () => {
  it("places one anchor for touching areas", () => {
    expect(areaLabelAnchors([square(0, 0), square(1, 0)])).toHaveLength(1)
  })

  it("places one anchor per separate area", () => {
    expect(areaLabelAnchors([square(0, 0), square(5, 0)])).toHaveLength(2)
  })
})

describe("partOfGroupKey", () => {
  it("ignores case and spaces", () => {
    expect(partOfGroupKey(" frm 9 ")).toBe(partOfGroupKey("FRM9"))
    expect(partOfGroupKey("FRM9")).not.toBe(partOfGroupKey("FRM5"))
  })
})
