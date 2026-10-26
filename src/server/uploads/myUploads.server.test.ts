import { beforeEach, describe, expect, test, vi } from "vitest"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { FORMER_MEMBER_PLACEHOLDER } from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import { getMyUploads, getMyUploadTags } from "./myUploads.server"

const { mockDb, mockSession } = vi.hoisted(() => ({
  mockDb: {
    upload: { findMany: vi.fn() },
    membership: { findMany: vi.fn() },
    tag: { findMany: vi.fn() },
  },
  mockSession: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { session: mockSession },
}))

const headers = new Headers()

const s3Url = (filename: string) =>
  `https://trassenscout.s3.eu-central-1.amazonaws.com/uploads/rs23/0c6f2a51-4d6e-4b8a-9b55-1f2e3d4c5b6a/${filename}`

const uploadRow = (id: number, projectId: number, fields: Record<string, unknown> = {}) => ({
  id,
  projectId,
  title: `Dokument ${id}`,
  externalUrl: s3Url(`dokument-${id}.pdf`),
  createdBy: null,
  updatedBy: null,
  createdById: null,
  updatedById: null,
  ...fields,
})

const pageQuery = () => mockDb.upload.findMany.mock.calls.at(-1)?.[0]

describe("getMyUploads", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.USER })
    mockDb.upload.findMany.mockResolvedValue([])
    mockDb.membership.findMany.mockResolvedValue([])
  })

  test("lists the user's projects only, newest first, without survey-only uploads", async () => {
    await getMyUploads(headers, {})

    const { where, orderBy, take } = pageQuery()
    expect(where.project).toEqual({ memberships: { some: { userId: 99 } } })
    expect(where.projectId).toEqual({ not: null })
    expect(where.NOT).toMatchObject({
      surveyResponseId: { not: null },
      projectRecordEmailId: null,
      projectRecords: { none: {} },
    })
    expect(where).not.toHaveProperty("OR")
    expect(orderBy).toEqual({ id: "desc" })
    expect(take).toBe(51)
  })

  test("leaves an admin every project", async () => {
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.ADMIN })

    await getMyUploads(headers, {})

    expect(pageQuery().where.project).toEqual({})
  })

  test("keeps the membership check when narrowing to one project", async () => {
    await getMyUploads(headers, { projectSlug: "rs23" })

    expect(pageQuery().where.project).toEqual({
      slug: "rs23",
      memberships: { some: { userId: 99 } },
    })
  })

  test("continues below the cursor and hands out the next one", async () => {
    mockDb.upload.findMany.mockResolvedValue(
      Array.from({ length: 51 }, (_, index) => uploadRow(200 - index, 1)),
    )

    const result = await getMyUploads(headers, { cursor: 201 })

    expect(pageQuery().where.id).toEqual({ lt: 201 })
    expect(result.uploads).toHaveLength(50)
    expect(result.nextCursor).toBe(151)
  })

  test("searches title and summary, not the file URL", async () => {
    await getMyUploads(headers, { searchterm: " Trasse " })

    expect(mockDb.upload.findMany).toHaveBeenCalledTimes(1)
    expect(pageQuery().where.OR).toEqual([
      { title: { contains: "trasse", mode: "insensitive" } },
      { summary: { contains: "trasse", mode: "insensitive" } },
    ])
  })

  test("narrows to a tag by its title, whichever project it belongs to", async () => {
    await getMyUploads(headers, { tag: "Finanzierung" })

    expect(pageQuery().where.tags).toEqual({
      some: { title: { equals: "Finanzierung", mode: "insensitive" } },
    })
  })

  test("anonymises former members per project", async () => {
    const erika = { id: 5, firstName: "Erika", lastName: "Muster", institution: null }
    mockDb.upload.findMany.mockResolvedValue([
      uploadRow(2, 2, { createdBy: erika, createdById: 5 }),
      uploadRow(1, 1, { createdBy: erika, createdById: 5 }),
    ])
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 1, userId: 5 }])

    const { uploads } = await getMyUploads(headers, {})

    expect(mockDb.membership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projectId: { in: [2, 1] } } }),
    )
    expect(uploads.map((upload) => upload.createdBy?.firstName)).toEqual([
      FORMER_MEMBER_PLACEHOLDER,
      "Erika",
    ])
  })
})

describe("getMyUploadTags", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession.mockResolvedValue({ userId: 99, role: UserRoleEnum.USER })
    mockDb.tag.findMany.mockResolvedValue([{ title: "Finanzierung" }])
  })

  test("offers only tags of documents the list shows", async () => {
    const result = await getMyUploadTags(headers, { projectSlug: "rs23" })

    const { where } = mockDb.tag.findMany.mock.calls[0]![0]
    expect(where.uploads.some).toMatchObject({
      projectId: { not: null },
      project: { slug: "rs23", memberships: { some: { userId: 99 } } },
      NOT: { surveyResponseId: { not: null } },
    })
    expect(result).toEqual({ tags: [{ title: "Finanzierung" }] })
  })
})
