import { beforeEach, describe, expect, test, vi } from "vitest"
import { updateProject } from "./projects.server"

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  findFirstOrThrow: vi.fn(),
  update: vi.fn(),
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { session: (...args: unknown[]) => mocks.session(...args) },
}))

vi.mock("@/src/server/authorization/authorizeProjectMember.server", () => ({
  authorizeProjectMemberByProjectSlug: vi.fn(),
}))

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({
  default: {
    project: {
      findFirstOrThrow: (...args: unknown[]) => mocks.findFirstOrThrow(...args),
      update: (...args: unknown[]) => mocks.update(...args),
    },
  },
}))

const input: Parameters<typeof updateProject>[1] = {
  projectSlug: "frm9-ra3",
  slug: "frm9-ra3",
  subTitle: null,
  partOf: "FRM9",
  description: null,
  logoSrc: null,
  partnerLogoSrcs: [],
  exportEnabled: false,
  aiEnabled: false,
  alkisStateKey: "BERLIN",
  landAcquisitionModuleEnabled: false,
}

describe("updateProject", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const row = { ...input, id: 1, partOf: null }
    mocks.findFirstOrThrow.mockResolvedValue(row)
    mocks.update.mockResolvedValue(row)
  })

  test("admin sets the admin-only fields", async () => {
    mocks.session.mockResolvedValue({ userId: 1, role: "ADMIN" })

    await updateProject(new Headers(), input)

    expect(mocks.update.mock.calls[0]?.[0].data).toMatchObject({
      partOf: "FRM9",
      alkisStateKey: "BERLIN",
    })
  })

  test("editor keeps the stored admin-only fields", async () => {
    mocks.session.mockResolvedValue({ userId: 2, role: "USER" })

    await updateProject(new Headers(), input)

    const data = mocks.update.mock.calls[0]?.[0].data
    expect(data).not.toHaveProperty("partOf")
    expect(data).not.toHaveProperty("alkisStateKey")
  })

  test("admin update without the field keeps Teilprojekt von", async () => {
    mocks.session.mockResolvedValue({ userId: 1, role: "ADMIN" })

    await updateProject(new Headers(), { ...input, partOf: undefined })

    expect(mocks.update.mock.calls[0]?.[0].data.partOf).toBeUndefined()
  })
})
