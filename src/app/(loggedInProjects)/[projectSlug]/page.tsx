import { invoke } from "@/src/blitz-server"
import { seoTitleSlug } from "@/src/core/components/text"
import getProject from "@/src/server/projects/queries/getProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import "server-only"
import { ProjectDashboardClient } from "./_components/ProjectDashboardClient"

export async function generateMetadata({ params }: { params: { projectSlug: string } }) {
  const project = await invoke(getProject, { projectSlug: params.projectSlug })
  return {
    title: seoTitleSlug(project.slug),
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string }
}

export default async function ProjectDashboardPage({ params: { projectSlug } }: Props) {
  const project = await invoke(getProject, { projectSlug })
  const subsections = await invoke(getSubsections, { projectSlug })

  return <ProjectDashboardClient initialProject={project} initialSubsections={subsections} />
}
