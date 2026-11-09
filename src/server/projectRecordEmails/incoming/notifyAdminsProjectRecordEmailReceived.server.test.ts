import { expect, test, vi } from "vitest"
import { notifyAdminsProjectRecordEmailReceived } from "./notifyAdminsProjectRecordEmailReceived.server"

vi.mock("@/emails/mailers/projectRecordEmailReceivedNotificationToAdmins", () => ({
  projectRecordEmailReceivedNotificationToAdmins: vi.fn(async () => ({
    send: vi.fn().mockRejectedValue(new Error("Brevo down")),
  })),
}))

test("a failed admin mail does not fail the stored incoming mail", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {})

  await expect(
    notifyAdminsProjectRecordEmailReceived({
      projectSlug: "rs8",
      senderEmail: "brit@example.org",
      emailSubject: "Abstimmung",
      projectRecordEmailId: 61,
    }),
  ).resolves.toBeUndefined()
})
