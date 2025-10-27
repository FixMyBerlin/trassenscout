"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"

import { m2mFields, M2MFieldsType } from "@/src/server/projectRecord/m2mFields"
import deleteProjectRecord from "@/src/server/projectRecord/mutations/deleteProjectRecord"
import updateProjectRecord from "@/src/server/projectRecord/mutations/updateProjectRecord"
import getProjectRecord from "@/src/server/projectRecord/queries/getProjectRecord"
import { ProjectRecordFormSchema } from "@/src/server/projectRecord/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { ProjectRecordForm } from "../../../_components/ProjectRecordForm"

export const EditProjectRecordForm = ({
  initialProjectRecord,
  projectSlug,
  projectRecordId,
}: {
  initialProjectRecord: Awaited<ReturnType<typeof getProjectRecord>>
  projectSlug: string
  projectRecordId: number
}) => {
  const router = useRouter()
  const [projectRecord, { refetch }] = useQuery(
    getProjectRecord,
    { projectSlug, id: projectRecordId },
    // todo check if this works as expected
    { initialData: initialProjectRecord },
  )

  const [updateProjectRecordMutation] = useMutation(updateProjectRecord)
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecord)

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${projectRecordId} unwiderruflich löschen?`)) {
      try {
        await deleteProjectRecordMutation({
          id: projectRecordId,
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
      await refetch()
      router.push(`/${projectSlug}/project-records/${projectRecord.id}`)
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
      <ProjectRecordForm
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
        mode="edit"
      />

      <p className="mt-10">
        <Link href={`/${projectSlug}/project-records`}>← Zurück zur Protokoll-Übersicht</Link>
      </p>

      <hr className="my-5" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button>

      <SuperAdminLogData data={{ projectRecord }} />
    </>
  )
}
