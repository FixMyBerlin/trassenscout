import { withAdminAuth } from "@/src/app/api/(auth)/_utils/withAdminAuth"
import { createUploadRouter } from "@/src/server/uploads/_utils/createUploadRouter"
import { toRouteHandler } from "@better-upload/server/adapters/next"

export const POST = withAdminAuth(async ({ request, userId }) => {
  try {
    const router = createUploadRouter({
      keyPrefix: "support",
      userId,
    })
    const handler = toRouteHandler(router)
    return await handler.POST(request)
  } catch (error) {
    console.error("Upload route error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
})
