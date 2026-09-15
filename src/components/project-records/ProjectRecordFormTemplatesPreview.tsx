import { DocumentTextIcon } from "@heroicons/react/24/outline"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { FieldLayout } from "@/src/components/core/components/forms/FieldLayout"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { FormTemplateFillModal } from "@/src/components/project-records/FormTemplateFillModal"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { formTemplatesByProjectQueryOptions } from "@/src/server/formTemplates/formTemplatesQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import {
  type FormTemplateRef,
  getEffectiveFormTemplates,
} from "@/src/shared/formTemplates/effectiveFormTemplates"

type Props = {
  projectSlug: string
  landAcquisitionModuleEnabled: boolean
}

const idsFrom = (value: unknown) =>
  Array.isArray(value) ? value.map(Number).filter((id) => !Number.isNaN(id)) : []

export const ProjectRecordFormTemplatesPreview = ({
  projectSlug,
  landAcquisitionModuleEnabled,
}: Props) => {
  const [openFormTemplateId, setOpenFormTemplateId] = useState<number | null>(null)

  const attachedFormTemplateIds = idsFrom(useFormValue("formTemplates"))
  const hasSubsubsection = idsFrom(useFormValue("subsubsections")).length > 0
  const acquisitionAreaIds = idsFrom(useFormValue("acquisitionAreas"))
  const hasAcquisitionArea = landAcquisitionModuleEnabled && acquisitionAreaIds.length > 0

  const { data: formTemplates = [] } = useQuery({
    ...formTemplatesByProjectQueryOptions({ projectSlug }),
    refetchOnWindowFocus: false,
  })
  const { data: user } = useQuery(currentUserQueryOptions())

  const byId = new Map(formTemplates.map((formTemplate) => [formTemplate.id, formTemplate]))
  const resolve = (ids: number[]) =>
    ids
      .map((id) => byId.get(id))
      .filter((formTemplate): formTemplate is NonNullable<typeof formTemplate> =>
        Boolean(formTemplate),
      ) as FormTemplateRef[]

  const source = { formTemplates: resolve(attachedFormTemplateIds) }

  const effectiveFormTemplates = getEffectiveFormTemplates(source, {
    projectSlug,
    hasSubsubsection,
    hasAcquisitionArea,
  })

  const candidates = getEffectiveFormTemplates(source, {
    projectSlug,
    hasSubsubsection: true,
    hasAcquisitionArea: landAcquisitionModuleEnabled,
  })

  if (candidates.length === 0 || user?.role === UserRoleEnum.ADMIN) return null

  const missingRelation = candidates.length > effectiveFormTemplates.length

  return (
    <FieldLayout label="Formulare">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {candidates.map((formTemplate) => (
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
        <p className="text-sm text-gray-500">
          {missingRelation
            ? "Formulare zum Ansehen. Am Eintrag hängen sie, sobald er gespeichert und mit einer Maßnahme oder Verhandlungsfläche verknüpft ist."
            : "Diese Formulare gehören zum Eintrag. Ausfüllen und ablegen geht, sobald der Eintrag gespeichert ist."}
        </p>
      </div>

      <FormTemplateFillModal
        projectSlug={projectSlug}
        formTemplateId={openFormTemplateId}
        onClose={() => setOpenFormTemplateId(null)}
      />
    </FieldLayout>
  )
}
