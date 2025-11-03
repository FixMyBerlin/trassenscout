"use client"

import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { Form, LabeledSelect } from "@/src/core/components/forms"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecord/m2mFields"
import deleteProjectRecordAdmin from "@/src/server/projectRecord/mutations/deleteProjectRecordAdmin"
import updateProjectRecordAdmin from "@/src/server/projectRecord/mutations/updateProjectRecordAdmin"
import getProjectRecordAdmin from "@/src/server/projectRecord/queries/getProjectRecordAdmin"
import { ProjectRecordUpdateAdminFormSchema } from "@/src/server/projectRecord/schemas"
import getProjects from "@/src/server/projects/queries/getProjects"

import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/navigation"

export const AdminEditProjectRecordForm = ({
  initialProjectRecord,
  projectRecordId,
}: {
  initialProjectRecord: Awaited<ReturnType<typeof getProjectRecordAdmin>>
  projectRecordId: number
}) => {
  const router = useRouter()
  const [projectRecord, { refetch }] = useQuery(
    getProjectRecordAdmin,
    { id: projectRecordId },
    { initialData: initialProjectRecord },
  )
  const [{ projects }] = useQuery(getProjects, {})

  const [updateProjectRecordMutation] = useMutation(updateProjectRecordAdmin)
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecordAdmin)

  const projectOptions: [string | number, string][] = projects.map((project) => [
    project.id,
    project.slug,
  ])
  projectOptions.unshift(["", "Keine Angabe"])

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${projectRecordId} unwiderruflich löschen?`)) {
      try {
        await deleteProjectRecordMutation({
          id: projectRecordId,
        })
        router.push("/admin/project-records")
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
      const updated = await updateProjectRecordMutation({
        ...values,
        id: projectRecord.id,
        date: values.date === "" ? null : new Date(values.date),
      })
      await refetch()
      router.push(`/admin/project-records/${projectRecord.id}/review`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  // m2m copied from subsubsection/edit.tsx
  const m2mFieldsInitialValues: Record<M2MFieldsType | string, string[]> = {}
  m2mFields.forEach((fieldName) => {
    if (fieldName in projectRecord) {
      // @ts-expect-error
      m2mFieldsInitialValues[fieldName] = Array.from(projectRecord[fieldName].values(), (obj) =>
        String(obj.id),
      )
    }
  })

  return (
    <>
      <Form
        submitText="Protokoll speichern"
        schema={ProjectRecordUpdateAdminFormSchema}
        // @ts-expect-error ProjectRecord type mismatch with form schema for m2m fields
        initialValues={{
          ...projectRecord,
          date: projectRecord.date ? getDate(projectRecord.date) : "",
          ...m2mFieldsInitialValues,
        }}
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <LabeledSelect name="projectId" options={projectOptions} label="Projekt" />
        </div>
        <ProjectRecordFormFields projectSlug={projectRecord.project.slug} />
      </Form>

      <div className="mt-10">
        <Link href={`/admin/project-records/${projectRecord.id}/review`}>
          ← Zurück zur Protokoll-Review
        </Link>
        <br />
        <Link href="/admin/project-records">← Zurück zur Protokoll-Übersicht</Link>
      </div>

      <hr className="my-5" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button>
    </>
  )
}
