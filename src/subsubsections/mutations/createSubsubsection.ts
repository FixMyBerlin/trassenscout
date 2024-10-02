import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { m2mFields, M2MFieldsType } from "../m2mFields"
import { SubsubsectionSchema } from "../schema"

const CreateSubsubsectionSchema = ProjectSlugRequiredSchema.merge(SubsubsectionSchema)

export default resolver.pipe(
  resolver.zod(CreateSubsubsectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }) => {
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      connect[fieldName] = { connect: data[fieldName] ? data[fieldName].map((id) => ({ id })) : [] }
      // @ts-expect-error "The operand of a 'delete' operator must be optional.ts(2790)"
      delete data[fieldName]
    })
    return await db.subsubsection.create({
      // @ts-expect-error The whole `m2mFields` is way to hard to type but apparently working
      data: { ...data, ...connect },
    })
  },
)
