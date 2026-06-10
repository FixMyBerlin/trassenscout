import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { z } from "zod"
import { ProjectRecordEmailForm } from "@/src/components/admin/project-record-emails/ProjectRecordEmailForm"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { createProjectRecordEmailFn } from "@/src/server/projectRecordEmails/projectRecordEmails.functions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { ProjectRecordEmailFormSchema } from "@/src/shared/projectRecordEmails/schemas"

export const AdminNewProjectRecordEmailForm = () => {
  const navigate = useNavigate()
  const { data: projectsResult } = useSuspenseQuery(projectsAdminQueryOptions())
  const createProjectRecordEmailMutation = useMutation({ mutationFn: createProjectRecordEmailFn })

  const handleSubmit = async (values: z.infer<typeof ProjectRecordEmailFormSchema>) => {
    try {
      const projectRecordEmail = await createProjectRecordEmailMutation.mutateAsync({
        data: {
          ...values,
          projectId: values.projectId ?? null,
        },
      })
      navigate({
        to: "/admin/project-record-emails/$projectRecordEmailId",
        params: { projectRecordEmailId: String(projectRecordEmail.id) },
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["body"])
    }
  }

  return (
    <ProjectRecordEmailForm
      submitText="E-Mail speichern"
      schema={ProjectRecordEmailFormSchema}
      onSubmit={handleSubmit}
      projects={projectsResult.projects}
    />
  )
}
