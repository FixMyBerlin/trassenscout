import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  subsection: {
    findFirstOrThrow: vi.fn(),
  },
  subsubsection: {
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
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
    mockDb.subsection.findFirstOrThrow.mockResolvedValue({ id: 10 })
    mockDb.subsubsection.update.mockResolvedValue({ id: 1 })
  })

  test("does not require admin when the Planungsabschnitt is unchanged", async () => {
    const { updateSubsubsection } = await import("./subsubsections.server")
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({ id: 1, subsectionId: 10 })

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
})
