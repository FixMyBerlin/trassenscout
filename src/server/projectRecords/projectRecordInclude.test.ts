import { describe, expect, test } from "vitest"
import { projectRecordInclude } from "./projectRecordInclude"

describe("projectRecordInclude", () => {
  test("does not load who created or last edited the linked Maßnahmen", () => {
    const omitted = { createdById: true, updatedById: true }

    expect(projectRecordInclude.subsubsection.omit).toEqual(omitted)
    expect(projectRecordInclude.subsubsections.omit).toEqual(omitted)
  })
})
