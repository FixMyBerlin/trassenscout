import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import getProject from "src/projects/queries/getProject"
import getUser from "src/users/queries/getUser"

export const Manager: React.FC = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [user] = useQuery(getUser, project.managerId)

  if (!project) return null

  return (
    <p className="mt-5">
      <strong>Trassenkoordination:</strong> {user?.firstName && user?.firstName} {user?.lastName}
    </p>
  )
}
