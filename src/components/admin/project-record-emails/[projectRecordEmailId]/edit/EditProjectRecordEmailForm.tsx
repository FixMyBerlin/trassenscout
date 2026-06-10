import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  deleteProjectRecordEmailFn,
  updateProjectRecordEmailFn,
} from "@/src/server/projectRecordEmails/projectRecordEmails.functions"
import { projectRecordEmailQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailsQueryOptions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { ProjectRecordEmailFormSchema } from "@/src/shared/projectRecordEmails/schemas"
import { ProjectRecordEmailForm } from "../../ProjectRecordEmailForm"

type Props = {
  projectRecordEmailId: number
}

export const EditProjectRecordEmailForm = ({ projectRecordEmailId }: Props) => {
  const navigate = useNavigate()
  const { data: initialProjectRecordEmail } = useSuspenseQuery(
    projectRecordEmailQueryOptions(projectRecordEmailId),
  )
  const { data: projectsResult } = useSuspenseQuery(projectsAdminQueryOptions())
  const updateProjectRecordEmailMutation = useMutation({ mutationFn: updateProjectRecordEmailFn })
  const deleteProjectRecordEmailMutation = useMutation({ mutationFn: deleteProjectRecordEmailFn })

  type HandleSubmit = z.infer<typeof ProjectRecordEmailFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateProjectRecordEmailMutation.mutateAsync({
        data: {
          ...values,
          id: projectRecordEmailId,
          projectId: values.projectId ?? null,
        },
      })
      navigate({ to: `/admin/project-record-emails/${projectRecordEmailId}` })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <ProjectRecordEmailForm
      className="grow"
      submitText="E-Mail speichern"
      schema={ProjectRecordEmailFormSchema}
      initialValues={{
        ...initialProjectRecordEmail,
      }}
      onSubmit={handleSubmit}
      projects={projectsResult.projects}
      actionBarRight={
        <DeleteActionBar
          itemTitle={initialProjectRecordEmail.subject || "E-Mail"}
          onDelete={() =>
            deleteProjectRecordEmailMutation.mutateAsync({
              data: { id: initialProjectRecordEmail.id },
            })
          }
          returnPath="/admin/project-record-emails"
        />
      }
    />
  )
}
