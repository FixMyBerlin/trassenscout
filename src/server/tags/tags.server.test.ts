import { beforeEach, describe, expect, test, vi } from "vitest"
import { Prisma } from "@/src/prisma/generated/client"
import { AuthorizationError } from "@/src/shared/auth/errors"
import { createTag, TAG_TITLE_TAKEN, updateTag } from "./tags.server"

const { mockDb, mockEndpointAuth } = vi.hoisted(() => ({
  mockDb: {
    tag: { findFirst: vi.fn(), findFirstOrThrow: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
  mockEndpointAuth: { projectRole: vi.fn() },
}))

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({ endpointAuth: mockEndpointAuth }))

const headers = new Headers()

describe("createTag", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({ projectId: 1 })
  })

  test("reuses a tag whose name differs only in case", async () => {
    const existing = { id: 7, title: "Radverkehr", archivedAt: null }
    mockDb.tag.findFirst.mockResolvedValue(existing)

    const result = await createTag(headers, { projectSlug: "lb", title: "radverkehr" })

    expect(result).toBe(existing)
    expect(mockDb.tag.findFirst).toHaveBeenCalledWith({
      where: { projectId: 1, title: { equals: "radverkehr", mode: "insensitive" } },
    })
    expect(mockDb.tag.create).not.toHaveBeenCalled()
    expect(mockDb.tag.update).not.toHaveBeenCalled()
  })

  test("reactivates an archived tag with the same name", async () => {
    mockDb.tag.findFirst.mockResolvedValue({ id: 7, title: "Radverkehr", archivedAt: new Date() })
    mockDb.tag.update.mockResolvedValue({ id: 7, title: "Radverkehr", archivedAt: null })

    const result = await createTag(headers, { projectSlug: "lb", title: "RADVERKEHR" })

    expect(mockDb.tag.update).toHaveBeenCalledWith({ where: { id: 7 }, data: { archivedAt: null } })
    expect(result).toEqual({ id: 7, title: "Radverkehr", archivedAt: null })
    expect(mockDb.tag.create).not.toHaveBeenCalled()
  })

  test("creates a new tag when no name matches", async () => {
    mockDb.tag.findFirst.mockResolvedValue(null)
    mockDb.tag.create.mockResolvedValue({ id: 8, title: "Lastenrad", archivedAt: null })

    await createTag(headers, { projectSlug: "lb", title: "Lastenrad" })

    expect(mockDb.tag.create).toHaveBeenCalledWith({ data: { title: "Lastenrad", projectId: 1 } })
  })

  test("returns the tag created by a concurrent request instead of failing", async () => {
    const concurrent = { id: 9, title: "Lastenrad", archivedAt: null }
    mockDb.tag.findFirst.mockResolvedValue(null)
    mockDb.tag.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    )
    mockDb.tag.findFirstOrThrow.mockResolvedValue(concurrent)

    await expect(createTag(headers, { projectSlug: "lb", title: "Lastenrad" })).resolves.toBe(
      concurrent,
    )
  })

  test("rethrows other database errors", async () => {
    mockDb.tag.findFirst.mockResolvedValue(null)
    mockDb.tag.create.mockRejectedValue(new Error("connection lost"))

    await expect(createTag(headers, { projectSlug: "lb", title: "Lastenrad" })).rejects.toThrow(
      "connection lost",
    )
  })
})

describe("updateTag", () => {
  const asRole = (role: "ADMIN" | "USER") =>
    mockEndpointAuth.projectRole.mockResolvedValue({ projectId: 1, session: { role } })

  beforeEach(() => {
    vi.clearAllMocks()
    asRole("USER")
    mockDb.tag.findFirstOrThrow.mockResolvedValue({ id: 3, title: "Fuss", projectId: 1 })
  })

  test("rejects a name that another tag already has in a different case", async () => {
    mockDb.tag.findFirst.mockResolvedValue({ id: 7 })

    await expect(
      updateTag(headers, { projectSlug: "lb", id: 3, title: "radverkehr" }),
    ).rejects.toThrow(TAG_TITLE_TAKEN)
    expect(mockDb.tag.findFirst).toHaveBeenCalledWith({
      where: { projectId: 1, title: { equals: "radverkehr", mode: "insensitive" }, id: { not: 3 } },
      select: { id: true },
    })
    expect(mockDb.tag.update).not.toHaveBeenCalled()
  })

  test("allows changing only the case of the tag's own name", async () => {
    mockDb.tag.findFirst.mockResolvedValue(null)
    mockDb.tag.update.mockResolvedValue({ id: 3, title: "FUSS" })

    await updateTag(headers, { projectSlug: "lb", id: 3, title: "FUSS" })

    expect(mockDb.tag.update).toHaveBeenCalledWith({ where: { id: 3 }, data: { title: "FUSS" } })
  })

  test("lets editors rename but not change colour or description", async () => {
    mockDb.tag.findFirst.mockResolvedValue(null)

    await updateTag(headers, { projectSlug: "lb", id: 3, title: "Fußverkehr" })
    expect(mockDb.tag.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { title: "Fußverkehr" },
    })

    await expect(
      updateTag(headers, { projectSlug: "lb", id: 3, title: "Fußverkehr", color: "PINK" }),
    ).rejects.toThrow(AuthorizationError)
    await expect(
      updateTag(headers, { projectSlug: "lb", id: 3, title: "Fußverkehr", description: "Info" }),
    ).rejects.toThrow(AuthorizationError)
  })

  test("lets admins set colour and description; an empty description is stored as null", async () => {
    asRole("ADMIN")
    mockDb.tag.findFirst.mockResolvedValue(null)

    await updateTag(headers, {
      projectSlug: "lb",
      id: 3,
      title: "Fuss",
      color: "PINK",
      description: "",
    })

    expect(mockDb.tag.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { title: "Fuss", color: "PINK", description: null },
    })
  })
})
