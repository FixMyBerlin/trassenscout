import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import {
  getBackendConfigBySurveySlug,
  getResponseConfigBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import { resolver } from "@blitzjs/rpc"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetFeedbackSurveyResponsesWithSurveyDataAndComments = {
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
  }: GetFeedbackSurveyResponsesWithSurveyDataAndComments) => {
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

    const questions = getBackendConfigBySurveySlug(
      rawFeedbackSurveyResponse[0]!.surveySession.survey.slug as AllowedSurveySlugs,
    ).additionalFilters

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

    const additionalFilterQuestionsWithResponseOptions = questions?.map((question) => {
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
      // for the map view we only return responses with location
      feedbackSurveyResponses: withLocationOnly
        ? parsedAndSorted.filter(
            // @ts-expect-error
            (response) => response.data[evaluationRefs["feedback-location"]],
          )
        : parsedAndSorted,
      // for the filter form on /responses we return all response options for additional filters
      additionalFilterQuestionsWithResponseOptions,
    }
  },
)
