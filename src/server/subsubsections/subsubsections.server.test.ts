import { beforeEach, describe, expect, test, vi } from "vitest"
import { Prisma } from "@/src/prisma/generated/client"

const mockDb = {
  membership: {
    findMany: vi.fn(),
  },
  project: {
    findFirstOrThrow: vi.fn(),
  },
  subsection: {
    findFirstOrThrow: vi.fn(),
  },
  subsubsection: {
    findFirstOrThrow: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  acquisitionArea: {
    count: vi.fn(),
  },
  mcpDraft: {
    deleteMany: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

const mockEndpointAuth = {
  projectRole: vi.fn(),
  admin: vi.fn(),
}

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: mockEndpointAuth,
}))

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: vi.fn().mockResolvedValue(undefined),
}))

const mockAddSubsubsectionBookmarks = vi.fn().mockResolvedValue(undefined)

vi.mock("@/src/server/subsubsectionBookmarks/recordSubsubsectionActivity.server", () => ({
  addSubsubsectionBookmarks: mockAddSubsubsectionBookmarks,
}))

const headers = new Headers()

const baseInput = {
  id: 1,
  projectSlug: "test-project",
  slug: "rf-1",
  subsectionId: 10,
  geometry: [],
  specialFeatures: [],
  subsubsectionInfrastructureTypeIds: [],
} as never

