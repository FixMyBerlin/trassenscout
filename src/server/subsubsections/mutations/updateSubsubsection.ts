import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { subsubsectionGeometryTypeValidationRefine } from "@/src/server/shared/utils/geometryTypeValidation"
import { typeSubsubsectionGeometry } from "@/src/server/subsubsections/utils/typeSubsubsectionGeometry"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { m2mFields, type M2MFieldsType } from "../m2mFields"
import { SubsubsectionWithPosition } from "../queries/getSubsubsection"
import { SubsubsectionBaseSchema } from "../schema"

const UpdateSubsubsectionSchema = subsubsectionGeometryTypeValidationRefine(
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
    // WARN: Cast needed because update doesn't fetch all relations required by SubsubsectionWithPosition
    // (like manager, subsection, qualityLevel, etc.). The geometry is properly typed via typeSubsubsectionGeometry.
    return typeSubsubsectionGeometry(subsubsection) as SubsubsectionWithPosition
  },
)
