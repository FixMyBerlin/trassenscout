"use client"

import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Form, FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import deleteProjectRecord from "@/src/server/projectRecords/mutations/deleteProjectRecord"
import updateProjectRecord from "@/src/server/projectRecords/mutations/updateProjectRecord"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { ProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import { useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/navigation"

export const EditProjectRecordForm = ({
  projectRecord,
  projectSlug,
}: {
  projectRecord: Awaited<ReturnType<typeof getProjectRecord>>
  projectSlug: string
}) => {
  const router = useRouter()

  const [updateProjectRecordMutation] = useMutation(updateProjectRecord)
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecord)

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${projectRecord.id} unwiderruflich löschen?`)) {
      try {
        await deleteProjectRecordMutation({
          id: projectRecord.id,
          projectSlug,
        })
        router.push(`/${projectSlug}/project-records`)
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
        projectSlug,
      })
      router.push(projectRecordDetailRoute(projectSlug, projectRecord.id))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  // m2m copied from subsubsection/edit.tsx
  const m2mFieldsInitialValues: Record<M2MFieldsType | string, string[]> = {}
  m2mFields.forEach((fieldName) => {
    if (fieldName in projectRecord) {
      m2mFieldsInitialValues[fieldName] = Array.from(projectRecord[fieldName].values(), (obj) =>
        String(obj.id),
      )
    }
  })

  return (
    <>
      <Form
        className="grow"
        submitText="Protokoll speichern"
        schema={ProjectRecordFormSchema}
        // @ts-expect-error some null<>undefined missmatch
        initialValues={{
          ...projectRecord,
          date: projectRecord.date ? getDate(projectRecord.date) : "",
          ...m2mFieldsInitialValues,
        }}
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <ProjectRecordFormFields projectSlug={projectSlug} />
        </div>
      </Form>

      <p className="mt-10">
        <Link href={`/${projectSlug}/project-records`}>← Zurück zur Protokoll-Übersicht</Link>
      </p>

      <hr className="my-5 text-gray-200" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button>

      <SuperAdminLogData data={{ projectRecord }} />
    </>
  )
}
