import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { clsx } from "clsx"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { deleteTestSurveyResponsesFn } from "@/src/server/survey-responses/surveyResponses.functions"

type DeleteButtonProps = {
  testSurveyResponseIds: number[]
  surveySlug: AllowedSurveySlugs
}

export const DeleteButton = ({ testSurveyResponseIds, surveySlug }: DeleteButtonProps) => {
  const deleteTestSurveyMutation = useMutation({ mutationFn: deleteTestSurveyResponsesFn })
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (
      window.confirm(
        `Diese ${testSurveyResponseIds.length} Beteiligungsbeiträge unwiderruflich löschen?`,
      )
    ) {
      try {
        await deleteTestSurveyMutation.mutateAsync({
          data: { slug: surveySlug, deleteIds: testSurveyResponseIds },
        })
      } catch {
        alert("Beim Löschen ist ein Fehler aufgetreten.")
      }
      navigate({ to: "/admin/surveys" })
    }
  }

  return (
    <>
      <hr className="my-5 text-gray-200" />
      <button type="button" onClick={handleDelete} className={clsx(primaryButtonClassName, "ml-2")}>
        Diese {testSurveyResponseIds.length} Testeinträge und dazugehörige Sessions löschen
      </button>
    </>
  )
}
