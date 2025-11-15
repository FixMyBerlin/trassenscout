import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { Link } from "@/src/core/components/links"
import { SubsectionIcon, SubsubsectionIcon } from "@/src/core/components/Map/Icons"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { shortTitle } from "@/src/core/components/text"
import { projectRecordUploadEditRoute } from "@/src/core/routes/uploadRoutes"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { createProjectRecordFilterUrl } from "./createFilterUrl"

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

        <span className="text-gray-500">Titel: </span>
        <span className="col-span-5">{projectRecord.title}</span>

        <div className="text-gray-500">Abschnitt: </div>
        {projectRecord.subsection ? (
          <Link
            className="col-span-5 mt-2 inline-flex"
            href={`/${projectRecord.project.slug}/abschnitte/${projectRecord.subsection.slug}`}
          >
            <SubsectionIcon label={shortTitle(projectRecord.subsection.slug)} />
          </Link>
        ) : (
          <span className="col-span-5">Keine Angabe</span>
        )}

        <div className="text-gray-500">Eintrag: </div>
        {projectRecord.subsubsection ? (
          <Link
            className="col-span-5 mt-2 inline-flex"
            href={`/${projectRecord.project.slug}/abschnitte/${projectRecord.subsubsection.subsection.slug}/fuehrung/${projectRecord.subsubsection.slug}`}
          >
            <SubsubsectionIcon label={shortTitle(projectRecord.subsubsection.slug)} />
          </Link>
        ) : (
          <span className="col-span-5">Keine Angabe</span>
        )}
      </div>

      {projectRecord.body && (
        <div className="max-w-3xl rounded-md bg-purple-100 p-4">
          <Markdown
            className="prose-p:text-base prose-ol:leading-tight prose-ul:list-disc prose-ul:leading-tight"
            markdown={projectRecord.body}
          />
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
        <p className="mr-2 mb-3 text-gray-500">Dokumente:</p>
        {!!projectRecord.uploads?.length ? (
          <div className="flex gap-3">
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
        ) : (
          <span>Keine Dokumente verknüpft</span>
        )}
      </div>
    </div>
  )
}
