"use client"

import {
  Form,
  FormProps,
  LabeledCheckboxGroup,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import getAdminProjectRecordTopics from "@/src/server/projectRecordTemplates/queries/getAdminProjectRecordTopics"
import { ProjectRecordTemplateFormSchema } from "@/src/server/projectRecordTemplates/schema"
import getProjects from "@/src/server/projects/queries/getProjects"
import { useQuery } from "@blitzjs/rpc"
import { useEffect, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"

type Props = FormProps<z.ZodType<any, any>>

const toNumericIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  return value.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry) && entry > 0)
}

const ProjectAndTopicFields = () => {
  const [projectsResult] = useQuery(getProjects, {})
  const [{ projectRecordTopics }] = useQuery(getAdminProjectRecordTopics, {})
  const { watch, setValue } = useFormContext()

  const projects = projectsResult.projects || []

  const selectedProjectIds = toNumericIds(watch("projectIds"))
  const selectedTopicIds = toNumericIds(watch("projectRecordTopicIds"))
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
    setValue("projectRecordTopicIds", filteredTopicIds.map(String), { shouldDirty: true })
  }, [availableTopicIds, selectedTopicIds, setValue])

  const projectItems = projects.map((project) => ({
    value: String(project.id),
    label: project.slug,
  }))

  const selectedProjects = projects.filter((project) => selectedProjectIdSet.has(project.id))

  return (
    <>
      <LabeledCheckboxGroup
        scope="projectIds"
        label="Aktiv in Projekten"
        optional
        classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
        items={projectItems}
      />

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
                <LabeledCheckboxGroup
                  scope="projectRecordTopicIds"
                  classLabelOverwrite="hidden"
                  classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
                  items={topicsForProject}
                />
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

export const AdminProjectRecordTemplateForm = (props: Props) => {
  return (
    <Form {...props} schema={ProjectRecordTemplateFormSchema}>
      <LabeledTextField type="text" name="templateTitle" label="Titel der Vorlage" />
      <LabeledTextField type="text" name="entryTitle" label="Titel in der Maßnahme " />
      <LabeledTextareaField name="body" label="Notizen (Markdown)" optional rows={12} />
      <ProjectAndTopicFields />
      <LabeledTextareaField name="purpose" label="Verwendungszweck" optional rows={5} />
    </Form>
  )
}
