import db from "@/db"
import { internalCreateLogEntry } from "@/src/logEntries/internalCeateLogEntry"
import { calculateComparisonDate } from "../../_utils/calculateComparisonDate"

const LOGENTRIES_DAYS_TO_DELETION = 90

export async function GET(request: Request) {
  const apiKey = new URL(request.url).searchParams.get("apiKey")
  if (apiKey !== process.env.TS_API_KEY) {
    return Response.json({ statusText: "Unauthorized" }, { status: 401 })
  }

  const compareDate = calculateComparisonDate(LOGENTRIES_DAYS_TO_DELETION)
  // Delete records where createdAt is older than the calculated date
  const { count: deletedCount } = await db.logEntry.deleteMany({
    where: {
      createdAt: { lt: compareDate },
    },
  })

  await internalCreateLogEntry({
    apiKey,
    logLevel: "INFO",
    message: "CRON logging-cleanup",
    context: {
      LOGENTRIES_DAYS_TO_DELETION,
      deletedCount,
    },
  })

  return Response.json({ statusText: "Success" }, { status: 200 })
}
