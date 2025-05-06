import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
import { ProgressContext } from "@/src/survey-public/context/contexts"
import { clsx } from "clsx"
import { useParams } from "next/navigation"
import { useContext } from "react"

export const ProgressBar = () => {
  const surveySlug = useParams()?.surveySlug as AllowedSurveySlugs
  const TOTAL = getConfigBySurveySlug(surveySlug, "meta").progessBarDefinition["total"]

  const { progress } = useContext(ProgressContext)
  const width = progress ? (progress / TOTAL) * 100 : 100

  return (
    <div>
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
