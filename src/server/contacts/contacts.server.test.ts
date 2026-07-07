import { beforeEach, describe, expect, test, vi } from "vitest"
import { contactInProjectWhere } from "@/src/server/contacts/contactScope"
import { AuthorizationError } from "@/src/shared/auth/errors"

const mockDb = {
  contact: {
    findFirstOrThrow: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: {
    session: vi.fn().mockResolvedValue({ userId: 1, role: "USER" }),
    projectRole: vi.fn().mockResolvedValue({ projectId: 10, session: { userId: 1, role: "USER" } }),
  },
}))

vi.mock("@/src/server/authorization/authorizeProjectMember.server", () => ({
  authorizeProjectMemberByProjectSlug: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/src/server/projects/queries/getProjectIdBySlug.server", () => ({
  getProjectIdBySlug: vi.fn().mockResolvedValue(10),
}))

const headers = new Headers()

describe("contacts.server project scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("getContact queries within the project", async () => {
    const { getContact } = await import("@/src/server/contacts/queries/contacts.server")
    mockDb.contact.findFirstOrThrow.mockResolvedValue({ id: 5 })

    await getContact(headers, { projectSlug: "alpha", id: 5 })

    expect(mockDb.contact.findFirstOrThrow).toHaveBeenCalledWith({
      where: contactInProjectWhere("alpha", 5),
      include: { tags: true },
    })
  })

  test("updateContact rejects contacts outside the project", async () => {
    const { updateContact } = await import("@/src/server/contacts/mutations/contacts.server")
    mockDb.contact.findFirst.mockResolvedValue(null)

    await expect(
      updateContact(headers, {
        projectSlug: "alpha",
        id: 9,
        lastName: "Muster",
        email: "test@example.com",
        tags: [],
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)
  })

  test("deleteContact rejects contacts outside the project", async () => {
    const { deleteContact } = await import("@/src/server/contacts/mutations/contacts.server")
    mockDb.contact.findFirst.mockResolvedValue(null)

    await expect(deleteContact(headers, { projectSlug: "alpha", id: 9 })).rejects.toBeInstanceOf(
      AuthorizationError,
    )
  })
})
