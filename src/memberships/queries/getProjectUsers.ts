import { resolver } from "@blitzjs/rpc"
import db, { MembershipRoleEnum } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

const Schema = z.object({
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) => {
    const users = await db.user.findMany({
      where: { memberships: { some: { project: { slug: projectSlug } } } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        memberships: { select: { project: { select: { slug: true } }, role: true } },
      },
    })

    // We flatten the memberships in order to not leak a list of memberships for one user to all users that receive this data
    type NonLeakingUser = Omit<(typeof users)[number], "memberships"> & {
      currentMembershipRole: MembershipRoleEnum
    }
    const secureUsers = users.map((user) => {
      const { memberships, ...secureUser } = user
      // @ts-expect-error we add this property to the type in the next line
      secureUser.currentMembershipRole = memberships.find((m) => m.project.slug === projectSlug)
        ?.role
      return secureUser as NonLeakingUser
    })

    return secureUsers
  },
)
