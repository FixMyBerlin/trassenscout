import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import { getResponseConfigBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import { resolver } from "@blitzjs/rpc"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetFeedbackSurveyResponsesWithSurveySurveyResponsesInput = {
  projectSlug: string
  surveyId: number
  withLocationOnly?: boolean
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({
    projectSlug,
    surveyId,
    withLocationOnly,
  }: GetFeedbackSurveyResponsesWithSurveySurveyResponsesInput) => {
    const rawFeedbackSurveyResponse = await db.surveyResponse.findMany({
      where: {
        // Only surveyResponse.session.project === projectSlug
        surveySession: {
          survey: { project: { slug: projectSlug } },
          // Only surveyResponse.surveyId === surveyId
          surveyId,
        },
        // Only surveyResponse.surveyPart === 2
        // the field here just represents first or second part of the survey json
        // surveyPart `2` in feedback.ts
        surveyPart: 2,
      },
      orderBy: { id: "desc" },
      include: {
        operator: { select: { id: true, title: true, slug: true } },
        surveyResponseTopics: true,
        surveySession: { include: { survey: { select: { slug: true } } } },
      },
    })

    const rawSurveySurveyResponse = await db.surveyResponse.findMany({
      where: {
        // Only surveyResponse.session.project === projectSlug
        surveySession: {
          survey: { project: { slug: projectSlug } },
          // Only surveyResponse.surveyId === surveyId
          surveyId,
        },
        // Only surveyResponse.surveyPart === 2
        // the field here just represents first or second part of the survey json
        // surveyPart `1` in survey.ts
        surveyPart: 1,
      },
    })

    const { evaluationRefs } = getResponseConfigBySurveySlug(
      rawFeedbackSurveyResponse[0]!.surveySession.survey.slug as AllowedSurveySlugs,
    )

    const rawFeedbackSurveyResponseWithSurveySurveyResponses = rawFeedbackSurveyResponse.map(
      (response) => {
        const surveySurveyResponseData = rawSurveySurveyResponse.find(
          (surveyResponse) => surveyResponse.surveySessionId === response.surveySessionId,
        )?.data
        return { ...response, surveySurveyResponseData }
      },
    )

    const parsedAndSorted = rawFeedbackSurveyResponseWithSurveySurveyResponses
      // Make `data` an object to work with…
      .map((response) => {
        const data = JSON.parse(response.data)
        const surveyResponseTopics = response.surveyResponseTopics.map(
          (topic) => topic.surveyResponseTopicId,
        )
        const surveySurveyResponseData = response.surveySurveyResponseData
          ? JSON.parse(response.surveySurveyResponseData)
          : null
        return { ...response, data, surveyResponseTopics, surveySurveyResponseData }
      })
      // Sometimes the fronted received a different order for unknown reasons
      .sort((a, b) => b.id - a.id)

    if (withLocationOnly)
      return parsedAndSorted.filter(
        // @ts-expect-error
        (response) => response.data[evaluationRefs["feedback-location"]],
      )
    return parsedAndSorted
  },
)
