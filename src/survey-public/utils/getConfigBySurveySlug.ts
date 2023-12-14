import { responseConfig as FRM7ResponseConfig } from "src/survey-public/frm7/data/response-config"
import { responseConfig as RS8ResponseConfig } from "src/survey-public/rs8/data/response-config"

import { feedbackDefinition as feedbackDefinitionFRM7 } from "src/survey-public/frm7/data/feedback"
import { feedbackDefinition as feedbackDefinitionRS8 } from "src/survey-public/rs8/data/feedback"

import { surveyDefinition as surveyDefinitionFRM7 } from "src/survey-public/frm7/data/survey"
import { surveyDefinition as surveyDefinitionRS8 } from "src/survey-public/rs8/data/survey"

export const getResponseConfigBySurveySlug = (slug: string) => {
  switch (slug) {
    case "rs8":
      return RS8ResponseConfig
    case "frm7":
      return FRM7ResponseConfig
    default:
      return RS8ResponseConfig
  }
}

export const getFeedbackDefinitionBySurveySlug = (slug: string) => {
  switch (slug) {
    case "rs8":
      return feedbackDefinitionRS8
    case "frm7":
      return feedbackDefinitionFRM7
    default:
      return feedbackDefinitionRS8
  }
}
export const getSurveyDefinitionBySurveySlug = (slug: string) => {
  switch (slug) {
    case "rs8":
      return surveyDefinitionRS8
    case "frm7":
      return surveyDefinitionFRM7
    default:
      return surveyDefinitionRS8
  }
}
