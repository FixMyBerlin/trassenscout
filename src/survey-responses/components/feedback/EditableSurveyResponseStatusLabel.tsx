import { StatusLabel } from "@/src/core/components/Status/StatusLabel"
import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import { getBackendConfigBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"

type Props = {
  status?: string | null
  surveySlug: AllowedSurveySlugs
}

export const EditableSurveyResponseStatusLabel = ({ status, surveySlug }: Props) => {
  if (!status) return null

  const backendConfigStatus = getBackendConfigBySurveySlug(surveySlug).status
  const statusConfig = backendConfigStatus?.find((s) => s.value === status)

  if (!statusConfig) {
    console.log(
      `Missmatch statusConfig: check DB entries status for ${surveySlug}-Beteiligung: ${status} is stored in the DB but could not be found in backend-config.ts of ${surveySlug}`,
    )
    return null
  }

  return (
    <StatusLabel
      icon={statusConfig.icon}
      label={statusConfig.label}
      colorClass={statusConfig.colorClass}
    />
  )
}
