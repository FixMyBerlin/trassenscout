import { format } from "date-fns"
import { de } from "date-fns/locale"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { useCurrentReturnTo } from "@/src/components/core/routes/useCurrentPathWithSearch"
import { getFullname } from "@/src/components/core/users/getFullname"
import { ProjectRecordAssignedToPill } from "@/src/components/project-records/ProjectRecordAssignedToPill"
import { ProjectRecordEditingStateIndicator } from "@/src/components/project-records/ProjectRecordEditingStateIndicator"
import { ProjectRecordEmailSourceText } from "@/src/components/project-records/ProjectRecordEmailSource"
import { ProjectRecordVerknuepfungen } from "@/src/components/project-records/ProjectRecordVerknuepfungen"
import { createProjectRecordFilterUrl } from "@/src/components/project-records/utils/filter/createFilterUrl"
import { UploadPreviewClickable } from "@/src/components/uploads/UploadPreviewClickable"
import type { ProjectRecord } from "@/src/server/projectRecords/types"

type Props = {
  projectRecord: ProjectRecord & {
    projectRecordEmail?: {
      from: string | null
      subject: string | null
      date: Date | null
      textBody: string | null
      uploads: { id: number; title: string }[]
    } | null
  }
}

export const ProjectRecordSummary = ({ projectRecord }: Props) => {
  const projectSlug = projectRecord.project.slug
  const returnTo = useCurrentReturnTo()

  const buildUploadEditLink = (uploadId: number) => ({
    to: "/$projectSlug/uploads/$uploadId/edit" as const,
    params: { projectSlug, uploadId: String(uploadId) },
    search: {
      returnProjectRecordId: String(projectRecord.id),
      ...(returnTo ? { returnTo } : {}),
    },
  })

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
                to={createProjectRecordFilterUrl(projectSlug, {
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
        {projectRecord.projectRecordTopics.length ? (
          <ul className="list-inside list-none space-y-1">
            {projectRecord.projectRecordTopics.map((topic) => (
              <li className="whitespace-nowrap text-gray-700" key={topic.id}>
                <Link
                  to={createProjectRecordFilterUrl(projectSlug, {
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
          subsubsections={projectRecord.subsubsections}
          acquisitionAreas={projectRecord.acquisitionAreas}
        />
      </div>

      {!!projectRecord.uploads.length && (
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {projectRecord.uploads.map((upload) => (
              <UploadPreviewClickable
                key={upload.id}
                uploadId={upload.id}
                projectSlug={projectSlug}
                size="grid"
                editLink={buildUploadEditLink(upload.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
