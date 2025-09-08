import { ProtocolTypePill } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolsTable"
import { ProtocolReviewStatePill } from "@/src/app/admin/protocols/_components/AdminProtocolsTable"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { SubsectionIcon } from "@/src/core/components/Map/Icons"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { shortTitle } from "@/src/core/components/text"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getProtocolAdmin from "@/src/server/protocols/queries/getProtocolAdmin"
import { ProtocolType } from "@prisma/client"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Admin: Protokoll Details",
}

export default async function AdminProtocolDetailPage({
  params,
}: {
  params: { protocolId: string }
}) {
  const protocolId = parseInt(params.protocolId)
  const protocol = await invoke(getProtocolAdmin, { id: protocolId })

  return (
    <>
      <PageHeader
        title={protocol.title}
        className="mt-12"
        action={
          <div className="flex flex-col gap-2">
            <Link icon="edit" href={`/admin/protocols/${protocolId}/edit`}>
              Bearbeiten
            </Link>
            <Link href={`/admin/protocols/${protocolId}/review`}>Review</Link>
          </div>
        }
      />

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

        <span className="font-medium text-gray-500">Body: </span>
        <div className="max-w-3xl rounded-md bg-purple-100 p-4">
          <Markdown
            className="prose-p:text-base prose-ol:leading-tight prose-ul:list-disc prose-ul:leading-tight"
            markdown={protocol.body}
          />
        </div>

        {!!protocol.protocolTopics.length && (
          <div>
            <p className="mb-2 font-medium text-gray-500">Tags</p>
            <ul className="list-inside list-none space-y-1">
              {protocol.protocolTopics.map((topic) => (
                <li className="whitespace-nowrap text-gray-700" key={topic.id}>
                  # {topic.title}
                </li>
              ))}
            </ul>
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

        <div className="mt-8 gap-4 border-t border-gray-200 pt-4">
          <div>
            <span className="font-medium text-gray-500">Review-Status: </span>
            <ProtocolReviewStatePill state={protocol.reviewState} />
          </div>
          <div>
            <span className="font-medium text-gray-500">Reviewt von: </span>
            <span className="text-gray-900">
              {protocol.reviewedBy ? getFullname(protocol.reviewedBy) : "—"}
            </span>
          </div>

          {protocol.reviewNotes && (
            <div>
              <span className="font-medium text-gray-500">Review-Notizen: </span>
              <div className="mt-2 max-w-3xl rounded-md bg-gray-100 p-4">
                <Markdown markdown={protocol.reviewNotes} />
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 border-t border-gray-200 pt-4">
          <Link href="/admin/protocols">← Zurück zur Admin-Protokoll-Übersicht</Link>
        </div>
      </div>
    </>
  )
}
