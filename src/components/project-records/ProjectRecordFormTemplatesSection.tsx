import { DocumentTextIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { FormTemplateFillModal } from "@/src/components/project-records/FormTemplateFillModal"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import type { FormTemplateRef } from "@/src/shared/formTemplates/effectiveFormTemplates"

type Props = {
  projectSlug: string
  projectRecord: ProjectRecord
  /** Computed by the caller so it can hide the row when empty. */
  formTemplates: FormTemplateRef[]
  onUploadSaved?: () => void
}

/** Open to every role: viewers may fill a form in, they just cannot change which are attached. */
export const ProjectRecordFormTemplatesSection = ({
  projectSlug,
  projectRecord,
  formTemplates,
  onUploadSaved,
}: Props) => {
  const [openFormTemplateId, setOpenFormTemplateId] = useState<number | null>(null)

  const acquisitionAreaId =
    projectRecord.acquisitionAreas[0]?.id ?? projectRecord.acquisitionArea?.id
  const filenameContext =
    projectRecord.subsubsections[0]?.slug ??
    projectRecord.subsubsection?.slug ??
    (acquisitionAreaId ? `vf-${acquisitionAreaId}` : null)

  return (
    <>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {formTemplates.map((formTemplate) => (
          <button
            key={formTemplate.id}
            type="button"
            onClick={() => setOpenFormTemplateId(formTemplate.id)}
            className={`inline-flex items-center gap-1 whitespace-nowrap ${linkStyles}`}
          >
            <DocumentTextIcon className="size-4 shrink-0" aria-hidden />
            {formTemplate.title}
          </button>
        ))}
      </div>

      <FormTemplateFillModal
        projectSlug={projectSlug}
        projectRecordId={projectRecord.id}
        filenameContext={filenameContext}
        formTemplateId={openFormTemplateId}
        onClose={() => setOpenFormTemplateId(null)}
        onSaved={onUploadSaved}
      />
    </>
  )
}
