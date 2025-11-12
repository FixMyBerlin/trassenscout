import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { DeleteProjectRecordSchema } from "@/src/server/projectRecords/schemas"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(DeleteProjectRecordSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const projectRecord = await db.projectRecord.deleteMany({ where: { id } })

    return projectRecord
  },
)
