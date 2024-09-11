import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import m2mFields from "../m2mFields"
import { SubsubsectionWithPosition } from "../queries/getSubsubsection"
import getSubsubsectionProjectId from "../queries/getSubsubsectionProjectId"
import { SubsubsectionSchema } from "../schema"

let UpdateSubsubsectionSchema = SubsubsectionSchema.merge(
  z.object({
    id: z.number(),
  }),
)
m2mFields.forEach((fieldName) => {
  // @ts-ignore
  UpdateSubsubsectionSchema = UpdateSubsubsectionSchema.merge(
    z.object({
      [fieldName]: z.array(z.number()),
    }),
  )
})

// @ts-ignore
export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionSchema),
  authorizeProjectAdmin(getSubsubsectionProjectId),
  async ({ id, ...data }) => {
    const disconnect = {}
    const connect = {}
    m2mFields.forEach((fieldName) => {
      // @ts-ignore
      disconnect[fieldName] = { set: [] }
      // @ts-ignore
      connect[fieldName] = { connect: data[fieldName].map((id) => ({ id })) }
      // @ts-ignore
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
