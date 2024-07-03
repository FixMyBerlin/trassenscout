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
        surveySession: {
          survey: { project: { slug: projectSlug } },
          surveyId,
        },

        surveyPart: 1,
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
