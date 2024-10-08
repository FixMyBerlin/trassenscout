import db, { MembershipRoleEnum } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { selectUserFieldsForSession } from "@/src/server/auth/shared/selectUserFieldsForSession"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const Schema = z.object({
  projectSlug: z.string(),
  role: z.nativeEnum(MembershipRoleEnum).optional(),
})

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, role }) => {
    const whereRole = role ? { role } : {}
    const users = await db.user.findMany({
      where: {
        memberships: { some: { project: { slug: projectSlug }, ...whereRole } },
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        ...selectUserFieldsForSession,
      },
    })

    // We flatten the memberships in order to not leak a list of memberships for one user to all users that receive this data
    type NonLeakingUser = Omit<(typeof users)[number], "memberships"> & {
      currentMembershipId: number
      currentMembershipRole: MembershipRoleEnum
    }
    const secureUsers = users.map((user) => {
      const { memberships, ...secureUser } = user
      const membership = memberships.find((m) => m.project.slug === projectSlug)
      // @ts-expect-error we add this property to the type in the next line
      secureUser.currentMembershipId = membership?.id
      // @ts-expect-error we add this property to the type in the next line
      secureUser.currentMembershipRole = membership?.role
      return secureUser as NonLeakingUser
    })

    return secureUsers
  },
)
