"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/CreateEditReviewHistory"
import { useFilters } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/useFilters.nuqs"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link, linkStyles } from "@/src/core/components/links"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react"
import { ChevronDownIcon, SparklesIcon } from "@heroicons/react/20/solid"
import { ProtocolReviewState, ProtocolType } from "@prisma/client"
import clsx from "clsx"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export const ProtocolTypePill = ({
  type,
  author,
}: {
  type: ProtocolType
  author?: Awaited<ReturnType<typeof getProtocol>>["author"]
}) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 font-medium text-gray-500",
      type === ProtocolType.USER ? "bg-blue-100" : "bg-gray-100",
    )}
  >
    {type === ProtocolType.USER ? (
      author ? (
        <span>{getFullname(author) || "Nutzer*in"}</span>
      ) : (
        "Nutzer*in"
      )
    ) : (
      <span className="inline-flex items-center gap-1">
        <SparklesIcon className="h-3.5 w-3.5" />
        System
      </span>
    )}
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
  const { filter, setFilter } = useFilters()

  if (!protocols.length) return null

  const spaceClasses = "px-3 py-2"

  const handleTopicClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const topic = event.currentTarget.value
    if (topic) setFilter({ ...filter, searchterm: topic })
  }

  return (
    <>
      <TableWrapper className="mt-7">
        <div className="min-w-full divide-y divide-gray-300 text-sm text-gray-900">
          <div className="bg-gray-50">
            <div className="grid grid-cols-3">
              <div className={clsx(spaceClasses, "font-medium uppercase")}>Datum</div>
              <div className={clsx(spaceClasses, "font-medium uppercase")}>Titel</div>
              <div className={clsx(spaceClasses, "font-medium uppercase")}>Tags</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 bg-white">
            {protocols.map((protocol) => (
              <div key={protocol.id}>
                <Disclosure>
                  {({ open }) => (
                    <>
                      <div
                        className={clsx(
                          "group grid grid-cols-3 hover:bg-gray-50",
                          highlightId === protocol.id && "bg-green-50",
                        )}
                      >
                        <DisclosureButton
                          className={clsx(
                            "group col-span-2 text-left focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75",
                            { "border-b border-gray-100": !open },
                          )}
                        >
                          <div className="grid grid-cols-2">
                            <div className={clsx(spaceClasses, "flex justify-start")}>
                              <ChevronDownIcon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-700 group-hover:text-black group-data-[open]:rotate-180" />
                              {protocol.date
                                ? format(new Date(protocol.date), "P", { locale: de })
                                : "—"}
                            </div>
                            <div className={clsx(spaceClasses, "font-semibold text-blue-500")}>
                              {protocol.title}
                            </div>
                          </div>
                        </DisclosureButton>
                        <div className={spaceClasses}>
                          <div className="flex justify-between">
                            {protocol.protocolTopics.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {protocol.protocolTopics.map((topic) => (
                                  <button
                                    key={topic.id}
                                    className={clsx(
                                      linkStyles,
                                      "inline-block rounded bg-gray-100 px-2 py-1 text-xs",
                                    )}
                                    onClick={handleTopicClick}
                                    type="button"
                                    value={topic.title}
                                  >
                                    # {topic.title}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              "-"
                            )}
                            <div>
                              {protocol.protocolAuthorType === ProtocolType.SYSTEM && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 font-medium text-gray-500">
                                  <SparklesIcon className="h-3.5 w-3.5" />
                                  {protocol.reviewState === ProtocolReviewState.NEEDSREVIEW
                                    ? "Freigabe erforderlich"
                                    : "Freigegeben"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Transition
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <DisclosurePanel
                          static
                          className={clsx("flex items-start gap-4 overflow-clip p-3 text-sm", {
                            "border-b border-gray-100": open,
                          })}
                        >
                          {protocol.body && (
                            // for some reasons prose modifiers did not work here
                            <Markdown
                              className="rounded-md bg-purple-100 p-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:leading-tight [&_p]:text-base [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:leading-tight"
                              markdown={protocol.body}
                            />
                          )}
                          {protocol.subsection && (
                            <div>
                              <p className="mb-2">Planungsabschnitt: </p>
                              <Link href={`/${projectSlug}/abschnitte/${protocol.subsection.slug}`}>
                                {shortTitle(protocol.subsection.slug)}
                              </Link>
                            </div>
                          )}
                          <CreateEditReviewHistory protocol={protocol} />
                          <div className="flex flex-col items-start gap-3">
                            <IfUserCanEdit>
                              {protocol.reviewState === "NEEDSREVIEW" && (
                                <Link
                                  className="inline-flex items-center justify-center gap-1"
                                  href={`/${projectSlug}/protocols/${protocol.id}/review`}
                                >
                                  <SparklesIcon className="h-3.5 w-3.5" />
                                  Freigabe
                                </Link>
                              )}
                              <Link
                                icon="edit"
                                href={`/${projectSlug}/protocols/${protocol.id}/edit`}
                              >
                                Bearbeiten
                              </Link>
                            </IfUserCanEdit>
                            <Link icon="details" href={`/${projectSlug}/protocols/${protocol.id}`}>
                              Detailansicht
                            </Link>
                          </div>
                        </DisclosurePanel>
                      </Transition>
                    </>
                  )}
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
