import { formConfig as FRM7Config } from "@/src/app/beteiligung-neu/_frm7-neu/config"
import { formConfig as BBConfig } from "@/src/app/beteiligung-neu/_radnetz-brandenbrug/config"
import { formConfig as RS8Config } from "@/src/app/beteiligung-neu/_rs8/config"
import { formConfig as TestConfig } from "@/src/app/beteiligung-neu/_rstest-1-2-3/config"
import { formConfig as Test1Config } from "@/src/app/beteiligung-neu/_rstest-1/config"
import { formConfig as Test23Config } from "@/src/app/beteiligung-neu/_rstest-2-3/config"
import { formConfig as Test2Config } from "@/src/app/beteiligung-neu/_rstest-2/config"
import { FormConfig, Stage } from "@/src/app/beteiligung-neu/_shared/types"
import {
  AllowedSurveySlugs,
  SurveyLegacySlugs,
} from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"

export const getConfigBySurveySlug = <K extends keyof FormConfig>(
  slug: AllowedSurveySlugs,
  part: K,
): FormConfig[K] => {
  switch (slug) {
    // todo frm7
    case "frm7-neu":
      return FRM7Config[part]
    case "frm7":
      return FRM7Config[part]
    case "rstest-1-2-3":
      return TestConfig[part]
    case "rstest-2-3":
      return Test23Config[part]
    case "rstest-2":
      return Test2Config[part]
    case "rstest-1":
      return Test1Config[part]
    case "rs8":
      return RS8Config[part]
    case "radnetz-brandenburg":
      return BBConfig[part]
  }
}

export const getprogressBarDefinitionBySurveySlug = (slug: AllowedSurveySlugs, part: Stage) => {
  return getConfigBySurveySlug(slug, part)!.progressBarDefinition
}

import { responseConfig as FRM7ResponseConfig } from "@/src/app/beteiligung-neu/_frm7-neu/response-config"
import { responseConfig as BBResponseConfig } from "@/src/app/beteiligung-neu/_radnetz-brandenbrug/response-config"
import { responseConfig as RS8ResponseConfig } from "@/src/app/beteiligung-neu/_rs8/response-config"

// This function returns the response configuration based on the survey slug of legacy surveys.
// After the migration we use "location" / "feedbackText" / "feedbackText2"... as question IDs in the DB.
// As we do not want to migrate the legacy survey results in the DB, we need to get the legacy response config.
export const getResponseConfigBySurveySlug = (slug: SurveyLegacySlugs) => {
  switch (slug) {
    case "rs8":
      return RS8ResponseConfig
    case "frm7":
      return FRM7ResponseConfig
    case "radnetz-brandenburg":
      return BBResponseConfig
  }
}
