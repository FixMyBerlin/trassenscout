import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { sendWithScalewayTem } from "./sendWithScalewayTem.server"
import { MailMessage } from "./types"

const fetchMock = vi.fn()

const mailMessage: MailMessage = {
  From: { Email: "protokoll+rs8@trassenscout.de", Name: "Trassenscout" },
  To: [{ Email: "ada@example.org", Name: "Ada Beispiel" }, { Email: "brit@example.org" }],
  Subject: "Trassenscout: Neue Aufgabe",
  TextPart: "Guten Tag!",
  HTMLPart: "<p>Guten Tag!</p>",
}

describe("sendWithScalewayTem", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
    vi.stubEnv("SCALEWAY_TEM_SECRET_KEY", " secret-key ")
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  test("posts the mail to the TEM API and returns the email ids", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ emails: [{ id: "tem-1" }, { id: "tem-2" }] }), { status: 200 }),
    )

    await expect(sendWithScalewayTem(mailMessage)).resolves.toEqual(["tem-1", "tem-2"])

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe("https://api.scaleway.com/transactional-email/v1alpha1/regions/fr-par/emails")
    expect(init.method).toBe("POST")
    expect(init.headers["X-Auth-Token"]).toBe("secret-key")
    expect(JSON.parse(init.body)).toEqual({
      project_id: "c9c72676-df76-4abe-bb06-c673b7eef2b5",
      from: { email: "protokoll+rs8@trassenscout.de", name: "Trassenscout" },
      to: [{ email: "ada@example.org", name: "Ada Beispiel" }, { email: "brit@example.org" }],
      subject: "Trassenscout: Neue Aufgabe",
      text: "Guten Tag!",
      html: "<p>Guten Tag!</p>",
    })
  })

  test("throws with the status and response body when TEM rejects the mail", async () => {
    fetchMock.mockResolvedValue(new Response('{"message":"domain not verified"}', { status: 403 }))

    await expect(sendWithScalewayTem(mailMessage)).rejects.toThrow(
      'Scaleway TEM responded 403: {"message":"domain not verified"}',
    )
  })
})
