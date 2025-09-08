"use client"

import { ProtocolReviewStatePill } from "@/src/app/admin/protocols/_components/AdminProtocolsTable"
import { Form, LabeledRadiobuttonGroup, LabeledTextareaField } from "@/src/core/components/forms"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { Link } from "@/src/core/components/links"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { H3 } from "@/src/core/components/text"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import updateProtocolReview from "@/src/server/protocols/mutations/updateProtocolReview"
import getProtocolAdmin from "@/src/server/protocols/queries/getProtocolAdmin"
import { ProtocolReviewFormSchema } from "@/src/server/protocols/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ProtocolReviewState } from "@prisma/client"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { useRouter } from "next/navigation"

export const AdminReviewProtocolForm = ({
  initialProtocol,
  protocolId,
}: {
  initialProtocol: Awaited<ReturnType<typeof getProtocolAdmin>>
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
      router.push(`/admin/protocols/${protocolId}`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <>
      {/* Protocol Summary */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Protokoll-Übersicht</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Titel:</span> {protocol.title}
          </div>
          <div>
            <span className="font-medium text-gray-600">Datum:</span>{" "}
            {protocol.date ? format(new Date(protocol.date), "P", { locale: de }) : "—"}
          </div>
          <div>
            <span className="font-medium text-gray-600">Projekt:</span>{" "}
            <Link href={`/${protocol.project.slug}/protocols`}>{protocol.project.slug}</Link>
          </div>
          <div>
            <span className="font-medium text-gray-600">Aktueller Status:</span>{" "}
            <ProtocolReviewStatePill state={protocol.reviewState} />
          </div>
        </div>

        {protocol.body && (
          <div className="mt-4">
            <span className="font-medium text-gray-600">Inhalt:</span>
            <div className="mt-2 max-w-3xl rounded-md bg-white p-4">
              <Markdown markdown={protocol.body} />
            </div>
          </div>
        )}

        {protocol.reviewNotes && (
          <div className="mt-4">
            <span className="font-medium text-gray-600">Bisherige Review-Notizen:</span>
            <div className="mt-2 max-w-3xl rounded-md bg-yellow-50 p-4">
              <Markdown markdown={protocol.reviewNotes} />
            </div>
          </div>
        )}

        {protocol.reviewedBy && (
          <div className="mt-4 text-sm text-gray-600">
            Zuletzt reviewt von: {getFullname(protocol.reviewedBy)}{" "}
            {protocol.reviewedAt && (
              <>am {format(new Date(protocol.reviewedAt), "P", { locale: de })}</>
            )}
          </div>
        )}
      </div>

      {/* Review Form */}
      <Form
        schema={ProtocolReviewFormSchema}
        initialValues={{
          reviewState: protocol.reviewState,
          reviewNotes: protocol.reviewNotes || "",
        }}
        onSubmit={handleSubmit}
        className="max-w-2xl"
      >
        <H3>Review durchführen</H3>

        <div className="space-y-4">
          <LabeledRadiobuttonGroup
            scope="reviewState"
            label="Review-Status"
            items={[
              {
                value: ProtocolReviewState.REVIEWED,
                label: "Genehmigt - Protokoll ist korrekt und kann veröffentlicht werden",
              },
              {
                value: ProtocolReviewState.NEEDSREVIEW,
                label: "Benötigt weitere Überarbeitung",
              },
              {
                value: ProtocolReviewState.REJECTED,
                label: "Abgelehnt - Protokoll entspricht nicht den Standards",
              },
            ]}
          />

          <LabeledTextareaField
            name="reviewNotes"
            label="Review-Notizen (optional)"
            placeholder="Kommentare, Verbesserungsvorschläge oder Begründung für die Entscheidung..."
            rows={5}
            optional
          />
        </div>

        <SubmitButton>Review speichern</SubmitButton>
      </Form>

      <div className="mt-8 border-t border-gray-200 pt-4">
        <Link href={`/admin/protocols/${protocolId}`}>← Zurück zur Protokoll-Details</Link>
      </div>
    </>
  )
}
