import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  surveySession: {
    findFirst: vi.fn(),
  },
  surveyResponse: {
    findFirst: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/emails/mailers/surveyEntryCreatedNotificationToUser", () => ({
  surveyEntryCreatedNotificationToUser: vi.fn().mockResolvedValue({
    send: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock("@/src/components/beteiligung/shared/utils/getConfigBySurveySlug", () => ({
  getConfigBySurveySlug: vi.fn((slug: string, kind: string) => {
    if (kind === "email") {
      return { subject: "Test", markdown: "Hello", fields: ["email"] }
    }
    return null
  }),
}))

vi.mock("@/src/components/surveys/responses/getFlatSurveyFormFields", () => ({
  getFlatSurveyFormFields: vi.fn(() => []),
}))

vi.mock("@/src/server/auth/publicEndpointRateLimit.server", () => ({
  enforcePublicEndpointRateLimit: vi.fn(),
}))

const headers = new Headers()

describe("sendSurveyPart2Email", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("rejects when survey session does not exist", async () => {
    const { sendSurveyPart2Email } = await import("./publicSurveyResponses.server")
    mockDb.surveySession.findFirst.mockResolvedValue(null)

    const result = await sendSurveyPart2Email(headers, {
      surveySessionId: 1,
      surveySlug: "frm7",
      data: { email: "attacker@example.com" },
      searchParams: null,
    })

    expect(result).toEqual({
      success: false,
      message: "Unable to send email for this survey session",
    })
    expect(mockDb.surveyResponse.findFirst).not.toHaveBeenCalled()
  })

  test("ignores attacker-controlled data.email and requires part-1 email", async () => {
    const { sendSurveyPart2Email } = await import("./publicSurveyResponses.server")
    mockDb.surveySession.findFirst.mockResolvedValue({ id: 1 })
    mockDb.surveyResponse.findFirst.mockResolvedValue(null)

    const result = await sendSurveyPart2Email(headers, {
      surveySessionId: 1,
      surveySlug: "frm7",
      data: { email: "attacker@example.com" },
      searchParams: null,
    })

    expect(result.success).toBe(false)
  })

  test("sends only to email stored on part 1", async () => {
    const { surveyEntryCreatedNotificationToUser } =
      await import("@/emails/mailers/surveyEntryCreatedNotificationToUser")
    const { sendSurveyPart2Email } = await import("./publicSurveyResponses.server")

    mockDb.surveySession.findFirst.mockResolvedValue({ id: 1 })
    mockDb.surveyResponse.findFirst.mockResolvedValue({
      data: JSON.stringify({ email: "participant@example.com" }),
    })

    const result = await sendSurveyPart2Email(headers, {
      surveySessionId: 1,
      surveySlug: "frm7",
      data: { email: "attacker@example.com" },
      searchParams: null,
    })

    expect(result.success).toBe(true)
    expect(surveyEntryCreatedNotificationToUser).toHaveBeenCalledWith(
      expect.objectContaining({ userEmail: "participant@example.com" }),
    )
  })
})
