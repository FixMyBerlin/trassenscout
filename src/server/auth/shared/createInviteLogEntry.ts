import { getFullname } from "@/src/components/core/users/getFullname"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
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
    action: "CREATE",
    message: `${getFullname(invitee)} hat die Einladung angenommen und hat jetzt ${roleTranslation[invite.role]}.`,
    userId: invitee.id,
    projectId: invite.projectId,
  })
}
