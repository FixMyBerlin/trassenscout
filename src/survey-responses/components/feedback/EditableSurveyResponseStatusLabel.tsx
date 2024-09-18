import { StatusLabel } from "@/src/core/components/Status/StatusLabel"
import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import { backendConfig as defaultBackendConfig } from "@/src/survey-public/utils/backend-config-defaults"
import { getBackendConfigBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"

type Props = {
  status?: string | null
  surveySlug: AllowedSurveySlugs
}

export const EditableSurveyResponseStatusLabel = ({ status, surveySlug }: Props) => {
  if (!status) return null

  const backendConfigStatus =
    getBackendConfigBySurveySlug(surveySlug).status || defaultBackendConfig.status

  const statusConfig = backendConfigStatus.find((s) => s.value === status)!

  return (
    <StatusLabel
      icon={statusConfig.icon}
      label={statusConfig.label}
      colorClass={statusConfig.colorClass}
    />
  )
}
