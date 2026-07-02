import { format } from "date-fns"
import { de } from "date-fns/locale"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { getFullname } from "@/src/components/core/users/getFullname"
import { ProjectRecordAssignedToPill } from "@/src/components/project-records/ProjectRecordAssignedToPill"
import { ProjectRecordEditingStateIndicator } from "@/src/components/project-records/ProjectRecordEditingStateIndicator"
import { ProjectRecordEmailSourceText } from "@/src/components/project-records/ProjectRecordEmailSource"
import { ProjectRecordVerknuepfungen } from "@/src/components/project-records/ProjectRecordVerknuepfungen"
import { createProjectRecordFilterUrl } from "@/src/components/project-records/utils/filter/createFilterUrl"
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

  const metadataItemClassName = "flex flex-wrap items-center gap-3 text-sm text-gray-600"
  const metadataLabelClassName = "text-sm font-medium text-gray-700"
  const sectionClassName =
    "grid gap-2 sm:grid-cols-[minmax(170px,_190px)_1fr] sm:items-start sm:gap-x-1 sm:gap-y-4"
  const sectionLabelClassName = metadataLabelClassName
  const sectionValueClassName = "text-sm text-gray-700"

  return (
    <div className="my-6 space-y-6">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
        <div className={metadataItemClassName}>
          <span className={metadataLabelClassName}>Am/bis:</span>
          <span className="text-gray-600">
            {format(new Date(projectRecord.date!), "P", { locale: de })}
          </span>
        </div>
        {projectRecord.assignedTo && (
          <div className={metadataItemClassName}>
            <span className={metadataLabelClassName}>Zugewiesen:</span>
            <Link
              classNameOverwrites="inline-flex rounded-md text-inherit no-underline hover:opacity-90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500/40"
              to={createProjectRecordFilterUrl(projectSlug, {
                searchterm: getFullname(projectRecord.assignedTo)!.trim(),
              })}
            >
              <ProjectRecordAssignedToPill assignedTo={projectRecord.assignedTo} variant="detail" />
            </Link>
          </div>
        )}
        <div className={metadataItemClassName}>
          <span className={metadataLabelClassName}>Status:</span>
          <ProjectRecordEditingStateIndicator
            editingState={projectRecord.editingState}
            variant="detail"
          />
        </div>
      </div>

      {projectRecord.body && (
        <section className="rounded-md bg-blue-50 p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">Zusammenfassung</h2>
          <Markdown
            className="prose prose-sm max-w-none text-gray-700 prose-p:my-2 prose-p:text-sm prose-ol:my-2 prose-ol:pl-4 prose-ol:leading-tight prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4 prose-ul:leading-tight"
            markdown={projectRecord.body}
          />
        </section>
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

      <div className={sectionClassName}>
        <p className={sectionLabelClassName}>Eintrag:</p>
        {projectRecord.subsubsections.length > 0 || projectRecord.subsubsection ? (
          <ProjectRecordVerknuepfungen
            projectSlug={projectSlug}
            landAcquisitionModuleEnabled={projectRecord.project.landAcquisitionModuleEnabled}
            subsubsection={projectRecord.subsubsection}
            subsubsections={projectRecord.subsubsections}
            variant="valuesOnly"
            relationType="subsubsections"
            className={sectionValueClassName}
          />
        ) : (
          <span className="text-sm text-gray-500">Kein Eintrag zugeordnet</span>
        )}
      </div>

      {(projectRecord.acquisitionAreas.length > 0 || projectRecord.acquisitionArea) &&
        projectRecord.project.landAcquisitionModuleEnabled && (
          <div className={sectionClassName}>
            <p className={sectionLabelClassName}>
              {(projectRecord.acquisitionAreas.length > 0
                ? projectRecord.acquisitionAreas.length
                : projectRecord.acquisitionArea
                  ? 1
                  : 0) === 1
                ? "Verhandlungsfläche:"
                : "Verhandlungsflächen:"}
            </p>
            <ProjectRecordVerknuepfungen
              projectSlug={projectSlug}
              landAcquisitionModuleEnabled={projectRecord.project.landAcquisitionModuleEnabled}
              acquisitionArea={projectRecord.acquisitionArea}
              acquisitionAreas={projectRecord.acquisitionAreas}
              variant="valuesOnly"
              relationType="acquisitionAreas"
              className={sectionValueClassName}
            />
          </div>
        )}

      <div className={sectionClassName}>
        <p className={sectionLabelClassName}>Tags:</p>
        {projectRecord.projectRecordTopics.length ? (
          <div className={`flex flex-wrap gap-x-3 gap-y-1 ${sectionValueClassName}`}>
            {projectRecord.projectRecordTopics.map((topic) => (
              <span className="whitespace-nowrap" key={topic.id}>
                <Link
                  to={createProjectRecordFilterUrl(projectSlug, {
                    searchterm: topic.title,
                  })}
                >
                  #{topic.title}
                </Link>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-500">Keine Tags zugeordnet</span>
        )}
      </div>

      <div>
        <p className="mb-2 text-gray-500">Dokumente:</p>
      </div>
    </div>
  )
}
