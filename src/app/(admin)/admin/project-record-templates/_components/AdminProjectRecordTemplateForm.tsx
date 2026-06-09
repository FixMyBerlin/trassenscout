"use client"

import { FormShell } from "@/src/core/components/forms/FormShell"
import { useCoreAppFormContext } from "@/src/core/components/forms/hooks/formContext"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { useFormValue } from "@/src/core/components/forms/hooks/useFormValue"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import getAdminProjectRecordTopics from "@/src/server/projectRecordTemplates/queries/getAdminProjectRecordTopics"
import {
  ProjectRecordTemplateFormSchema,
  ProjectRecordTemplateFormValues,
  projectRecordTemplateFormDefaultValues,
} from "@/src/server/projectRecordTemplates/schema"
import getProjects from "@/src/server/projects/queries/getProjects"
import { useQuery } from "@blitzjs/rpc"
import { ReactNode, useEffect, useMemo, useState } from "react"

export type AdminProjectRecordTemplateFormProps = {
  initialValues?: Partial<typeof projectRecordTemplateFormDefaultValues>
  onSubmit: (values: ProjectRecordTemplateFormValues) => Promise<void | OnSubmitResult>
  submitText: string
  resetOnSubmit?: boolean
  className?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  submitDisabled?: boolean
  submitClassName?: string
  showFormDebug?: boolean
}

const toNumericIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  return value.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry) && entry > 0)
}

const ProjectAndTopicFields = () => {
  const [projectsResult] = useQuery(getProjects, {})
  const [{ projectRecordTopics }] = useQuery(getAdminProjectRecordTopics, {})
  const form = useCoreAppFormContext()

  const projects = projectsResult.projects || []

  const selectedProjectIds = toNumericIds(useFormValue("projectIds"))
  const selectedTopicIds = toNumericIds(useFormValue("projectRecordTopicIds"))
  const selectedProjectIdSet = useMemo(() => new Set(selectedProjectIds), [selectedProjectIds])

  const availableTopicIds = useMemo(
    () =>
      new Set(
        projectRecordTopics
          .filter((topic) => selectedProjectIdSet.has(topic.projectId))
          .map((topic) => topic.id),
      ),
    [projectRecordTopics, selectedProjectIdSet],
  )

  useEffect(() => {
    const filteredTopicIds = selectedTopicIds.filter((topicId) => availableTopicIds.has(topicId))
    if (filteredTopicIds.length === selectedTopicIds.length) return
    form.setFieldValue("projectRecordTopicIds", filteredTopicIds.map(String))
  }, [availableTopicIds, form, selectedTopicIds])

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
          const topicsForProject = projectRecordTopics
            .filter((topic) => topic.projectId === project.id)
            .map((topic) => ({ value: String(topic.id), label: topic.title }))

          return (
            <div key={project.id} className="rounded-md border border-gray-200 p-3">
              <p className="mb-3 text-sm font-semibold text-gray-700">{project.slug}</p>
              {topicsForProject.length ? (
                <form.AppField name="projectRecordTopicIds">
                  {(field) => (
                    <field.CheckboxGroup
                      classLabelOverwrite="hidden"
                      classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
                      items={topicsForProject}
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
  showFormDebug,
}: AdminProjectRecordTemplateFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...projectRecordTemplateFormDefaultValues, ...initialValues },
    validators: { onSubmit: ProjectRecordTemplateFormSchema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value as unknown as ProjectRecordTemplateFormValues)) || {}
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
      showFormDebug={showFormDebug}
    >
      <form.AppField name="templateTitle">
        {(field) => <field.TextField type="text" label="Titel der Vorlage" />}
      </form.AppField>
      <form.AppField name="entryTitle">
        {(field) => <field.TextField type="text" label="Titel im Eintrag" />}
      </form.AppField>
      <form.AppField name="body">
        {(field) => <field.TextareaField label="Notizen (Markdown)" optional rows={12} />}
      </form.AppField>
      <ProjectAndTopicFields />
      <form.AppField name="purpose">
        {(field) => <field.TextareaField label="Verwendungszweck" optional rows={5} />}
      </form.AppField>
    </FormShell>
  )
}
