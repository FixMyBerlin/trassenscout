import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { GetGeolocatedUploadsSchema } from "./uploads.inputSchemas"

const GeolocatedUploadSchema = z.object({
  id: z.number(),
  mimeType: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
})

export async function getGeolocatedUploads(
  headers: Headers,
  input: z.infer<typeof GetGeolocatedUploadsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const uploads = await db.upload.findMany({
    where: {
      project: { slug: input.projectSlug },
      latitude: { not: null },
      longitude: { not: null },
    },
    orderBy: { id: "desc" },
    select: {
      id: true,
      mimeType: true,
      latitude: true,
      longitude: true,
    },
  })

  return z.array(GeolocatedUploadSchema).parse(uploads)
}
