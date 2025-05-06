import { formConfig as FRM7Config } from "@/src/app/beteiligung-neu/_frm7-neu/config"
import { formConfig as Test23Config } from "@/src/app/beteiligung-neu/_rstest-2-3/config"
import { formConfig as TestConfig } from "@/src/app/beteiligung-neu/_rstest/config"
import { FormConfig } from "@/src/app/beteiligung-neu/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"

export const getConfigBySurveySlug = <K extends keyof FormConfig>(
  slug: AllowedSurveySlugs,
  part: K,
): FormConfig[K] => {
  switch (slug) {
    case "frm7-neu":
      return FRM7Config[part]
    case "rstest":
      return TestConfig[part]
    case "rstest-2-3":
      return Test23Config[part]
    case "frm7":
      // todo
      return FRM7Config[part]
    case "rs8":
      return FRM7Config[part]
    // todo
    case "radnetz-brandenburg":
      return FRM7Config[part]
    // todo
  }
}
