import db, { LabelPositionEnum } from "@/db"
import { beforeEach, describe, expect, it, vi } from "vitest"
import createProject from "../../projects/mutations/createProject"
import createSubsection from "../../subsections/mutations/createSubsection"
import updateSubsection from "../../subsections/mutations/updateSubsection"

beforeEach(async () => {
  // await db.$reset() // We do this manually in the describe block to share data between the tests
})

const mockCtx: any = {
  session: {
    $create: vi.fn(),
    $authorize: vi.fn(),
    userId: 1,
    role: "ADMIN",
  },
} // satisfies Ctx

describe("createLogEntry mutation", async () => {
  await db.$reset()
  await db.user.create({
    data: {
      id: mockCtx.session.userId,
      email: "test@example.com",
      firstName: "Test User",
      lastName: "Test User",
      role: mockCtx.session.role,
    },
  })
  const project = await createProject(
    { slug: "test", exportEnabled: false, aiEnabled: false },
    mockCtx,
  )
  const subsectionInput = {
    slug: "test",
    order: 99,
    lengthM: 99,
    start: "start string",
    end: "end string",
    labelPos: "top" as LabelPositionEnum,
    geometry: {
      type: "LineString" as const,
      coordinates: [
        [1, 1],
        [2, 2],
      ] as [number, number][],
    },
    projectSlug: project.slug,
    projectId: project.id,
    managerId: null,
    operatorId: null,
    networkHierarchyId: null,
    subsectionStatusId: null,
    estimatedCompletionDateString: null,
  }
  const subsection = await createSubsection({ ...subsectionInput }, mockCtx)

  it("CREATE case without diff", async () => {
    expect(true).toBe(true)

    expect(subsection.slug).toBe(subsectionInput.slug)

    const logEntry = await db.logEntry.findFirst()
    expect(logEntry?.message?.startsWith("Neuer Planungsabschnitt")).toBe(true)
    expect(logEntry?.changes).toBe(null)
  })

  it("UPDATE case with diff for real changes", async () => {
    expect(true).toBe(true)

    const input = { ...subsectionInput, id: subsection.id, lengthM: 100 }
    const updatedSubsection = await updateSubsection({ ...input }, mockCtx)
    expect(updatedSubsection?.slug).toBe(subsectionInput.slug)
    expect(updatedSubsection?.lengthM).toBe(100)

    const logEntries = await db.logEntry.findMany()
    expect(logEntries.length).toBe(2)
    const logEntry = logEntries.at(1)
    expect(logEntry?.message).toContain("Planungsabschnitt")
    expect(logEntry?.message).toContain("bearbeitet")
    expect(Array.isArray(logEntry?.changes) && logEntry?.changes?.length).toBe(2)
    expect(Array.isArray(logEntry?.changes) && logEntry?.changes?.at(1)).toStrictEqual({
      kind: "E",
      lhs: 99,
      path: ["lengthM"],
      rhs: 100,
    })
  })

  it("UPDATE with no diff because only updatedAt changed", async () => {
    expect(true).toBe(true)

    // Idential changes to the second test, so nothing changes except updatedAt
    const input = { ...subsectionInput, id: subsection.id, lengthM: 100 }
    const updatedSubsection = await updateSubsection({ ...input }, mockCtx)
    expect(updatedSubsection?.slug).toBe(subsectionInput.slug)
    expect(updatedSubsection?.lengthM).toBe(100)

    const logEntriesCount = await db.logEntry.count()
    expect(logEntriesCount).toBe(2)
    // Still only 2 log entries (from the two tests above) because we don't record changes when only updateAt changed
  })
})
