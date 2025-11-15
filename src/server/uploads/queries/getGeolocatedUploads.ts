import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
const UploadSchema = ProjectSlugRequiredSchema

const GeolocatedUploadSchema = z.object({
  id: z.number(),
  mimeType: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
})

const GeolocatedUploadsSchema = z.array(GeolocatedUploadSchema)

export default resolver.pipe(
  resolver.zod(UploadSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) => {
    const uploads = await db.upload.findMany({
      where: {
        project: { slug: projectSlug },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        mimeType: true,
        latitude: true,
        longitude: true,
      },
    })

    return GeolocatedUploadsSchema.parse(uploads)
  },
)
