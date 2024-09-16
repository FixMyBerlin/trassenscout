import { backendConfig as backendConfigFRM7 } from "src/survey-public/frm7/data/backend-config"
import { feedbackDefinition as feedbackDefinitionFRM7 } from "src/survey-public/frm7/data/feedback"
import { responseConfig as FRM7ResponseConfig } from "src/survey-public/frm7/data/response-config"
import { surveyDefinition as surveyDefinitionFRM7 } from "src/survey-public/frm7/data/survey"
import { backendConfig as backendConfigBB } from "src/survey-public/radnetz-brandenburg/data/backend-config"
import { feedbackDefinition as feedbackDefinitionBB } from "src/survey-public/radnetz-brandenburg/data/feedback"
import { responseConfig as BBResponseConfig } from "src/survey-public/radnetz-brandenburg/data/response-config"
import { surveyDefinition as surveyDefinitionBB } from "src/survey-public/radnetz-brandenburg/data/survey"
import { backendConfig as backendConfigRS8 } from "src/survey-public/rs8/data/backend-config"
import { feedbackDefinition as feedbackDefinitionRS8 } from "src/survey-public/rs8/data/feedback"
import { responseConfig as RS8ResponseConfig } from "src/survey-public/rs8/data/response-config"
import { surveyDefinition as surveyDefinitionRS8 } from "src/survey-public/rs8/data/survey"
import { AllowedSurveySlugs } from "./allowedSurveySlugs"

export const getResponseConfigBySurveySlug = (slug: AllowedSurveySlugs) => {
  switch (slug) {
    case "rs8":
      return RS8ResponseConfig
    case "frm7":
      return FRM7ResponseConfig
    case "radnetz-brandenburg":
      return BBResponseConfig
  }
}

export const getFeedbackDefinitionBySurveySlug = (slug: AllowedSurveySlugs) => {
  switch (slug) {
    case "rs8":
      return feedbackDefinitionRS8
    case "frm7":
      return feedbackDefinitionFRM7
    case "radnetz-brandenburg":
      return feedbackDefinitionBB
  }
}
export const getSurveyDefinitionBySurveySlug = (slug: AllowedSurveySlugs) => {
  switch (slug) {
    case "rs8":
      return surveyDefinitionRS8
    case "frm7":
      return surveyDefinitionFRM7
    case "radnetz-brandenburg":
      return surveyDefinitionBB
  }
}

export const getBackendConfigBySurveySlug = (slug: AllowedSurveySlugs) => {
  switch (slug) {
    case "rs8":
      return backendConfigRS8
    case "frm7":
      return backendConfigFRM7
    case "radnetz-brandenburg":
      return backendConfigBB
  }
}
