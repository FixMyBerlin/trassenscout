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
        surveySession: {
          survey: { project: { slug: projectSlug } },
          surveyId,
        },
      },
      orderBy: { id: "desc" },
      include: {
        surveySession: true,
      },
    })

    const parsedAndSorted = rawSurveyResponse
      // Make `data` an object to work with…
      .map((response) => {
        const data = JSON.parse(response.data)
        return { ...response, data }
      })
      // Sometimes the fronted received a different order for unknown reasons
      .sort((a, b) => b.id - a.id)

    return parsedAndSorted
  },
)
