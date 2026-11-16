import { beforeEach, describe, expect, test, vi } from "vitest"

const mockTx = {
  acquisitionArea: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  parcel: {
    upsert: vi.fn(),
  },
}

const mockDb = {
  acquisitionArea: {
    create: vi.fn(),
    update: vi.fn(),
    findFirstOrThrow: vi.fn(),
  },
  acquisitionAreaStatus: {
    findMany: vi.fn(),
  },
  parcel: {
    findMany: vi.fn(),
  },
  subsubsection: {
    findFirstOrThrow: vi.fn(),
  },
  $transaction: vi.fn((callback: (tx: typeof mockTx) => unknown) => callback(mockTx)),
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

const mockEndpointAuth = {
  projectRole: vi.fn(),
}

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: mockEndpointAuth,
}))

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("./_utils/validateAcquisitionAreaInput", () => ({
  validateAcquisitionAreaInput: vi.fn().mockResolvedValue(undefined),
  assertSubsubsectionHasGeometry: vi.fn(),
}))

const mockRecordSubsubsectionActivity = vi.fn().mockResolvedValue(undefined)

vi.mock("@/src/server/subsubsectionBookmarks/recordSubsubsectionActivity.server", () => ({
  recordSubsubsectionActivity: mockRecordSubsubsectionActivity,
}))

const headers = new Headers()

beforeEach(() => {
  vi.clearAllMocks()
  mockEndpointAuth.projectRole.mockResolvedValue({
    projectId: 1,
    session: { userId: "7", role: "USER" },
  })
})

describe("createAcquisitionArea", () => {
  test("records the activity of the acting user on the Maßnahme", async () => {
    const { createAcquisitionArea } = await import("./acquisitionAreas.server")
    mockDb.acquisitionArea.create.mockResolvedValue({
      id: 3,
      subsubsectionId: 5,
      parcel: { alkisParcelId: "1" },
    })

    await createAcquisitionArea(headers, { projectSlug: "rs23", subsubsectionId: 5 } as never)

    expect(mockDb.acquisitionArea.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ createdById: 7, updatedById: 7 }),
      }),
    )
    expect(mockRecordSubsubsectionActivity).toHaveBeenCalledWith({
      subsubsectionIds: [5],
      userId: 7,
    })
  })
})

describe("updateAcquisitionArea", () => {
  test("records no activity", async () => {
    const { updateAcquisitionArea } = await import("./acquisitionAreas.server")
    mockDb.acquisitionArea.findFirstOrThrow.mockResolvedValue({ id: 3 })
    mockDb.acquisitionArea.update.mockResolvedValue({
      id: 3,
      subsubsectionId: 5,
      parcel: { alkisParcelId: "1" },
    })

    await updateAcquisitionArea(headers, { projectSlug: "rs23", id: 3 } as never)

    const { data } = mockDb.acquisitionArea.update.mock.calls[0]![0]
    expect(data).toMatchObject({ updatedById: 7 })
    expect(data).not.toHaveProperty("createdById")
    expect(mockRecordSubsubsectionActivity).not.toHaveBeenCalled()
  })
})

describe("createAcquisitionAreasFromSelection", () => {
  const selectionInput = (mode: "create" | "keep") =>
    ({
      projectSlug: "rs23",
      subsubsectionId: 5,
      acquisitionAreas: [
        {
          alkisParcelId: "P1",
          alkisParcelIdSource: "ALKIS",
          parcelGeometry: {},
          geometry: {},
          mode,
        },
      ],
    }) as never

  beforeEach(() => {
    mockDb.subsubsection.findFirstOrThrow.mockResolvedValue({ id: 5, slug: "rf-1", type: "LINE" })
    mockDb.parcel.findMany.mockResolvedValue([])
    mockTx.parcel.upsert.mockResolvedValue({ id: 9, alkisParcelId: "P1" })
    mockTx.acquisitionArea.findMany.mockResolvedValue([])
    mockTx.acquisitionArea.create.mockResolvedValue({ id: 3, parcelId: 9 })
  })

  test("records the activity when acquisition areas were created", async () => {
    const { createAcquisitionAreasFromSelection } = await import("./acquisitionAreas.server")

    await createAcquisitionAreasFromSelection(headers, selectionInput("create"))

    expect(mockTx.acquisitionArea.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ createdById: 7, updatedById: 7 }),
      }),
    )
    expect(mockRecordSubsubsectionActivity).toHaveBeenCalledWith({
      subsubsectionIds: [5],
      userId: 7,
    })
  })

  test("records no activity when every parcel already had an acquisition area", async () => {
    const { createAcquisitionAreasFromSelection } = await import("./acquisitionAreas.server")
    mockTx.acquisitionArea.findMany.mockResolvedValue([{ id: 3, parcel: { alkisParcelId: "P1" } }])

    await createAcquisitionAreasFromSelection(headers, selectionInput("keep"))

    expect(mockTx.acquisitionArea.create).not.toHaveBeenCalled()
    expect(mockRecordSubsubsectionActivity).not.toHaveBeenCalled()
  })
})
