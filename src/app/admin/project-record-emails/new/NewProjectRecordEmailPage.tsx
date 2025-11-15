"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import createProjectRecordEmail from "@/src/server/ProjectRecordEmails/mutations/createProjectRecordEmail"
import { ProjectRecordEmailFormSchema } from "@/src/server/ProjectRecordEmails/schema"
import { TGetProjects } from "@/src/server/projects/queries/getProjects"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { ProjectRecordEmailForm } from "../_components/ProjectRecordEmailForm"

type Props = {
  projects: TGetProjects["projects"]
}

export function NewProjectRecordEmailPage({ projects }: Props) {
  const router = useRouter()
  const [createProjectRecordEmailMutation] = useMutation(createProjectRecordEmail)

  const handleSubmit = async (values: z.infer<typeof ProjectRecordEmailFormSchema>) => {
    try {
      const project = projects.find((p) => p.id === values.projectId)!
      const projectRecordEmail = await createProjectRecordEmailMutation({
        ...values,
        projectSlug: project.slug,
      })
      router.push(`/admin/project-record-emails/${projectRecordEmail.id}`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["body"])
    }
  }

  return (
    <>
      <PageHeader title="Neue Protokoll-E-Mail hinzufügen" className="mt-12" />

      <ProjectRecordEmailForm
        submitText="E-Mail speichern"
        schema={ProjectRecordEmailFormSchema}
        onSubmit={handleSubmit}
        projects={projects}
      />

      <div className="mt-8">
        <Link href="/admin/project-record-emails">← Zurück zur E-Mail-Übersicht</Link>
      </div>
    </>
  )
}
