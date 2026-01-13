"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { ReviewProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReviewProjectRecordForm"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Form, FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import {
  projectRecordDetailRoute,
  projectRecordEditRoute,
} from "@/src/core/routes/projectRecordRoutes"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import deleteProjectRecord from "@/src/server/projectRecords/mutations/deleteProjectRecord"
import updateProjectRecord from "@/src/server/projectRecords/mutations/updateProjectRecord"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import getProjectRecordAdmin from "@/src/server/projectRecords/queries/getProjectRecordAdmin"
import { ProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import { useMutation } from "@blitzjs/rpc"
import { SparklesIcon } from "@heroicons/react/20/solid"
import { ProjectRecordReviewState } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { z } from "zod"

export const NeedsReviewBanner = ({
  withAction,
  projectRecord,
}: {
  withAction?: boolean
  projectRecord:
    | Awaited<ReturnType<typeof getProjectRecord>>
    | Awaited<ReturnType<typeof getProjectRecordAdmin>>
}) => (
  <div className="mb-6 inline-flex flex-col space-y-2 rounded-md border border-gray-200 bg-yellow-100 p-4 text-gray-700">
    <div className="flex items-center gap-2">
      <SparklesIcon className="size-5" />
      <h3 className="font-semibold">Bestätigung erforderlich</h3>
    </div>
    <p className="text-sm">
      Dieser Protokolleintrag wurde per KI erstellt und muss noch bestätigt werden.
    </p>
    {withAction && (
      <Link
        href={projectRecordEditRoute(projectRecord.project.slug, projectRecord.id)}
        className="text-sm"
      >
        Zur Bestätigung
      </Link>
    )}
  </div>
)

export const EditProjectRecordForm = ({
  projectRecord,
}: {
  projectRecord: Awaited<ReturnType<typeof getProjectRecord>>
}) => {
  const router = useRouter()
  const needsReview = projectRecord.reviewState !== ProjectRecordReviewState.APPROVED
  const [updateProjectRecordMutation] = useMutation(updateProjectRecord)
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecord)

  const projectSlug = projectRecord.project.slug

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

  const handleSubmit = async (values: z.infer<typeof ProjectRecordFormSchema>) => {
    try {
      const updated = await updateProjectRecordMutation({
        ...values,
        id: projectRecord.id,
        date: values.date === "" ? null : new Date(values.date),
        projectSlug,
        // Normalize m2m fields: convert true to false (empty array)
        projectRecordTopics:
          values.projectRecordTopics === true ? false : values.projectRecordTopics,
        uploads: values.uploads === true ? false : values.uploads,
        projectRecordEmailId: projectRecord.projectRecordEmailId,
      })
      if (values.reviewState === ProjectRecordReviewState.REJECTED)
        router.push(`/${projectSlug}/project-records`)
      else {
        router.push(projectRecordDetailRoute(projectSlug, projectRecord.id))
      }
      router.refresh()
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
      {needsReview && <NeedsReviewBanner projectRecord={projectRecord} />}
      {projectRecord.projectRecordAuthorType === "SYSTEM" && (
        <SuperAdminBox className="mb-6">
          In die{" "}
          <Link
            blank
            href={`/admin/project-records/${projectRecord.id}/edit`}
            className="text-blue-500 hover:underline"
          >
            Admin-Ansicht
          </Link>{" "}
          wechseln, um Bestätigungsstatus zu ändern und Quellnachricht zu sehen.
        </SuperAdminBox>
      )}
      <Form
        submitText="Änderungen speichern"
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
          <ProjectRecordFormFields
            projectSlug={projectSlug}
            splitView={needsReview}
            emailSource={projectRecord.projectRecordEmail}
          />
        </div>
        {needsReview && <ReviewProjectRecordForm />}
      </Form>

      <CreateEditReviewHistory projectRecord={projectRecord} />

      <p className="mt-10">
        <Link
          href={
            projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
              ? `/${projectSlug}/project-records/needsreview`
              : `/${projectSlug}/project-records`
          }
        >
          ← Zurück zur Protokoll-Übersicht
        </Link>
      </p>

      <hr className="my-5 text-gray-200" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button>

      <SuperAdminLogData data={{ initialValues: projectRecord }} />
    </>
  )
}
