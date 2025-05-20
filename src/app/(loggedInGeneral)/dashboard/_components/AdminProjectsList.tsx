import { invoke } from "@/src/blitz-server"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links/Link"
import { shortTitle } from "@/src/core/components/text"
import getProjects from "@/src/server/projects/queries/getProjects"
import getCurrentUser from "@/src/server/users/queries/getCurrentUser"
import "server-only"

export const AdminProjectsList = async () => {
  const user = await invoke(getCurrentUser, null)
  if (user?.role !== "ADMIN") return null

  const projects = await invoke(getProjects, {})

  return (
    <SuperAdminBox className="prose">
      <h2 className="mt-0">Alle Projekte</h2>
      <ul>
        {projects?.projects.map((project) => {
          return (
            <li key={project.id}>
              <Link href={`/${project.slug}`}>{shortTitle(project.slug)}</Link>
            </li>
          )
        })}
      </ul>
    </SuperAdminBox>
  )
}
