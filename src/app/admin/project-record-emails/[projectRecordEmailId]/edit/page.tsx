import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecordEmail from "@/src/server/ProjectRecordEmails/queries/getProjectRecordEmail"
import getProjects from "@/src/server/projects/queries/getProjects"
import { Metadata } from "next"
import "server-only"
import { EditProjectRecordEmailForm } from "./_components/EditProjectRecordEmailForm"

export const metadata: Metadata = {
  title: "Protokoll-E-Mail bearbeiten",
}

export default async function EditProjectRecordEmailPage({
  params,
}: {
  params: { projectRecordEmailId: string }
}) {
  const projectRecordEmailId = parseInt(params.projectRecordEmailId)
  const projectRecordEmail = await invoke(getProjectRecordEmail, {
    id: projectRecordEmailId,
  })
  const { projects } = await invoke(getProjects, {})

  return (
    <>
      <PageHeader title="Protokoll-E-Mail bearbeiten" className="mt-12" />

      <EditProjectRecordEmailForm
        initialProjectRecordEmail={projectRecordEmail}
        projectRecordEmailId={projectRecordEmailId}
        projects={projects}
      />
    </>
  )
}
