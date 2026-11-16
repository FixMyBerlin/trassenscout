import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  subsubsection: { updateMany: vi.fn() },
  subsubsectionBookmark: { createMany: vi.fn() },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

describe("recordSubsubsectionActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("does nothing for an empty id list", async () => {
    const { recordSubsubsectionActivity } = await import("./recordSubsubsectionActivity.server")

    await recordSubsubsectionActivity({ subsubsectionIds: [], userId: 5 })

    expect(mockDb.subsubsection.updateMany).not.toHaveBeenCalled()
    expect(mockDb.subsubsectionBookmark.createMany).not.toHaveBeenCalled()
  })

  test("marks the Maßnahmen as updated by the acting user and creates the missing bookmarks once per id", async () => {
    const { recordSubsubsectionActivity } = await import("./recordSubsubsectionActivity.server")

    await recordSubsubsectionActivity({ subsubsectionIds: [1, 2, 1], userId: 5 })

    expect(mockDb.subsubsection.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] } },
      data: { updatedById: 5 },
    })
    expect(mockDb.subsubsectionBookmark.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 5, subsubsectionId: 1 },
        { userId: 5, subsubsectionId: 2 },
      ],
      skipDuplicates: true,
    })
  })
})

describe("addSubsubsectionBookmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("does nothing without Maßnahmen or users", async () => {
    const { addSubsubsectionBookmarks } = await import("./recordSubsubsectionActivity.server")

    await addSubsubsectionBookmarks({ subsubsectionIds: [], userIds: [3] })
    await addSubsubsectionBookmarks({
      subsubsectionIds: [1],
      userIds: [null, undefined],
    })

    expect(mockDb.subsubsectionBookmark.createMany).not.toHaveBeenCalled()
  })

  test("creates one bookmark per distinct user and Maßnahme and skips duplicates", async () => {
    const { addSubsubsectionBookmarks } = await import("./recordSubsubsectionActivity.server")

    await addSubsubsectionBookmarks({
      subsubsectionIds: [1, 2, 1],
      userIds: [3, null, 4, 3, undefined],
    })

    expect(mockDb.subsubsectionBookmark.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 3, subsubsectionId: 1 },
        { userId: 3, subsubsectionId: 2 },
        { userId: 4, subsubsectionId: 1 },
        { userId: 4, subsubsectionId: 2 },
      ],
      skipDuplicates: true,
    })
    expect(mockDb.subsubsection.updateMany).not.toHaveBeenCalled()
  })
})
