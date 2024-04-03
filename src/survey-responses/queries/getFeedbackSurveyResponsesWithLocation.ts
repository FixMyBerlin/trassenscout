import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { getResponseConfigBySurveySlug } from "src/survey-public/utils/getConfigBySurveySlug"

type GetFeedbackSurveyResponsesWithLocationInput = { projectSlug: string; surveyId: number }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, surveyId }: GetFeedbackSurveyResponsesWithLocationInput) => {
    const rawSurveyResponse = await db.surveyResponse.findMany({
      where: {
        // Only surveyResponse.session.project === projectSlug
        surveySession: {
          survey: { project: { slug: projectSlug } },
          // Only surveyResponse.surveyId === surveyId
          surveyId,
        },
        surveyPart: 2,
      },
      orderBy: { id: "desc" },
      include: {
        operator: { select: { id: true, title: true, slug: true } },
        surveyResponseTopics: true,
        surveySession: { include: { survey: { select: { slug: true } } } },
      },
    })

    if (!rawSurveyResponse?.length) throw new NotFoundError()

    const { evaluationRefs } = getResponseConfigBySurveySlug(
      rawSurveyResponse[0]!.surveySession.survey.slug,
    )

    const parsedAndSorted = rawSurveyResponse
      // Make `data` an object to work with…
      .map((response) => {
        const data = JSON.parse(response.data)
        const surveyResponseTopics = response.surveyResponseTopics.map(
          (topic) => topic.surveyResponseTopicId,
        )
        return { ...response, data, surveyResponseTopics }
      })
      // Sometimes the fronted received a different order for unknown reasons
      // @ts-expect-error
      .filter((response) => response.data[evaluationRefs["feedback-location"]])
      .sort((a, b) => b.id - a.id)

    return {
      surveyResponsesFeedbackPartWithLocation: parsedAndSorted,
    }
  },
)
