import { describe, expect, test } from "vitest"
import { getSubsectionFeatures, type SubsectionForFeatures } from "./getSubsectionFeatures"

const subsections: SubsectionForFeatures[] = [
  {
    slug: "pa1",
    type: "LINE",
    geometry: {
      type: "LineString",
      coordinates: [
        [13.1, 52.1],
        [13.2, 52.2],
      ],
    },
  },
  {
    slug: "pa2",
    type: "POLYGON",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [13.3, 52.3],
          [13.4, 52.3],
          [13.4, 52.4],
          [13.3, 52.3],
        ],
      ],
    },
  },
]

const isCurrentBySlug = (features: ReturnType<typeof getSubsectionFeatures>) =>
  Object.fromEntries(
    [...features.lines.features, ...features.polygons.features].map(({ properties }) => [
      properties.subsectionSlug,
      properties.isCurrent,
    ]),
  )

describe("getSubsectionFeatures", () => {
  test("marks every Planungsabschnitt as current for the overview", () => {
    expect(isCurrentBySlug(getSubsectionFeatures({ subsections, highlight: "all" }))).toEqual({
      pa1: true,
      pa2: true,
    })
  })

  test("marks only Planungsabschnitte with search matches as current", () => {
    const features = getSubsectionFeatures({
      subsections,
      highlight: "matches",
      matchedSubsectionSlugs: new Set(["pa2"]),
    })

    expect(isCurrentBySlug(features)).toEqual({ pa1: false, pa2: true })
  })

  test("marks nothing as current when the search has no matches", () => {
    const features = getSubsectionFeatures({
      subsections,
      highlight: "matches",
      matchedSubsectionSlugs: new Set(),
    })

    expect(isCurrentBySlug(features)).toEqual({ pa1: false, pa2: false })
  })
})
