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

function parseSurveyResponseFilterParam(value: string | undefined) {
  if (!value) return undefined
  try {
    return surveyResponseFilterSchema.parse(JSON.parse(value))
  } catch {
    return undefined
  }
}

export function serializeSurveyResponseFilterParam(filter: SurveyResponseFilter | undefined) {
  if (!filter) return undefined
  return JSON.stringify(filter)
}

function parseSelectedResponsesParam(value: string | undefined) {
  if (!value) return undefined
  const ids = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0)
  return ids.length > 0 ? ids : undefined
}

export const surveyResponsesSearchSchema = z.object({
  responseDetails: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => (value === undefined ? undefined : String(value))),
  filter: z
    .union([z.string(), surveyResponseFilterSchema])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      if (typeof value === "string") return parseSurveyResponseFilterParam(value)
      return surveyResponseFilterSchema.parse(value)
    }),
  selectedResponses: z
    .string()
    .optional()
    .transform((value) => parseSelectedResponsesParam(value)),
})

export type SurveyResponsesSearch = z.infer<typeof surveyResponsesSearchSchema>

export function surveyResponsesSearchToRaw(
  search: Pick<SurveyResponsesSearch, "responseDetails" | "filter" | "selectedResponses">,
) {
  return {
    responseDetails: search.responseDetails,
    filter: search.filter ? serializeSurveyResponseFilterParam(search.filter) : undefined,
    selectedResponses: search.selectedResponses?.length
      ? search.selectedResponses.join(",")
      : undefined,
  }
}
