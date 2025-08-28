"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Disclosure } from "@/src/core/components/Disclosure"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/core/components/text"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { ProtocolType } from "@prisma/client"
import clsx from "clsx"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export const ProtocolTypePill = ({ type }: { type: ProtocolType }) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 font-medium text-gray-500",
      type === ProtocolType.USER ? "bg-blue-100" : "bg-gray-100",
    )}
  >
    {type}
  </span>
)

export const ProtocolsTable = ({
  protocols,
  highlightId,
}: {
  protocols: Awaited<ReturnType<typeof getProtocols>>
  highlightId: number | null
}) => {
  const projectSlug = useProjectSlug()
  protocols.sort((a, b) => {
    return a.date && b.date && a.date < b.date ? 1 : -1
  })

  const spaceClasses = "px-3 py-2"

  return (
    <>
      <TableWrapper className="mt-7">
        <div className="min-w-full divide-y divide-gray-300">
          <div className="bg-gray-50 pr-5">
            <div className="grid grid-cols-3">
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                Datum
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                Titel
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                Planungsabschnitt
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 bg-white">
            {!!protocols.length ? (
              protocols.map((protocol) => (
                <div key={protocol.id}>
                  <Disclosure
                    classNamePanel="p-3 text-sm flex gap-4 items-start"
                    classNameButton={clsx(
                      "text-left hover:bg-gray-50",
                      highlightId === protocol.id && "bg-green-50",
                    )}
                    button={
                      <div className="grid flex-grow grid-cols-3">
                        <div className={clsx(spaceClasses, "text-sm font-medium text-gray-900")}>
                          {protocol.date
                            ? format(new Date(protocol.date), "P", { locale: de })
                            : "—"}
                        </div>
                        <div className={clsx(spaceClasses, "text-sm font-semibold text-blue-500")}>
                          {protocol.title}
                        </div>
                        <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                          {protocol.subsection ? (
                            <Link href={`/${projectSlug}/subsections/${protocol.subsection.slug}`}>
                              {shortTitle(protocol.subsection.slug)}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>
                    }
                  >
                    {protocol.body && (
                      // for some reasons prose modifiers did not work here
                      <Markdown
                        className="rounded-md bg-purple-100 p-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:leading-tight [&_p]:text-base [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:leading-tight"
                        markdown={protocol.body}
                      />
                    )}
                    {!!protocol.protocolTopics.length && (
                      <div>
                        <p className="mb-4 font-medium text-gray-500">Tags</p>
                        <ul className="list-inside list-none">
                          {protocol.protocolTopics.map((topic) => (
                            <li className="whitespace-nowrap" key={topic.id}>
                              # {topic.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <ButtonWrapper className="flex flex-col justify-end gap-3">
                        <IfUserCanEdit>
                          <Link icon="edit" href={`/${projectSlug}/protocols/${protocol.id}/edit`}>
                            Bearbeiten
                          </Link>
                          <Link href={`/${projectSlug}/protocols/${protocol.id}`}>
                            Detailansicht
                          </Link>
                        </IfUserCanEdit>
                      </ButtonWrapper>
                      <SuperAdminBox>
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
                          {protocol.protocolUpdatedByType === ProtocolType.USER &&
                            protocol.updatedBy && <span>{getFullname(protocol.updatedBy)}</span>}
                        </p>
                      </SuperAdminBox>
                    </div>
                  </Disclosure>
                </div>
              ))
            ) : (
              <ZeroCase visible={protocols.length} name="Protokolle" />
            )}
          </div>
        </div>
      </TableWrapper>

      <SuperAdminLogData data={protocols} />
    </>
  )
}
