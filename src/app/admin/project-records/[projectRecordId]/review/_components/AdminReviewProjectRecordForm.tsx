"use client"

import { ProjectRecordTypePill } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordTable"
import { Form, LabeledRadiobuttonGroup, LabeledTextareaField } from "@/src/core/components/forms"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { Link } from "@/src/core/components/links"
import { SubsectionIcon } from "@/src/core/components/Map/Icons"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { H3, shortTitle } from "@/src/core/components/text"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import updateProjectRecordReview from "@/src/server/projectRecord/mutations/updateProjectRecordReview"
import getProjectRecordAdmin from "@/src/server/projectRecord/queries/getProjectRecordAdmin"
import { ProjectRecordReviewFormSchema } from "@/src/server/projectRecord/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ProjectRecordReviewState, ProjectRecordType } from "@prisma/client"
import { format } from "date-fns"
import { de } from "date-fns/locale"
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
      {/* ProjectRecord Summary */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <h3 className="mb-4 text-lg font-semibold">Protokoll-Übersicht</h3>
          <Link icon="edit" href={`/admin/project-records/${projectRecordId}/edit`}>
            Protokoll bearbeiten
          </Link>
        </div>
        <div className="mt-7 space-y-4">
          <div>
            <span className="font-medium text-gray-500">Datum: </span>
            <span className="text-gray-900">
              {projectRecord.date ? format(new Date(projectRecord.date), "P", { locale: de }) : "—"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Projekt: </span>
            <Link href={`/${projectRecord.project.slug}/project-records`}>
              {shortTitle(projectRecord.project.slug)}
            </Link>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-medium text-gray-500">Planungsabschnitt: </span>
            {projectRecord.subsection ? (
              <Link
                href={`/${projectRecord.project.slug}/abschnitte/${projectRecord.subsection.slug}`}
              >
                <SubsectionIcon label={shortTitle(projectRecord.subsection.slug)} />
              </Link>
            ) : (
              "k.A."
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-gray-500">Tags: </p>
          <ul className="list-inside list-none space-y-1">
            {!!projectRecord.projectRecordTopics.length ? (
              projectRecord.projectRecordTopics.map((topic) => (
                <li className="whitespace-nowrap text-gray-700" key={topic.id}>
                  # {topic.title}
                </li>
              ))
            ) : (
              <li className="whitespace-nowrap text-gray-700">Keine Tags zugeordnet</li>
            )}
          </ul>
        </div>

        {projectRecord.body && (
          <div className="mt-4">
            <span className="font-medium text-gray-500">Body:</span>
            <div className="mt-2 max-w-3xl rounded-md bg-white p-4">
              <Markdown markdown={projectRecord.body} />
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500">
            <p className="text-xs">
              <span>Erstellt von </span>
              <ProjectRecordTypePill type={projectRecord.projectRecordAuthorType} />
              {projectRecord.projectRecordAuthorType === ProjectRecordType.USER &&
                projectRecord.author && <span>{getFullname(projectRecord.author)}</span>}
            </p>
            <p className="mt-2 text-xs">
              <span>Zuletzt bearbeitet von </span>
              <ProjectRecordTypePill type={projectRecord.projectRecordUpdatedByType} />{" "}
              {projectRecord.projectRecordUpdatedByType === ProjectRecordType.USER &&
                projectRecord.updatedBy && <span>{getFullname(projectRecord.updatedBy)}</span>}
            </p>
          </div>
        </div>
      </div>

      <Form
        schema={ProjectRecordReviewFormSchema}
        initialValues={{
          reviewState: projectRecord.reviewState,
          reviewNotes: projectRecord.reviewNotes || "",
        }}
        onSubmit={handleSubmit}
        className="max-w-2xl"
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
