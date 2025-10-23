import db from "@/db"
import type { MembershipRole } from "@/src/authorization/types"
import { api, getBlitzContext } from "@/src/blitz-server"

type HandlerCtx<TParams> = {
  userId: number
  params: TParams
  request: Request
}

export function withProjectMembership<TParams extends { projectSlug: string; [k: string]: any }>(
  allowedRoles: MembershipRole[],
  handler: (ctx: HandlerCtx<TParams>) => Promise<Response>,
) {
  return async (request: Request, { params }: { params: Promise<TParams> }) => {
    try {
      const resolved = await params
      const { projectSlug } = resolved

      await api(() => null)
      const ctx = await getBlitzContext()
      const userId = ctx?.session?.userId

      if (!userId) {
        return new Response("Unauthorized", { status: 401 })
      }

      if (ctx.session.role === "ADMIN") {
        return await handler({ userId, params: resolved, request })
      }

      const membership = await db.membership.findFirst({
        where: { userId, project: { slug: projectSlug }, role: { in: allowedRoles } },
        select: { id: true },
      })

      if (!membership) {
        return new Response("Forbidden", { status: 403 })
      }

      return await handler({ userId, params: resolved, request })
    } catch (error: any) {
      console.error("withProjectMembership error:", error)
      return new Response("Internal Server Error", { status: 500 })
    }
  }
}
