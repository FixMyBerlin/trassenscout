import { beforeEach, describe, expect, test, vi } from "vitest"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import {
  deleteSurveyResponsesForMcp,
  listSurveyResponsesForMcp,
  listSurveysForMcp,
} from "./surveyResponsesMcp.server"

const { mockDb, mockDeleteResponses, mockFindLinkedSubsubsection, mockCreateLogEntry } = vi.hoisted(
  () => ({
    mockDb: {
      project: { findUnique: vi.fn() },
      survey: { findMany: vi.fn(), findFirst: vi.fn() },
      surveyResponse: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
      upload: { findMany: vi.fn() },
      membership: { findMany: vi.fn() },
    },
    mockDeleteResponses: vi.fn(),
    mockFindLinkedSubsubsection: vi.fn(),
    mockCreateLogEntry: vi.fn(),
  }),
)

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/survey-responses/surveyResponses.server", () => ({
  deleteResponsesWithOrphanedRelations: mockDeleteResponses,
  findLinkedSubsubsectionForSurveyResponse: mockFindLinkedSubsubsection,
  orphanedUploadWhere: (responseIds: number[]) => ({ orphanedOf: responseIds }),
}))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: mockCreateLogEntry,
}))

const origin = "http://localhost"
const surveySlug = "ohv-haltestellenfoerderung"
const statuses = getConfigBySurveySlug(surveySlug, "backend").status
const categoryField = getFlatSurveyFormFields(getConfigBySurveySlug(surveySlug, "part2")).find(
  (field) => field.name === "category",
)!

const ohv = (mcpMode: "DISABLED" | "DRAFT" | "DIRECT") => ({
  id: 3,
  slug: "ohv",
  mcpMode,
  mcpDirectUntil: new Date("2999-01-01"),
  subsubsectionExtraFieldDefinitions: [],
})

const eingabe = {
  id: 42,
  data: JSON.stringify({
    category: ["haltestelleneinrichtungen"],
    feedbackText: "",
    referenceId: "2026-07",
    contact: "Max Muster",
    phone: "0331 123456",
    email: "max@example.org",
  }),
  status: statuses[0].value,
  note: null,
  source: "FORM",
  surveySessionId: 9,
  surveySession: {
    createdAt: new Date("2026-09-30T10:00:00Z"),
    survey: { id: 5, slug: surveySlug },
  },
  operator: null,
  surveyResponseTags: [{ title: "Barrierefreiheit" }],
  surveyResponseComments: [
    {
      createdAt: new Date("2026-10-01T08:00:00Z"),
      body: "Unterlagen fehlen noch.",
      author: { id: 7, role: "USER", firstName: "Erika", institution: null, lastName: "Muster" },
    },
    {
      createdAt: new Date("2026-10-02T08:00:00Z"),
      body: "Erledigt.",
      author: { id: 8, role: "USER", firstName: "Otto", institution: null, lastName: "Alt" },
    },
  ],
  uploads: [{ id: 618, title: "Lageplan" }],
}

const storedEingabe = {
  id: 42,
  status: statuses[0].value,
  surveySession: { survey: { id: 5, slug: surveySlug } },
  _count: { surveyResponseComments: 1 },
  uploads: [
    { id: 618, title: "Lageplan" },
    { id: 619, title: "Foto" },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDb.project.findUnique.mockResolvedValue(ohv("DRAFT"))
  mockDb.membership.findMany.mockResolvedValue([{ projectId: 3, userId: 7 }])
  mockFindLinkedSubsubsection.mockResolvedValue(null)
})

