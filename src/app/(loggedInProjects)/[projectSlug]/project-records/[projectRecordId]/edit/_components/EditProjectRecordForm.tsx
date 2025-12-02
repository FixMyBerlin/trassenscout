"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/[projectRecordId]/_components/CreateEditReviewHistory"
import { ReviewProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/[projectRecordId]/edit/_components/ReviewProtocolForm"
import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Form, FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { isAdmin } from "@/src/pagesComponents/users/utils/isAdmin"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import deleteProjectRecord from "@/src/server/projectRecords/mutations/deleteProjectRecord"
import updateProjectRecord from "@/src/server/projectRecords/mutations/updateProjectRecord"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import getProjectRecordAdmin from "@/src/server/projectRecords/queries/getProjectRecordAdmin"
import { ProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import { useMutation } from "@blitzjs/rpc"
import { SparklesIcon } from "@heroicons/react/20/solid"
import { ProjectRecordReviewState } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { z } from "zod"

export const NeedsReviewBanner = () => (
  <div className="mb-6 inline-flex flex-col space-y-2 rounded-md border border-gray-200 bg-yellow-100 p-4 text-gray-700">
    <div className="flex items-center gap-2">
      <SparklesIcon className="size-5" />
      <h3 className="font-semibold">Protokoll-Freigabe erforderlich</h3>
    </div>
    <p className="text-sm">
      Dieses Protokoll wurde per KI-Assistent erstellt und muss noch freigegeben werden.
    </p>
  </div>
)

export const EditProjectRecordForm = ({
  projectRecord,
  projectSlug,
}: {
  projectRecord:
    | Awaited<ReturnType<typeof getProjectRecord>>
    | Awaited<ReturnType<typeof getProjectRecordAdmin>>
  projectSlug: string
}) => {
  const router = useRouter()
  const needsReview = projectRecord.reviewState !== ProjectRecordReviewState.APPROVED
  const [updateProjectRecordMutation] = useMutation(updateProjectRecord)
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecord)

  const user = useCurrentUser()
  const isUserAdmin = isAdmin(user)

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
      if (
        values.reviewState === ProjectRecordReviewState.REJECTED ||
        values.reviewState === ProjectRecordReviewState.NEEDSADMINREVIEW
      )
        router.push(`/${projectSlug}/project-records`)
      else {
        router.push(projectRecordDetailRoute(projectSlug, projectRecord.id))
      }
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
      {needsReview && <NeedsReviewBanner />}

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
            adminView={isUserAdmin}
            reviewView={needsReview}
            emailSource={projectRecord.projectRecordEmail}
          />
        </div>

        <ReviewProjectRecordForm reviewView={needsReview} adminView={isUserAdmin} />
      </Form>

      <CreateEditReviewHistory projectRecord={projectRecord} />

      <p className="mt-10">
        <Link href={`/${projectSlug}/project-records`}>← Zurück zur Protokoll-Übersicht</Link>
      </p>

      <hr className="my-5 text-gray-200" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button>

      <SuperAdminLogData data={{ initialValues: projectRecord }} />
    </>
  )
}
