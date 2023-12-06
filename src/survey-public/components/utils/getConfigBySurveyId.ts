import { responseConfig as FRM7ResponseConfig } from "src/survey-public/frm7/data/response-config"
import { responseConfig as RS8ResponseConfig } from "src/survey-public/rs8/data/response-config"

import { feedbackDefinition as feedbackDefinitionFRM7 } from "src/survey-public/frm7/data/feedback"
import { feedbackDefinition as feedbackDefinitionRS8 } from "src/survey-public/rs8/data/feedback"

import { surveyDefinition as surveyDefinitionFRM7 } from "src/survey-public/frm7/data/survey"
import { surveyDefinition as surveyDefinitionRS8 } from "src/survey-public/rs8/data/survey"

export const getResponseConfigBySurveyId = (id: number | string) => {
  id = Number(id)
  switch (id) {
    case 1:
      return RS8ResponseConfig
    case 2:
      return FRM7ResponseConfig
    default:
      return RS8ResponseConfig
  }
}

export const getFeedbackDefinitionBySurveyId = (id: number | string) => {
  id = Number(id)
  switch (id) {
    case 1:
      return feedbackDefinitionRS8
    case 2:
      return feedbackDefinitionFRM7
    default:
      return feedbackDefinitionRS8
  }
}
export const getSurveyDefinitionBySurveyId = (id: number | string) => {
  id = Number(id)
  switch (id) {
    case 1:
      return surveyDefinitionRS8
    case 2:
      return surveyDefinitionFRM7
    default:
      return surveyDefinitionRS8
  }
}
