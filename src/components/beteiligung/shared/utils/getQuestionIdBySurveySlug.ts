import {
  AllowedSurveySlugs,
  isSurveyLegacy,
  SurveyLegacySlugs,
} from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getResponseConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"

export const getQuestionIdBySurveySlug = (slug: AllowedSurveySlugs, questionId: string) => {
  if (!isSurveyLegacy(slug)) {
    return questionId
  }
  const { evaluationRefs } = getResponseConfigBySurveySlug(slug as SurveyLegacySlugs)
  // @ts-expect-error todo types
  return String(evaluationRefs[questionId])
}
