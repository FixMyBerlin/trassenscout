import { beforeEach, expect, test, vi } from "vitest"
import { notifyProjectLeadProjectRecordEmailReceived } from "./notifyProjectLeadProjectRecordEmailReceived.server"

const mocks = vi.hoisted(() => ({
  findProjectLead: vi.fn(),
  mailer: vi.fn(),
  send: vi.fn(),
}))

vi.mock("@/src/server/projects/findProjectLead.server", () => ({
  findProjectLead: (...args: unknown[]) => mocks.findProjectLead(...args),
}))
vi.mock("@/emails/mailers/projectRecordEmailReceivedNotificationToProjectLead", () => ({
  projectRecordEmailReceivedNotificationToProjectLead: (...args: unknown[]) =>
    mocks.mailer(...args),
}))

const project = { id: 1, slug: "rs8", aiEnabled: true }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.findProjectLead.mockResolvedValue({ id: 7, email: "brit@example.org" })
  mocks.mailer.mockResolvedValue({ send: mocks.send })
})

test("links the Projektleitung to the mail in the Posteingang", async () => {
  await notifyProjectLeadProjectRecordEmailReceived({ project, projectRecordEmailId: 61 })

  expect(mocks.findProjectLead).toHaveBeenCalledWith(1)
  expect(mocks.mailer).toHaveBeenCalledWith({
    projectLeadEmail: "brit@example.org",
    projectName: "RS8",
    inboxEmailUrl: expect.stringMatching(
      /\/rs8\/project-records\/inbox\?modalProjectRecordEmailId=61$/,
    ),
  })
  expect(mocks.send).toHaveBeenCalled()
})

test("sends nothing without KI or without Projektleitung", async () => {
  await notifyProjectLeadProjectRecordEmailReceived({
    project: { ...project, aiEnabled: false },
    projectRecordEmailId: 61,
  })
  mocks.findProjectLead.mockResolvedValue(null)
  await notifyProjectLeadProjectRecordEmailReceived({ project, projectRecordEmailId: 61 })

  expect(mocks.findProjectLead).toHaveBeenCalledTimes(1)
  expect(mocks.mailer).not.toHaveBeenCalled()
})

test("a failed mail does not fail the stored incoming mail", async () => {
  mocks.send.mockRejectedValue(new Error("Brevo down"))
  vi.spyOn(console, "error").mockImplementation(() => {})

  await expect(
    notifyProjectLeadProjectRecordEmailReceived({ project, projectRecordEmailId: 61 }),
  ).resolves.toBeUndefined()
})
