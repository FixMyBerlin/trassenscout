import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitleSlug } from "@/src/core/components/text"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getProject from "@/src/server/projects/queries/getProject"
import "server-only"
import { EditProjectClient } from "./_components/EditProjectClient"

export async function generateMetadata({ params }: { params: { projectSlug: string } }) {
  const project = await invoke(getProject, { projectSlug: params.projectSlug })
  return {
    title: seoEditTitleSlug(project.slug),
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string }
}

export default async function EditProjectPage({ params: { projectSlug } }: Props) {
  const project = await invoke(getProject, { projectSlug })
  const users = await invoke(getProjectUsers, { projectSlug })

  return (
    <>
      <PageHeader title="Projekt bearbeiten" className="mt-12" />
      <EditProjectClient initialProject={project} initialUsers={users} />
      <SuperAdminLogData data={project} />
    </>
  )
}
