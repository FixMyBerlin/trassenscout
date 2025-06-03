import db from "@/db"
import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
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

    const additionalFilters = getConfigBySurveySlug(
      rawFeedbackSurveyResponse[0]!.surveySession.survey.slug as AllowedSurveySlugs,
      "backend",
    ).additionalFilters

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
        const surveyResponseTopics = response.surveyResponseTopics.map((topic) => topic.id)
        const surveySurveyResponseData = response.surveySurveyResponseData
          ? JSON.parse(response.surveySurveyResponseData)
          : null
        return { ...response, data, surveyResponseTopics, surveySurveyResponseData }
      })
      // Sometimes the fronted received a different order for unknown reasons
      .sort((a, b) => b.id - a.id)

    const additionalFilterQuestionsWithResponseOptions = additionalFilters?.map((question) => {
      const questionDatas = parsedAndSorted
        .map((responseItem) => {
          let result: string | null
          if (question.surveyPart === "survey") {
            result = responseItem.surveySurveyResponseData
              ? // @ts-expect-error data
                responseItem.surveySurveyResponseData[String(question.id)]
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
