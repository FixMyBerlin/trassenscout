import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import getSubsectionProjectId from "@/src/subsections/queries/getSubsectionProjectId"
import { resolver } from "@blitzjs/rpc"
import m2mFields from "../m2mFields"
import { SubsubsectionSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(SubsubsectionSchema),
  authorizeProjectAdmin(getSubsectionProjectId),
  async (data) => {
    const connect = {}
    m2mFields.forEach((fieldName) => {
      // @ts-ignore
      connect[fieldName] = { connect: data[fieldName].map((id) => ({ id })) }
      // @ts-ignore
      delete data[fieldName]
    })
    // @ts-ignore
    return await db.subsubsection.create({ data: { ...data, ...connect } })
  },
)
