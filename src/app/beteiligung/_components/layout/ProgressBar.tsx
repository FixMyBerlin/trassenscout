import { ProgressContext } from "@/src/app/beteiligung/_shared/contexts/contexts"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getprogressBarDefinitionBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { clsx } from "clsx"
import { useParams } from "next/navigation"
import { useContext } from "react"

export const ProgressBar = () => {
  const { progress } = useContext(ProgressContext)
  const surveySlug = useParams()?.surveySlug as AllowedSurveySlugs
  const TOTAL = getprogressBarDefinitionBySurveySlug(surveySlug, "end")
  const width = progress ? (progress / TOTAL) * 100 : 100

  return (
    <div className="mb-12">
      <h4 className="sr-only">Status</h4>
      <div aria-hidden="true">
        <div className="overflow-hidden bg-gray-200">
          <div
            className={clsx("h-3 bg-[var(--survey-primary-color)]")}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    </div>
  )
}
