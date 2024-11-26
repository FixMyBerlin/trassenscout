import db from "@/db"
import { AuthenticationError } from "blitz"

export const getInvite = async (inviteToken: string | undefined | null, email: string) => {
  if (!inviteToken) return null

  // Check if invite is valid and update/invalidate it at the same time
  const invite = await db.invite.findUniqueOrThrow({
    where: { token: inviteToken, email: email.toLocaleLowerCase(), status: "PENDING" },
  })

  // Explode when someone uses an broken or outdated inviteToken or a non-matching email-address
  if (!invite) throw new AuthenticationError()

  return invite
}
