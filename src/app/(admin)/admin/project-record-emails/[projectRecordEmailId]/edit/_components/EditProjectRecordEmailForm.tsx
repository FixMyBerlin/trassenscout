"use client"

import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteProjectRecordEmail from "@/src/server/ProjectRecordEmails/mutations/deleteProjectRecordEmail"
import updateProjectRecordEmail from "@/src/server/ProjectRecordEmails/mutations/updateProjectRecordEmail"
import { ProjectRecordEmailFormSchema } from "@/src/server/ProjectRecordEmails/schema"
import { TGetProjects } from "@/src/server/projects/queries/getProjects"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { z } from "zod"
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

  type HandleSubmit = z.infer<typeof ProjectRecordEmailFormSchema>
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
        actionBarRight={
          <DeleteActionBar
            itemTitle={initialProjectRecordEmail.subject || "E-Mail"}
            onDelete={() => deleteProjectRecordEmailMutation({ id: initialProjectRecordEmail.id })}
            returnPath="/admin/project-record-emails"
          />
        }
      />
    </>
  )
}
