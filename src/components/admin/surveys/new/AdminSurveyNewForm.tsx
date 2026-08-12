import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { createAdminSurveyFn } from "@/src/server/surveys/surveys.functions"
import { type CreateSurveyType } from "@/src/shared/surveys/schemas"
import { AdminSurveyForm } from "../AdminSurveyForm"

type Props = {
  projectSlug: string
}

export const AdminSurveyNewForm = ({ projectSlug }: Props) => {
  const navigate = useNavigate()
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const createSurveyMutation = useMutation({ mutationFn: createAdminSurveyFn })

  const handleSubmit = async (values: CreateSurveyType) => {
    try {
      await createSurveyMutation.mutateAsync({
        data: {
          ...values,
          projectId: project.id,
          interestedParticipants: Number(values.interestedParticipants),
          startDate: values.startDate ? new Date(values.startDate) : undefined,
          endDate: values.endDate ? new Date(values.endDate) : undefined,
        },
      })
      navigate({ to: "/admin/projects/$projectSlug/surveys", params: { projectSlug } })
    } catch (error: unknown) {
      console.error(error)
      return { [FORM_ERROR]: error instanceof Error ? error.message : String(error) }
    }
  }

  return (
    <AdminSurveyForm submitText="Erstellen" fixedProjectId={project.id} onSubmit={handleSubmit} />
  )
}
