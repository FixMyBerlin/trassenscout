import { describe, expect, test } from "vitest"
import { GeometryTypeEnum, LabelPositionEnum } from "@/src/prisma/generated/browser"
import { CreateSubsectionSchema, UpdateSubsectionSchema } from "./subsections.inputSchemas"

const input = {
  projectSlug: "rsv-d",
  slug: "pa1",
  order: 1,
  lengthM: null,
  labelPos: LabelPositionEnum.top,
  managerId: null,
  operatorId: null,
  networkHierarchyId: null,
  subsectionStatusId: null,
}
const point = {
  type: GeometryTypeEnum.POINT,
  geometry: { type: "Point", coordinates: [9.19, 48.89] },
}
const line = {
  type: GeometryTypeEnum.LINE,
  geometry: {
    type: "LineString",
    coordinates: [
      [9.19, 48.89],
      [9.2, 48.9],
    ],
  },
}

describe("subsection create/update input", () => {
  test("rejects POINT geometry", () => {
    expect(CreateSubsectionSchema.safeParse({ ...input, ...point }).success).toBe(false)
    expect(UpdateSubsectionSchema.safeParse({ ...input, id: 1, ...point }).success).toBe(false)
  })

  test("accepts LINE geometry", () => {
    expect(CreateSubsectionSchema.safeParse({ ...input, ...line }).success).toBe(true)
    expect(UpdateSubsectionSchema.safeParse({ ...input, id: 1, ...line }).success).toBe(true)
  })
})
