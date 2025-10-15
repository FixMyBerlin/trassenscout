"use client"

import { ProtocolTypePill } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolsTable"
import { Form, LabeledRadiobuttonGroup, LabeledTextareaField } from "@/src/core/components/forms"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { Link } from "@/src/core/components/links"
import { SubsectionIcon } from "@/src/core/components/Map/Icons"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { H3, shortTitle } from "@/src/core/components/text"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import updateProtocolReview from "@/src/server/protocols/mutations/updateProtocolReview"
import getProtocolAdmin from "@/src/server/protocols/queries/getProtocolAdmin"
import { ProtocolReviewFormSchema } from "@/src/server/protocols/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ProtocolReviewState, ProtocolType } from "@prisma/client"
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
      router.push(`/admin/protocols`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <>
      {/* Protocol Summary */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <h3 className="mb-4 text-lg font-semibold">Protokoll-Übersicht</h3>
          <Link icon="edit" href={`/admin/protocols/${protocolId}/edit`}>
            Protokoll bearbeiten
          </Link>
        </div>
        <div className="mt-7 space-y-4">
          <div>
            <span className="font-medium text-gray-500">Datum: </span>
            <span className="text-gray-900">
              {protocol.date ? format(new Date(protocol.date), "P", { locale: de }) : "—"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Projekt: </span>
            <Link href={`/${protocol.project.slug}/protocols`}>
              {shortTitle(protocol.project.slug)}
            </Link>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-medium text-gray-500">Planungsabschnitt: </span>
            {protocol.subsection ? (
              <Link href={`/${protocol.project.slug}/abschnitte/${protocol.subsection.slug}`}>
                <SubsectionIcon label={shortTitle(protocol.subsection.slug)} />
              </Link>
            ) : (
              "k.A."
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-gray-500">Tags: </p>
          <ul className="list-inside list-none space-y-1">
            {!!protocol.protocolTopics.length ? (
              protocol.protocolTopics.map((topic) => (
                <li className="whitespace-nowrap text-gray-700" key={topic.id}>
                  # {topic.title}
                </li>
              ))
            ) : (
              <li className="whitespace-nowrap text-gray-700">Keine Tags zugeordnet</li>
            )}
          </ul>
        </div>

        {protocol.body && (
          <div className="mt-4">
            <span className="font-medium text-gray-500">Body:</span>
            <div className="mt-2 max-w-3xl rounded-md bg-white p-4">
              <Markdown markdown={protocol.body} />
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500">
            <p className="text-xs">
              <span>Erstellt von </span>
              <ProtocolTypePill type={protocol.protocolAuthorType} />
              {protocol.protocolAuthorType === ProtocolType.USER && protocol.author && (
                <span>{getFullname(protocol.author)}</span>
              )}
            </p>
            <p className="mt-2 text-xs">
              <span>Zuletzt bearbeitet von </span>
              <ProtocolTypePill type={protocol.protocolUpdatedByType} />{" "}
              {protocol.protocolUpdatedByType === ProtocolType.USER && protocol.updatedBy && (
                <span>{getFullname(protocol.updatedBy)}</span>
              )}
            </p>
          </div>
        </div>
      </div>

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
          <LabeledRadiobuttonGroup
            scope="reviewState"
            label="Review-Status"
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
