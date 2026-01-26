"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { ProjectRecordNeedsReviewBanner } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordNeedsReviewBanner"
import { ReviewProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReviewProjectRecordForm"
import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Form, FORM_ERROR } from "@/src/core/components/forms"
import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import deleteProjectRecord from "@/src/server/projectRecords/mutations/deleteProjectRecord"
import updateProjectRecord from "@/src/server/projectRecords/mutations/updateProjectRecord"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { ProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import { useMutation } from "@blitzjs/rpc"
import { ProjectRecordReviewState } from "@prisma/client"
import { useRouter } from "next/navigation"
import { z } from "zod"

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
      {needsReview && <ProjectRecordNeedsReviewBanner />}
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

      <DeleteAndBackLinkFooter
        id={projectRecord.id}
        deleteAction={{
          mutate: () => deleteProjectRecordMutation({ id: projectRecord.id, projectSlug }),
        }}
        fieldName="Protokolleintrag"
        backHref={
          projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
            ? (`/${projectSlug}/project-records/needreview` as const)
            : (`/${projectSlug}/project-records` as const)
        }
        backText={
          projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
            ? "Zurück zu den Protokolleinträgen zur Bestätigung"
            : "Zurück zu den Protokolleinträgen"
        }
      />

      <SuperAdminLogData data={{ initialValues: projectRecord }} />
    </>
  )
}
