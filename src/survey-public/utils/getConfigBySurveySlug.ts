import { responseConfig as FRM7ResponseConfig } from "@/src/survey-public/frm7/data/response-config"
import { responseConfig as BBResponseConfig } from "@/src/survey-public/radnetz-brandenburg/data/response-config"
import { responseConfig as RS8ResponseConfig } from "@/src/survey-public/rs8/data/response-config"
import { AllowedSurveySlugsLegacy } from "./allowedSurveySlugs"

export const getResponseConfigBySurveySlugLegacy = (slug: AllowedSurveySlugsLegacy) => {
  switch (slug) {
    case "rs8":
      return RS8ResponseConfig
    case "frm7":
      return FRM7ResponseConfig
    case "radnetz-brandenburg":
      return BBResponseConfig
  }
}
