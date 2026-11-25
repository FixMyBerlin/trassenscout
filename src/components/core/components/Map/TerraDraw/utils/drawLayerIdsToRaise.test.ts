import { describe, expect, test } from "vitest"
import { drawLayerIdsToRaise } from "./drawLayerIdsToRaise"

describe("drawLayerIdsToRaise", () => {
  test("leaves the drawing layers alone while they are on top", () => {
    expect(drawLayerIdsToRaise(["background", "roads", "td-polygon", "td-point"], "td")).toEqual([])
  })

  test("raises the drawing layers in order once a layer lands above them", () => {
    expect(
      drawLayerIdsToRaise(["background", "td-polygon", "td-point", "tilda-infra-bikelanes"], "td"),
    ).toEqual(["td-polygon", "td-point"])
  })

  test("does nothing without drawing layers", () => {
    expect(drawLayerIdsToRaise(["background", "roads"], "td")).toEqual([])
  })
})
