import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  project: { findUnique: vi.fn() },
  projectRecord: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  subsubsection: { findFirst: vi.fn() },
  membership: { findMany: vi.fn() },
  tag: { findMany: vi.fn() },
  user: { findUnique: vi.fn() },
  mcpDraft: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    upsert: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({ createLogEntry: vi.fn() }))
vi.mock("@/emails/mailers/projectRecordAssignedNotificationToUser", () => ({
  projectRecordAssignedNotificationToUser: vi.fn(async () => ({ send: vi.fn() })),
}))

const directProject = {
  id: 1,
  slug: "frm9",
  mcpMode: "DIRECT",
  mcpDirectUntil: new Date("2099-01-01"),
  subsubsectionExtraFieldDefinitions: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDb.project.findUnique.mockResolvedValue({
    ...directProject,
    mcpMode: "DRAFT",
    mcpDirectUntil: null,
  })
  mockDb.mcpDraft.findFirst.mockResolvedValue(null)
  mockDb.mcpDraft.create.mockResolvedValue({ id: 1 })
  mockDb.projectRecord.create.mockResolvedValue({
    id: 8,
    title: "Notiz",
    body: null,
    assignedToId: null,
  })
  mockDb.membership.findMany.mockResolvedValue([])
  mockDb.tag.findMany.mockResolvedValue([])
  mockDb.user.findUnique.mockResolvedValue(null)
})

