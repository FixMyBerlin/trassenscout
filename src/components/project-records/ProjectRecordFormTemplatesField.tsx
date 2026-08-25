import { useQuery } from "@tanstack/react-query"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { formTemplatesByProjectQueryOptions } from "@/src/server/formTemplates/formTemplatesQueryOptions"
import type { FormTemplateOption } from "@/src/server/formTemplates/types"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { formTemplateTypeLabels } from "@/src/shared/formTemplates/schemas"

type Props = {
  projectSlug: string
  /** Shown read-only, not selectable. */
  inheritedFormTemplates?: { id: number; title: string }[]
}

/** Admin-only: attach forms on top of whatever the record inherits. */
export const ProjectRecordFormTemplatesField = ({
  projectSlug,
  inheritedFormTemplates = [],
}: Props) => {
  const form = useCoreAppFormContext()
  const { data: user } = useQuery(currentUserQueryOptions())
  const isAdmin = user?.role === UserRoleEnum.ADMIN
  const { data: formTemplates = [] } = useQuery({
    ...formTemplatesByProjectQueryOptions({ projectSlug }),
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  })

  if (!isAdmin) return null

  const inheritedIds = new Set(inheritedFormTemplates.map((formTemplate) => formTemplate.id))
  const selectableFormTemplates = formTemplates.filter(
    (formTemplate: FormTemplateOption) => !inheritedIds.has(formTemplate.id),
  )

  return (
    <SuperAdminBox className="space-y-3">
      <p className="mb-0 block text-sm font-medium text-gray-700">Formulare</p>

      {inheritedFormTemplates.length > 0 && (
        <p className="mt-0 text-sm text-gray-600">
          Über die Protokollvorlage vorgegeben:{" "}
          {inheritedFormTemplates.map((formTemplate) => formTemplate.title).join(", ")}
        </p>
      )}

      {selectableFormTemplates.length === 0 ? (
        <p className="mt-0 text-sm text-gray-500">
          {formTemplates.length === 0
            ? "Für dieses Projekt sind keine Formulartemplates hinterlegt."
            : "Alle Formulartemplates dieses Projekts sind bereits über die Protokollvorlage vorgegeben."}
        </p>
      ) : (
        <form.AppField name="formTemplates">
          {(field) => (
            <field.CheckboxGroup
              classLabelOverwrite="hidden"
              classNameItemWrapper="grid grid-cols-2 gap-1.5 w-full"
              items={selectableFormTemplates.map((formTemplate: FormTemplateOption) => ({
                value: String(formTemplate.id),
                label: `${formTemplate.title} (${formTemplateTypeLabels[formTemplate.type]})`,
              }))}
            />
          )}
        </form.AppField>
      )}
    </SuperAdminBox>
  )
}
