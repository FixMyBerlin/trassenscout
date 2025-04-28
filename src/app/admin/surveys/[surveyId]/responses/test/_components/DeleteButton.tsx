"use client"
import { AllowedSurveySlugs as AllowedSurveySlugsNew } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import { blueButtonStyles } from "@/src/core/components/links"
import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import deleteTestSurveyResponses from "@/src/survey-responses/mutations/deleteTestSurveyResponses"
import { useMutation } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/navigation"

type DeleteButtonProps = {
  testSurveyResponseIds: number[]
  surveySlug: AllowedSurveySlugs | AllowedSurveySlugsNew
}

export const DeleteButton = ({ testSurveyResponseIds, surveySlug }: DeleteButtonProps) => {
  const [deleteTestSurveyMutation] = useMutation(deleteTestSurveyResponses)
  const router = useRouter()
  const handleDelete = async () => {
    if (
      window.confirm(
        `Diese ${testSurveyResponseIds.length} Beteiligungsbeiträge unwiderruflich löschen?`,
      )
    ) {
      try {
        // @ts-expect-error todo
        await deleteTestSurveyMutation({ slug: surveySlug, deleteIds: testSurveyResponseIds })
      } catch (error) {
        alert("Beim Löschen ist ein Fehler aufgetreten.")
      }
      router.push("/admin/surveys")
    }
  }

  return (
    <>
      <hr />
      <button type="button" onClick={handleDelete} className={clsx(blueButtonStyles, "ml-2")}>
        Diese {testSurveyResponseIds.length} Testeinträge und dazugehörige Sessions löschen
      </button>
    </>
  )
}
