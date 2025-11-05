import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { m2mFields, type M2MFieldsType } from "../m2mFields"
import { SubsubsectionWithPosition } from "../queries/getSubsubsection"
import { geometryTypeValidationRefine, SubsubsectionBaseSchema } from "../schema"

const UpdateSubsubsectionSchema = geometryTypeValidationRefine(
  ProjectSlugRequiredSchema.merge(SubsubsectionBaseSchema.merge(z.object({ id: z.number() }))),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) => {
    const disconnect: Record<M2MFieldsType | string, { set: [] }> = {}
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      disconnect[fieldName] = { set: [] }
      connect[fieldName] = {
        connect: data[fieldName] ? data[fieldName].map((id: number) => ({ id })) : [],
      }
      delete data[fieldName]
    })

    await db.subsubsection.update({
      where: { id },
      data: disconnect,
    })
    const subsubsection = await db.subsubsection.update({
      where: { id },
      data: { ...data, ...connect },
    })
    return subsubsection as SubsubsectionWithPosition // Tip: Validate type shape with `satisfies`
  },
)
