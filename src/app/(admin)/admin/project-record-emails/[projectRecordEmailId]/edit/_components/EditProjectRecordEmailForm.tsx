"use client"

import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteProjectRecordEmail from "@/src/server/ProjectRecordEmails/mutations/deleteProjectRecordEmail"
import updateProjectRecordEmail from "@/src/server/ProjectRecordEmails/mutations/updateProjectRecordEmail"
import { ProjectRecordEmailFormSchema } from "@/src/server/ProjectRecordEmails/schema"
import { TGetProjects } from "@/src/server/projects/queries/getProjects"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { ProjectRecordEmailForm } from "../../../_components/ProjectRecordEmailForm"

export const EditProjectRecordEmailForm = ({
  initialProjectRecordEmail,
  projectRecordEmailId,
  projects,
}: {
  initialProjectRecordEmail: any // TODO: Type this properly
  projectRecordEmailId: number
  projects: TGetProjects["projects"]
}) => {
  const router = useRouter()
  const [updateProjectRecordEmailMutation] = useMutation(updateProjectRecordEmail)
  const [deleteProjectRecordEmailMutation] = useMutation(deleteProjectRecordEmail)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateProjectRecordEmailMutation({
        ...values,
        id: projectRecordEmailId,
        projectId: values.projectId ?? null,
      })
      router.push(`/admin/project-record-emails/${projectRecordEmailId}`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <>
      <ProjectRecordEmailForm
        className="grow"
        submitText="E-Mail speichern"
        schema={ProjectRecordEmailFormSchema}
        initialValues={{
          ...initialProjectRecordEmail,
        }}
        onSubmit={handleSubmit}
        projects={projects}
      />

      <DeleteAndBackLinkFooter
        fieldName="E-Mail"
        id={initialProjectRecordEmail.id}
        deleteAction={{
          mutate: () => deleteProjectRecordEmailMutation({ id: initialProjectRecordEmail.id }),
        }}
        backHref="/admin/project-record-emails"
        backText="Zurück zu den Protokoll-E-Mails"
      />
    </>
  )
}
