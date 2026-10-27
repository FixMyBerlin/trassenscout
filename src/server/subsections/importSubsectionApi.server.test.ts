import { beforeEach, describe, expect, test, vi } from "vitest"
import { importSubsectionFromApi } from "./importSubsectionApi.server"

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    project: { findFirst: vi.fn() },
    subsection: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn(), aggregate: vi.fn() },
  },
}))

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { apiKey: vi.fn() },
}))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: vi.fn().mockResolvedValue(undefined),
}))

const lineString = {
  type: "LineString",
  coordinates: [
    [9.19, 48.89],
    [9.2, 48.9],
  ],
}
const polygon = {
  type: "Polygon",
  coordinates: [
    [
      [9.19, 48.89],
      [9.2, 48.9],
      [9.21, 48.91],
      [9.19, 48.89],
    ],
  ],
}

const importRequest = (data: Record<string, unknown>) =>
  new Request("http://localhost/api/subsections/import", {
    method: "POST",
    body: JSON.stringify({
      projectSlug: "rsv-d",
      slug: "pa1",
      userId: 1,
      data: { slug: "pa1", labelPos: "top", ...data },
    }),
  })

describe("importSubsectionFromApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.project.findFirst.mockResolvedValue({ id: 1 })
    mockDb.subsection.findFirst.mockResolvedValue({ id: 5, type: "LINE", geometry: lineString })
    mockDb.subsection.update.mockResolvedValue({ id: 5, slug: "pa1" })
  })

  test("rejects a POINT type", async () => {
    const response = await importSubsectionFromApi(importRequest({ type: "POINT" }))

    expect(response.status).toBe(400)
    expect(mockDb.subsection.update).not.toHaveBeenCalled()
  })

  test("rejects geometry alone that does not match the stored type", async () => {
    const response = await importSubsectionFromApi(importRequest({ geometry: polygon }))

    expect(response.status).toBe(400)
    expect(mockDb.subsection.update).not.toHaveBeenCalled()
  })

  test("accepts geometry alone that matches the stored type", async () => {
    const response = await importSubsectionFromApi(importRequest({ geometry: lineString }))

    expect(response.status).toBe(200)
    expect(mockDb.subsection.update).toHaveBeenCalled()
  })
})
