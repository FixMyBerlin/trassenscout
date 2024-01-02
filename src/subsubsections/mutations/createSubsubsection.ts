import { resolver } from "@blitzjs/rpc"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"
import { SubsubsectionSchema } from "../schema"
import getSubsectionProjectId from "src/subsections/queries/getSubsectionProjectId"
import m2mFields from "../m2mFields"

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
    return await db.subsubsection.create({ data: { ...data, ...connect } })
  },
)
