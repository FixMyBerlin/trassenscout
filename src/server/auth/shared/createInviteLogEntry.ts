import { Invite, User } from "@/db"
import { roleTranslation } from "@/src/app/_components/memberships/roleTranslation.const"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
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
