import db from "@/db"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetFeedbackSurveyResponsesWithSurveyDataAndComments = {
  projectSlug: string
  surveyId: number
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, surveyId }: GetFeedbackSurveyResponsesWithSurveyDataAndComments) => {
    const rawSurveyResponsePart2 = await db.surveyResponse.findMany({
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
        surveyResponseComments: {
          select: {
            id: true,
            surveyResponseId: true,
            createdAt: true,
            updatedAt: true,
            body: true,
            author: {
              select: {
                id: true,
                role: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    })

    const rawSurveyResponsePart1 = await db.surveyResponse.findMany({
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

    const rawSurveyResponsePart3 = await db.surveyResponse.findMany({
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
        surveyPart: 3,
      },
    })

    const additionalFilters = rawSurveyResponsePart2.length
      ? getConfigBySurveySlug(
          rawSurveyResponsePart2[0]?.surveySession.survey.slug as AllowedSurveySlugs,
          "backend",
        )?.additionalFilters
      : []

    const rawSurveyResponsePart2WithPart1AndPart3Responses = rawSurveyResponsePart2?.map(
      (responsePart2) => {
        const surveyPart1ResponseData = rawSurveyResponsePart1.find(
          (responsePart1) => responsePart1.surveySessionId === responsePart2.surveySessionId,
        )?.data
        const surveyPart3ResponseData = rawSurveyResponsePart3.find(
          (responsePart1) => responsePart1.surveySessionId === responsePart2.surveySessionId,
        )?.data
        return { ...responsePart2, surveyPart1ResponseData, surveyPart3ResponseData }
      },
    )

    const parsedAndSorted = rawSurveyResponsePart2WithPart1AndPart3Responses
      // Make `data` an object to work with…
      .map((response) => {
        const data = JSON.parse(response.data)
        const surveyResponseTopics = response.surveyResponseTopics.map((topic) => topic.id)
        const surveyPart1ResponseData = response.surveyPart1ResponseData
          ? JSON.parse(response.surveyPart1ResponseData)
          : null
        const surveyPart3ResponseData = response.surveyPart3ResponseData
          ? JSON.parse(response.surveyPart3ResponseData)
          : null
        return {
          ...response,
          data,
          surveyResponseTopics,
          surveyPart1ResponseData,
          surveyPart3ResponseData,
        }
      })
      // Sometimes the fronted received a different order for unknown reasons
      .sort((a, b) => b.id - a.id)

    const additionalFilterQuestionsWithResponseOptions = additionalFilters?.map((question) => {
      const questionDatas = parsedAndSorted
        .map((responseItem) => {
          let result: string | null
          if (question.surveyPart === "part1") {
            result = responseItem.surveyPart1ResponseData
              ? // @ts-expect-error data
                responseItem.surveyPart1ResponseData[String(question.id)]
              : null
          } else if (question.surveyPart === "part3") {
            result = responseItem.surveyPart3ResponseData
              ? // @ts-expect-error data
                responseItem.surveyPart3ResponseData[String(question.id)]
              : null
          } else {
            // @ts-expect-error data
            result = responseItem.data[String(question.id)]
          }
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

    return {
      feedbackSurveyResponses: parsedAndSorted,
      // for the filter form on /responses we return all response options for additional filters
      additionalFilterQuestionsWithResponseOptions,
    }
  },
)
