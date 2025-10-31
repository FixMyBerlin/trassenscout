import db from "@/db"
import { guardedCreateSystemLogEntry } from "@/src/server/systemLogEntries/create/guardedCreateSystemLogEntry"
import { calculateComparisonDate } from "../../_utils/calculateComparisonDate"
import { withApiKey } from "../_utils/withApiKey"

const LOGENTRIES_DAYS_TO_DELETION = 365

export const GET = withApiKey(async ({ apiKey }) => {
  const compareDate = calculateComparisonDate(LOGENTRIES_DAYS_TO_DELETION)
  // Delete records where createdAt is older than the calculated date
  const { count: deletedCount } = await db.logEntry.deleteMany({
    where: {
      createdAt: { lt: compareDate },
    },
  })

  await guardedCreateSystemLogEntry({
    apiKey,
    logLevel: "INFO",
    message: "CRON logging-cleanup",
    context: {
      LOGENTRIES_DAYS_TO_DELETION,
      deletedCount,
    },
  })

  return Response.json({ statusText: "Success" }, { status: 200 })
})
