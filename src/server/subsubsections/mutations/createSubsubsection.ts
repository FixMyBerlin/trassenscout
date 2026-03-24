import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { subsubsectionGeometryTypeValidationRefine } from "@/src/server/shared/utils/geometryTypeValidation"
import { resolver } from "@blitzjs/rpc"
import { m2mFields, M2MFieldsType } from "../m2mFields"
import { SubsubsectionBaseSchema } from "../schema"

const CreateSubsubsectionSchema = subsubsectionGeometryTypeValidationRefine(
  ProjectSlugRequiredSchema.merge(SubsubsectionBaseSchema),
)

export default resolver.pipe(
  resolver.zod(CreateSubsubsectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }) => {
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      connect[fieldName] = {
        connect: data[fieldName] ? data[fieldName].map((id: number) => ({ id })) : [],
      }
      delete data[fieldName]
    })
    return await db.subsubsection.create({
      data: { ...data, ...connect },
    })
  },
)