describe("listSurveysForMcp", () => {
  test("lists the Beteiligungen with their Eingaben count and status values", async () => {
    mockDb.survey.findMany.mockResolvedValue([
      {
        id: 5,
        slug: surveySlug,
        title: "Maßnahmenmeldung",
        active: true,
        startDate: null,
        endDate: null,
      },
    ])
    mockDb.surveyResponse.count.mockResolvedValue(12)

    const result = await listSurveysForMcp({ projectSlug: "ohv", origin })

    expect(result.items).toEqual([
      {
        projectSlug: "ohv",
        slug: surveySlug,
        title: "Maßnahmenmeldung",
        active: true,
        startDate: null,
        endDate: null,
        responseCount: 12,
        statuses: statuses.map(({ value, label }) => ({ value, label })),
        url: "http://localhost/ohv/surveys/5",
      },
    ])
  })

  test("refuses a project with MCP switched off", async () => {
    mockDb.project.findUnique.mockResolvedValue(ohv("DISABLED"))

    await expect(listSurveysForMcp({ projectSlug: "ohv", origin })).rejects.toThrow(
      'MCP is not enabled for project "ohv"',
    )
  })
})

describe("listSurveyResponsesForMcp", () => {
  test("lists submitted Eingaben of the project with their status label", async () => {
    mockDb.survey.findFirst.mockResolvedValue({ id: 5 })
    mockDb.surveyResponse.findMany.mockResolvedValue([eingabe])

    const result = await listSurveyResponsesForMcp({
      projectSlug: "ohv",
      surveySlug,
      status: statuses[0].value,
      beforeId: 100,
      origin,
      viewerUserId: 1,
    })

    expect(mockDb.surveyResponse.findMany.mock.calls[0]?.[0].where).toEqual({
      state: "SUBMITTED",
      surveyPart: 2,
      surveySession: { survey: { projectId: 3, slug: surveySlug } },
      status: statuses[0].value,
      id: { lt: 100 },
    })
    expect(result.items).toEqual([
      {
        projectSlug: "ohv",
        id: 42,
        surveySlug,
        createdAt: new Date("2026-09-30T10:00:00Z"),
        status: statuses[0].value,
        statusLabel: statuses[0].label,
        source: "FORM",
        operator: null,
        tags: ["Barrierefreiheit"],
        note: null,
        commentCount: 2,
        uploadCount: 1,
        url: "http://localhost/ohv/surveys/5/responses?responseDetails=42",
      },
    ])
  })

  test("adds labelled answers without contact data, comments, and uploads on request", async () => {
    mockDb.surveyResponse.findMany.mockResolvedValueOnce([eingabe]).mockResolvedValueOnce([])

    const result = await listSurveyResponsesForMcp({
      projectSlug: "ohv",
      includeAnswers: true,
      origin,
      viewerUserId: 1,
    })

    expect(result.items[0]).toMatchObject({
      answers: [
        { part: 2, question: categoryField.props.label, answer: "Haltestelleneinrichtungen" },
        { part: 2, question: "referenceId", answer: "2026-07" },
      ],
      comments: [
        {
          author: "Erika Muster",
          createdAt: new Date("2026-10-01T08:00:00Z"),
          body: "Unterlagen fehlen noch.",
        },
        {
          author: "Ehemalige:r Mitarbeiter:in",
          createdAt: new Date("2026-10-02T08:00:00Z"),
          body: "Erledigt.",
        },
      ],
      uploads: [{ id: 618, title: "Lageplan" }],
    })
  })

  test("leaves out name, email, and PIN that radnetz-brandenburg asks in part 1", async () => {
    mockDb.surveyResponse.findMany
      .mockResolvedValueOnce([
        {
          ...eingabe,
          data: "{}",
          surveySession: {
            ...eingabe.surveySession,
            survey: { id: 5, slug: "radnetz-brandenburg" },
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          surveySessionId: 9,
          surveyPart: 1,
          data: JSON.stringify({
            1: "Max",
            2: "Muster",
            3: "max@example.org",
            4: "1234",
            5: "Amt Barnim",
            6: "Barnim",
          }),
        },
      ])

    const result = await listSurveyResponsesForMcp({
      projectSlug: "ohv",
      includeAnswers: true,
      origin,
      viewerUserId: 1,
    })

    expect(result.items[0]).toMatchObject({
      answers: [
        { part: 1, question: "Institution", answer: "Amt Barnim" },
        { part: 1, question: "Landkreis", answer: "Barnim" },
      ],
    })
  })

  test("names an unknown Beteiligung instead of listing nothing", async () => {
    mockDb.survey.findFirst.mockResolvedValue(null)

    await expect(
      listSurveyResponsesForMcp({
        projectSlug: "ohv",
        surveySlug: "nope",
        origin,
        viewerUserId: 1,
      }),
    ).rejects.toThrow("Beteiligung nicht gefunden: nope")
  })
})

describe("deleteSurveyResponsesForMcp", () => {
  beforeEach(() => {
    mockDb.project.findUnique.mockResolvedValue(ohv("DIRECT"))
    mockDb.upload.findMany.mockResolvedValue([{ id: 618 }])
  })

  test("refuses to delete while the project is in DRAFT", async () => {
    mockDb.project.findUnique.mockResolvedValue(ohv("DRAFT"))
    mockDb.surveyResponse.findFirst.mockResolvedValue(storedEingabe)

    const result = await deleteSurveyResponsesForMcp({
      items: [{ projectSlug: "ohv", id: 42 }],
      confirm: true,
      origin,
      createdById: 1,
    })

    expect(mockDeleteResponses).not.toHaveBeenCalled()
    expect(result.items[0]).toMatchObject({
      deleted: false,
      errors: [
        'Delete is only available while MCP direct write is active for "ohv". The effective mode is drafts.',
      ],
    })
  })

  test("previews which uploads go with the Eingabe and which stay", async () => {
    mockDb.surveyResponse.findFirst.mockResolvedValue(storedEingabe)

    const result = await deleteSurveyResponsesForMcp({
      items: [{ projectSlug: "ohv", id: 42 }],
      origin,
      createdById: 1,
    })

    expect(mockDb.upload.findMany).toHaveBeenCalledWith({
      where: { orphanedOf: [42] },
      select: { id: true },
    })
    expect(mockDeleteResponses).not.toHaveBeenCalled()
    expect(result.items).toEqual([
      {
        projectSlug: "ohv",
        id: 42,
        surveySlug,
        url: "http://localhost/ohv/surveys/5/responses?responseDetails=42",
        commentCount: 1,
        uploadsDeleted: [{ id: 618, title: "Lageplan" }],
        uploadsKept: [{ id: 619, title: "Foto" }],
        deleted: false,
        errors: [],
      },
    ])
  })

  test("deletes on confirm with the app's delete and logs it", async () => {
    mockDb.surveyResponse.findFirst.mockResolvedValue(storedEingabe)

    const result = await deleteSurveyResponsesForMcp({
      items: [{ projectSlug: "ohv", id: 42 }],
      confirm: true,
      origin,
      createdById: 1,
    })

    expect(mockDeleteResponses).toHaveBeenCalledWith([42])
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DELETE", userId: 1, projectId: 3, surveyId: 5 }),
    )
    expect(result.deletedCount).toBe(1)
  })

  test("keeps an Eingabe that is linked to a Maßnahme", async () => {
    mockDb.surveyResponse.findFirst.mockResolvedValue(storedEingabe)
    mockFindLinkedSubsubsection.mockResolvedValue({ id: 8, slug: "2026-07" })

    const result = await deleteSurveyResponsesForMcp({
      items: [{ projectSlug: "ohv", id: 42 }],
      confirm: true,
      origin,
      createdById: 1,
    })

    expect(mockDeleteResponses).not.toHaveBeenCalled()
    expect(result.items[0]).toMatchObject({
      deleted: false,
      errors: [
        "Eingabe 42 ist mit der Maßnahme „2026-07“ verknüpft und kann nicht gelöscht werden.",
      ],
    })
  })

  test("reports an Eingabe that is not in the project", async () => {
    mockDb.surveyResponse.findFirst.mockResolvedValue(null)

    const result = await deleteSurveyResponsesForMcp({
      items: [{ projectSlug: "ohv", id: 99 }],
      confirm: true,
      origin,
      createdById: 1,
    })

    expect(result.items[0]).toMatchObject({
      deleted: false,
      errors: ["Eingabe nicht gefunden: 99"],
    })
  })
})
