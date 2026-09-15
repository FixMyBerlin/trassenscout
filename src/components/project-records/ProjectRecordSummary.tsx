import { format } from "date-fns"
import { de } from "date-fns/locale"
import type { ReactNode } from "react"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { ProjectRecordAssignmentForm } from "@/src/components/project-records/ProjectRecordAssignmentForm"
import {
  ProjectRecordEmailSourceDisclosure,
  type ProjectRecordEmailSourceValue,
} from "@/src/components/project-records/ProjectRecordEmailSource"
import { ProjectRecordFormTemplatesSection } from "@/src/components/project-records/ProjectRecordFormTemplatesSection"
import { ProjectRecordVerknuepfungen } from "@/src/components/project-records/ProjectRecordVerknuepfungen"
import { createProjectRecordFilterUrl } from "@/src/components/project-records/utils/filter/createFilterUrl"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import { getEffectiveFormTemplates } from "@/src/shared/formTemplates/effectiveFormTemplates"

type Props = {
  projectRecord: ProjectRecord & {
    projectRecordEmail?: ProjectRecordEmailSourceValue | null
  }
  /** Rendered under "Dokumente", so this view keeps the reading order of the form. */
  uploadsSection?: ReactNode
}
export const metadataItemClassName = "flex flex-wrap items-center gap-3 text-sm text-gray-600"
export const projectRecordSectionClassName =
  "grid gap-2 sm:grid-cols-[minmax(170px,_190px)_1fr] sm:items-start sm:gap-x-1 sm:gap-y-4"
export const projectRecordSectionLabelClassName = "text-sm font-medium text-gray-700"
export const projectRecordSectionValueClassName = "text-sm text-gray-700"

export const ProjectRecordSummary = ({ projectRecord, uploadsSection }: Props) => {
  const projectSlug = projectRecord.project.slug
  const formTemplates = getEffectiveFormTemplates(projectRecord, {
    projectSlug,
    hasSubsubsection:
      projectRecord.subsubsections.length > 0 || Boolean(projectRecord.subsubsection),
    hasAcquisitionArea:
      projectRecord.acquisitionAreas.length > 0 || Boolean(projectRecord.acquisitionArea),
  })

  return (
    <div className="my-6 space-y-6">
      <ProjectRecordAssignmentForm key={projectRecord.id} projectRecord={projectRecord} />

      {projectRecord.body && (
        <section className="rounded-md bg-blue-50 p-4">
          <Markdown
            className="prose prose-sm max-w-none text-gray-700 prose-p:my-2 prose-p:text-sm prose-ol:my-2 prose-ol:pl-4 prose-ol:leading-tight prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4 prose-ul:leading-tight"
            markdown={projectRecord.body}
          />
        </section>
      )}

      {projectRecord.projectRecordEmail && (
        <ProjectRecordEmailSourceDisclosure
          email={projectRecord.projectRecordEmail}
          className="mb-6"
        />
      )}

      <div className={projectRecordSectionClassName}>
        <p className={projectRecordSectionLabelClassName}>Am/bis:</p>
        <p className={projectRecordSectionValueClassName}>
          {format(new Date(projectRecord.date!), "P", { locale: de })}
        </p>
      </div>

      {/* One row for both relation types, rendered by the same component the list uses. */}
      <div className={projectRecordSectionClassName}>
        <p className={projectRecordSectionLabelClassName}>Verknüpfungen:</p>
        <ProjectRecordVerknuepfungen
          projectSlug={projectSlug}
          landAcquisitionModuleEnabled={projectRecord.project.landAcquisitionModuleEnabled}
          subsubsection={projectRecord.subsubsection}
          subsubsections={projectRecord.subsubsections}
          acquisitionArea={projectRecord.acquisitionArea}
          acquisitionAreas={projectRecord.acquisitionAreas}
          className={twJoin(projectRecordSectionValueClassName, "[&>ul]:mt-0")}
        />
      </div>

      <div className={projectRecordSectionClassName}>
        <p className={projectRecordSectionLabelClassName}>Tags:</p>
        {projectRecord.tags.length ? (
          <div className={`flex flex-wrap gap-x-3 gap-y-1 ${projectRecordSectionValueClassName}`}>
            {projectRecord.tags.map((tag) => (
              <span className="whitespace-nowrap" key={tag.id}>
                <Link
                  to={createProjectRecordFilterUrl(projectSlug, {
                    searchterm: tag.title,
                  })}
                >
                  #{tag.title}
                </Link>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-500">Keine Tags zugeordnet</span>
        )}
      </div>

      <div>
        <p className={projectRecordSectionLabelClassName}>Dokumente:</p>
        {uploadsSection}
      </div>

      {formTemplates.length > 0 && (
        <div className={projectRecordSectionClassName}>
          <p className={projectRecordSectionLabelClassName}>Formulare:</p>
          <ProjectRecordFormTemplatesSection
            projectSlug={projectSlug}
            projectRecord={projectRecord}
            formTemplates={formTemplates}
          />
        </div>
      )}
    </div>
  )
}
