import { beforeEach, describe, expect, test, vi } from "vitest"
import { Prisma } from "@/src/prisma/generated/browser"

const mockDb = {
  subsubsection: { findMany: vi.fn(), count: vi.fn() },
  upload: { findMany: vi.fn() },
}
const mockLoadRedactionContext = vi.fn()

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock(
  "@/src/server/memberships/redactFormerProjectMemberUser.server",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    loadUserRedactionContext: mockLoadRedactionContext,
  }),
)

const row = {
  id: 5,
  slug: "rs8-1",
  subTitle: "Brücke",
  costEstimate: 1000,
  widthExisting: 2.5,
  estimatedConstructionDateString: "",
  extraFields: { foerderung: "ja" },
  geometry: { type: "Point", coordinates: [13.4, 52.5] },
  subsection: { slug: "pa1", networkHierarchy: { title: "Radschnellweg" } },
  qualityLevel: null,
  manager: { id: 2, firstName: "Ada", lastName: "Lovelace", institution: null },
  SubsubsectionStatus: { title: "In Planung" },
  SubsubsectionTask: { title: "Neubau" },
  SubsubsectionInfra: null,
  SubsubsectionInfrastructureTypes: [{ title: "Radweg" }, { title: "Beleuchtung" }],
  specialFeatures: [{ title: "Denkmalschutz" }],
}

describe("buildExternalShareGeojson", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.subsubsection.findMany.mockResolvedValue([row])
    mockLoadRedactionContext.mockResolvedValue({
      memberUserIds: new Set([2]),
      isAdmin: false,
      sessionUserId: 0,
    })
  })

  test("exports every Maßnahme field except internal ids and map settings", async () => {
    const { buildExternalShareGeojson } = await import("./externalShareContent.server")

    await buildExternalShareGeojson(1)

    const select = mockDb.subsubsection.findMany.mock.calls[0]?.[0]?.select
    const internal = [
      "type",
      "labelPos",
      "managerId",
      "subsectionId",
      "qualityLevelId",
      "subsubsectionStatusId",
      "subsubsectionTaskId",
      "subsubsectionInfraId",
    ]
    const exported = Object.values(Prisma.SubsubsectionScalarFieldEnum).filter(
      (field) => !internal.includes(field),
    )
    expect(Object.keys(select)).toEqual(expect.arrayContaining(exported))
    for (const key of internal) {
      expect(select).not.toHaveProperty(key)
    }
  })

  test("keeps every column on a Maßnahme without values", async () => {
    mockDb.subsubsection.findMany.mockResolvedValue([
      { ...row, SubsubsectionInfrastructureTypes: [], specialFeatures: [], widthExisting: null },
    ])
    const { buildExternalShareGeojson } = await import("./externalShareContent.server")

    const { features } = await buildExternalShareGeojson(1)

    expect(features[0]?.properties).toMatchObject({
      widthExisting: null,
      infrastructureTypes: null,
      specialFeatures: null,
    })
  })

  test("resolves relations to names and keeps the stored geometry", async () => {
    const { buildExternalShareGeojson } = await import("./externalShareContent.server")

    const { features } = await buildExternalShareGeojson(1)

    expect(features[0]).toEqual({
      type: "Feature",
      id: 5,
      geometry: { type: "Point", coordinates: [13.4, 52.5] },
      properties: {
        id: 5,
        slug: "rs8-1",
        subTitle: "Brücke",
        costEstimate: 1000,
        widthExisting: 2.5,
        estimatedConstructionDateString: null,
        extraFields: { foerderung: "ja" },
        subsection: "pa1",
        networkHierarchy: "Radschnellweg",
        qualityLevel: null,
        status: "In Planung",
        task: "Neubau",
        infra: null,
        infrastructureTypes: "Radweg, Beleuchtung",
        specialFeatures: "Denkmalschutz",
        manager: "Ada Lovelace",
      },
    })
  })

  test("keeps the Maßnahme when its stored geometry is invalid", async () => {
    const { buildExternalShareGeojson } = await import("./externalShareContent.server")
    mockDb.subsubsection.findMany.mockResolvedValue([{ ...row, geometry: { type: "Nope" } }])

    const { features } = await buildExternalShareGeojson(1)

    expect(features[0]?.geometry).toBeNull()
    expect(features[0]?.properties?.slug).toBe("rs8-1")
  })

  test("anonymises a manager who left the project", async () => {
    const { buildExternalShareGeojson } = await import("./externalShareContent.server")
    mockLoadRedactionContext.mockResolvedValue({
      memberUserIds: new Set(),
      isAdmin: false,
      sessionUserId: 0,
    })

    const { features } = await buildExternalShareGeojson(1)

    expect(features[0]?.properties?.manager).not.toContain("Lovelace")
  })
})

describe("loadExternalShareContent", () => {
  const upload = {
    id: 9,
    title: "Lageplan",
    mimeType: "application/pdf",
    createdAt: new Date("2026-10-01T08:00:00Z"),
    externalUrl: "https://s3.example.com/upload/rs23/uuid/lageplan.pdf",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.upload.findMany.mockResolvedValue([upload])
    mockDb.subsubsection.count.mockResolvedValue(3)
  })

  test("sends only allowlisted fields of this project's shared documents", async () => {
    const { loadExternalShareContent } = await import("./externalShareContent.server")

    const content = await loadExternalShareContent(1)

    const query = mockDb.upload.findMany.mock.calls[0]?.[0]
    expect(query?.where).toEqual({ projectId: 1, externalShareEnabled: true })
    // Every selected field except externalUrl goes public, so adding one must be deliberate.
    expect(Object.keys(query?.select).sort()).toEqual([
      "createdAt",
      "externalUrl",
      "id",
      "mimeType",
      "title",
    ])
    expect(content).toEqual({
      uploads: [
        {
          id: 9,
          title: "Lageplan",
          mimeType: "application/pdf",
          createdAt: upload.createdAt,
          previewKind: "pdf",
        },
      ],
      subsubsectionCount: 3,
    })
  })

  test("picks the preview from the file name when an older upload has no file type", async () => {
    mockDb.upload.findMany.mockResolvedValue(
      ["foto.JPG", "plan.pdf", "tabelle.xlsx"].map((name, index) => ({
        ...upload,
        id: index,
        mimeType: null,
        externalUrl: `https://s3.example.com/upload/rs23/uuid/${name}`,
      })),
    )
    const { loadExternalShareContent } = await import("./externalShareContent.server")

    const { uploads } = await loadExternalShareContent(1)

    expect(uploads.map((shared) => shared.previewKind)).toEqual(["image", "pdf", "other"])
  })
})
