import { isSupportedMimeType } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { withProjectMembership } from "@/src/app/api/(auth)/_utils/withProjectMembership"
import { editorRoles } from "@/src/authorization/constants"
import { createUploadRouter } from "@/src/server/uploads/_utils/createUploadRouter"
import { toRouteHandler } from "@better-upload/server/adapters/next"

export const POST = withProjectMembership(editorRoles, async ({ params, request, userId }) => {
  try {
    const { projectSlug } = params
    const router = createUploadRouter({
      keyPrefix: projectSlug,
      userId,
      onBeforeUpload: async (files) => {
        for (const file of files) {
          if (!isSupportedMimeType(file.type)) {
            throw new Error(
              `Dateityp nicht erlaubt: ${file.type || "unbekannt"}. Erlaubt sind Bilder, PDF und Office-Dokumente.`,
            )
          }
        }
      },
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
