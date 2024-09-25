import db from "@/db"
import { INVITE_DAYS_TO_DELETION, INVITE_DAYS_TO_EXPIRED } from "@/src/invites/inviteSettings.const"
import { internalCreateLogEntry } from "@/src/logEntries/internalCeateLogEntry"
import { endOfDay, subDays } from "date-fns"

const calculateComparisonDate = (daysToComparison: number) => {
  const currentDate = endOfDay(new Date())
  // Calculate the date that is INVITE_DAYS_TO_DELETION days before the current date
  return subDays(currentDate, daysToComparison)
}

const deleteOldInvites = async () => {
  const compareDate = calculateComparisonDate(INVITE_DAYS_TO_DELETION)
  // Delete records where createdAt is older than the calculated date
  const { count: deletedInvitesCount } = await db.invite.deleteMany({
    where: {
      createdAt: { lt: compareDate },
    },
  })
  return deletedInvitesCount
}

const expireOldInvites = async () => {
  const compareDate = calculateComparisonDate(INVITE_DAYS_TO_EXPIRED)
  // Update records where createdAt is older than the calculated date
  const { count: expiredInvitesCount } = await db.invite.updateMany({
    where: {
      createdAt: { lt: compareDate },
      status: "PENDING",
    },
    data: {
      status: "EXPIRED",
    },
  })
  return expiredInvitesCount
}

export async function GET(request: Request) {
  const apiKey = new URL(request.url).searchParams.get("apiKey")
  if (apiKey !== process.env.TS_API_KEY) {
    return Response.json({ statusText: "Unauthorized" }, { status: 401 })
  }

  const deletedInvitesCount = await deleteOldInvites()
  const expiredInvitesCount = await expireOldInvites()

  await internalCreateLogEntry({
    apiKey,
    logLevel: "INFO",
    message: "CRON invite-cleanup",
    context: {
      deletedInvites: { INVITE_DAYS_TO_DELETION, deletedInvitesCount },
      expiredInvites: { INVITE_DAYS_TO_EXPIRED, expiredInvitesCount },
    },
  })

  return Response.json({ statusText: "Success" }, { status: 200 })
}
