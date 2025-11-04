"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import deleteProjectRecordEmail from "@/src/server/ProjectRecordEmails/mutations/deleteProjectRecordEmail"
import updateProjectRecordEmail from "@/src/server/ProjectRecordEmails/mutations/updateProjectRecordEmail"
import { ProjectRecordEmailFormSchema } from "@/src/server/ProjectRecordEmails/schema"
import { TGetProjects } from "@/src/server/projects/queries/getProjects"
import { useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
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

  const handleDelete = async () => {
    if (
      window.confirm(
        `Die E-Mail mit der ID ${initialProjectRecordEmail.id} unwiderruflich löschen?`,
      )
    ) {
      try {
        await deleteProjectRecordEmailMutation({ id: initialProjectRecordEmail.id })
        router.push("/admin/project-record-emails")
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateProjectRecordEmailMutation({
        ...values,
        id: projectRecordEmailId,
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

      <div className="mt-8">
        <Link href="/admin/project-record-emails">← Zurück zur E-Mail-Übersicht</Link>
      </div>

      <hr className="my-5" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        E-Mail löschen
      </button>
    </>
  )
}
