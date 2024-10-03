"use client"
import { FORM_ERROR } from "@/src/core/components/forms"
import createSurvey from "@/src/surveys/mutations/createSurvey"
import { CreateSurveySchema, CreateSurveyType } from "@/src/surveys/schemas"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { AdminSurveyForm } from "../../_components/AdminSurveyForm"
export { FORM_ERROR } from "@/src/core/components/forms"

export const AdminSurveyNewForm = () => {
  const router = useRouter()
  const [createSurveyMutation] = useMutation(createSurvey)

  const handleSubmit = async (values: CreateSurveyType) => {
    try {
      await createSurveyMutation({
        ...values,
        interestedParticipants: Number(values.interestedParticipants),
        startDate: values.startDate ? new Date(values.startDate) : undefined,
        endDate: values.endDate ? new Date(values.endDate) : undefined,
      })
      router.push("/admin/surveys")
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <AdminSurveyForm submitText="Erstellen" schema={CreateSurveySchema} onSubmit={handleSubmit} />
  )
}
