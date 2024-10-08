"use client"
import { FORM_ERROR } from "@/src/core/components/forms"
import { linkStyles } from "@/src/core/components/links/styles"
import deleteSurvey from "@/src/surveys/mutations/deleteSurvey"
import updateSurvey from "@/src/surveys/mutations/updateSurvey"
import getAdminSurvey from "@/src/surveys/queries/getAdminSurvey"
import { CreateSurveySchema, CreateSurveyType } from "@/src/surveys/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useParams, useRouter } from "next/navigation"
import { AdminSurveyForm } from "../../../_components/AdminSurveyForm"
export { FORM_ERROR } from "@/src/core/components/forms"

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

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${survey.id} unwiderruflich löschen?`)) {
      await deleteSurveyMutation({ id: survey.id })
      router.push(`/admin/surveys`)
    }
  }

  return (
    <>
      <AdminSurveyForm
        submitText="Aktualisieren"
        schema={CreateSurveySchema}
        initialValues={survey}
        onSubmit={handleSubmit}
      />
      <hr />
      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
    </>
  )
}
