import { describe, expect, test } from "vitest"
import { splitTildaInfraFeatures } from "./splitTildaInfraFeatures"
import { TILDA_INFRA_HIT_LAYER_ID } from "./tildaInfra.const"

const tildaLeft = {
  layer: { id: TILDA_INFRA_HIT_LAYER_ID, type: "line" },
  properties: { id: "way/1/cycleway/left" },
}
const tildaRight = {
  layer: { id: TILDA_INFRA_HIT_LAYER_ID, type: "line" },
  properties: { id: "way/1/cycleway/right" },
}
const ownLine = { layer: { id: "layer_line_subsection", type: "line" }, properties: {} }
const ownPoint = { layer: { id: "layer_point_subsubsection", type: "circle" }, properties: {} }
const ownArea = { layer: { id: "layer_polygon_fill_subsection", type: "fill" }, properties: {} }

describe("splitTildaInfraFeatures", () => {
  test("hovers every TILDA line with nothing of Trassenscout under the cursor", () => {
    expect(splitTildaInfraFeatures([tildaLeft, tildaRight])).toEqual({
      hoveredTildaInfraFeatures: [tildaLeft, tildaRight],
      otherFeatures: [],
    })
  })

  test("hovers no TILDA line under a Trassenscout line or point", () => {
    expect(splitTildaInfraFeatures([ownLine, tildaLeft])).toEqual({
      hoveredTildaInfraFeatures: [],
      otherFeatures: [ownLine],
    })
    expect(splitTildaInfraFeatures([ownPoint, tildaLeft]).hoveredTildaInfraFeatures).toEqual([])
  })

  test("hovers a TILDA line inside a Trassenscout area", () => {
    expect(splitTildaInfraFeatures([ownArea, tildaLeft])).toEqual({
      hoveredTildaInfraFeatures: [tildaLeft],
      otherFeatures: [ownArea],
    })
  })

  test("keeps missing features missing", () => {
    expect(splitTildaInfraFeatures(undefined)).toEqual({
      hoveredTildaInfraFeatures: [],
      otherFeatures: undefined,
    })
  })
})
