"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Disclosure } from "@/src/core/components/Disclosure"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import getProtocols from "@/src/server/protocols/queries/getProtocols"
import clsx from "clsx"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export const ProtocolsTable = ({
  protocols,
}: {
  protocols: Awaited<ReturnType<typeof getProtocols>>
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
                DATUM
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                TITEL
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                PLANUNGSABSCHNITT
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 bg-white">
            {protocols.map((protocol) => (
              <div key={protocol.id}>
                <Disclosure
                  classNamePanel="p-3 text-sm flex gap-4 items-start"
                  classNameButton="hover:bg-gray-50 text-left"
                  button={
                    <div className="grid flex-grow grid-cols-3">
                      <div className={clsx(spaceClasses, "text-sm font-medium text-gray-900")}>
                        {protocol.date ? format(new Date(protocol.date), "P", { locale: de }) : "—"}
                      </div>
                      <div className={clsx(spaceClasses, "text-sm font-semibold text-blue-500")}>
                        {protocol.title}
                      </div>
                      <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                        {protocol.subsection ? (
                          <Link
                            href={`/${projectSlug}/subsections/${protocol.subsection.slug}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            {shortTitle(protocol.subsection.slug)}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  }
                >
                  {protocol.description && (
                    <Markdown
                      className="rounded-md bg-purple-100 p-2"
                      markdown={protocol.description}
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
                  <ButtonWrapper className="flex flex-col justify-end gap-3">
                    <IfUserCanEdit>
                      <Link icon="edit" href={`/${projectSlug}/protocols/${protocol.id}/edit`}>
                        Bearbeiten
                      </Link>
                      <Link href={`/${projectSlug}/protocols/${protocol.id}`}>Detailansicht</Link>
                    </IfUserCanEdit>
                  </ButtonWrapper>
                </Disclosure>
              </div>
            ))}
          </div>
        </div>
      </TableWrapper>

      <SuperAdminLogData data={protocols} />
    </>
  )
}
