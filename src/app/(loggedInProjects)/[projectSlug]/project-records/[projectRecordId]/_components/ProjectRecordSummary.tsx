import { ProjectRecordEmailSourceText } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/[projectRecordId]/edit/_components/ProjectRecordEmailSource"
import { createProjectRecordFilterUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/filter/createFilterUrl"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { Link, linkStyles } from "@/src/core/components/links"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { projectRecordUploadEditRoute } from "@/src/core/routes/uploadRoutes"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { twJoin } from "tailwind-merge"

type ProjectRecordSummaryProps = {
  projectRecord: Awaited<ReturnType<typeof getProjectRecord>>
}

export const ProjectRecordSummary = ({ projectRecord }: ProjectRecordSummaryProps) => {
  return (
    <div className="my-6 space-y-6 font-medium">
      <div className="grid max-w-3xl grid-cols-6 gap-3">
        <span className="text-gray-500">am/bis: </span>
        <span className="col-span-5">
          {format(new Date(projectRecord.date!), "P", { locale: de })}
        </span>

        <div className="text-gray-500">Abschnitt: </div>
        {projectRecord.subsection ? (
          <Link
            className="col-span-5 uppercase"
            href={`/${projectRecord.project.slug}/abschnitte/${projectRecord.subsection.slug}`}
          >
            {projectRecord.subsection.slug}
          </Link>
        ) : (
          <span className="col-span-5">Keine Angabe</span>
        )}

        <div className="text-gray-500">Eintrag: </div>
        {projectRecord.subsubsection ? (
          <Link
            className="col-span-5 uppercase"
            href={`/${projectRecord.project.slug}/abschnitte/${projectRecord.subsubsection.subsection.slug}/fuehrung/${projectRecord.subsubsection.slug}`}
          >
            {projectRecord.subsubsection.slug}
          </Link>
        ) : (
          <span className="col-span-5">Keine Angabe</span>
        )}
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
        <p className="mb-3 text-gray-500">Tags: </p>
        {!!projectRecord.projectRecordTopics.length ? (
          <ul className="list-inside list-none space-y-1">
            {projectRecord.projectRecordTopics.map((topic) => (
              <li className="whitespace-nowrap text-gray-700" key={topic.id}>
                <Link
                  href={createProjectRecordFilterUrl(projectRecord.project.slug, {
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
        <p className="mr-2 mb-3 text-gray-500">Dokumente ({projectRecord.uploads?.length || 0})</p>
        {projectRecord.uploads && projectRecord.uploads.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {projectRecord.uploads.map((upload) => (
              <UploadPreviewClickable
                key={upload.id}
                uploadId={upload.id}
                projectSlug={projectRecord.project.slug}
                size="grid"
                editUrl={projectRecordUploadEditRoute(
                  projectRecord.project.slug,
                  projectRecord.id,
                  upload.id,
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
