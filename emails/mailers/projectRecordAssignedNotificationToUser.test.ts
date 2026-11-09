import { beforeEach, describe, expect, test, vi } from "vitest"
import { assignmentReplyHintText } from "@/src/shared/emailTemplates/registry"
import { projectRecordAssignedNotificationToUser } from "./projectRecordAssignedNotificationToUser"
import { addressNoreply } from "./utils/addresses"

const mocks = vi.hoisted(() => ({ render: vi.fn(), sendMail: vi.fn() }))

vi.mock("@/src/server/emailTemplates/render", () => ({
  resolveAndRenderEmailTemplate: (...args: unknown[]) => mocks.render(...args),
}))
vi.mock("./utils/sendMail", () => ({
  sendMail: (...args: unknown[]) => mocks.sendMail(...args),
}))

const props = {
  assigneeEmail: "ada@example.org",
  assigneeName: "Ada Beispiel",
  actorName: "Brit Beispiel",
  recordTitle: "Abstimmung Knotenpunkt",
  recordText: null,
  projectName: "RS8",
  recordPath: "/rs8/project-records/42",
}

describe("projectRecordAssignedNotificationToUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.render.mockResolvedValue({
      key: "project_record_assigned_user",
      isValid: true,
      unknownVariables: [],
      htmlFields: [],
      rendered: { subject: "Neue Aufgabe", introMarkdown: "Guten Tag!", ctaText: "Öffnen" },
    })
  })

  test("sends from the project's protocol mailbox and invites a reply", async () => {
    const mail = await projectRecordAssignedNotificationToUser({
      ...props,
      protocolMailboxEmail: "protokoll+rs8@trassenscout.de",
    })
    await mail.send()

    expect(mocks.render).toHaveBeenCalledWith(
      "project_record_assigned_user",
      expect.objectContaining({ replyHintText: assignmentReplyHintText }),
    )
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        From: { Email: "protokoll+rs8@trassenscout.de", Name: "Trassenscout Protokoll RS8" },
      }),
    )
  })

  test("sends from noreply@ without the hint when the toggle is off", async () => {
    const mail = await projectRecordAssignedNotificationToUser({
      ...props,
      protocolMailboxEmail: null,
    })
    await mail.send()

    expect(mocks.render).toHaveBeenCalledWith(
      "project_record_assigned_user",
      expect.objectContaining({ replyHintText: "" }),
    )
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({ From: addressNoreply }))
  })

  test("falls back to noreply@ without the hint when the mailbox sender is rejected", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.sendMail.mockRejectedValueOnce(new Error("Sender not valid"))

    const mail = await projectRecordAssignedNotificationToUser({
      ...props,
      protocolMailboxEmail: "protokoll+rs8@trassenscout.de",
    })
    await mail.send()

    expect(mocks.sendMail).toHaveBeenCalledTimes(2)
    expect(mocks.sendMail).toHaveBeenLastCalledWith(
      expect.objectContaining({ From: addressNoreply }),
    )
    expect(mocks.render).toHaveBeenLastCalledWith(
      "project_record_assigned_user",
      expect.objectContaining({ replyHintText: "" }),
    )
  })
})
