import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { deleteAdminSurveyFn, updateAdminSurveyFn } from "@/src/server/surveys/surveys.functions"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"
import { type CreateSurveyType } from "@/src/shared/surveys/schemas"
import { AdminSurveyForm } from "../../AdminSurveyForm"

type Props = {
  surveyId: number
}

export const AdminSurveyEditForm = ({ surveyId }: Props) => {
  const navigate = useNavigate()
  const { data: survey } = useSuspenseQuery(adminSurveyQueryOptions(surveyId))
  const updateSurveyMutation = useMutation({ mutationFn: updateAdminSurveyFn })
  const deleteSurveyMutation = useMutation({ mutationFn: deleteAdminSurveyFn })

  const handleSubmit = async (values: CreateSurveyType) => {
    try {
      await updateSurveyMutation.mutateAsync({
        data: {
          id: survey.id,
          ...values,
          interestedParticipants: Number(values.interestedParticipants),
          startDate: values.startDate ? new Date(values.startDate) : null,
          endDate: values.endDate ? new Date(values.endDate) : null,
        },
      })
      navigate({ to: "/admin/surveys" })
    } catch (error: unknown) {
      console.error(error)
      return { [FORM_ERROR]: error instanceof Error ? error.message : String(error) }
    }
  }

  return (
    <AdminSurveyForm
      submitText="Aktualisieren"
      initialValues={survey}
      onSubmit={handleSubmit}
      actionBarRight={
        <DeleteActionBar
          itemTitle={survey.title}
          onDelete={() => deleteSurveyMutation.mutateAsync({ data: { id: survey.id } })}
          returnPath="/admin/surveys"
        />
      }
    />
  )
}
