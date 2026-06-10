import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { createAdminSurveyFn } from "@/src/server/surveys/surveys.functions"
import { CreateSurveySchema, type CreateSurveyType } from "@/src/shared/surveys/schemas"
import { AdminSurveyForm } from "../AdminSurveyForm"

export const AdminSurveyNewForm = () => {
  const navigate = useNavigate()
  const createSurveyMutation = useMutation({ mutationFn: createAdminSurveyFn })

  const handleSubmit = async (values: CreateSurveyType) => {
    try {
      await createSurveyMutation.mutateAsync({
        data: {
          ...values,
          interestedParticipants: Number(values.interestedParticipants),
          startDate: values.startDate ? new Date(values.startDate) : undefined,
          endDate: values.endDate ? new Date(values.endDate) : undefined,
        },
      })
      navigate({ to: "/admin/surveys" })
    } catch (error: unknown) {
      console.error(error)
      return { [FORM_ERROR]: error instanceof Error ? error.message : String(error) }
    }
  }

  return (
    <AdminSurveyForm submitText="Erstellen" schema={CreateSurveySchema} onSubmit={handleSubmit} />
  )
}