describe("updateSubsubsection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      session: { userId: 1, role: "USER" },
    })
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 1, userId: 1 }])
    mockDb.project.findFirstOrThrow.mockResolvedValue({ subsubsectionExtraFieldDefinitions: [] })
    mockDb.subsection.findFirstOrThrow.mockResolvedValue({ id: 10 })
    mockDb.acquisitionArea.count.mockResolvedValue(0)
    mockDb.subsubsection.update.mockResolvedValue({
      id: 1,
      slug: "rf-1",
      subsectionId: 10,
      managerId: null,
      specialFeatures: [],
      SubsubsectionInfrastructureTypes: [],
      subsection: { slug: "pa1" },
    })
  })

  test("does not send createdById and updatedById in the response", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({
      id: 1,
      subsectionId: 10,
      slug: "rf-1",
      specialFeatures: [],
      SubsubsectionInfrastructureTypes: [],
    })
    mockDb.subsubsection.update.mockResolvedValue({
      id: 1,
      slug: "rf-1",
      subsectionId: 10,
      managerId: null,
      createdById: 99,
      updatedById: 98,
      specialFeatures: [],
      SubsubsectionInfrastructureTypes: [],
      subsection: { slug: "pa1" },
    })

    const result = await updateSubsubsection(headers, baseInput)

    expect(result).not.toHaveProperty("createdById")
    expect(result).not.toHaveProperty("updatedById")
  })

  test("sets updatedById to the acting user and leaves createdById alone", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({
      id: 1,
      subsectionId: 10,
      slug: "rf-1",
      specialFeatures: [],
      SubsubsectionInfrastructureTypes: [],
    })

    await updateSubsubsection(headers, baseInput)

    const { data } = mockDb.subsubsection.update.mock.calls[0]![0]
    expect(data).toMatchObject({ updatedById: 1 })
    expect(data).not.toHaveProperty("createdById")
  })

  test("does not require admin when the Planungsabschnitt is unchanged", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({
      id: 1,
      subsectionId: 10,
      slug: "rf-1",
      specialFeatures: [],
      SubsubsectionInfrastructureTypes: [],
    })

    await updateSubsubsection(headers, baseInput)

    expect(mockEndpointAuth.projectRole).toHaveBeenCalled()
    expect(mockEndpointAuth.admin).not.toHaveBeenCalled()
    expect(mockDb.subsubsection.update).toHaveBeenCalled()
  })

  test("requires admin when moving to another Planungsabschnitt", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({ id: 1, subsectionId: 99 })

    await updateSubsubsection(headers, baseInput)

    expect(mockEndpointAuth.admin).toHaveBeenCalledWith(headers)
    expect(mockDb.subsubsection.update).toHaveBeenCalled()
  })

  test("rejects the move for non-admins without updating", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({ id: 1, subsectionId: 99 })
    mockEndpointAuth.admin.mockRejectedValue(new Error("Not authorized"))

    await expect(updateSubsubsection(headers, baseInput)).rejects.toThrow("Not authorized")
    expect(mockDb.subsubsection.update).not.toHaveBeenCalled()
  })

  test("stores a Maßnahme without geometry as SQL NULL, never as JSON null", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({
      id: 1,
      subsectionId: 10,
      type: null,
      geometry: null,
    })

    await updateSubsubsection(headers, {
      ...(baseInput as object),
      type: null,
      geometry: null,
    } as never)

    const { data } = mockDb.subsubsection.update.mock.calls[0]?.[0] ?? {}
    expect(data.type).toBeNull()
    expect(data.geometry).toBe(Prisma.DbNull)
  })

  test("removes the geometry when there are no Verhandlungsflächen", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({
      id: 1,
      subsectionId: 10,
      type: "POINT",
      geometry: { type: "Point", coordinates: [13.4, 52.5] },
    })

    await updateSubsubsection(headers, {
      ...(baseInput as object),
      type: null,
      geometry: null,
    } as never)

    expect(mockDb.acquisitionArea.count).toHaveBeenCalledWith({ where: { subsubsectionId: 1 } })
    const { data } = mockDb.subsubsection.update.mock.calls[0]?.[0] ?? {}
    expect(data.type).toBeNull()
    expect(data.geometry).toBe(Prisma.DbNull)
  })

  test("refuses to remove the geometry while Verhandlungsflächen exist", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({
      id: 1,
      subsectionId: 10,
      type: "POINT",
      geometry: { type: "Point", coordinates: [13.4, 52.5] },
    })
    mockDb.acquisitionArea.count.mockResolvedValue(2)

    await expect(
      updateSubsubsection(headers, {
        ...(baseInput as object),
        type: null,
        geometry: null,
      } as never),
    ).rejects.toThrow("Verhandlungsflächen")
    expect(mockDb.subsubsection.update).not.toHaveBeenCalled()
    expect(mockAddSubsubsectionBookmarks).not.toHaveBeenCalled()
  })

  test("bookmarks the acting user and a new manager in one call", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({
      id: 1,
      subsectionId: 10,
      managerId: 7,
    })
    mockDb.subsubsection.update.mockResolvedValue({
      id: 1,
      slug: "rf-1",
      subsectionId: 10,
      managerId: 8,
      specialFeatures: [],
      SubsubsectionInfrastructureTypes: [],
      subsection: { slug: "pa1" },
    })

    await updateSubsubsection(headers, baseInput)

    expect(mockAddSubsubsectionBookmarks).toHaveBeenCalledTimes(1)
    expect(mockAddSubsubsectionBookmarks).toHaveBeenCalledWith({
      subsubsectionIds: [1],
      userIds: [1, 8],
    })
  })

  test("does not bookmark the manager again when the manager is unchanged", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({
      id: 1,
      subsectionId: 10,
      managerId: 7,
    })
    mockDb.subsubsection.update.mockResolvedValueOnce({
      id: 1,
      slug: "rf-1",
      subsectionId: 10,
      managerId: 7,
      specialFeatures: [],
      SubsubsectionInfrastructureTypes: [],
      subsection: { slug: "pa1" },
    })

    await updateSubsubsection(headers, baseInput)
    await updateSubsubsection(headers, baseInput)

    expect(mockAddSubsubsectionBookmarks).toHaveBeenCalledTimes(2)
    for (const [call] of mockAddSubsubsectionBookmarks.mock.calls) {
      expect(call).toEqual({ subsubsectionIds: [1], userIds: [1, null] })
    }
  })
})

