import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { StatusLabel } from "@/src/components/core/components/Status/StatusLabel"

type Props = {
  status?: string | null
  surveySlug: AllowedSurveySlugs
}

export const EditableSurveyResponseStatusLabel = ({ status, surveySlug }: Props) => {
  if (!status) return null

  const backendConfigStatus = getConfigBySurveySlug(surveySlug, "backend").status
  const statusConfig = backendConfigStatus?.find((s) => s.value === status)

  if (!statusConfig) {
    console.log(
      `Missmatch statusConfig: check DB entries status for ${surveySlug}-Beteiligung: ${status} is stored in the DB but could not be found in backend-config.ts of ${surveySlug}`,
    )
    return null
  }

  return (
    <StatusLabel
      className="max-w-full @max-xl:gap-2 @max-xl:px-3"
      icon={statusConfig.icon}
      label={statusConfig.label}
      color={statusConfig.color}
    />
  )
}
