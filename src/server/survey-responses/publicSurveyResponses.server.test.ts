import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  surveySession: {
    findFirst: vi.fn(),
  },
  surveyResponse: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
}

const mockNotifyProjectLead = vi.fn()

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("./notifyProjectLeadSurveyResponseSubmitted.server", () => ({
  notifyProjectLeadSurveyResponseSubmitted: (...args: unknown[]) => mockNotifyProjectLead(...args),
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

describe("updateSurveyResponsePublic", () => {
  const tx = {
    surveyResponse: { findFirst: vi.fn(), update: vi.fn() },
    surveySession: { findFirstOrThrow: vi.fn() },
  }
  const submitInput = { id: 9, surveySessionId: 3, data: "{}", state: "SUBMITTED" as const }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    )
    tx.surveySession.findFirstOrThrow.mockResolvedValue({
      surveyId: 5,
      survey: { slug: "rsv-hinweis" },
    })
  })

  test("a submitted Eingabe notifies the Projektleitung", async () => {
    const { updateSurveyResponsePublic } = await import("./publicSurveyResponses.server")
    tx.surveyResponse.findFirst.mockResolvedValue({ id: 9, surveyPart: 2 })
    tx.surveyResponse.update.mockResolvedValue({ id: 9, surveyPart: 2, state: "SUBMITTED" })

    await updateSurveyResponsePublic(headers, submitInput)

    expect(mockNotifyProjectLead).toHaveBeenCalledWith({
      headers,
      surveyResponseId: 9,
      surveySessionId: 3,
    })
  })

  test("answers from part 1 are no Eingabe", async () => {
    const { updateSurveyResponsePublic } = await import("./publicSurveyResponses.server")
    tx.surveyResponse.findFirst.mockResolvedValue({ id: 9, surveyPart: 1 })
    tx.surveyResponse.update.mockResolvedValue({ id: 9, surveyPart: 1, state: "SUBMITTED" })

    await updateSurveyResponsePublic(headers, submitInput)

    expect(mockNotifyProjectLead).not.toHaveBeenCalled()
  })
})
