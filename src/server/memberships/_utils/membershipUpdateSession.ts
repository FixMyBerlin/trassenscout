import db from "@/db"
import { AuthenticatedSessionContext, SessionContext } from "@blitzjs/auth"
import { selectUserFieldsForSession } from "../../auth/shared/selectUserFieldsForSession"

// After changing the roles, we need to update the session.
// However, different strategies are required depending on whether the membership was created for ME or SOMEONE ELSE.
export const membershipUpdateSession = async (
  userId: number,
  session: AuthenticatedSessionContext | SessionContext,
) => {
  if (userId === session.userId) {
    // CASE: New Membership for ME
    // We update the session, so I don't get logged out
    const user = await db.user.findFirstOrThrow({
      where: { id: userId },
      select: selectUserFieldsForSession,
    })
    await session.$setPublicData(user)
  } else {
    // CASE: New Membership for SOMEONE ELSE
    // We delete the session of the updated user so she is forced to log in again to update her membership
    // … which is the safest route to make sure the data is updated
    await db.session.deleteMany({ where: { userId: userId } })
  }
}
