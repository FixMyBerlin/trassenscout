import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async (input) => await db.surveySession.create({ data: input }))
