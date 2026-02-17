import { invoke } from "@/src/blitz-server"
import { seoTitleSlug } from "@/src/core/components/text"
import getProject from "@/src/server/projects/queries/getProject"
import "server-only"
import { ProjectDashboardClient } from "./_components/ProjectDashboardClient"

export async function generateMetadata({ params }: { params: { projectSlug: string } }) {
  try {
    const project = await invoke(getProject, { projectSlug: params.projectSlug })
    return {
      title: seoTitleSlug(project.slug),
      robots: "noindex",
    }
  } catch {
    return {
      title: "Projekt",
      robots: "noindex",
    }
  }
}

export default function ProjectDashboardPage() {
  return <ProjectDashboardClient />
}
