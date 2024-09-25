import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { m2mFields, type M2MFieldsType } from "../m2mFields"
import { SubsubsectionWithPosition } from "../queries/getSubsubsection"
import getSubsubsectionProjectId from "../queries/getSubsubsectionProjectId"
import { SubsubsectionSchema } from "../schema"

const UpdateSubsubsectionSchema = SubsubsectionSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionSchema),
  authorizeProjectAdmin(getSubsubsectionProjectId),
  async ({ id, ...data }) => {
    const disconnect: Record<M2MFieldsType | string, { set: [] }> = {}
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      disconnect[fieldName] = { set: [] }
      connect[fieldName] = { connect: data[fieldName] ? data[fieldName].map((id) => ({ id })) : [] }
      // @ts-expect-error "The operand of a 'delete' operator must be optional.ts(2790)"
      delete data[fieldName]
    })

    await db.subsubsection.update({
      where: { id },
      data: disconnect,
    })
    const subsubsection = await db.subsubsection.update({
      where: { id },
      // @ts-expect-error The whole `m2mFields` is way to hard to type but apparently working
      data: { ...data, ...connect },
    })
    return subsubsection as SubsubsectionWithPosition // Tip: Validate type shape with `satisfies`
  },
)
