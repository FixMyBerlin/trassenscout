// @vitest-environment jsdom

import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import type { SurveyResponseTagsResult } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"
import type { SurveyResponseFilter } from "@/src/shared/survey-responses/searchSchemas"
import { useFilteredResponses } from "./useFilteredResponses"

const filterState = vi.hoisted(() => ({
  filter: undefined as SurveyResponseFilter | undefined,
}))

vi.mock("./useSurveyResponseFilters", () => ({
  useSurveyResponseFilters: () => ({
    filter: filterState.filter,
    setFilter: vi.fn(),
  }),
}))

vi.mock("@/src/components/beteiligung/shared/utils/getConfigBySurveySlug", () => ({
  getConfigBySurveySlug: () => ({
    status: [
      { value: "PENDING", label: "Ausstehend" },
      { value: "ACCEPTED", label: "Angenommen" },
      { value: "REJECTED", label: "Abgelehnt" },
    ],
    additionalFilters: [
      {
        label: "Landkreis",
        value: "county",
        id: "county",
        surveyPart: "part1",
      },
      {
        label: "Verkehrsmittel",
        value: "transport",
        id: "transport",
        surveyPart: "part2",
      },
    ],
  }),
}))

vi.mock("@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug", () => ({
  getQuestionIdBySurveySlug: (_surveySlug: string, questionId: string) => questionId,
}))

const topics = [
  { id: 1, title: "Filtertest Netzentwurf", archivedAt: null },
  { id: 2, title: "Filtertest Bestand", archivedAt: null },
  { id: 3, title: "Bus", archivedAt: null },
  { id: 4, title: "Busbahnhof", archivedAt: null },
] as SurveyResponseTagsResult["surveyResponseTags"]

function response({
  id,
  status = "PENDING",
  data = {},
  part1 = null,
  tags = [],
}: {
  id: number
  status?: string | null
  data?: Record<string, unknown>
  part1?: Record<string, unknown> | null
  tags?: number[]
}) {
  return {
    id,
    status,
    note: null,
    data,
    surveyPart1ResponseData: part1,
    surveyPart3ResponseData: null,
    surveyResponseComments: [],
    surveyResponseTags: tags,
  } as unknown as FeedbackSurveyResponse
}

function filteredIds(
  filter: SurveyResponseFilter,
  responses: FeedbackSurveyResponse[],
  tagDefinitions = topics,
) {
  filterState.filter = filter

  const { result } = renderHook(() =>
    useFilteredResponses(responses, "radnetz-brandenburg", tagDefinitions),
  )

  return result.current.map((item) => item.id)
}

describe("useFilteredResponses", () => {
  beforeEach(() => {
    filterState.filter = undefined
  })

  test("keeps status filtering multi-select", () => {
    const responses = [
      response({ id: 1, status: "PENDING" }),
      response({ id: 2, status: "ACCEPTED" }),
      response({ id: 3, status: "REJECTED" }),
    ]

    expect(filteredIds({ status: ["PENDING", "ACCEPTED"], searchterm: "" }, responses)).toEqual([
      1, 2,
    ])
  })

  test("treats empty status as all configured statuses", () => {
    const responses = [
      response({ id: 1, status: "PENDING" }),
      response({ id: 2, status: "ACCEPTED" }),
      response({ id: 3, status: "UNKNOWN" }),
    ]

    expect(filteredIds({ status: [], searchterm: "" }, responses)).toEqual([1, 2])
  })

  test("does not apply an advanced filter while its value is ALL", () => {
    const responses = [
      response({ id: 1, part1: null }),
      response({ id: 2, part1: { county: "Potsdam" } }),
    ]

    expect(filteredIds({ status: [], searchterm: "", county: "ALL" }, responses)).toEqual([1, 2])
  })

  test("keeps advanced filters single-value but matches array response answers", () => {
    const responses = [
      response({ id: 1, data: { transport: "bike" } }),
      response({ id: 2, data: { transport: ["bike", "walk"] } }),
      response({ id: 3, data: { transport: "car" } }),
    ]

    expect(filteredIds({ status: [], searchterm: "", transport: "bike" }, responses)).toEqual([
      1, 2,
    ])
  })

  test("uses exact tag matching when the full tag exists", () => {
    const responses = [response({ id: 1, tags: [3] }), response({ id: 2, tags: [4] })]

    expect(filteredIds({ status: [], searchterm: "tag:Bus" }, responses)).toEqual([1])
  })

  test("falls back to partial tag matching when no exact tag exists", () => {
    const responses = [
      response({ id: 1, tags: [1] }),
      response({ id: 2, tags: [2] }),
      response({ id: 3, tags: [3] }),
    ]

    expect(filteredIds({ status: [], searchterm: "tag:Filtertest" }, responses)).toEqual([1, 2])
  })
})
