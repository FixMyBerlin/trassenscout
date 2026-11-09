import { beforeEach, describe, expect, test, vi } from "vitest"
import { updateProject } from "./projects.server"

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  findFirstOrThrow: vi.fn(),
  update: vi.fn(),
  findMembership: vi.fn(),
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
    membership: { findFirst: (...args: unknown[]) => mocks.findMembership(...args) },
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
  projectLeadId: null,
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

    await updateProject(new Headers(), { ...input, projectLeadId: 7 })

    const data = mocks.update.mock.calls[0]?.[0].data
    expect(data).not.toHaveProperty("partOf")
    expect(data).not.toHaveProperty("alkisStateKey")
    expect(data).not.toHaveProperty("projectLeadId")
    expect(mocks.findMembership).not.toHaveBeenCalled()
  })

  test("admin update without the field keeps Teilprojekt von", async () => {
    mocks.session.mockResolvedValue({ userId: 1, role: "ADMIN" })

    await updateProject(new Headers(), { ...input, partOf: undefined })

    expect(mocks.update.mock.calls[0]?.[0].data.partOf).toBeUndefined()
  })

  test("admin makes an editor of the project Projektleitung", async () => {
    mocks.session.mockResolvedValue({ userId: 1, role: "ADMIN" })
    mocks.findMembership.mockResolvedValue({ id: 30 })

    await updateProject(new Headers(), { ...input, projectLeadId: 7 })

    expect(mocks.findMembership).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projectId: 1, userId: 7, role: "EDITOR" } }),
    )
    expect(mocks.update.mock.calls[0]?.[0].data.projectLeadId).toBe(7)
  })

  test("someone without edit rights cannot become Projektleitung", async () => {
    mocks.session.mockResolvedValue({ userId: 1, role: "ADMIN" })
    mocks.findMembership.mockResolvedValue(null)

    await expect(updateProject(new Headers(), { ...input, projectLeadId: 7 })).rejects.toThrow(
      "Bearbeitungsrechte",
    )
    expect(mocks.update).not.toHaveBeenCalled()
  })

  test("an unchanged Projektleitung is not checked again", async () => {
    mocks.session.mockResolvedValue({ userId: 1, role: "ADMIN" })
    mocks.findFirstOrThrow.mockResolvedValue({ ...input, id: 1, projectLeadId: 7 })

    await updateProject(new Headers(), { ...input, projectLeadId: 7 })

    expect(mocks.findMembership).not.toHaveBeenCalled()
    expect(mocks.update).toHaveBeenCalled()
  })

  test("admin update without the field keeps the Projektleitung", async () => {
    mocks.session.mockResolvedValue({ userId: 1, role: "ADMIN" })
    mocks.findFirstOrThrow.mockResolvedValue({ ...input, id: 1, projectLeadId: 7 })

    await updateProject(new Headers(), { ...input, projectLeadId: undefined })

    expect(mocks.findMembership).not.toHaveBeenCalled()
    expect(mocks.update.mock.calls[0]?.[0].data.projectLeadId).toBeUndefined()
  })
})
