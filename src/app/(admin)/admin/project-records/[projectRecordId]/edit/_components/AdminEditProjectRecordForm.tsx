"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { ProjectRecordNeedsReviewBanner } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordNeedsReviewBanner"
import { ReviewProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReviewProjectRecordForm"
import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { Form, FORM_ERROR } from "@/src/core/components/forms"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import deleteProjectRecord from "@/src/server/projectRecords/mutations/deleteProjectRecord"
import updateProjectRecord from "@/src/server/projectRecords/mutations/updateProjectRecord"
import getProjectRecordAdmin from "@/src/server/projectRecords/queries/getProjectRecordAdmin"
import { ProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import { useMutation } from "@blitzjs/rpc"
import { ProjectRecordReviewState } from "@prisma/client"
import { useRouter } from "next/navigation"
import { z } from "zod"

export const AdminEditProjectRecordForm = ({
  projectRecord,
}: {
  projectRecord: Awaited<ReturnType<typeof getProjectRecordAdmin>>
}) => {
  const router = useRouter()
  const needsReview = projectRecord.reviewState !== ProjectRecordReviewState.APPROVED
  const [updateProjectRecordMutation] = useMutation(updateProjectRecord)
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecord)

  const projectSlug = projectRecord.project.slug

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
      router.push(`/admin/project-records`)
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
      {!projectRecord.project.aiEnabled && projectRecord.projectRecordAuthorType === "SYSTEM" && (
        <div className="mb-6 inline-flex flex-col space-y-2 rounded-md border border-gray-200 bg-red-200 p-4 text-gray-700">
          <p className="text-sm">
            In diesem Projekt ist die KI-Unterstützung deaktiviert. Damit Protokolleinträge für
            Projektmitglieder sichtbar werden, müssen KI Features aktiviert werden.
          </p>
        </div>
      )}
      {needsReview && <ProjectRecordNeedsReviewBanner />}

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
        actionBarRight={
          <DeleteActionBar
            itemTitle={projectRecord.title}
            onDelete={() => deleteProjectRecordMutation({ id: projectRecord.id, projectSlug })}
            returnPath="/admin/project-records"
          />
        }
      >
        <p>
          Projekt: <span className="font-medium uppercase">{projectSlug}</span>
        </p>
        <div className="space-y-6">
          <ProjectRecordFormFields
            projectSlug={projectSlug}
            splitView={true}
            emailSource={projectRecord.projectRecordEmail}
          />
        </div>
        <ReviewProjectRecordForm admin />
      </Form>

      <CreateEditReviewHistory projectRecord={projectRecord} />
    </>
  )
}
