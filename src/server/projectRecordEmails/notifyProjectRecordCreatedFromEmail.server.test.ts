import { beforeEach, describe, expect, test, vi } from "vitest"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import {
  notifyProjectRecordCreatedFromEmail,
  notifyProjectRecordFromEmailConfirmed,
} from "./notifyProjectRecordCreatedFromEmail.server"

const mocks = vi.hoisted(() => ({
  findProjectLead: vi.fn(),
  findSender: vi.fn(),
  projectLeadMailer: vi.fn(),
  senderMailer: vi.fn(),
  pendingMailer: vi.fn(),
  sendLeadMail: vi.fn(),
  sendSenderMail: vi.fn(),
  sendPendingMail: vi.fn(),
}))

vi.mock("@/src/server/projects/findProjectLead.server", () => ({
  findProjectLead: (...args: unknown[]) => mocks.findProjectLead(...args),
}))
vi.mock("./incoming/checkSenderApproval.server", () => ({
  findAdminOrProjectMember: (...args: unknown[]) => mocks.findSender(...args),
}))
vi.mock("@/emails/mailers/projectRecordCreatedNotificationToProjectLead", () => ({
  projectRecordCreatedNotificationToProjectLead: (...args: unknown[]) =>
    mocks.projectLeadMailer(...args),
}))
vi.mock("@/emails/mailers/projectRecordCreatedNotificationToSender", () => ({
  projectRecordCreatedNotificationToSender: (...args: unknown[]) => mocks.senderMailer(...args),
}))
vi.mock("@/emails/mailers/projectRecordPendingNotificationToSender", () => ({
  projectRecordPendingNotificationToSender: (...args: unknown[]) => mocks.pendingMailer(...args),
}))

const projectLead = { id: 7, email: "brit@example.org" }
const sender = { id: 4, email: "max@example.org" }
const adminSave = {
  projectId: 1,
  projectSlug: "rs8",
  projectRecord: {
    id: 42,
    title: "Abstimmung Knotenpunkt",
    assignedToId: null,
    reviewState: ProjectRecordReviewState.NEEDSREVIEW,
  },
  projectLead,
  emailFrom: "Max Beispiel <max@example.org>",
  actorUserId: 3,
}
const approvedSave = {
  ...adminSave,
  projectRecord: { ...adminSave.projectRecord, reviewState: ProjectRecordReviewState.APPROVED },
}
const assignedTo = (assignedToId: number) => ({
  ...adminSave,
  projectRecord: { ...adminSave.projectRecord, assignedToId },
})

describe("notifyProjectRecordCreatedFromEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findSender.mockResolvedValue(sender)
    mocks.projectLeadMailer.mockResolvedValue({ send: mocks.sendLeadMail })
    mocks.senderMailer.mockResolvedValue({ send: mocks.sendSenderMail })
    mocks.pendingMailer.mockResolvedValue({ send: mocks.sendPendingMail })
  })

  test("an admin's save asks the Projektleitung to confirm and tells the sender it waits", async () => {
    await notifyProjectRecordCreatedFromEmail(adminSave)

    expect(mocks.findSender).toHaveBeenCalledWith({
      projectId: 1,
      email: "Max Beispiel <max@example.org>",
    })
    expect(mocks.projectLeadMailer).toHaveBeenCalledWith({
      projectLeadEmail: "brit@example.org",
      projectName: "RS8",
      recordTitle: "Abstimmung Knotenpunkt",
      recordPath: "/rs8/project-records/42",
    })
    expect(mocks.pendingMailer).toHaveBeenCalledWith({
      senderEmail: "max@example.org",
      projectName: "RS8",
    })
    expect(mocks.sendLeadMail).toHaveBeenCalled()
    expect(mocks.sendPendingMail).toHaveBeenCalled()
    expect(mocks.senderMailer).not.toHaveBeenCalled()
  })

  test("the Projektleitung's own save only confirms to the sender", async () => {
    await notifyProjectRecordCreatedFromEmail({ ...approvedSave, actorUserId: projectLead.id })

    expect(mocks.projectLeadMailer).not.toHaveBeenCalled()
    expect(mocks.pendingMailer).not.toHaveBeenCalled()
    expect(mocks.senderMailer).toHaveBeenCalledWith({
      senderEmail: "max@example.org",
      projectName: "RS8",
    })
    expect(mocks.sendSenderMail).toHaveBeenCalled()
  })

  test("without Projektleitung the admin's save confirms to the sender", async () => {
    await notifyProjectRecordCreatedFromEmail({ ...approvedSave, projectLead: null })

    expect(mocks.projectLeadMailer).not.toHaveBeenCalled()
    expect(mocks.sendSenderMail).toHaveBeenCalled()
  })

  test("senders outside the team get no mail", async () => {
    mocks.findSender.mockResolvedValue(null)

    await notifyProjectRecordCreatedFromEmail(adminSave)

    expect(mocks.projectLeadMailer).toHaveBeenCalled()
    expect(mocks.pendingMailer).not.toHaveBeenCalled()
  })

  test("a Projektleitung who sent the mail only gets the request to confirm", async () => {
    mocks.findSender.mockResolvedValue(projectLead)

    await notifyProjectRecordCreatedFromEmail(adminSave)

    expect(mocks.projectLeadMailer).toHaveBeenCalled()
    expect(mocks.pendingMailer).not.toHaveBeenCalled()
  })

  test("an assigned Projektleitung still gets the request to confirm", async () => {
    await notifyProjectRecordCreatedFromEmail(assignedTo(projectLead.id))

    expect(mocks.projectLeadMailer).toHaveBeenCalled()
    expect(mocks.pendingMailer).toHaveBeenCalled()
  })

  test("an assigned sender only gets the assignment mail", async () => {
    await notifyProjectRecordCreatedFromEmail(assignedTo(sender.id))

    expect(mocks.projectLeadMailer).toHaveBeenCalled()
    expect(mocks.pendingMailer).not.toHaveBeenCalled()
  })

  test("a broken Projektleitung mail still tells the sender", async () => {
    mocks.projectLeadMailer.mockRejectedValueOnce(new Error("Invalid email template"))
    vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(notifyProjectRecordCreatedFromEmail(adminSave)).resolves.toBeUndefined()
    expect(mocks.sendPendingMail).toHaveBeenCalled()
  })
})

describe("notifyProjectRecordFromEmailConfirmed", () => {
  const confirmed = {
    projectId: 1,
    projectSlug: "rs8",
    projectRecord: {
      userId: 3,
      assignedToId: null,
      projectRecordEmail: { from: "Max Beispiel <max@example.org>" },
    },
    actorUserId: projectLead.id,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findProjectLead.mockResolvedValue(projectLead)
    mocks.findSender.mockResolvedValue(sender)
    mocks.senderMailer.mockResolvedValue({ send: mocks.sendSenderMail })
  })

  test("sends the sender the usual confirmation", async () => {
    await notifyProjectRecordFromEmailConfirmed(confirmed)

    expect(mocks.findProjectLead).toHaveBeenCalledWith(1)
    expect(mocks.senderMailer).toHaveBeenCalledWith({
      senderEmail: "max@example.org",
      projectName: "RS8",
    })
    expect(mocks.sendSenderMail).toHaveBeenCalled()
  })

  test("older KI entries and entries without a mail send nothing", async () => {
    await notifyProjectRecordFromEmailConfirmed({
      ...confirmed,
      projectRecord: { ...confirmed.projectRecord, userId: null },
    })
    await notifyProjectRecordFromEmailConfirmed({
      ...confirmed,
      projectRecord: { ...confirmed.projectRecord, projectRecordEmail: null },
    })

    expect(mocks.findSender).not.toHaveBeenCalled()
    expect(mocks.senderMailer).not.toHaveBeenCalled()
  })

  test.each([
    ["saved", 3],
    ["confirmed", projectLead.id],
  ])("a sender who %s the entry gets nothing", async (_, senderId) => {
    mocks.findSender.mockResolvedValue({ id: senderId, email: "team@example.org" })

    await notifyProjectRecordFromEmailConfirmed(confirmed)

    expect(mocks.senderMailer).not.toHaveBeenCalled()
  })

  test("a failing mail is only logged", async () => {
    mocks.senderMailer.mockRejectedValueOnce(new Error("Brevo down"))
    vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(notifyProjectRecordFromEmailConfirmed(confirmed)).resolves.toBeUndefined()
  })
})
