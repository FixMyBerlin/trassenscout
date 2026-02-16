import db from "@/db"
import { INVITE_DAYS_TO_DELETION } from "@/src/server/invites/inviteSettings.const"
import { guardedCreateSystemLogEntry } from "@/src/server/systemLogEntries/create/guardedCreateSystemLogEntry"
import { endOfDay, subDays } from "date-fns"
import { withApiKey } from "../_utils/withApiKey"

export const dynamic = "force-dynamic" // required with withApiKey (uses request.url)

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

// Currently disabled to prevent duplicate invite conflicts:
// Users cannot be re-invited while expired invites remain in the database
// In the future we might want to re-enable invite expiration feature

// const expireOldInvites = async () => {
//   const compareDate = calculateComparisonDate(INVITE_DAYS_TO_EXPIRED)
//   // Update records where createdAt is older than the calculated date
//   const { count: expiredInvitesCount } = await db.invite.updateMany({
//     where: {
//       createdAt: { lt: compareDate },
//       status: "PENDING",
//     },
//     data: {
//       status: "EXPIRED",
//     },
//   })
//   return expiredInvitesCount
// }

export const GET = withApiKey(async ({ apiKey }) => {
  const deletedInvitesCount = await deleteOldInvites()
  // const expiredInvitesCount = await expireOldInvites()

  await guardedCreateSystemLogEntry({
    apiKey,
    logLevel: "INFO",
    message: "CRON invite-cleanup",
    context: {
      deletedInvites: { INVITE_DAYS_TO_DELETION, deletedInvitesCount },
      // expiredInvites: { INVITE_DAYS_TO_EXPIRED, expiredInvitesCount },
    },
  })

  return Response.json({ statusText: "Success" }, { status: 200 })
})
