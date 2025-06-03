import { getConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
import { StatusLabel } from "@/src/core/components/Status/StatusLabel"
import { AllowedSurveySlugsLegacy } from "@/src/survey-public/utils/allowedSurveySlugs"

type Props = {
  status?: string | null
  surveySlug: AllowedSurveySlugsLegacy
  short?: boolean
}

export const EditableSurveyResponseStatusLabel = ({ status, surveySlug, short }: Props) => {
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
      className={short ? "w-[200px] truncate" : ""}
      icon={statusConfig.icon}
      label={statusConfig.label}
      color={statusConfig.color}
    />
  )
}
