import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug.server"
import { streamUploadObject } from "./_utils/streamUploadObject.server"

const ParamsSchema = z.object({
  projectSlug: z.string(),
  uploadId: z.coerce.number().int().positive(),
})

export async function serveProjectUploadObject(
  headers: Headers,
  params: { projectSlug: string; uploadId: string },
  options: { download?: boolean } = {},
) {
  await endpointAuth.projectMember({ headers, projectSlug: params.projectSlug, roles: viewerRoles })

  const parseResult = ParamsSchema.safeParse(params)
  if (!parseResult.success) {
    return new Response("Invalid request parameters", { status: 400 })
  }

  const { projectSlug, uploadId } = parseResult.data

  const projectId = await getProjectIdBySlug(projectSlug)
  const upload = await db.upload.findFirst({
    where: {
      id: uploadId,
      projectId,
    },
    select: {
      externalUrl: true,
    },
  })

  if (!upload) {
    return new Response("Not Found", { status: 404 })
  }

  return streamUploadObject(upload.externalUrl, { download: options.download })
}