describe("createSubsubsection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      session: { userId: 1, role: "USER" },
    })
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 1, userId: 1 }])
    mockDb.project.findFirstOrThrow.mockResolvedValue({ subsubsectionExtraFieldDefinitions: [] })
    mockDb.mcpDraft.deleteMany.mockResolvedValue({ count: 0 })
    mockDb.subsubsection.create.mockResolvedValue({
      id: 1,
      slug: "rf-1",
      subsectionId: 10,
      type: null,
      geometry: null,
      managerId: null,
      manager: null,
    })
  })

  test("does not send createdById and updatedById in the response", async () => {
    const { createSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.create.mockResolvedValue({
      id: 1,
      slug: "rf-1",
      subsectionId: 10,
      type: null,
      geometry: null,
      managerId: null,
      manager: null,
      createdById: 99,
      updatedById: 98,
    })

    const result = await createSubsubsection(headers, {
      ...(baseInput as object),
      geometry: null,
    } as never)

    expect(result).not.toHaveProperty("createdById")
    expect(result).not.toHaveProperty("updatedById")
  })

  test("sets createdById and updatedById to the acting user", async () => {
    const { createSubsubsection } = await import("./subsubsections.server")

    await createSubsubsection(headers, baseInput)

    const { data } = mockDb.subsubsection.create.mock.calls[0]![0]
    expect(data).toMatchObject({ createdById: 1, updatedById: 1 })
  })

  test("creates a Maßnahme ohne Geometrie with SQL NULL type and geometry", async () => {
    const { createSubsubsection } = await import("./subsubsections.server")

    await createSubsubsection(headers, {
      ...(baseInput as object),
      type: null,
      geometry: null,
    } as never)

    const { data } = mockDb.subsubsection.create.mock.calls[0]?.[0] ?? {}
    expect(data.type).toBeNull()
    expect(data.geometry).toBe(Prisma.DbNull)
  })

  test("bookmarks the acting user and the manager in one call", async () => {
    const { createSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.create.mockResolvedValue({
      id: 1,
      slug: "rf-1",
      subsectionId: 10,
      type: null,
      geometry: null,
      managerId: 7,
      manager: null,
    })

    await createSubsubsection(headers, baseInput)

    expect(mockAddSubsubsectionBookmarks).toHaveBeenCalledTimes(1)
    expect(mockAddSubsubsectionBookmarks).toHaveBeenCalledWith({
      subsubsectionIds: [1],
      userIds: [1, 7],
    })
  })

  test("bookmarks only the acting user without a manager", async () => {
    const { createSubsubsection } = await import("./subsubsections.server")

    await createSubsubsection(headers, baseInput)

    expect(mockAddSubsubsectionBookmarks).toHaveBeenCalledWith({
      subsubsectionIds: [1],
      userIds: [1, null],
    })
  })
})

describe("getSubsubsection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      session: { userId: 1, role: "USER" },
    })
    mockDb.membership.findMany.mockResolvedValue([
      { projectId: 1, userId: 1 },
      { projectId: 1, userId: 2 },
    ])
  })

  const detail = (updatedById: number | null) => ({
    id: 1,
    slug: "rf-1",
    type: null,
    geometry: null,
    managerId: null,
    manager: null,
    createdById: updatedById,
    updatedById,
  })

  test("does not send createdById and updatedById, also not of a project member", async () => {
    const { getSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue(detail(2))

    const result = await getSubsubsection(headers, { projectSlug: "test-project", id: 1 })

    expect(result).not.toHaveProperty("createdById")
    expect(result).not.toHaveProperty("updatedById")
  })

  test("does not send createdById and updatedById of a former member", async () => {
    const { getSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue(detail(99))

    const result = await getSubsubsection(headers, { projectSlug: "test-project", id: 1 })

    expect(result).not.toHaveProperty("createdById")
    expect(result).not.toHaveProperty("updatedById")
  })

  test("does not send createdById and updatedById when loading by slug", async () => {
    const { getSubsubsectionBySlug } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue(detail(99))

    const result = await getSubsubsectionBySlug(headers, {
      projectSlug: "test-project",
      subsectionSlug: "pa1",
      subsubsectionSlug: "rf-1",
    })

    expect(result).not.toHaveProperty("createdById")
    expect(result).not.toHaveProperty("updatedById")
  })
})
