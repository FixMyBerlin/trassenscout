"use client"

import { useFilters } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/filter/useFilters.nuqs"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/core/components/text"
import {
  projectRecordDetailRoute,
  projectRecordEditRoute,
} from "@/src/core/routes/projectRecordRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProjectRecords from "@/src/server/projectRecords/queries/getProjectRecords"
import getProjectRecordsBySubsubsection from "@/src/server/projectRecords/queries/getProjectRecordsBySubsubsection"
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react"
import { ChevronDownIcon, SparklesIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { ProjectRecordReviewBadge } from "../[projectRecordId]/_components/ProjectRecordReviewBadge"
import { ProjectRecordTopicsList } from "./ProjectRecordTopicsList"

export const ProjectRecordsTable = ({
  projectRecords,
  highlightId,
  isTopicFilter,
  withSubsection,
  withSubsubsection,
  openLinksInNewTab,
}: {
  projectRecords:
    | Awaited<ReturnType<typeof getProjectRecords>>
    | Awaited<ReturnType<typeof getProjectRecordsBySubsubsection>>
  highlightId?: number | null
  isTopicFilter?: boolean
  withSubsection?: boolean
  withSubsubsection?: boolean
  openLinksInNewTab?: boolean
}) => {
  const projectSlug = useProjectSlug()
  const { filter, setFilter } = useFilters()

  if (!projectRecords.length) return null

  const spaceClasses = "px-3 py-2"

  const handleTopicClick = (topic: string): void => {
    if (topic) setFilter({ ...filter, searchterm: topic })
  }

  return (
    <>
      <TableWrapper className="mt-7">
        <div className="@container min-w-full divide-y divide-gray-300 text-sm text-gray-900">
          <div className="flex flex-row bg-gray-50">
            <div className="grid w-full grid-cols-2 @lg:grid-cols-3">
              <div className={clsx(spaceClasses, "font-medium uppercase")}>Datum</div>
              <div className={clsx(spaceClasses, "font-medium uppercase")}>Titel</div>
              <div className={clsx(spaceClasses, "hidden font-medium uppercase @lg:block")}>
                Tags
              </div>
            </div>
            <div className="p-2">
              <div className="h-5 w-5 shrink-0" />
            </div>
          </div>
          <div className="divide-y divide-gray-200 bg-white">
            {projectRecords.map((projectRecord) => (
              <div key={projectRecord.id}>
                <Disclosure>
                  {({ open }) => (
                    <>
                      <DisclosureButton
                        className={clsx(
                          "group w-full text-left focus:outline-hidden focus-visible:ring focus-visible:ring-gray-500/75",
                          { "border-b border-gray-100": !open },
                        )}
                      >
                        <div className="flex flex-row hover:bg-gray-50">
                          <div
                            className={clsx(
                              "grid w-full grow grid-cols-2 @lg:grid-cols-3",
                              highlightId === projectRecord.id && "bg-green-50",
                            )}
                          >
                            <div className={clsx(spaceClasses, "flex justify-start")}>
                              {projectRecord.date
                                ? format(new Date(projectRecord.date), "P", { locale: de })
                                : "—"}
                            </div>
                            <div
                              className={clsx(
                                spaceClasses,
                                "max-w-xs min-w-0 truncate font-semibold text-blue-500",
                              )}
                              title={projectRecord.title}
                            >
                              {projectRecord.title}
                            </div>
                            <div className={clsx("hidden @lg:block", spaceClasses)}>
                              <div className="flex items-center justify-between gap-2">
                                {/* workaround with stopPropagation to Prevent disclosure toggle */}
                                {/* for now we use this workaround since we propably do not use the disclosure component in the table anyway  */}
                                <div onClick={(e) => e.stopPropagation()}>
                                  <ProjectRecordTopicsList
                                    topics={projectRecord.projectRecordTopics}
                                    isInteractive={isTopicFilter}
                                    onTopicClick={handleTopicClick}
                                  />
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <ProjectRecordReviewBadge
                                    reviewState={projectRecord.reviewState}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            <ChevronDownIcon className="h-5 w-5 shrink-0 text-gray-700 group-hover:text-black group-data-open:rotate-180" />
                          </div>
                        </div>
                      </DisclosureButton>
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
                          className={clsx(
                            "flex flex-col items-start gap-6 overflow-clip p-3 text-sm @lg:flex-row",
                            {
                              "border-b border-gray-100": open,
                            },
                          )}
                        >
                          {projectRecord.body && (
                            // for some reasons prose modifiers did not work here
                            <div className="rounded-md border border-gray-200 p-2">
                              <Markdown
                                className="line-clamp-6 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:leading-tight [&_p]:text-base [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:leading-tight"
                                markdown={projectRecord.body}
                              />
                            </div>
                          )}
                          {/* PA */}
                          {withSubsection && projectRecord.subsection && (
                            <div>
                              <p className="mb-2 font-medium text-gray-500">Abschnitt: </p>
                              <Link
                                href={`/${projectSlug}/abschnitte/${projectRecord.subsection.slug}`}
                              >
                                {shortTitle(projectRecord.subsection.slug)}
                              </Link>
                            </div>
                          )}
                          {/* Eintrag */}
                          {withSubsubsection && projectRecord.subsubsection && (
                            <div>
                              <p className="mb-2 font-medium text-gray-500">Eintrag: </p>
                              <Link
                                href={`/${projectSlug}/abschnitte/${projectRecord.subsubsection.subsection.slug}/fuehrung/${projectRecord.subsubsection.slug}`}
                              >
                                {shortTitle(projectRecord.subsubsection.slug)}
                              </Link>
                            </div>
                          )}
                          {/* Uploads */}
                          {projectRecord.uploads && projectRecord.uploads.length > 0 && (
                            <div>
                              <p className="mb-2 font-medium text-gray-500">
                                Dokumente ({projectRecord.uploads.length}):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {projectRecord.uploads.slice(0, 5).map((upload) => (
                                  <UploadPreviewClickable
                                    key={upload.id}
                                    uploadId={upload.id}
                                    projectSlug={projectSlug}
                                    size="table"
                                  />
                                ))}
                                {projectRecord.uploads.length > 5 && <span>…</span>}
                              </div>
                            </div>
                          )}
                          {/* Topics and " Bestätigung"-Pill */}
                          <div className="@lg:hidden">
                            <div className="flex flex-col gap-6">
                              <div onClick={(e) => e.stopPropagation()}>
                                <ProjectRecordTopicsList
                                  topics={projectRecord.projectRecordTopics}
                                  isInteractive={isTopicFilter}
                                  onTopicClick={handleTopicClick}
                                />
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <ProjectRecordReviewBadge reviewState={projectRecord.reviewState} />
                              </div>
                            </div>
                          </div>
                          {/* Action Buttons */}
                          <div className="flex grow items-end gap-3 @lg:flex-col">
                            <IfUserCanEdit>
                              {projectRecord.reviewState === "NEEDSREVIEW" && (
                                <Link
                                  className="inline-flex items-center justify-center gap-1"
                                  href={projectRecordEditRoute(projectSlug, projectRecord.id)}
                                  blank={openLinksInNewTab}
                                >
                                  <SparklesIcon className="h-3.5 w-3.5" />
                                  Bestätigen
                                </Link>
                              )}
                              <Link
                                icon="edit"
                                href={projectRecordEditRoute(projectSlug, projectRecord.id)}
                                blank={openLinksInNewTab}
                              >
                                Bearbeiten
                              </Link>
                            </IfUserCanEdit>
                            <Link
                              icon="details"
                              href={projectRecordDetailRoute(projectSlug, projectRecord.id)}
                              blank={openLinksInNewTab}
                            >
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

      <SuperAdminLogData data={projectRecords} />
    </>
  )
}
