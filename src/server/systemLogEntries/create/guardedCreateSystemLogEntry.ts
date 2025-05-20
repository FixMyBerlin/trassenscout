import db, { SystemLogEntry } from "@/db"
import { Prettify } from "@/src/core/types"

type Props = Prettify<
  { apiKey: string } & Partial<Pick<SystemLogEntry, "userId" | "projectId" | "context">> &
    Pick<SystemLogEntry, "logLevel" | "message">
>

/**
 * Copy paste helper:

  guardedCreateSystemLogEntry({
    apiKey: process.env.TS_API_KEY
    logLevel: "ERROR" | "INFO"
    message: ""
    context: {}
    userId: undefined
    projectId: undefined
  })
*/

export const guardedCreateSystemLogEntry = async ({ apiKey, context, ...data }: Props) => {
  if (apiKey !== process.env.TS_API_KEY) {
    return Response.json({ statusText: "Unauthorized" }, { status: 401 })
  }

  return await db.systemLogEntry.create({ data: { ...data, context: context || undefined } })
}
