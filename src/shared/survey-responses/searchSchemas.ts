import { z } from "zod"

const surveyResponseFilterSchema = z.looseObject({
  status: z.array(z.string()),
  operator: z.string(),
  hasnotes: z.enum(["true", "false", "ALL"]),
  haslocation: z.enum(["true", "false", "ALL"]),
  categories: z.array(z.string()),
  topics: z.array(z.string()),
  searchterm: z.string(),
})

export type SurveyResponseFilter = z.infer<typeof surveyResponseFilterSchema>

function parseSurveyResponseFilterParam(value: unknown) {
  if (value === undefined) return undefined

  if (typeof value === "string") {
    if (!value) return undefined

    try {
      return surveyResponseFilterSchema.parse(JSON.parse(value))
    } catch {
      return undefined
    }
  }

  return surveyResponseFilterSchema.safeParse(value).data
}

function serializeSurveyResponseFilterParam(filter: SurveyResponseFilter | undefined) {
  if (!filter) return undefined
  return JSON.stringify(filter)
}

function toPositiveInteger(value: unknown) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : undefined
  }

  if (typeof value !== "string") return undefined

  const trimmedValue = value.trim()
  if (!trimmedValue) return undefined

  const numericValue = Number(trimmedValue)
  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : undefined
}

function parseResponseDetailsParam(value: unknown) {
  if (value === undefined) return undefined

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      const parsedInteger = toPositiveInteger(parsed)
      if (parsedInteger !== undefined) return parsedInteger
    } catch {
      // Keep plain query-param values as-is.
    }
  }

  return toPositiveInteger(value)
}

function parseSelectedResponsesParam(value: unknown) {
  if (value === undefined) return undefined

  if (Array.isArray(value)) {
    const ids = value
      .map((part) => toPositiveInteger(part))
      .filter((id): id is number => id !== undefined)

    return ids.length > 0 ? Array.from(new Set(ids)) : undefined
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (parsed !== value) return parseSelectedResponsesParam(parsed)
    } catch {
      // Keep plain comma-separated query values as-is.
    }

    const ids = value
      .split(",")
      .map((part) => toPositiveInteger(part))
      .filter((id): id is number => id !== undefined)

    return ids.length > 0 ? Array.from(new Set(ids)) : undefined
  }

  const singleId = toPositiveInteger(value)
  return singleId !== undefined ? [singleId] : undefined
}

function normalizeSelectedResponsesRouteParam(value: unknown) {
  if (value === undefined) return undefined

  if (Array.isArray(value)) {
    const ids = value
      .map((part) => toPositiveInteger(part))
      .filter((id): id is number => id !== undefined)

    return ids.length > 0 ? ids.join(",") : undefined
  }

  if (typeof value === "string") {
    return value || undefined
  }

  const singleId = toPositiveInteger(value)
  return singleId !== undefined ? String(singleId) : undefined
}

export const surveyResponsesSearchSchema = z.object({
  responseDetails: z.preprocess(
    (value) => parseResponseDetailsParam(value),
    z.number().int().positive().optional(),
  ),
  filter: z.preprocess(
    (value) => parseSurveyResponseFilterParam(value),
    surveyResponseFilterSchema.optional(),
  ),
  selectedResponses: z.preprocess(
    (value) => normalizeSelectedResponsesRouteParam(value),
    z.coerce.string().optional(),
  ),
})

export type SurveyResponsesRouteSearch = z.infer<typeof surveyResponsesSearchSchema>

export type SurveyResponsesSearch = {
  responseDetails?: SurveyResponsesRouteSearch["responseDetails"]
  filter?: SurveyResponsesRouteSearch["filter"]
  selectedResponses?: number[]
}

export function parseSurveyResponsesSearch(
  search: SurveyResponsesRouteSearch,
): SurveyResponsesSearch {
  return {
    responseDetails: search.responseDetails,
    filter: search.filter,
    selectedResponses: parseSelectedResponsesParam(search.selectedResponses),
  }
}

export function surveyResponsesSearchToRaw(
  search: Pick<SurveyResponsesSearch, "responseDetails" | "filter" | "selectedResponses">,
) {
  return {
    responseDetails:
      search.responseDetails !== undefined ? String(search.responseDetails) : undefined,
    filter: serializeSurveyResponseFilterParam(search.filter),
    selectedResponses: search.selectedResponses?.length
      ? search.selectedResponses.join(",")
      : undefined,
  }
}
