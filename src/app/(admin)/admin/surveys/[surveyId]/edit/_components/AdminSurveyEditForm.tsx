"use client"
import { FORM_ERROR } from "@/src/core/components/forms"
import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import deleteSurvey from "@/src/server/surveys/mutations/deleteSurvey"
import updateSurvey from "@/src/server/surveys/mutations/updateSurvey"
import getAdminSurvey from "@/src/server/surveys/queries/getAdminSurvey"
import { CreateSurveySchema, CreateSurveyType } from "@/src/server/surveys/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useParams, useRouter } from "next/navigation"
import { AdminSurveyForm } from "../../../_components/AdminSurveyForm"

export const AdminSurveyEditForm = () => {
  const router = useRouter()
  const surveyId = Number(useParams()?.surveyId)
  const [survey] = useQuery(getAdminSurvey, { id: surveyId })
  const [updateSurveyMutation] = useMutation(updateSurvey)

  const handleSubmit = async (values: CreateSurveyType) => {
    try {
      await updateSurveyMutation({
        id: survey.id,
        ...values,
        interestedParticipants: Number(values.interestedParticipants),
        startDate: values.startDate ? new Date(values.startDate) : null,
        endDate: values.endDate ? new Date(values.endDate) : null,
      })
      router.push("/admin/surveys")
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const [deleteSurveyMutation] = useMutation(deleteSurvey)

  return (
    <>
      <AdminSurveyForm
        submitText="Aktualisieren"
        schema={CreateSurveySchema}
        initialValues={survey}
        onSubmit={handleSubmit}
      />

      <DeleteAndBackLinkFooter
        fieldName="Beteiligung"
        id={survey.id}
        deleteAction={{
          mutate: () => deleteSurveyMutation({ id: survey.id }),
        }}
        backHref="/admin/surveys"
        backText="Zurück zu den Beteiligungen"
      />
    </>
  )
}
