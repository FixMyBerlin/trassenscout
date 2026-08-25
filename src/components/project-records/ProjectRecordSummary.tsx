import { format } from "date-fns"
import { de } from "date-fns/locale"
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
  onFormSaved?: () => void
}
export const metadataItemClassName = "flex flex-wrap items-center gap-3 text-sm text-gray-600"
export const projectRecordSectionClassName =
  "grid gap-2 sm:grid-cols-[minmax(170px,_190px)_1fr] sm:items-start sm:gap-x-1 sm:gap-y-4"
export const projectRecordSectionLabelClassName = "text-sm font-medium text-gray-700"
export const projectRecordSectionValueClassName = "text-sm text-gray-700"

export const ProjectRecordSummary = ({ projectRecord, onFormSaved }: Props) => {
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
      <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
        <div className={metadataItemClassName}>
          <span className={projectRecordSectionLabelClassName}>Am/bis:</span>
          <span className="text-gray-600">
            {format(new Date(projectRecord.date!), "P", { locale: de })}
          </span>
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
        <ProjectRecordEmailSourceDisclosure
          email={projectRecord.projectRecordEmail}
          className="mb-6"
        />
      )}

      <div className={projectRecordSectionClassName}>
        <p className={projectRecordSectionLabelClassName}>Eintrag:</p>
        {projectRecord.subsubsections.length > 0 || projectRecord.subsubsection ? (
          <ProjectRecordVerknuepfungen
            projectSlug={projectSlug}
            landAcquisitionModuleEnabled={projectRecord.project.landAcquisitionModuleEnabled}
            subsubsection={projectRecord.subsubsection}
            subsubsections={projectRecord.subsubsections}
            variant="valuesOnly"
            relationType="subsubsections"
            className={projectRecordSectionValueClassName}
          />
        ) : (
          <span className="text-sm text-gray-500">Kein Eintrag zugeordnet</span>
        )}
      </div>

      {(projectRecord.acquisitionAreas.length > 0 || projectRecord.acquisitionArea) &&
        projectRecord.project.landAcquisitionModuleEnabled && (
          <div className={projectRecordSectionClassName}>
            <p className={projectRecordSectionLabelClassName}>
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
              className={projectRecordSectionValueClassName}
            />
          </div>
        )}

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

      <ProjectRecordAssignmentForm key={projectRecord.id} projectRecord={projectRecord} />

      {formTemplates.length > 0 && (
        <div className={projectRecordSectionClassName}>
          <p className={projectRecordSectionLabelClassName}>Formulare:</p>
          <ProjectRecordFormTemplatesSection
            projectSlug={projectSlug}
            projectRecord={projectRecord}
            formTemplates={formTemplates}
            onUploadSaved={onFormSaved}
          />
        </div>
      )}

      <div>
        <p className={projectRecordSectionLabelClassName}>Dokumente:</p>
      </div>
    </div>
  )
}
