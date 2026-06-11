import { Prettify } from "@/src/components/core/types"
import { SystemLogEntry } from "@/src/prisma/generated/browser"
import { compareApiKeyTimingSafe } from "@/src/server/auth/api-key.server"
import db from "@/src/server/db.server"
import { AuthorizationError } from "@/src/shared/auth/errors"

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
  if (!compareApiKeyTimingSafe(apiKey, process.env.TS_API_KEY)) {
    throw new AuthorizationError()
  }

  return await db.systemLogEntry.create({ data: { ...data, context: context || undefined } })
}
