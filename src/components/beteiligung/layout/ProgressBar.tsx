import { useContext } from "react"
import { twJoin } from "tailwind-merge"
import { ProgressContext } from "@/src/components/beteiligung/shared/contexts/contexts"
import { getprogressBarDefinitionBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { useAllowedSurveySlug } from "@/src/components/beteiligung/shared/utils/useAllowedSurveySlug"

export const ProgressBar = () => {
  const { progress } = useContext(ProgressContext)
  const surveySlug = useAllowedSurveySlug()
  const TOTAL = getprogressBarDefinitionBySurveySlug(surveySlug, "end")
  const width = progress ? (progress / TOTAL) * 100 : 100

  return (
    <div className="mb-8 sm:mb-12">
      <h4 className="sr-only">Status</h4>
      <div aria-hidden="true">
        <div className="overflow-hidden bg-gray-200">
          <div
            className={twJoin("h-3 bg-(--survey-primary-color)")}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    </div>
  )
}
