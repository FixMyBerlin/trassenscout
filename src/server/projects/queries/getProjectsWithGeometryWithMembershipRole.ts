import db from "@/db"
import getProjectsWithGeometryWithMembershipRole from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { resolver } from "@blitzjs/rpc"
import { Ctx, NotFoundError } from "blitz"

export type TGetProjectsWithGeometryWithMembershipRole = Awaited<
  ReturnType<typeof getProjectsWithGeometryWithMembershipRole>
>

export default resolver.pipe(
  resolver.authorize(/* ok: being logged in is enough to request the list */),
  async (_, { session }: Pick<Ctx, "session">) => {
    if (!session.userId) throw new NotFoundError()

    const projectsWithGeometryWithMembershipRole = await db.project.findMany({
      // Note: We don't have a "ADMIN" sees all here, because that would fill the Dashboard with a map of all projects
      // where: session.role === "ADMIN" ? {} : { memberships: { some: { userId: session.userId } } },
      where: { memberships: { some: { userId: session.userId } } },
      select: {
        id: true,
        slug: true,
        subsections: { select: { geometry: true } },
        memberships: { select: { role: true }, where: { userId: session.userId } },
      },
    })

    return projectsWithGeometryWithMembershipRole
  },
)
