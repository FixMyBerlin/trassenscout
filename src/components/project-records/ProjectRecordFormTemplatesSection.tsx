import { useState } from "react"
import { FormTemplateFillModal } from "@/src/components/project-records/FormTemplateFillModal"
import { FormTemplateOpenButton } from "@/src/components/project-records/FormTemplateOpenButton"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import type { FormTemplateRef } from "@/src/shared/formTemplates/effectiveFormTemplates"

type Props = {
  projectSlug: string
  projectRecord: ProjectRecord
  /** Computed by the caller so it can hide the row when empty. */
  formTemplates: FormTemplateRef[]
}

/** Open to every role: viewers may fill a form in, they just cannot change which are attached. */
export const ProjectRecordFormTemplatesSection = ({
  projectSlug,
  projectRecord,
  formTemplates,
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
      <div className="flex flex-col items-start gap-2 text-sm">
        {formTemplates.map((formTemplate) => (
          <FormTemplateOpenButton
            key={formTemplate.id}
            onClick={() => setOpenFormTemplateId(formTemplate.id)}
          >
            {formTemplate.title}
          </FormTemplateOpenButton>
        ))}
      </div>

      <FormTemplateFillModal
        projectSlug={projectSlug}
        projectRecordId={projectRecord.id}
        filenameContext={filenameContext}
        formTemplateId={openFormTemplateId}
        onClose={() => setOpenFormTemplateId(null)}
      />
    </>
  )
}
