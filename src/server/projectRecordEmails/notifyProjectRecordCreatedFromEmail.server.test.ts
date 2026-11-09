import { beforeEach, describe, expect, test, vi } from "vitest"
import { notifyProjectRecordCreatedFromEmail } from "./notifyProjectRecordCreatedFromEmail.server"

const mocks = vi.hoisted(() => ({
  findProjectLead: vi.fn(),
  findSender: vi.fn(),
  projectLeadMailer: vi.fn(),
  senderMailer: vi.fn(),
  sendLeadMail: vi.fn(),
  sendSenderMail: vi.fn(),
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

const projectLead = { id: 7, email: "brit@example.org" }
const sender = { id: 4, email: "max@example.org" }
const input = {
  projectId: 1,
  projectSlug: "rs8",
  projectRecord: { id: 42, title: "Abstimmung Knotenpunkt", assignedToId: null },
  emailFrom: "Max Beispiel <max@example.org>",
  actorUserId: 3,
}
const assignedTo = (assignedToId: number) => ({
  ...input,
  projectRecord: { ...input.projectRecord, assignedToId },
})

describe("notifyProjectRecordCreatedFromEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findProjectLead.mockResolvedValue(projectLead)
    mocks.findSender.mockResolvedValue(sender)
    mocks.projectLeadMailer.mockResolvedValue({ send: mocks.sendLeadMail })
    mocks.senderMailer.mockResolvedValue({ send: mocks.sendSenderMail })
  })

  test("mails the Projektleitung a link to the entry and confirms to a known sender", async () => {
    await notifyProjectRecordCreatedFromEmail(input)

    expect(mocks.findProjectLead).toHaveBeenCalledWith(1)
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
    expect(mocks.senderMailer).toHaveBeenCalledWith({
      senderEmail: "max@example.org",
      projectName: "RS8",
    })
    expect(mocks.sendLeadMail).toHaveBeenCalled()
    expect(mocks.sendSenderMail).toHaveBeenCalled()
  })

  test("senders outside the team get no confirmation", async () => {
    mocks.findSender.mockResolvedValue(null)

    await notifyProjectRecordCreatedFromEmail(input)

    expect(mocks.projectLeadMailer).toHaveBeenCalled()
    expect(mocks.senderMailer).not.toHaveBeenCalled()
  })

  test("a Projektleitung who sent the mail only gets the Projektleitung mail", async () => {
    mocks.findSender.mockResolvedValue(projectLead)

    await notifyProjectRecordCreatedFromEmail(input)

    expect(mocks.projectLeadMailer).toHaveBeenCalled()
    expect(mocks.senderMailer).not.toHaveBeenCalled()
  })

  test("the admin who saved the entry gets neither mail", async () => {
    mocks.findSender.mockResolvedValue(projectLead)

    await notifyProjectRecordCreatedFromEmail({ ...input, actorUserId: projectLead.id })

    expect(mocks.projectLeadMailer).not.toHaveBeenCalled()
    expect(mocks.senderMailer).not.toHaveBeenCalled()
  })

  test("an assigned Projektleitung only gets the assignment mail", async () => {
    await notifyProjectRecordCreatedFromEmail(assignedTo(projectLead.id))

    expect(mocks.projectLeadMailer).not.toHaveBeenCalled()
    expect(mocks.senderMailer).toHaveBeenCalled()
  })

  test("an assigned sender only gets the assignment mail", async () => {
    await notifyProjectRecordCreatedFromEmail(assignedTo(sender.id))

    expect(mocks.projectLeadMailer).toHaveBeenCalled()
    expect(mocks.senderMailer).not.toHaveBeenCalled()
  })

  test("without Projektleitung only the sender gets a mail", async () => {
    mocks.findProjectLead.mockResolvedValue(null)

    await notifyProjectRecordCreatedFromEmail(input)

    expect(mocks.projectLeadMailer).not.toHaveBeenCalled()
    expect(mocks.sendSenderMail).toHaveBeenCalled()
  })

  test("a broken Projektleitung mail still sends the confirmation", async () => {
    mocks.projectLeadMailer.mockRejectedValueOnce(new Error("Invalid email template"))
    vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(notifyProjectRecordCreatedFromEmail(input)).resolves.toBeUndefined()
    expect(mocks.sendSenderMail).toHaveBeenCalled()
  })
})
