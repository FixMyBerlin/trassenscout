import { beforeEach, describe, expect, test, vi } from "vitest"
import { processIncomingProjectRecordEmail } from "./processIncomingEmail.server"

const mocks = vi.hoisted(() => ({
  findProject: vi.fn(),
  createProjectRecordEmail: vi.fn(),
  createProjectRecord: vi.fn(),
  uploadEmailAttachments: vi.fn(),
  extractProjectRecordFromEmail: vi.fn(),
  checkProjectAiEnabled: vi.fn(),
  isAdminOrProjectMember: vi.fn(),
  notifyLegacyMailbox: vi.fn(),
  notifyAdminsWithoutProject: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({
  default: {
    project: { findUnique: (...args: unknown[]) => mocks.findProject(...args) },
    projectRecordEmail: { create: (...args: unknown[]) => mocks.createProjectRecordEmail(...args) },
    projectRecord: { create: (...args: unknown[]) => mocks.createProjectRecord(...args) },
  },
}))
vi.mock("@/src/server/ai/extractProjectRecordFromEmail.server", () => ({
  extractProjectRecordFromEmail: (...args: unknown[]) =>
    mocks.extractProjectRecordFromEmail(...args),
}))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({ createLogEntry: vi.fn() }))
vi.mock("@/src/server/observability/langfuseSpanProcessor.server", () => ({
  flushLangfuseSpans: vi.fn(),
}))
vi.mock("./checkProjectAiEnabled.server", () => ({
  checkProjectAiEnabled: (...args: unknown[]) => mocks.checkProjectAiEnabled(...args),
}))
vi.mock("./checkSenderApproval.server", () => ({
  isAdminOrProjectMember: (...args: unknown[]) => mocks.isAdminOrProjectMember(...args),
}))
vi.mock("./fetchProjectContext.server", () => ({
  fetchProjectContext: vi.fn().mockResolvedValue({ subsections: [], subsubsections: [], tags: [] }),
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
vi.mock("./notifyAdminsProjectRecordNeedsReview.server", () => ({
  notifyAdminsProjectRecordNeedsReview: vi.fn(),
}))

const rawEmail = (header: string) =>
  [
    "From: Brit Beispiel <brit@example.org>",
    "To: protokoll+rs8@trassenscout.de",
    "Subject: Re: Neue Aufgabe",
    "Date: Tue, 27 Oct 2026 10:00:00 +0100",
    "Content-Type: text/plain; charset=utf-8",
    header,
    "",
    "Ich bin bis zum 3. November nicht im Büro.",
  ].join("\r\n")

describe("processIncomingProjectRecordEmail auto-replies", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findProject.mockResolvedValue({ id: 1, slug: "rs8" })
    mocks.createProjectRecordEmail.mockResolvedValue({ id: 61 })
    mocks.checkProjectAiEnabled.mockResolvedValue(true)
    mocks.isAdminOrProjectMember.mockResolvedValue(true)
    mocks.uploadEmailAttachments.mockResolvedValue({ uploadIds: [], skippedAttachments: [] })
    mocks.extractProjectRecordFromEmail.mockResolvedValue({
      title: "Antwort",
      body: "Zusammenfassung",
      topics: [],
    })
    mocks.createProjectRecord.mockResolvedValue({ id: 7, projectId: 1, title: "Antwort" })
  })

  test.each(["Auto-Submitted: auto-replied", "X-Autoreply: yes", "Precedence: bulk"])(
    "stores mail with %s without mails, lookups or a Protokolleintrag",
    async (header) => {
      const result = await processIncomingProjectRecordEmail({
        projectSlug: "rs8",
        rawEmailText: rawEmail(header),
      })

      expect(mocks.createProjectRecordEmail).toHaveBeenCalledWith({
        data: expect.objectContaining({ projectId: 1 }),
      })
      expect(mocks.notifyLegacyMailbox).not.toHaveBeenCalled()
      expect(mocks.checkProjectAiEnabled).not.toHaveBeenCalled()
      expect(mocks.isAdminOrProjectMember).not.toHaveBeenCalled()
      expect(mocks.uploadEmailAttachments).not.toHaveBeenCalled()
      expect(mocks.extractProjectRecordFromEmail).not.toHaveBeenCalled()
      expect(mocks.createProjectRecord).not.toHaveBeenCalled()
      expect(result).toEqual(expect.objectContaining({ success: false, projectRecordEmailId: 61 }))
    },
  )

  test("stores an auto-reply without project and does not notify admins", async () => {
    mocks.findProject.mockResolvedValue(null)

    await processIncomingProjectRecordEmail({
      projectSlug: "unbekannt",
      rawEmailText: rawEmail("Auto-Submitted: auto-replied"),
    })

    expect(mocks.createProjectRecordEmail).toHaveBeenCalledWith({
      data: expect.objectContaining({ projectId: null }),
    })
    expect(mocks.notifyAdminsWithoutProject).not.toHaveBeenCalled()
  })

  test.each(["Auto-Submitted: no", "Precedence: list"])(
    "still creates a Protokolleintrag for mail with %s",
    async (header) => {
      await processIncomingProjectRecordEmail({
        projectSlug: "rs8",
        rawEmailText: rawEmail(header),
      })

      expect(mocks.createProjectRecord).toHaveBeenCalledTimes(1)
    },
  )
})
