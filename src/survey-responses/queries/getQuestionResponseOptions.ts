import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { TBackendConfig } from "@/src/survey-public/utils/backend-config-defaults"
import { resolver } from "@blitzjs/rpc"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetQuestionResponseOptions = {
  projectSlug: string
  surveyId: number
  questions: NonNullable<TBackendConfig["additionalFilters"]>
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, surveyId, questions }: GetQuestionResponseOptions) => {
    if (!questions) return null
    const rawSurveyResponse = await db.surveyResponse.findMany({
      where: {
        surveySession: {
          survey: { project: { slug: projectSlug } },
          surveyId,
        },
      },
      orderBy: { id: "desc" },
      select: { data: true },
    })

    const parsedSurveyResponse = rawSurveyResponse
      // Make `data` an object to work with…
      .map((response) => {
        return JSON.parse(response.data)
      })

    const additionalFilterQuestionsWithResponseOptions = questions.map((question) => {
      const questionDatas = parsedSurveyResponse
        .map((data) => {
          //  @ts-expect-error
          const result = data[String(question.id)]
          return result
        })
        .filter(Boolean)
      // Remove duplicates and sort alphabetically
      let uniqueSortedResponseOptions = Array.from(new Set(questionDatas))
        .sort()
        .map((option) => {
          return { value: option, label: option }
        })
      // Add "Alle" to the beginning of the options array
      uniqueSortedResponseOptions = [
        { value: "ALL", label: "Alle" },
        ...uniqueSortedResponseOptions,
      ]
      return { ...question, options: uniqueSortedResponseOptions }
    })

    return additionalFilterQuestionsWithResponseOptions
  },
)
