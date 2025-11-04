"use client"

import { Form, FormProps, LabeledSelect, LabeledTextareaField } from "@/src/core/components/forms"
import { TGetProjects } from "@/src/server/projects/queries/getProjects"
import { z } from "zod"

type ProjectRecordEmailFormProps<S extends z.ZodType<any, any>> = FormProps<S> & {
  projects: TGetProjects["projects"]
}

export function ProjectRecordEmailForm<S extends z.ZodType<any, any>>(
  props: ProjectRecordEmailFormProps<S>,
) {
  const { projects, ...formProps } = props
  const projectOptions: [string | number, string][] = projects.map(
    (project) => [String(project.id), project.slug] as [string, string],
  )

  return (
    <Form<S> {...formProps}>
      <div className="space-y-6">
        <LabeledTextareaField
          name="text"
          label="Body"
          rows={15}
          placeholder="E-Mail-Inhalt einfügen..."
        />
        <LabeledSelect name="projectId" optional options={projectOptions} label="Projekt" />
      </div>
    </Form>
  )
}
