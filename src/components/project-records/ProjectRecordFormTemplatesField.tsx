import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { FormTemplateFillModal } from "@/src/components/project-records/FormTemplateFillModal"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { formTemplatesByProjectQueryOptions } from "@/src/server/formTemplates/formTemplatesQueryOptions"
import type { FormTemplateOption } from "@/src/server/formTemplates/types"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { formTemplateTypeLabels } from "@/src/shared/formTemplates/schemas"

type Props = {
  projectSlug: string
}

export const ProjectRecordFormTemplatesField = ({ projectSlug }: Props) => {
  const form = useCoreAppFormContext()
  const [openFormTemplateId, setOpenFormTemplateId] = useState<number | null>(null)
  const { data: user } = useQuery(currentUserQueryOptions())
  const isAdmin = user?.role === UserRoleEnum.ADMIN
  const { data: formTemplates = [] } = useQuery({
    ...formTemplatesByProjectQueryOptions({ projectSlug }),
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  })

  if (!isAdmin) return null

  return (
    <SuperAdminBox className="space-y-3">
      <p className="mb-0 block text-sm font-medium text-gray-700">Formulare</p>

      {formTemplates.length === 0 ? (
        <p className="mt-0 text-sm text-gray-500">
          Für dieses Projekt sind keine Formulartemplates hinterlegt.
        </p>
      ) : (
        <form.AppField name="formTemplates">
          {(field) => (
            <field.CheckboxGroup
              classLabelOverwrite="hidden"
              classNameItemWrapper="grid grid-cols-2 gap-1.5 w-full"
              items={formTemplates.map((formTemplate: FormTemplateOption) => ({
                value: String(formTemplate.id),
                label: `${formTemplate.title} (${formTemplateTypeLabels[formTemplate.type]})`,
                trailing: (
                  <button
                    type="button"
                    onClick={() => setOpenFormTemplateId(formTemplate.id)}
                    className={`text-sm ${linkStyles}`}
                  >
                    ansehen
                  </button>
                ),
              }))}
            />
          )}
        </form.AppField>
      )}

      <FormTemplateFillModal
        projectSlug={projectSlug}
        formTemplateId={openFormTemplateId}
        onClose={() => setOpenFormTemplateId(null)}
      />
    </SuperAdminBox>
  )
}
