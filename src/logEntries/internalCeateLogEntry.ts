import db, { LogEntry } from "@/db"
import { Prettify } from "../core/types"

type Props = Prettify<
  { apiKey: string } & Partial<Pick<LogEntry, "userId" | "projectId" | "context">> &
    Pick<LogEntry, "logLevel" | "message">
>

/**
 * Copy paste helper:

  internalCreateLogEntry({
    apiKey: process.env.TS_API_KEY
    logLevel: "ERROR" | "INFO" | "WARN"
    message: ""
    context: {}
    userId: undefined
    projectId: undefined
  })
*/

export const internalCreateLogEntry = async ({ apiKey, context, ...data }: Props) => {
  if (apiKey !== process.env.TS_API_KEY) {
    return Response.json({ statusText: "Unauthorized" }, { status: 401 })
  }

  return await db.logEntry.create({ data: { ...data, context: context || undefined } })
}
