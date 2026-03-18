"use client"
import createSurvey from "@/src/server/surveys/mutations/createSurvey"
import { CreateSurveySchema, CreateSurveyType } from "@/src/server/surveys/schemas"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { AdminSurveyForm } from "../../_components/AdminSurveyForm"

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
      return { success: false, message: error instanceof Error ? error.message : String(error) }
    }
  }

  return (
    <AdminSurveyForm submitText="Erstellen" schema={CreateSurveySchema} onSubmit={handleSubmit} />
  )
}
