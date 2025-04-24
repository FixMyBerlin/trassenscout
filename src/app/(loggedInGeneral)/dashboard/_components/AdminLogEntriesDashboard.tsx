import { invoke } from "@/src/blitz-server"
import getProjects from "@/src/server/projects/queries/getProjects"
import getCurrentUser from "@/src/server/users/queries/getCurrentUser"
import "server-only"
import { AdminLogEntriesProject } from "./AdminLogEntriesProject"

export const AdminLogEntriesDashboard = async () => {
  const user = await invoke(getCurrentUser, null)
  if (user?.role !== "ADMIN") return null

  const { projects } = await invoke(getProjects, {})

  return (
    <>
      {projects.map((project) => {
        return (
          <AdminLogEntriesProject
            key={project.id}
            projectId={project.id}
            projectSlug={project.slug}
          />
        )
      })}
    </>
  )
}