describe("project record MCP", () => {
  let createProjectRecordForMcp: (typeof import("./projectRecordsMcp.server"))["createProjectRecordForMcp"]
  let updateProjectRecordForMcp: (typeof import("./projectRecordsMcp.server"))["updateProjectRecordForMcp"]
  let deleteProjectRecordForMcp: (typeof import("./projectRecordsMcp.server"))["deleteProjectRecordForMcp"]

  beforeAll(async () => {
    ;({ createProjectRecordForMcp, updateProjectRecordForMcp, deleteProjectRecordForMcp } =
      await import("./projectRecordsMcp.server"))
  })
  test("DRAFT create without ref inserts a new draft and does not write ProjectRecord", async () => {
    const result = await createProjectRecordForMcp({
      projectSlug: "frm9",
      title: "Notiz",
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.mode).toBe("drafted")
    expect(mockDb.mcpDraft.create).toHaveBeenCalled()
    expect(mockDb.projectRecord.create).not.toHaveBeenCalled()
  })

  test("DIRECT create writes one ProjectRecord", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    const result = await createProjectRecordForMcp({
      projectSlug: "frm9",
      title: "Notiz",
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.mode).toBe("applied")
    expect(mockDb.projectRecord.create).toHaveBeenCalledTimes(1)
  })

  test("delete confirm refuses while comments or uploads remain", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.projectRecord.findFirst.mockResolvedValue({
      id: 8,
      title: "Notiz",
      _count: { projectRecordComments: 1, uploads: 0 },
    })
    const result = await deleteProjectRecordForMcp({
      items: [{ projectSlug: "frm9", id: 8 }],
      confirm: true,
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.items[0]?.deleted).toBe(false)
    expect(mockDb.projectRecord.delete).not.toHaveBeenCalled()
  })

  test("DIRECT update with a unique name writes assignedToId and assignedById", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.projectRecord.findFirst.mockResolvedValue({
      id: 8,
      title: "Notiz",
      body: null,
      assignedToId: null,
    })
    mockDb.membership.findMany.mockResolvedValue([
      {
        user: {
          id: 3,
          firstName: "Ada",
          lastName: "Lovelace",
          institution: "Analytical Engine Lab",
          email: "ada@example.com",
        },
      },
    ])
    const result = await updateProjectRecordForMcp({
      projectSlug: "frm9",
      id: 8,
      patch: { assignedTo: "Ada Lovelace (Analytical Engine Lab)" },
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.errors).toEqual([])
    expect(result.changes).toEqual([
      { field: "assignedTo", proposed: "Ada Lovelace (Analytical Engine Lab)" },
    ])
    expect(mockDb.projectRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ assignedToId: 3, assignedById: 1 }),
      }),
    )
    expect(JSON.stringify(result)).not.toContain("ada@example.com")
    expect(JSON.stringify(result)).not.toContain("3")
  })

  test("DIRECT update with a numeric id does not return the member name", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.projectRecord.findFirst.mockResolvedValue({
      id: 8,
      title: "Notiz",
      body: null,
      assignedToId: null,
    })
    mockDb.membership.findMany.mockResolvedValue([
      {
        user: {
          id: 3,
          firstName: "Ada",
          lastName: "Lovelace",
          institution: "Analytical Engine Lab",
          email: "ada@example.com",
        },
      },
    ])
    const result = await updateProjectRecordForMcp({
      projectSlug: "frm9",
      id: 8,
      patch: { assignedTo: "3" },
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.errors).toEqual([])
    expect(result.changes).toEqual([{ field: "assignedTo", proposed: "3" }])
    const body = JSON.stringify(result)
    expect(body).not.toContain("Ada")
    expect(body).not.toContain("Lovelace")
    expect(body).not.toContain("ada@example.com")
  })

  test("unknown or ambiguous assignee writes nothing and returns no user list", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.projectRecord.findFirst.mockResolvedValue({
      id: 8,
      title: "Notiz",
      body: null,
      assignedToId: null,
    })
    mockDb.membership.findMany.mockResolvedValue([
      {
        user: {
          id: 3,
          firstName: "Ada",
          lastName: "Lovelace",
          institution: null,
          email: "ada@example.com",
        },
      },
      {
        user: {
          id: 4,
          firstName: "Ada",
          lastName: "Lovelace",
          institution: null,
          email: "ada2@example.com",
        },
      },
    ])
    const ambiguous = await updateProjectRecordForMcp({
      projectSlug: "frm9",
      id: 8,
      patch: { assignedTo: "Ada Lovelace" },
      origin: "http://localhost",
      createdById: 1,
    })
    expect(ambiguous.errors).toEqual(["Zuweisung nicht gefunden"])
    expect(mockDb.projectRecord.update).not.toHaveBeenCalled()
    expect(JSON.stringify(ambiguous)).not.toContain("ada@example.com")
    expect(JSON.stringify(ambiguous)).not.toContain("ada2@example.com")

    mockDb.membership.findMany.mockResolvedValue([])
    const unknown = await updateProjectRecordForMcp({
      projectSlug: "frm9",
      id: 8,
      patch: { assignedTo: "Unknown Person" },
      origin: "http://localhost",
      createdById: 1,
    })
    expect(unknown.errors).toEqual(["Zuweisung nicht gefunden"])
    expect(mockDb.projectRecord.update).not.toHaveBeenCalled()
  })

  test("DIRECT update with tag titles replaces the tag set and an unknown title fails", async () => {
    mockDb.project.findUnique.mockResolvedValue(directProject)
    mockDb.projectRecord.findFirst.mockResolvedValue({
      id: 8,
      title: "Notiz",
      body: null,
      assignedToId: null,
    })
    mockDb.tag.findMany.mockResolvedValue([{ id: 9, title: "Brücke" }])
    const result = await updateProjectRecordForMcp({
      projectSlug: "frm9",
      id: 8,
      patch: { tags: ["Brücke"] },
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.errors).toEqual([])
    expect(mockDb.projectRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tags: { set: [{ id: 9 }] } }),
      }),
    )

    mockDb.projectRecord.update.mockClear()
    mockDb.tag.findMany.mockResolvedValue([])
    const unknown = await updateProjectRecordForMcp({
      projectSlug: "frm9",
      id: 8,
      patch: { tags: ["Unbekannt"] },
      origin: "http://localhost",
      createdById: 1,
    })
    expect(unknown.errors).toEqual(["Tag nicht gefunden"])
    expect(mockDb.projectRecord.update).not.toHaveBeenCalled()
    expect(JSON.stringify(unknown)).not.toContain("candidate")
  })

  test("DRAFT create stores assignedToId and tagIds and does not write ProjectRecord", async () => {
    mockDb.membership.findMany.mockResolvedValue([
      { user: { id: 3, firstName: "Ada", lastName: "Lovelace", institution: null } },
    ])
    mockDb.tag.findMany.mockResolvedValue([{ id: 9, title: "Brücke" }])
    const result = await createProjectRecordForMcp({
      projectSlug: "frm9",
      title: "Notiz",
      assignedTo: "Ada Lovelace",
      tags: ["Brücke"],
      origin: "http://localhost",
      createdById: 1,
    })
    expect(result.mode).toBe("drafted")
    expect(mockDb.projectRecord.create).not.toHaveBeenCalled()
    expect(mockDb.mcpDraft.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        patch: expect.objectContaining({ assignedToId: 3, tagIds: [9] }),
      }),
    })
    const stored = JSON.stringify(mockDb.mcpDraft.create.mock.calls[0]?.[0])
    expect(stored).not.toContain("assignedBy")
  })
})
