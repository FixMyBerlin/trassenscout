import { Invite, User } from "@/src/prisma/generated/browser"
import { createLogEntry } from "../../logEntries/create/createLogEntry"

type Props = {
  invite: Invite | null
  invitee: Pick<User, "id" | "firstName" | "lastName" | "email">
}

export const createInviteLogEntry = async ({ invite, invitee }: Props) => {
  if (!invitee) return
  if (!invite) return

  await createLogEntry({
    action: "UPDATE",
    message: `Einladung an ${invite.email} wurde angenommen.`,
    userId: invitee.id,
    projectId: invite.projectId,
    inviteId: invite.id,
    previousRecord: { email: invite.email, status: "PENDING" },
    updatedRecord: { email: invite.email, status: "ACCEPTED" },
  })
}
