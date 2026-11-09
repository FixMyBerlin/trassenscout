import { describe, expect, it } from "vitest"
import { ProjectSchema } from "./schemas"

const project = {
  slug: "frm9-ra1",
  exportEnabled: false,
  aiEnabled: false,
  alkisStateKey: "DISABLED",
  landAcquisitionModuleEnabled: false,
}

describe("ProjectSchema partOf", () => {
  it("stores a blank value as null", () => {
    expect(ProjectSchema.parse({ ...project, partOf: "  " }).partOf).toBeNull()
  })

  it("keeps an omitted value undefined", () => {
    expect(ProjectSchema.parse(project).partOf).toBeUndefined()
  })

  it("trims the value", () => {
    expect(ProjectSchema.parse({ ...project, partOf: " FRM9 " }).partOf).toBe("FRM9")
  })

  it("rejects more than 20 characters", () => {
    expect(ProjectSchema.safeParse({ ...project, partOf: "x".repeat(21) }).success).toBe(false)
  })
})

describe("ProjectSchema projectLeadId", () => {
  it("keeps an omitted value undefined", () => {
    expect(ProjectSchema.parse(project).projectLeadId).toBeUndefined()
  })

  it("stores the empty choice as null and an id as a number", () => {
    expect(ProjectSchema.parse({ ...project, projectLeadId: "" }).projectLeadId).toBeNull()
    expect(ProjectSchema.parse({ ...project, projectLeadId: "7" }).projectLeadId).toBe(7)
  })
})
