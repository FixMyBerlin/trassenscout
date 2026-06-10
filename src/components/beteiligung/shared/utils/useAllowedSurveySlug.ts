import { Route } from "@/src/routes/beteiligung/$surveySlug/index"

/** Route params.parse rejects unknown slugs before render. */
export function useAllowedSurveySlug() {
  return Route.useParams().surveySlug
}
