"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/CreateEditReviewHistory"
import { ProtocolSummary } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolSummary"
import { Form, LabeledRadiobuttonGroup, LabeledTextareaField } from "@/src/core/components/forms"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { Link } from "@/src/core/components/links"
import { H3 } from "@/src/core/components/text"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import updateProtocolReview from "@/src/server/protocols/mutations/updateProtocolReview"

import getProtocol from "@/src/server/protocols/queries/getProtocol"
import getProtocolAdmin from "@/src/server/protocols/queries/getProtocolAdmin"
import { ProtocolReviewFormSchema } from "@/src/server/protocols/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ProtocolReviewState } from "@prisma/client"
import { useRouter } from "next/navigation"

export const ReviewProtocolForm = ({
  initialProtocol,
  protocolId,
}: {
  initialProtocol: Awaited<ReturnType<typeof getProtocol>>
  protocolId: number
}) => {
  const router = useRouter()
  const [protocol] = useQuery(
    getProtocolAdmin,
    { id: protocolId },
    { initialData: initialProtocol },
  )

  const [updateProtocolReviewMutation] = useMutation(updateProtocolReview)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateProtocolReviewMutation({
        id: protocolId,
        projectSlug: protocol.project.slug,
        reviewState: values.reviewState,
        reviewNotes: values.reviewNotes,
      })
      router.push(`/${protocol.project.slug}/protocols`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <>
      <CreateEditReviewHistory protocol={protocol} />

      <ProtocolSummary protocol={protocol} projectSlug={protocol.project.slug} />

      <Form
        schema={ProtocolReviewFormSchema}
        initialValues={{
          reviewState: protocol.reviewState,
          reviewNotes: protocol.reviewNotes || "",
        }}
        onSubmit={handleSubmit}
        className="mt-6 max-w-2xl rounded-md bg-gray-200 p-4"
      >
        <H3>Freigabe durchführen</H3>
        {protocol.reviewState !== ProtocolReviewState.NEEDSREVIEW && (
          <div className="text-sm">
            <span className="font-medium text-gray-500">
              {protocol.reviewState === ProtocolReviewState.APPROVED ? "Genehmigt" : "Abgelehnt"}{" "}
              von:{" "}
            </span>
            <span className="text-gray-900">
              {protocol.reviewedBy ? getFullname(protocol.reviewedBy) : "—"}
            </span>
          </div>
        )}

        <div className="space-y-4">
          <small className="text-sm text-gray-500">
            Hinweis: Abgelehnte Protokolle werden nicht mehr in der Protokoll-Liste angezeigt.
          </small>
          <LabeledRadiobuttonGroup
            scope="reviewState"
            items={[
              {
                value: ProtocolReviewState.APPROVED,
                label: "Genehmigt - Protokoll ist korrekt",
              },
              {
                value: ProtocolReviewState.NEEDSREVIEW,
                label: "Benötigt Review",
              },
              {
                value: ProtocolReviewState.REJECTED,
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
        <Link href="/admin/protocols">← Zurück zur Admin-Protokoll-Übersicht</Link>
      </div>
    </>
  )
}
