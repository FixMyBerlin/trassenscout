import { Link } from "@/src/core/components/links"
import { SubsectionIcon, SubsubsectionIcon } from "@/src/core/components/Map/Icons"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { shortTitle } from "@/src/core/components/text"
import getProjectRecord from "@/src/server/projectRecord/queries/getProjectRecord"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { createProjectRecordFilterUrl } from "./createFilterUrl"

type ProjectRecordSummaryProps = {
  projectRecord: Awaited<ReturnType<typeof getProjectRecord>>
}

export const ProjectRecordSummary = ({ projectRecord }: ProjectRecordSummaryProps) => {
  return (
    <div className="mt-7 space-y-4">
      <div>
        <span className="font-medium text-gray-500">am/bis: </span>
        <span>{format(new Date(projectRecord.date!), "P", { locale: de })}</span>
      </div>
      <div>
        <span className="font-medium text-gray-500">Titel: </span>
        <span>{projectRecord.title}</span>
      </div>
      <div>
        <span className="font-medium text-gray-500">Planungsabschnitt: </span>
        {projectRecord.subsection ? (
          <Link
            className="inline-flex"
            href={`/${projectRecord.project.slug}/abschnitte/${projectRecord.subsection.slug}`}
          >
            <SubsectionIcon label={shortTitle(projectRecord.subsection.slug)} />
          </Link>
        ) : (
          <span>Keine Angabe</span>
        )}
      </div>

      <div>
        <span className="font-medium text-gray-500">Eintrag: </span>
        {projectRecord.subsubsection ? (
          <Link
            className="inline-flex"
            href={`/${projectRecord.project.slug}/abschnitte/${projectRecord.subsubsection.subsection.slug}/fuehrung/${projectRecord.subsubsection.slug}`}
          >
            <SubsubsectionIcon label={shortTitle(projectRecord.subsubsection.slug)} />
          </Link>
        ) : (
          <span>Keine Angabe</span>
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
        <p className="mb-2 font-medium text-gray-500">Tags: </p>
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
        <p className="mb-2 font-medium text-gray-500">Verknüpfte Dokumente</p>
        {!!projectRecord.uploads?.length ? (
          <ul className="list-inside list-disc space-y-1">
            {projectRecord.uploads.map((upload) => (
              <li key={upload.id} className="text-gray-700">
                <a
                  href={upload.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {upload.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <span>Keine Dokumente verknüpft</span>
        )}
      </div>
    </div>
  )
}
