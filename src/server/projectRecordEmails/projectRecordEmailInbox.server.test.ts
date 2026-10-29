import { beforeEach, describe, expect, test, vi } from "vitest"
import { AuthorizationError, NotFoundError } from "@/src/shared/auth/errors"
import {
  createProjectRecordFromEmail,
  discardProjectRecordEmail,
  draftProjectRecordFromEmail,
  getProjectRecordEmailInboxItem,
} from "./projectRecordEmailInbox.server"

const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  findProject: vi.fn(),
  findEmail: vi.fn(),
  updateEmails: vi.fn(),
  findTemplate: vi.fn(),
  extract: vi.fn(),
  createProjectRecord: vi.fn(),
  parseEmail: vi.fn(),
  notify: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({
  default: {
    project: { findUnique: (...args: unknown[]) => mocks.findProject(...args) },
    projectRecordEmail: {
      findFirst: (...args: unknown[]) => mocks.findEmail(...args),
      updateMany: (...args: unknown[]) => mocks.updateEmails(...args),
    },
    projectRecordTemplate: { findFirst: (...args: unknown[]) => mocks.findTemplate(...args) },
    tag: { findMany: vi.fn().mockResolvedValue([{ id: 11, title: "Radweg" }]) },
  },
}))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { admin: (...args: unknown[]) => mocks.admin(...args) },
}))
vi.mock("@/src/server/ai/extractProjectRecordFromEmail.server", () => ({
  extractProjectRecordFromEmail: (...args: unknown[]) => mocks.extract(...args),
}))
vi.mock("@/src/server/observability/langfuseSpanProcessor.server", () => ({
  flushLangfuseSpans: vi.fn(),
}))
vi.mock("@/src/server/projectRecords/projectRecords.server", () => ({
  createProjectRecord: (...args: unknown[]) => mocks.createProjectRecord(...args),
}))
vi.mock("./incoming/checkSenderApproval.server", () => ({
  isAdminOrProjectMember: vi.fn().mockResolvedValue(true),
}))
vi.mock("./incoming/parseEmail.server", () => ({
  parseEmail: (...args: unknown[]) => mocks.parseEmail(...args),
}))
vi.mock("./notifyProjectRecordCreatedFromEmail.server", () => ({
  notifyProjectRecordCreatedFromEmail: (...args: unknown[]) => mocks.notify(...args),
}))

const headers = new Headers()
const inboxWhere = {
  id: 61,
  projectId: 1,
  discardedAt: null,
  projectRecords: { none: {} },
}

