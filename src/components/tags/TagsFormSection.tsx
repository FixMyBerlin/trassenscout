import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LinkWithFormDirtyConfirm } from "@/src/components/abschnitte/LinkWithFormDirtyConfirm"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import { createTagFn } from "@/src/server/tags/tags.functions"
import { tagsQueryOptions } from "@/src/server/tags/tagsQueryOptions"
import { buildTagCheckboxItems } from "./buildTagCheckboxItems"
import { NewTagInline } from "./NewTagInline"

type Props = {
  projectSlug: string
  fieldName?: string
  label?: string
  classNameItemWrapper?: string
  showManageLink?: boolean
}

export function TagsFormSection({
  projectSlug,
  fieldName = "tags",
  label = "Tags",
  classNameItemWrapper = "grid grid-cols-4 gap-1.5 w-full",
  showManageLink = false,
}: Props) {
  const form = useCoreAppFormContext()
  const queryClient = useQueryClient()
  const assignedIds = (useFormValue<string[]>(fieldName) ?? []).map(String)
  const tagsQuery = tagsQueryOptions({ projectSlug, includeArchived: true })
  const { data: tagsResult } = useQuery({
    ...tagsQuery,
    refetchOnReconnect: false,
  })
  const createTagMutation = useMutation({ mutationFn: createTagFn })

  const tagItems = buildTagCheckboxItems(tagsResult?.tags ?? [], assignedIds)

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

  const tagsField = (
    <form.AppField name={fieldName}>
      {(field) => (
        <field.CheckboxGroup
          classNameItemWrapper={classNameItemWrapper}
          items={tagItems}
          label={label}
        />
      )}
    </form.AppField>
  )

  if (!showManageLink) {
    return (
      <div className="flex flex-col gap-3">
        {tagsField}
        <NewTagInline onCreate={handleCreateTag} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
        <div className="grow">{tagsField}</div>
        <SuperAdminBox className="shrink-0 self-start sm:self-auto">
          <LinkWithFormDirtyConfirm
            to={`/${projectSlug}/tags`}
            className="self-start py-2 sm:self-auto"
            blank
          >
            Tags verwalten…
          </LinkWithFormDirtyConfirm>
        </SuperAdminBox>
      </div>
      <NewTagInline onCreate={handleCreateTag} />
    </div>
  )
}
