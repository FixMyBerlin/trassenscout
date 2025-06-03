import db from "@/db"
import {
  AllowedSurveySlugsSchema,
  isSurveyLegacy,
  SurveyLegacySlugs,
} from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import { getResponseConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"

import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(
  resolver.zod(AllowedSurveySlugsSchema),
  resolver.authorize("ADMIN"),
  async ({ slug }) => {
    const isLegacy = isSurveyLegacy(slug)
    const userFeedbackTextQuestionId = isLegacy
      ? getResponseConfigBySurveySlug(slug as SurveyLegacySlugs)?.evaluationRefs["usertext-1"]
      : "feedbackText"

    const surveySessions = await db.surveySession.findMany({
      where: { survey: { slug: slug } },
      include: { responses: true },
    })

    let filteredSurveyResponses: (typeof surveySessions)[number]["responses"] = []

    surveySessions.forEach(({ responses }) => {
      if (
        // if either of the conditions is met, add the responses of the sesseion to the filteredSurveyResponses
        responses.some((response) => {
          const data = JSON.parse(response.data)
          return (
            // survey part 2 / "Hinweis" and contains "test" in the first 20 characters of the user text
            (response.surveyPart === 2 &&
              // @ts-expect-error data is of type unknown
              data[userFeedbackTextQuestionId]?.substring(0, 20).toLowerCase().includes("test")) ||
            // survey is BB and survey part 1 / "Umfrage" and institution is "FixMyCity"
            // @ts-expect-error data is of type unknown
            (response.surveyPart === 1 && slug === "radnetz-brandenburg" && data[5] === "FixMyCity")
          )
        })
      )
        filteredSurveyResponses = [...filteredSurveyResponses, ...responses]
    })

    return filteredSurveyResponses
  },
)
