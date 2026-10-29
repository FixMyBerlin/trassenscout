import { beforeEach, describe, expect, test, vi } from "vitest"
import { notifyProjectLeadSurveyResponseSubmitted } from "./notifyProjectLeadSurveyResponseSubmitted.server"

const mocks = vi.hoisted(() => ({
  findSurveySession: vi.fn(),
  findProjectLead: vi.fn(),
  getConfig: vi.fn(),
  rateLimit: vi.fn(),
  mailer: vi.fn(),
  send: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({
  default: {
    surveySession: { findUnique: (...args: unknown[]) => mocks.findSurveySession(...args) },
  },
}))
vi.mock("@/src/server/projects/findProjectLead.server", () => ({
  findProjectLead: (...args: unknown[]) => mocks.findProjectLead(...args),
}))
vi.mock("@/src/components/beteiligung/shared/utils/getConfigBySurveySlug", () => ({
  getConfigBySurveySlug: (...args: unknown[]) => mocks.getConfig(...args),
}))
vi.mock("@/src/server/auth/publicEndpointRateLimit.server", () => ({
  enforcePublicEndpointRateLimit: (...args: unknown[]) => mocks.rateLimit(...args),
}))
vi.mock("@/emails/mailers/surveyResponseSubmittedNotificationToProjectLead", () => ({
  surveyResponseSubmittedNotificationToProjectLead: (...args: unknown[]) => mocks.mailer(...args),
}))

const headers = new Headers()
const input = { headers, surveyResponseId: 9, surveySessionId: 3 }
const survey = {
  id: 5,
  slug: "rsv-hinweis",
  title: "Hinweise zur Trasse",
  active: true,
  project: { id: 1, slug: "rs8" },
}

describe("notifyProjectLeadSurveyResponseSubmitted", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findSurveySession.mockResolvedValue({ survey })
    mocks.getConfig.mockReturnValue({ recipients: ["team@example.org"] })
    mocks.findProjectLead.mockResolvedValue({ id: 7, email: "brit@example.org" })
    mocks.mailer.mockResolvedValue({ send: mocks.send })
  })

  test("mails the Projektleitung a link to the new Eingabe", async () => {
    await notifyProjectLeadSurveyResponseSubmitted(input)

    expect(mocks.rateLimit).toHaveBeenCalledWith(
      headers,
      "notifyProjectLeadSurveyResponseSubmitted",
      { max: 10 },
    )
    expect(mocks.getConfig).toHaveBeenCalledWith("rsv-hinweis", "adminEmail")
    expect(mocks.findProjectLead).toHaveBeenCalledWith(1)
    expect(mocks.mailer).toHaveBeenCalledWith({
      projectLeadEmail: "brit@example.org",
      projectName: "RS8",
      surveyTitle: "Hinweise zur Trasse",
      surveyResponsePath: "/rs8/surveys/5/responses?responseDetails=9",
    })
    expect(mocks.send).toHaveBeenCalledTimes(1)
  })

  test("Beteiligungen without team mails don't notify", async () => {
    mocks.getConfig.mockReturnValue(null)

    await notifyProjectLeadSurveyResponseSubmitted(input)

    expect(mocks.mailer).not.toHaveBeenCalled()
  })

  test("closed Beteiligungen don't notify", async () => {
    mocks.findSurveySession.mockResolvedValue({ survey: { ...survey, active: false } })

    await notifyProjectLeadSurveyResponseSubmitted(input)

    expect(mocks.mailer).not.toHaveBeenCalled()
  })

  test("without Projektleitung nobody is mailed", async () => {
    mocks.findProjectLead.mockResolvedValue(null)

    await notifyProjectLeadSurveyResponseSubmitted(input)

    expect(mocks.mailer).not.toHaveBeenCalled()
  })

  test("too many Eingaben from one client stop the mails", async () => {
    mocks.rateLimit.mockImplementationOnce(() => {
      throw new Error("Too many requests")
    })
    vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(notifyProjectLeadSurveyResponseSubmitted(input)).resolves.toBeUndefined()
    expect(mocks.findSurveySession).not.toHaveBeenCalled()
    expect(mocks.mailer).not.toHaveBeenCalled()
  })

  test("a failing mail does not fail the submission", async () => {
    mocks.send.mockRejectedValueOnce(new Error("Brevo down"))
    vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(notifyProjectLeadSurveyResponseSubmitted(input)).resolves.toBeUndefined()
  })
})
