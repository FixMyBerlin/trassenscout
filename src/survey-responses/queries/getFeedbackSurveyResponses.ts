import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

type GetSurveySessionsWithResponsesInput = { projectSlug: string; surveyId: number }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, surveyId }: GetSurveySessionsWithResponsesInput) => {
    const rawSurveyResponse = await db.surveyResponse.findMany({
      where: {
        // Only surveyResponse.session.project === projectSlug
        surveySession: {
          survey: { project: { slug: projectSlug } },
          // Only surveyResponse.surveyId === surveyId
          surveyId,
        },
        // Only surveyResponse.surveyId === 2 which
        // Reminder: `response.surveyId` is NOT a relation field
        // the field here just represents first or second part of the survey json
        // surveyId `2` is src/participation/data/feedback.json
        surveyId: 2,
      },
      orderBy: { id: "desc" },
      include: {
        operator: { select: { id: true, title: true } },
        // surveyResponseTopics: {
        //   include: {
        //     surveyResponseTopic: { select: { id: true, title: true } },
        //   },
        // },
        surveyResponseTopics: true,
      },
    })

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
      .sort((a, b) => b.id - a.id)

    return parsedAndSorted
  },
)
