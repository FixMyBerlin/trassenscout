import { notFound } from "@tanstack/react-router"
import { beteiligungSurveySlugParamsSchema } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"

export function parseBeteiligungSurveySlugRouteParams(raw: Record<string, string>) {
  const parsed = beteiligungSurveySlugParamsSchema.safeParse(raw)
  if (!parsed.success) {
    throw notFound()
  }
  return parsed.data
}
