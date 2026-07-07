import { useSuspenseQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { ReactNode, useState } from "react"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { tagsAdminQueryOptions } from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import {
  projectRecordTemplateFormDefaultValues,
  type ProjectRecordTemplateFormFieldValues,
  ProjectRecordTemplateFormSchema,
} from "@/src/shared/projectRecordTemplates/schemas"

export type AdminProjectRecordTemplateFormProps<S extends z.ZodType> = {
  schema?: S
  initialValues?: Partial<ProjectRecordTemplateFormFieldValues>
  onSubmit: (
    values: z.infer<typeof ProjectRecordTemplateFormSchema>,
  ) => Promise<void | OnSubmitResult>
  submitText: string
  resetOnSubmit?: boolean
  className?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  submitDisabled?: boolean
  submitClassName?: string
}

const toNumericIds = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry) && entry > 0)
}

const ProjectAndTagFields = () => {
  const form = useCoreAppFormContext()
  const { data: projectsResult } = useSuspenseQuery(projectsAdminQueryOptions())
  const { data: tagsResult } = useSuspenseQuery(tagsAdminQueryOptions())

  const projects = projectsResult.projects || []
  const tags = tagsResult.tags

  const selectedProjectIds = toNumericIds(useFormValue<string[]>("projectIds"))
  const selectedTagIds = toNumericIds(useFormValue<string[]>("tagIds"))
  const selectedProjectIdSet = useMemo(() => new Set(selectedProjectIds), [selectedProjectIds])

  const availableTagIds = useMemo(
    () =>
      new Set(tags.filter((tag) => selectedProjectIdSet.has(tag.projectId)).map((tag) => tag.id)),
    [tags, selectedProjectIdSet],
  )

  useEffect(
    function filterTagIdsWhenProjectsChange() {
      const filteredTagIds = selectedTagIds.filter((tagId) => availableTagIds.has(tagId))
      if (filteredTagIds.length === selectedTagIds.length) return
      form.setFieldValue("tagIds", filteredTagIds.map(String))
    },
    [availableTagIds, form, selectedTagIds],
  )

  const projectItems = projects.map((project) => ({
    value: String(project.id),
    label: project.slug,
  }))

  const selectedProjects = projects.filter((project) => selectedProjectIdSet.has(project.id))

  return (
    <>
      <form.AppField name="projectIds">
        {(field) => (
          <field.CheckboxGroup
            label="Aktiv in Projekten"
            optional
            classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
            items={projectItems}
          />
        )}
      </form.AppField>

      <div className="space-y-4">
        <p className="mb-0 block text-sm font-medium text-gray-700">Tags (optional)</p>
        {!selectedProjects.length && (
          <p className="mt-0 text-sm text-gray-500">
            Wählen Sie zuerst ein oder mehrere Projekte aus, um projektspezifische Tags zuzuordnen.
          </p>
        )}
        {selectedProjects.map((project) => {
          const tagsForProject = tags
            .filter((tag) => tag.projectId === project.id)
            .map((tag) => ({ value: String(tag.id), label: tag.title }))

          return (
            <div key={project.id} className="rounded-md border border-gray-200 p-3">
              <p className="mb-3 text-sm font-semibold text-gray-700">{project.slug}</p>
              {tagsForProject.length ? (
                <form.AppField name="tagIds">
                  {(field) => (
                    <field.CheckboxGroup
                      classLabelOverwrite="hidden"
                      classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
                      items={tagsForProject}
                    />
                  )}
                </form.AppField>
              ) : (
                <p className="text-sm text-gray-500">Keine Tags in diesem Projekt vorhanden.</p>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

export function AdminProjectRecordTemplateForm({
  initialValues,
  onSubmit,
  submitText,
  resetOnSubmit,
  className,
  actionBarLeft,
  actionBarRight,
  submitDisabled,
  submitClassName,
}: AdminProjectRecordTemplateFormProps<typeof ProjectRecordTemplateFormSchema>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...projectRecordTemplateFormDefaultValues, ...initialValues },
    validators: { onSubmit: ProjectRecordTemplateFormSchema } as never,
    onSubmit: async ({ value }) => {
      const result =
        (await onSubmit(value as unknown as z.infer<typeof ProjectRecordTemplateFormSchema>)) || {}
      applyFormSubmitResult(form, result, setFormError)
      if (resetOnSubmit && !result.FORM_ERROR) {
        form.reset()
        setFormError(null)
      }
    },
  })

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText={submitText}
      className={className}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
    >
      <form.AppField name="templateTitle">
        {(field) => <field.TextField type="text" label="Titel der Vorlage" />}
      </form.AppField>
      <form.AppField name="entryTitle">
        {(field) => <field.TextField type="text" label="Titel in der Maßnahme " />}
      </form.AppField>
      <form.AppField name="body">
        {(field) => <field.TextareaField label="Notizen" optional rows={12} />}
      </form.AppField>
      <ProjectAndTagFields />
      <form.AppField name="purpose">
        {(field) => <field.TextareaField label="Verwendungszweck" optional rows={5} />}
      </form.AppField>
    </FormShell>
  )
}

export { ProjectRecordTemplateFormSchema }
