import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
export async function getOperatorMaxOrder(headers: Headers, projectSlug: string) {
  await endpointAuth.projectRole(headers, projectSlug, viewerRoles)
  const maxOrder = await db.operator.aggregate({
    _max: {
      order: true,
    },
    where: {
      project: {
        slug: projectSlug,
      },
    },
  })

  return maxOrder._max.order
}
