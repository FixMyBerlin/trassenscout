import { beforeEach, describe, expect, test, vi } from "vitest"
import type { Prisma } from "@/src/prisma/generated/browser"

const mockTx = {
  projectRecord: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
  subsection: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
  subsubsection: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
}

const mockDb = {
  projectRecord: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
  subsection: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
  subsubsection: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

describe("cleanupBeforeMembershipDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("clears assignments scoped to the project", async () => {
    const { cleanupBeforeMembershipDelete } = await import("./cleanupMembershipDelete.server")

    await cleanupBeforeMembershipDelete({
      membershipId: 10,
      projectId: 5,
      userId: 3,
    })

    expect(mockDb.projectRecord.updateMany).toHaveBeenCalledWith({
      where: { projectId: 5, assignedToId: 3 },
      data: { assignedToId: null },
    })
    expect(mockDb.subsection.updateMany).toHaveBeenCalledWith({
      where: { projectId: 5, managerId: 3 },
      data: { managerId: null },
    })
    expect(mockDb.subsubsection.updateMany).toHaveBeenCalledWith({
      where: { managerId: 3, subsection: { projectId: 5 } },
      data: { managerId: null },
    })
  })

  test("uses injected transaction client when provided", async () => {
    const { cleanupBeforeMembershipDelete } = await import("./cleanupMembershipDelete.server")

    await cleanupBeforeMembershipDelete({
      membershipId: 10,
      projectId: 5,
      userId: 3,
      client: mockTx as unknown as Prisma.TransactionClient,
    })

    expect(mockTx.projectRecord.updateMany).toHaveBeenCalledWith({
      where: { projectId: 5, assignedToId: 3 },
      data: { assignedToId: null },
    })
    expect(mockDb.projectRecord.updateMany).not.toHaveBeenCalled()
  })
})
