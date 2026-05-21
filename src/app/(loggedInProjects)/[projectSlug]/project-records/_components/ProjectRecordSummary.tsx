import { ProjectRecordAssignedToPill } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordAssignedToPill"
import { ProjectRecordEditingStateIndicator } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordEditingStateIndicator"
import { ProjectRecordEmailSourceText } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordEmailSource"
import { ProjectRecordVerknuepfungen } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordVerknuepfungen"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { createProjectRecordFilterUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/filter/createFilterUrl"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { Link, linkStyles } from "@/src/core/components/links"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { useCurrentReturnTo } from "@/src/core/routes/useCurrentPathWithSearch"
import { uploadEditRouteForProjectRecord } from "@/src/core/routes/uploadRoutes"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { twJoin } from "tailwind-merge"

type Props = {
  projectRecord: Awaited<ReturnType<typeof getProjectRecord>>
}

export const ProjectRecordSummary = ({ projectRecord }: Props) => {
  const projectSlug = projectRecord.project.slug
  const returnTo = useCurrentReturnTo()

  return (
    <div className="my-6 space-y-6 font-medium">
      <div className="grid max-w-3xl grid-cols-4 gap-3">
        <span className="text-gray-500">Status: </span>
        <span className="col-span-3">
          <ProjectRecordEditingStateIndicator
            editingState={projectRecord.editingState}
            variant="detail"
          />
        </span>
        {projectRecord.assignedTo && (
          <>
            <span className="text-gray-500">Zugewiesen: </span>
            <span className="col-span-3">
              <Link
                classNameOverwrites="inline-flex rounded-md text-inherit no-underline hover:opacity-90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500/40"
                href={createProjectRecordFilterUrl(projectSlug, {
                  searchterm: getFullname(projectRecord.assignedTo)!.trim(),
                })}
              >
                <ProjectRecordAssignedToPill
                  assignedTo={projectRecord.assignedTo}
                  variant="detail"
                />
              </Link>
            </span>
          </>
        )}
        <span className="text-gray-500">am/bis: </span>
        <span className="col-span-3">
          {format(new Date(projectRecord.date!), "P", { locale: de })}
        </span>

      </div>

      {projectRecord.body && (
        <div className="max-w-3xl rounded-md bg-blue-50 p-4">
          <Markdown
            className="prose-p:text-base prose-ol:leading-tight prose-ul:list-disc prose-ul:leading-tight"
            markdown={projectRecord.body}
          />
        </div>
      )}

      {projectRecord.projectRecordEmail && (
        <div className="mb-6">
          <details className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2">
            <summary className={twJoin(linkStyles, "cursor-pointer")}>
              Quellnachricht (unverarbeitet)
            </summary>
            <div className="mt-4">
              <ProjectRecordEmailSourceText email={projectRecord.projectRecordEmail} />
            </div>
          </details>
          <p className="font-normal text-gray-600">
            Die „Quellnachricht“ zeigt die unveränderte E-Mail, bevor die KI sie zusammengefasst
            hat. Nutzen Sie diese Ansicht gern zur Kontrolle, wenn Sie sich bei einzelnen
            Formulierungen oder Inhalten unsicher sind.
          </p>
        </div>
      )}

      <div>
        <p className="mb-2 text-gray-500">Tags: </p>
        {!!projectRecord.projectRecordTopics.length ? (
          <ul className="list-inside list-none space-y-1">
            {projectRecord.projectRecordTopics.map((topic) => (
              <li className="whitespace-nowrap text-gray-700" key={topic.id}>
                <Link
                  href={createProjectRecordFilterUrl(projectSlug, {
                    searchterm: topic.title,
                  })}
                >
                  #{topic.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <span>Keine Tags zugeordnet</span>
        )}
      </div>

      <div>
        <p className="mb-2 text-gray-500">Verknüpfungen:</p>
        <ProjectRecordVerknuepfungen
          projectSlug={projectSlug}
          landAcquisitionModuleEnabled={projectRecord.project.landAcquisitionModuleEnabled}
          subsubsection={projectRecord.subsubsection}
          acquisitionArea={projectRecord.acquisitionArea}
        />
      </div>

      {!!projectRecord.uploads.length && (
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {projectRecord.uploads.map((upload) => (
              <UploadPreviewClickable
                key={upload.id}
                uploadId={upload.id}
                upload={upload}
                projectSlug={projectSlug}
                size="grid"
                editUrl={uploadEditRouteForProjectRecord(projectSlug, upload.id, projectRecord.id, {
                  returnTo,
                })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
