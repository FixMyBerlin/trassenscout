import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LinkWithFormDirtyConfirm } from "@/src/components/abschnitte/LinkWithFormDirtyConfirm"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { createTagFn } from "@/src/server/tags/tags.functions"
import { tagsQueryOptions } from "@/src/server/tags/tagsQueryOptions"
import { buildTagItems } from "./buildTagItems"

type Props = {
  projectSlug: string
  fieldName?: string
  label?: string
  showManageLink?: boolean
}

export function TagsFormSection({
  projectSlug,
  fieldName = "tags",
  label = "Tags",
  showManageLink = false,
}: Props) {
  const form = useCoreAppFormContext()
  const queryClient = useQueryClient()
  const canCreateTag = useUserCan(projectSlug).edit
  const assignedIds = (useFormValue<string[]>(fieldName) ?? []).map(String)
  const tagsQuery = tagsQueryOptions({ projectSlug, includeArchived: true })
  const { data: tagsResult } = useQuery({
    ...tagsQuery,
    refetchOnReconnect: false,
  })
  const createTagMutation = useMutation({ mutationFn: createTagFn })

  const tagItems = buildTagItems(tagsResult?.tags ?? [], assignedIds)

  const handleCreateTag = async (title: string) => {
    const createdTag = await createTagMutation.mutateAsync({
      data: { projectSlug, title },
    })
    await queryClient.invalidateQueries({ queryKey: tagsQuery.queryKey })

    const currentTags = Array.isArray(form.getFieldValue(fieldName))
      ? (form.getFieldValue(fieldName) as string[]).map(String)
      : []
    const newTagId = String(createdTag.id)
    if (!currentTags.includes(newTagId)) {
      form.setFieldValue(fieldName, [...currentTags, newTagId])
    }
  }

  return (
    <form.AppField name={fieldName}>
      {(field) => (
        <field.Combobox
          label={label}
          items={tagItems}
          chips
          placeholder={canCreateTag ? "Tag suchen oder neu anlegen" : "Tag suchen"}
          onCreate={canCreateTag ? handleCreateTag : undefined}
          trailingControl={
            showManageLink ? (
              <SuperAdminBox>
                <LinkWithFormDirtyConfirm to={`/${projectSlug}/tags`} blank>
                  Tags verwalten…
                </LinkWithFormDirtyConfirm>
              </SuperAdminBox>
            ) : undefined
          }
        />
      )}
    </form.AppField>
  )
}
