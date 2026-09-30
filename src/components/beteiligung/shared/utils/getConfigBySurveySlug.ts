import { FormConfig, Stage } from "@/src/components/beteiligung/shared/types"
import {
  AllowedSurveySlugs,
  SurveyLegacySlugs,
} from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { formConfig as FRM7Config } from "@/src/components/beteiligung/surveys/frm7/config"
import { formConfig as SurveyOhvHaltestellenfoerderungConfig } from "@/src/components/beteiligung/surveys/ohv-haltestellenfoerderung/config"
import { formConfig as BBConfig } from "@/src/components/beteiligung/surveys/radnetz-brandenbrug/config"
import { formConfig as SurveyRadschnellverbindungenInfoFeedbackConfig } from "@/src/components/beteiligung/surveys/radschnellverbindungen-info-feedback/config"
import { formConfig as RS8Config } from "@/src/components/beteiligung/surveys/rs8/config"
import { formConfig as TestConfig } from "@/src/components/beteiligung/surveys/rstest-1-2-3/config"
import { formConfig as Test1Config } from "@/src/components/beteiligung/surveys/rstest-1/config"
import { formConfig as Test23Config } from "@/src/components/beteiligung/surveys/rstest-2-3/config"
import { formConfig as Test2Config } from "@/src/components/beteiligung/surveys/rstest-2/config"

// New surveys: add one line here (and the slug in `allowedSurveySlugs.ts`).
// See `src/components/beteiligung/surveys/AGENTS.md`.
const surveyConfigs: Record<AllowedSurveySlugs, FormConfig> = {
  frm7: FRM7Config,
  "rstest-1-2-3": TestConfig,
  "rstest-2-3": Test23Config,
  "rstest-2": Test2Config,
  "rstest-1": Test1Config,
  rs8: RS8Config,
  "radnetz-brandenburg": BBConfig,
  "ohv-haltestellenfoerderung": SurveyOhvHaltestellenfoerderungConfig,
  "radschnellverbindungen-info-feedback": SurveyRadschnellverbindungenInfoFeedbackConfig,
}

export const getConfigBySurveySlug = <K extends keyof FormConfig>(
  slug: AllowedSurveySlugs,
  part: K,
) => {
  return surveyConfigs[slug][part]
}

export const getprogressBarDefinitionBySurveySlug = (slug: AllowedSurveySlugs, part: Stage) => {
  return getConfigBySurveySlug(slug, part)!.progressBarDefinition
}

import { responseConfig as FRM7ResponseConfig } from "@/src/components/beteiligung/surveys/frm7/response-config"
import { responseConfig as BBResponseConfig } from "@/src/components/beteiligung/surveys/radnetz-brandenbrug/response-config"
import { responseConfig as RS8ResponseConfig } from "@/src/components/beteiligung/surveys/rs8/response-config"

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