describe("Posteingang", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.admin.mockResolvedValue({
      userId: "3",
      role: "ADMIN",
      user: { email: "admin@example.org" },
    })
    mocks.findProject.mockResolvedValue({ id: 1, aiEnabled: true })
    mocks.findEmail.mockResolvedValue({
      id: 61,
      from: "Brit Beispiel <brit@example.org>",
      subject: "Abstimmung Knotenpunkt",
      date: new Date("2026-10-27T09:00:00Z"),
      textBody: "Bitte ins Protokoll aufnehmen.",
      uploads: [{ id: 5 }],
    })
    mocks.findTemplate.mockResolvedValue({
      id: 7,
      entryTitle: "Abstimmung",
      body: "## Ergebnisse",
      purpose: "Abstimmungen festhalten",
      tags: [{ id: 12 }],
      formTemplates: [{ id: 21 }],
    })
    mocks.extract.mockResolvedValue({
      title: "Abstimmung Knotenpunkt",
      body: "## Ergebnisse\n- Einigung",
      date: null,
      topics: ["11"],
    })
  })

  test("drafts from an unprocessed mail with the chosen Vorlage", async () => {
    const draft = await draftProjectRecordFromEmail(headers, {
      projectSlug: "rs8",
      projectRecordEmailId: 61,
      projectRecordTemplateId: 7,
    })

    expect(mocks.findEmail).toHaveBeenCalledWith(expect.objectContaining({ where: inboxWhere }))
    expect(mocks.extract).toHaveBeenCalledWith(
      expect.objectContaining({
        template: expect.objectContaining({ entryTitle: "Abstimmung", body: "## Ergebnisse" }),
        projectContext: { tags: [{ id: 11, title: "Radweg" }] },
        userId: "3",
      }),
    )
    expect(draft).toEqual({
      title: "Abstimmung Knotenpunkt",
      body: "## Ergebnisse\n- Einigung",
      date: "2026-10-27",
      tags: [12, 11],
      uploads: [5],
      formTemplates: [21],
      projectRecordTemplateId: 7,
    })
  })

  test("drafts without a Vorlage when the admin chose none", async () => {
    const draft = await draftProjectRecordFromEmail(headers, {
      projectSlug: "rs8",
      projectRecordEmailId: 61,
      projectRecordTemplateId: null,
    })

    expect(mocks.findTemplate).not.toHaveBeenCalled()
    expect(mocks.extract).toHaveBeenCalledWith(expect.objectContaining({ template: null }))
    expect(draft).toEqual(expect.objectContaining({ tags: [11], projectRecordTemplateId: null }))
  })

  test("does not draft for a project without KI", async () => {
    mocks.findProject.mockResolvedValue({ id: 1, aiEnabled: false })

    await expect(
      draftProjectRecordFromEmail(headers, {
        projectSlug: "rs8",
        projectRecordEmailId: 61,
        projectRecordTemplateId: null,
      }),
    ).rejects.toThrow()
    expect(mocks.extract).not.toHaveBeenCalled()
  })

  test("does not draft mails that are processed, discarded or from another project", async () => {
    mocks.findEmail.mockResolvedValue(null)

    await expect(
      draftProjectRecordFromEmail(headers, {
        projectSlug: "rs8",
        projectRecordEmailId: 61,
        projectRecordTemplateId: null,
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
    expect(mocks.extract).not.toHaveBeenCalled()
  })

  test("is admin-only", async () => {
    mocks.admin.mockRejectedValue(new AuthorizationError())

    await expect(
      discardProjectRecordEmail(headers, { projectSlug: "rs8", projectRecordEmailId: 61 }),
    ).rejects.toBeInstanceOf(AuthorizationError)
    expect(mocks.updateEmails).not.toHaveBeenCalled()
  })

  const saveInput = {
    projectSlug: "rs8",
    projectRecordEmailId: 61,
    title: "Abstimmung Knotenpunkt",
    body: "Text",
    date: "2026-10-27",
    subsubsectionId: null,
    acquisitionAreaId: null,
    assignedToId: null,
    editingState: "PENDING" as const,
    projectRecordTemplateId: 7,
    tags: [11],
    uploads: [5],
    subsubsections: [],
    acquisitionAreas: [],
    formTemplates: [21],
  }

  test("saves the draft as a Protokolleintrag linked to the mail and sends the notices", async () => {
    const projectRecord = { id: 99, title: "Abstimmung Knotenpunkt", assignedToId: null }
    mocks.createProjectRecord.mockResolvedValue(projectRecord)

    await createProjectRecordFromEmail(headers, saveInput)

    const { projectRecordEmailId: _, ...recordInput } = saveInput
    expect(mocks.findEmail).toHaveBeenCalledWith(expect.objectContaining({ where: inboxWhere }))
    expect(mocks.createProjectRecord).toHaveBeenCalledWith(headers, recordInput, {
      projectRecordEmailId: 61,
    })
    expect(mocks.notify).toHaveBeenCalledWith({
      projectId: 1,
      projectSlug: "rs8",
      projectRecord,
      emailFrom: "Brit Beispiel <brit@example.org>",
      actorUserId: 3,
    })
  })

  test("does not save for a project without KI", async () => {
    mocks.findProject.mockResolvedValue({ id: 1, aiEnabled: false })

    await expect(createProjectRecordFromEmail(headers, saveInput)).rejects.toThrow()
    expect(mocks.createProjectRecord).not.toHaveBeenCalled()
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  test("does not save a mail that is no longer in the Posteingang", async () => {
    mocks.findEmail.mockResolvedValue(null)

    await expect(createProjectRecordFromEmail(headers, saveInput)).rejects.toBeInstanceOf(
      NotFoundError,
    )
    expect(mocks.createProjectRecord).not.toHaveBeenCalled()
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  test("lists attachments that only exist in the raw mail", async () => {
    mocks.findEmail.mockResolvedValue({
      id: 61,
      from: "Brit Beispiel <brit@example.org>",
      text: "raw",
      uploads: [{ id: 5, title: "plan.pdf" }],
      projectRecords: [],
    })
    mocks.parseEmail.mockResolvedValue({
      attachments: [{ filename: "plan.pdf" }, { filename: "luftbild.tif" }],
      to: "protokoll+rs8@example.org",
      cc: null,
    })

    const email = await getProjectRecordEmailInboxItem(headers, {
      projectSlug: "rs8",
      projectRecordEmailId: 61,
    })

    expect(email.skippedAttachments).toEqual(["luftbild.tif"])
    expect(email.to).toBe("protokoll+rs8@example.org")
    expect(email).not.toHaveProperty("text")
  })

  test("discards only mails that are still in the Posteingang", async () => {
    mocks.updateEmails.mockResolvedValue({ count: 1 })

    await discardProjectRecordEmail(headers, { projectSlug: "rs8", projectRecordEmailId: 61 })

    expect(mocks.updateEmails).toHaveBeenCalledWith({
      where: inboxWhere,
      data: { discardedAt: expect.any(Date), discardedById: 3 },
    })

    mocks.updateEmails.mockResolvedValue({ count: 0 })
    await expect(
      discardProjectRecordEmail(headers, { projectSlug: "rs8", projectRecordEmailId: 61 }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
