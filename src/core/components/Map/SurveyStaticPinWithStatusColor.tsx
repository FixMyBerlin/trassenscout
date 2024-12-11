import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import { getBackendConfigBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import * as React from "react"
import SurveyStaticPin from "./SurveyStaticPin"

type Props = {
  status: string
  surveySlug: AllowedSurveySlugs
  selected?: boolean
  small?: boolean
}

export const SurveyStaticPinWithStatusColor: React.FC<Props> = ({
  status,
  surveySlug,
  selected,
  small,
}) => {
  const { status: statusConfig } = getBackendConfigBySurveySlug(surveySlug)
  const statusColor = statusConfig?.find((s) => s.value === status)?.color
  return (
    <SurveyStaticPin surveySlug={surveySlug} small={small} light={!selected} color={statusColor} />
  )
}
