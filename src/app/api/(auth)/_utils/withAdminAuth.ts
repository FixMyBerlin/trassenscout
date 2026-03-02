import { api, getBlitzContext } from "@/src/blitz-server"

type HandlerCtx<TParams> = {
  userId: number
  params: TParams
  request: Request
}

export function withAdminAuth<TParams>(handler: (ctx: HandlerCtx<TParams>) => Promise<Response>) {
  return async (request: Request, { params }: { params: Promise<TParams> }) => {
    try {
      const resolved = await params
      await api(() => null)
      const ctx = await getBlitzContext()
      const userId = ctx?.session?.userId
      if (!userId) {
        return new Response("Unauthorized", { status: 401 })
      }
      if (ctx.session.role !== "ADMIN") {
        return new Response("Forbidden", { status: 403 })
      }
      return handler({
        userId,
        params: resolved,
        request,
      })
    } catch (error: any) {
      console.error("withAdminAuth error:", error)
      return new Response("Internal Server Error", { status: 500 })
    }
  }
}
