import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  subsubsection: { updateMany: vi.fn() },
  subsubsectionBookmark: { createMany: vi.fn() },
  projectRecord: { findMany: vi.fn() },
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

describe("bookmarkProjectRecordSubsubsections", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("does nothing without Protokolle", async () => {
    const { bookmarkProjectRecordSubsubsections } =
      await import("./recordSubsubsectionActivity.server")

    await bookmarkProjectRecordSubsubsections({ projectRecordIds: [], userId: 5 })

    expect(mockDb.projectRecord.findMany).not.toHaveBeenCalled()
    expect(mockDb.subsubsectionBookmark.createMany).not.toHaveBeenCalled()
  })

  test("bookmarks the directly and m2n linked Maßnahmen for the acting user without touching the Maßnahme", async () => {
    mockDb.projectRecord.findMany.mockResolvedValueOnce([
      { subsubsectionId: 1, subsubsections: [{ id: 2 }, { id: 1 }] },
      { subsubsectionId: null, subsubsections: [{ id: 3 }] },
    ])
    const { bookmarkProjectRecordSubsubsections } =
      await import("./recordSubsubsectionActivity.server")

    await bookmarkProjectRecordSubsubsections({ projectRecordIds: [10, 11, 10], userId: 5 })

    expect(mockDb.projectRecord.findMany).toHaveBeenCalledWith({
      where: { id: { in: [10, 11] } },
      select: { subsubsectionId: true, subsubsections: { select: { id: true } } },
    })
    expect(mockDb.subsubsectionBookmark.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 5, subsubsectionId: 1 },
        { userId: 5, subsubsectionId: 2 },
        { userId: 5, subsubsectionId: 3 },
      ],
      skipDuplicates: true,
    })
    expect(mockDb.subsubsection.updateMany).not.toHaveBeenCalled()
  })
})
