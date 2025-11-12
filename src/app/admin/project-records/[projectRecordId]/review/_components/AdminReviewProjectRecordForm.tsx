"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/CreateEditReviewHistory"
import { ProjectRecordSummary } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordSummary"
import { Form, LabeledRadiobuttonGroup, LabeledTextareaField } from "@/src/core/components/forms"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { Link } from "@/src/core/components/links"
import { H3 } from "@/src/core/components/text"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import updateProjectRecordReview from "@/src/server/projectRecords/mutations/updateProjectRecordReview"
import getProjectRecordAdmin from "@/src/server/projectRecords/queries/getProjectRecordAdmin"
import { ProjectRecordReviewFormSchema } from "@/src/server/projectRecords/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ProjectRecordReviewState } from "@prisma/client"
import { useRouter } from "next/navigation"

export const AdminReviewProjectRecordForm = ({
  initialProjectRecord,
  projectRecordId,
}: {
  initialProjectRecord: Awaited<ReturnType<typeof getProjectRecordAdmin>>
  projectRecordId: number
}) => {
  const router = useRouter()
  const [projectRecord] = useQuery(
    getProjectRecordAdmin,
    { id: projectRecordId },
    { initialData: initialProjectRecord },
  )

  const [updateProjectRecordReviewMutation] = useMutation(updateProjectRecordReview)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateProjectRecordReviewMutation({
        id: projectRecordId,
        projectSlug: projectRecord.project.slug,
        reviewState: values.reviewState,
        reviewNotes: values.reviewNotes,
      })
      router.push(`/admin/project-records`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <>
      <CreateEditReviewHistory projectRecord={projectRecord} />

      <ProjectRecordSummary projectRecord={projectRecord} />

      <Form
        schema={ProjectRecordReviewFormSchema}
        initialValues={{
          reviewState: projectRecord.reviewState,
          reviewNotes: projectRecord.reviewNotes || "",
        }}
        onSubmit={handleSubmit}
        className="mt-6 max-w-2xl rounded-md bg-gray-200 p-4"
      >
        <H3>Review durchführen</H3>
        {projectRecord.reviewState !== ProjectRecordReviewState.NEEDSREVIEW && (
          <div className="text-sm">
            <span className="font-medium text-gray-500">
              {projectRecord.reviewState === ProjectRecordReviewState.APPROVED
                ? "Genehmigt"
                : "Abgelehnt"}{" "}
              von:{" "}
            </span>
            <span className="text-gray-900">
              {projectRecord.reviewedBy ? getFullname(projectRecord.reviewedBy) : "—"}
            </span>
          </div>
        )}

        <div className="space-y-4">
          <LabeledRadiobuttonGroup
            scope="reviewState"
            label="Review-Status"
            items={[
              {
                value: ProjectRecordReviewState.APPROVED,
                label: "Genehmigt - Protokoll ist korrekt",
              },
              {
                value: ProjectRecordReviewState.NEEDSADMINREVIEW,
                label: "Benötigt Admin-Review",
              },
              {
                value: ProjectRecordReviewState.NEEDSREVIEW,
                label: "Benötigt Review",
              },
              {
                value: ProjectRecordReviewState.REJECTED,
                label: "Abgelehnt - Protokoll entspricht nicht den Standards",
              },
            ]}
          />

          <LabeledTextareaField
            name="reviewNotes"
            label="Review-Notizen"
            placeholder="Kommentare, Verbesserungsvorschläge oder Begründung für die Entscheidung..."
            rows={5}
            optional
          />
        </div>

        <SubmitButton>Review speichern</SubmitButton>
      </Form>

      <div className="mt-8 border-t border-gray-200 pt-4">
        <Link href="/admin/project-records">← Zurück zur Admin-Protokoll-Übersicht</Link>
      </div>
    </>
  )
}
