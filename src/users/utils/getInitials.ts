import { Contact } from "@prisma/client"
import { CurrentUser } from "../types"

type Props = (Partial<CurrentUser> | Partial<Contact>) & {
  email: string
  firstName?: string | null
  lastName?: string | null
}

export const getInitials = (user: Props) => {
  if (!user) return null

  const tryInitials =
    user.firstName &&
    user.lastName &&
    [user.firstName[0], user.lastName[0]].filter(Boolean).join("")

  const tryEmail = [user.email[0], user.email[1]].join("")

  return tryInitials || tryEmail
}
