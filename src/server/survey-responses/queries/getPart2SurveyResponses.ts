import db, { SurveyResponseStateEnum } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"

type GetSurveySessionsWithResponsesInput = { projectSlug: string; surveyId: number }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, surveyId }: GetSurveySessionsWithResponsesInput) => {
    const rawSurveyResponse = await db.surveyResponse.findMany({
      where: {
        state: SurveyResponseStateEnum.SUBMITTED,
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
        surveySession: { select: { createdAt: true, id: true } },
      },
    })

    const parsedAndSorted = rawSurveyResponse
      // Make `data` an object to work with…
      .map((response) => {
        const data = JSON.parse(response.data)
        // maybe we do not need the topics in this query todo
        const surveyResponseTopics = response.surveyResponseTopics.map((topic) => topic.id)
        return { ...response, data, surveyResponseTopics }
      })
      // Sometimes the fronted received a different order for unknown reasons
      .sort((a, b) => b.id - a.id)

    return parsedAndSorted
  },
)
