import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { allowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import {
  createSurveyResponsesForMcp,
  deleteSurveyResponsesForMcp,
  getSurveyResponsesSchemaForMcp,
  listSurveyResponsesForMcp,
  listSurveysForMcp,
} from "./surveyResponsesMcp.server"

const {
  mockDb,
  mockDeleteResponses,
  mockFindLinkedSubsubsection,
  mockCreateLogEntry,
  mockCreateNextOhvReferenceId,
} = vi.hoisted(() => ({
  mockDb: {
    project: { findUnique: vi.fn() },
    survey: { findMany: vi.fn(), findFirst: vi.fn() },
    surveySession: { create: vi.fn() },
    surveyResponse: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn(), create: vi.fn() },
    upload: { findMany: vi.fn() },
    membership: { findMany: vi.fn() },
    $transaction: vi.fn(),
    $executeRaw: vi.fn(),
  },
  mockDeleteResponses: vi.fn(),
  mockFindLinkedSubsubsection: vi.fn(),
  mockCreateLogEntry: vi.fn(),
  mockCreateNextOhvReferenceId: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/survey-responses/surveyResponses.server", () => ({
  deleteResponsesWithOrphanedRelations: mockDeleteResponses,
  findLinkedSubsubsectionForSurveyResponse: mockFindLinkedSubsubsection,
  orphanedUploadWhere: (responseIds: number[]) => ({ orphanedOf: responseIds }),
}))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: mockCreateLogEntry,
}))
vi.mock("@/src/server/survey-responses/utils/ohvReferenceId", () => ({
  createNextOhvReferenceId: mockCreateNextOhvReferenceId,
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

describe("getSurveyResponsesSchemaForMcp", () => {
  test("lists the questions MCP can answer, without contact data and uploads", async () => {
    mockDb.survey.findFirst.mockResolvedValue({ id: 5, slug: surveySlug })

    const result = await getSurveyResponsesSchemaForMcp({ projectSlug: "ohv", surveySlug })

    expect(result.statuses).toEqual(statuses.map(({ value, label }) => ({ value, label })))
    expect(result.parts.map((part) => part.part)).toEqual([2])
    const questions = new Map(
      result.parts[0]!.questions.map((question) => [question.name, question]),
    )
    expect(questions.has("uploads")).toBe(false)
    expect(questions.get("email")).toMatchObject({
      answerType: "text",
      required: false,
      contact: true,
    })
    expect(questions.get("category")).toMatchObject({
      answerType: "options",
      required: true,
      options: expect.arrayContaining([
        { key: "haltestelleneinrichtungen", label: "Haltestelleneinrichtungen" },
      ]),
    })
    expect(questions.get("fundingSource")).toMatchObject({
      required: false,
      dependsOn: "coFinancing",
    })
    expect(questions.get("location")).toMatchObject({ answerType: "latLng", required: false })
  })
})

describe("createSurveyResponsesForMcp", () => {
  const testSurveySlug = "rstest-2-3"
  type Item = Parameters<typeof createSurveyResponsesForMcp>[0]["items"][number]
  const create = (item: Partial<Item>) =>
    createSurveyResponsesForMcp({
      items: [{ projectSlug: "ohv", surveySlug: testSurveySlug, part2: {}, ...item }],
      origin,
      createdById: 1,
    })
  const storedData = () => JSON.parse(mockDb.surveyResponse.create.mock.calls[0]?.[0].data.data)

  beforeEach(() => {
    mockDb.project.findUnique.mockResolvedValue(ohv("DIRECT"))
    mockDb.survey.findFirst.mockResolvedValue({ id: 6, slug: testSurveySlug })
    mockDb.$transaction.mockImplementation((fn: (tx: typeof mockDb) => unknown) => fn(mockDb))
    mockDb.surveySession.create.mockResolvedValue({ id: 11 })
    mockDb.surveyResponse.create.mockResolvedValue({ id: 77 })
  })

  test("refuses to create while the project is in DRAFT", async () => {
    mockDb.project.findUnique.mockResolvedValue(ohv("DRAFT"))

    const result = await create({ part2: { category: "nutzung", feedbackText: "Test" } })

    expect(mockDb.$transaction).not.toHaveBeenCalled()
    expect(result.items[0]).toMatchObject({
      created: false,
      errors: [
        'Creating Eingaben is only available while MCP direct write is active for "ohv". The effective mode is drafts.',
      ],
    })
  })

  test("submits an Eingabe like the form: own session, defaults, first status, log entry", async () => {
    const result = await create({
      part2: {
        category: "nutzung",
        location: { lat: 50.12, lng: 8.71 },
        feedbackText: "Test: Radweg zu schmal",
      },
    })

    expect(mockDb.surveySession.create).toHaveBeenCalledWith({
      data: { surveyId: 6 },
      select: { id: true },
    })
    expect(mockDb.surveyResponse.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        surveySessionId: 11,
        surveyPart: 2,
        source: "FORM",
        status: getConfigBySurveySlug(testSurveySlug, "backend").status[0].value,
        state: "SUBMITTED",
      }),
      select: { id: true },
    })
    expect(storedData()).toEqual({
      category: "nutzung",
      enableLocation: "ja",
      location: { lat: 50.12, lng: 8.71 },
      feedbackText: "Test: Radweg zu schmal",
    })
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE",
        userId: 1,
        projectId: 3,
        surveyId: 6,
        surveyResponseId: 77,
      }),
    )
    expect(result.items).toEqual([
      {
        projectSlug: "ohv",
        surveySlug: testSurveySlug,
        id: 77,
        referenceId: null,
        url: "http://localhost/ohv/surveys/6/responses?responseDetails=77",
        created: true,
        errors: [],
      },
    ])
  })

  test("leaves out the location when the Eingabe has no place, as the form does", async () => {
    await create({
      part2: { category: "umwelt", enableLocation: "nein", feedbackText: "Test allgemein" },
    })

    expect(storedData()).toEqual({
      category: "umwelt",
      enableLocation: "nein",
      feedbackText: "Test allgemein",
    })
  })

  test("asks for the location when the Eingabe has a place", async () => {
    const result = await create({ part2: { category: "nutzung", feedbackText: "Test" } })

    expect(result.items[0]?.errors).toEqual(["Teil 2: location: Pflichtfeld."])
  })

  test("names each answer it cannot take and writes nothing", async () => {
    const result = await create({
      part2: {
        category: "parken",
        enableLocation: "nein",
        location: { lat: 50.12, lng: 8.71 },
        farbe: "blau",
      },
    })

    expect(mockDb.$transaction).not.toHaveBeenCalled()
    expect(result.items[0]?.created).toBe(false)
    expect(result.items[0]?.errors).toEqual([
      "Teil 2: unbekannte Frage farbe",
      "Teil 2: category: unbekannte Option parken",
      "Teil 2: location: passt nicht zur Antwort in enableLocation",
      "Teil 2: feedbackText: Pflichtfeld.",
    ])
  })

  test.each(allowedSurveySlugs)("checks empty answers for %s without crashing", async (slug) => {
    mockDb.survey.findFirst.mockResolvedValue({ id: 6, slug })
    const schema = await getSurveyResponsesSchemaForMcp({ projectSlug: "ohv", surveySlug: slug })

    const result = await create({
      surveySlug: slug,
      ...Object.fromEntries(schema.parts.map(({ part }) => [`part${part}`, {}])),
    })

    for (const error of result.items[0]?.errors ?? []) {
      expect(error).toMatch(/^Teil \d/)
      expect(error).not.toContain("unbekannte")
    }
  })

  test("rejects a status the Beteiligung does not have", async () => {
    const result = await create({
      part2: { category: "nutzung", enableLocation: "nein", feedbackText: "Test" },
      status: "NOPE",
    })

    expect(result.items[0]?.errors).toEqual(["Unbekannter Status: NOPE"])
  })

  describe("for an OHV Maßnahmenmeldung", () => {
    const meldung = {
      category: ["zob"],
      commune: "unknown",
      feedbackText: "Test: neue Haltestelle",
      costs: 12000,
      coFinancing: "no",
      sharedBuilding: "no",
      realisationYear: "2028",
      declaration: true,
    }

    beforeEach(() => {
      vi.useFakeTimers({ now: new Date("2026-10-29T12:00:00Z"), toFake: ["Date"] })
      mockDb.survey.findFirst.mockResolvedValue({ id: 5, slug: surveySlug })
      mockCreateNextOhvReferenceId.mockResolvedValue("547010_13")
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    test("gives it the next Vorgangs-ID under the lock and no place when none is sent", async () => {
      const result = await create({ surveySlug, part2: meldung })

      expect(mockDb.$executeRaw).toHaveBeenCalled()
      expect(mockCreateNextOhvReferenceId).toHaveBeenCalledWith(5, mockDb)
      expect(storedData()).toMatchObject({
        referenceId: "547010_13",
        location: null,
        locationMode: "none",
        email: "",
      })
      expect(result.items[0]).toMatchObject({ created: true, referenceId: "547010_13" })
    })

    test("applies the form's own field rules", async () => {
      const result = await create({ surveySlug, part2: { ...meldung, realisationYear: "2027" } })

      expect(result.items[0]?.errors).toEqual([
        "Teil 2: realisationYear: Das Realisierungsjahr muss mindestens 2028 sein.",
      ])
    })

    test("stores the contact data it is sent without returning it", async () => {
      const result = await create({
        surveySlug,
        part2: {
          ...meldung,
          contact: "Erika Test",
          phone: "0331 123456",
          email: "erika@example.org",
        },
      })

      expect(storedData()).toMatchObject({
        contact: "Erika Test",
        phone: "0331 123456",
        email: "erika@example.org",
      })
      expect(JSON.stringify(result)).not.toContain("erika@example.org")
    })

    test("checks contact data like the form and refuses uploads", async () => {
      const result = await create({
        surveySlug,
        part2: { ...meldung, email: "erika-at-example.org", uploads: [618] },
      })

      expect(result.items[0]?.errors).toEqual([
        "Teil 2: uploads nimmt MCP nicht an",
        "Teil 2: email: Bitte eine gültige E-Mail-Adresse eingeben.",
      ])
    })
  })
})
