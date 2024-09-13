import { StatusLabel } from "src/core/components/Status/StatusLabel"
import { getBackendConfigBySurveySlug } from "src/survey-public/utils/getConfigBySurveySlug"

type Props = {
  status?: string | null
  surveySlug: string
}

export const EditableSurveyResponseStatusLabel: React.FC<Props> = ({ status, surveySlug }) => {
  if (!status) return null

  const statusConfig = getBackendConfigBySurveySlug(surveySlug).status.find(
    (s) => s.value === status,
  )

  return (
    <StatusLabel
      // @ts-expect-error
      icon={statusConfig.icon}
      // @ts-expect-error
      label={statusConfig.label}
      // @ts-expect-error
      colorClass={statusConfig.colorClass}
    />
  )
}
