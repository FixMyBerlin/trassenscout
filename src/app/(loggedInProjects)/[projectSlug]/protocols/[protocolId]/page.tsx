import { createProtocolFilterUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/createFilterUrl"
import { ProtocolTypePill } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolsTable"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links"
import { SubsectionIcon } from "@/src/core/components/Map/Icons"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { shortTitle } from "@/src/core/components/text"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { ProtocolType } from "@prisma/client"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Projektprotokoll",
}

export default async function ProtocolDetail({
  params,
}: {
  params: { projectSlug: string; protocolId: string }
}) {
  const protocolId = parseInt(params.protocolId)
  const protocol = await invoke(getProtocol, { projectSlug: params.projectSlug, id: protocolId })

  return (
    <>
      <PageHeader
        title={protocol.title}
        className="mt-12"
        action={
          <IfUserCanEdit>
            <Link icon="edit" href={`/${params.projectSlug}/protocols/${protocolId}/edit`}>
              Bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />

      <SuperAdminBox>
        <p className="text-xs">
          <span>Erstellt von </span>
          <ProtocolTypePill type={protocol.protocolAuthorType} />{" "}
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
      </SuperAdminBox>

      <div className="mt-7 space-y-4">
        <div>
          <span className="font-medium text-gray-500">am/bis: </span>
          <span className="text-gray-900">
            {format(new Date(protocol.date!), "P", { locale: de })}
          </span>
        </div>

        {protocol.subsection && (
          <div className="flex items-end gap-2">
            <span className="font-medium text-gray-500">Planungsabschnitt: </span>
            <Link href={`/${params.projectSlug}/abschnitte/${protocol.subsection.slug}`}>
              <SubsectionIcon label={shortTitle(protocol.subsection.slug)} />
            </Link>
          </div>
        )}

        {protocol.body && (
          <div className="max-w-3xl rounded-md bg-purple-100 p-4">
            <Markdown
              className="prose-p:text-base prose-ol:leading-tight prose-ul:list-disc prose-ul:leading-tight"
              markdown={protocol.body}
            />
          </div>
        )}

        {!!protocol.protocolTopics.length && (
          <div>
            <p className="mb-2 font-medium text-gray-500">Tags</p>
            <ul className="list-inside list-none space-y-1">
              {protocol.protocolTopics.map((topic) => (
                <li className="whitespace-nowrap text-gray-700" key={topic.id}>
                  <Link
                    href={createProtocolFilterUrl(params.projectSlug, { searchterm: topic.title })}
                  >
                    #{topic.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SuperAdminBox>
          <div>
            <p className="mb-2 font-medium text-gray-500">Review-Status: {protocol.reviewState}</p>
          </div>
          <div>
            <p className="mb-2 font-medium text-gray-500">Review-Notizen: {protocol.reviewNotes}</p>
          </div>
          <div>
            <p className="mb-2 font-medium text-gray-500">
              Review von:
              {protocol.reviewedBy?.firstName} {protocol.reviewedBy?.lastName}
            </p>
          </div>
        </SuperAdminBox>

        <div className="mt-8 border-t border-gray-200 pt-4">
          <Link href={`/${params.projectSlug}/protocols`}>← Zurück zur Protokoll-Übersicht</Link>
        </div>
      </div>
    </>
  )
}
