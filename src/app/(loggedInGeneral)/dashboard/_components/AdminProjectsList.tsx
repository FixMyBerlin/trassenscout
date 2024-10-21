"use client"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links/Link"
import { shortTitle } from "@/src/core/components/text"
import { isAdmin } from "@/src/pagesComponents/users/utils/isAdmin"
import getProjects from "@/src/server/projects/queries/getProjects"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import { useQuery } from "@blitzjs/rpc"

export const AdminProjectsList = () => {
  const user = useCurrentUser()
  const [projects] = useQuery(getProjects, {}, { enabled: isAdmin(user) })

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
