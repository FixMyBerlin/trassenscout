import db from "@/src/server/db.server"
import { AuthenticationError } from "@/src/shared/auth/errors"

export const getInvite = async (inviteToken: string | undefined | null, email: string) => {
  if (!inviteToken) return null

  const invite = await db.invite.findFirst({
    where: { token: inviteToken, email: email.toLocaleLowerCase(), status: "PENDING" },
  })

  if (!invite) throw new AuthenticationError()

  return invite
}
