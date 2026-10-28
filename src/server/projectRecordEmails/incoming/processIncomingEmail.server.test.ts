import { beforeEach, describe, expect, test, vi } from "vitest"
import { processIncomingProjectRecordEmail } from "./processIncomingEmail.server"

const mocks = vi.hoisted(() => ({
  findProject: vi.fn(),
  createProjectRecordEmail: vi.fn(),
  uploadEmailAttachments: vi.fn(),
  notifyLegacyMailbox: vi.fn(),
  notifyAdminsWithoutProject: vi.fn(),
  notifyAdminsReceived: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({
  default: {
    project: { findUnique: (...args: unknown[]) => mocks.findProject(...args) },
    projectRecordEmail: { create: (...args: unknown[]) => mocks.createProjectRecordEmail(...args) },
  },
}))
vi.mock("./uploadEmailAttachments.server", () => ({
  uploadEmailAttachments: (...args: unknown[]) => mocks.uploadEmailAttachments(...args),
}))
vi.mock("./notifySenderLegacyProtocolMailboxMoved.server", () => ({
  notifySenderLegacyProtocolMailboxMoved: (...args: unknown[]) =>
    mocks.notifyLegacyMailbox(...args),
}))
vi.mock("./notifyAdminsProjectRecordEmailWithoutProject.server", () => ({
  notifyAdminsProjectRecordEmailWithoutProject: (...args: unknown[]) =>
    mocks.notifyAdminsWithoutProject(...args),
}))
vi.mock("./notifyAdminsProjectRecordEmailReceived.server", () => ({
  notifyAdminsProjectRecordEmailReceived: (...args: unknown[]) =>
    mocks.notifyAdminsReceived(...args),
}))

const rawEmail = (header?: string) =>
  [
    "From: Brit Beispiel <brit@example.org>",
    "To: protokoll+rs8@trassenscout.de",
    "Subject: Abstimmung Knotenpunkt",
    "Date: Tue, 27 Oct 2026 10:00:00 +0100",
    "Content-Type: text/plain; charset=utf-8",
    ...(header ? [header] : []),
    "",
    "Bitte ins Protokoll aufnehmen.",
  ].join("\r\n")

describe("processIncomingProjectRecordEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findProject.mockResolvedValue({ id: 1, slug: "rs8" })
    mocks.createProjectRecordEmail.mockResolvedValue({ id: 61 })
    mocks.uploadEmailAttachments.mockResolvedValue({ uploadIds: [5], skippedAttachments: [] })
  })

  test("stores the mail for the Posteingang without creating a Protokolleintrag", async () => {
    const result = await processIncomingProjectRecordEmail({
      projectSlug: "rs8",
      rawEmailText: rawEmail(),
    })

    expect(mocks.createProjectRecordEmail).toHaveBeenCalledWith({
      data: expect.objectContaining({ projectId: 1, subject: "Abstimmung Knotenpunkt" }),
    })
    expect(mocks.uploadEmailAttachments).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 1, projectRecordEmailId: 61 }),
    )
    expect(mocks.notifyAdminsReceived).toHaveBeenCalledWith(
      expect.objectContaining({ projectSlug: "rs8", projectRecordEmailId: 61 }),
    )
    expect(result).toEqual(
      expect.objectContaining({ success: true, projectRecordEmailId: 61, uploadIds: [5] }),
    )
  })

  test("stores mail without a matching project for the admins", async () => {
    mocks.findProject.mockResolvedValue(null)

    await processIncomingProjectRecordEmail({ projectSlug: "unbekannt", rawEmailText: rawEmail() })

    expect(mocks.createProjectRecordEmail).toHaveBeenCalledWith({
      data: expect.objectContaining({ projectId: null }),
    })
    expect(mocks.notifyAdminsWithoutProject).toHaveBeenCalledWith(
      expect.objectContaining({ projectSlug: "unbekannt", projectRecordEmailId: 61 }),
    )
    expect(mocks.uploadEmailAttachments).not.toHaveBeenCalled()
    expect(mocks.notifyAdminsReceived).not.toHaveBeenCalled()
  })

  test.each(["Auto-Submitted: auto-replied", "X-Autoreply: yes", "Precedence: bulk"])(
    "stores mail with %s as discarded without any mail",
    async (header) => {
      const result = await processIncomingProjectRecordEmail({
        projectSlug: "rs8",
        rawEmailText: rawEmail(header),
      })

      expect(mocks.createProjectRecordEmail).toHaveBeenCalledWith({
        data: expect.objectContaining({ projectId: 1, discardedAt: expect.any(Date) }),
      })
      expect(mocks.notifyLegacyMailbox).not.toHaveBeenCalled()
      expect(mocks.notifyAdminsReceived).not.toHaveBeenCalled()
      expect(mocks.notifyAdminsWithoutProject).not.toHaveBeenCalled()
      expect(mocks.uploadEmailAttachments).not.toHaveBeenCalled()
      expect(result).toEqual(expect.objectContaining({ success: false, projectRecordEmailId: 61 }))
    },
  )

  test("treats list mail as a normal mail", async () => {
    await processIncomingProjectRecordEmail({
      projectSlug: "rs8",
      rawEmailText: rawEmail("Precedence: list"),
    })

    expect(mocks.createProjectRecordEmail).toHaveBeenCalledWith({
      data: expect.not.objectContaining({ discardedAt: expect.anything() }),
    })
    expect(mocks.notifyAdminsReceived).toHaveBeenCalledTimes(1)
  })
})
