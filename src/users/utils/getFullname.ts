import { Contact } from "@prisma/client"
import { CurrentUser } from "../types"

type Props = (Partial<CurrentUser> | Partial<Contact>) & {
  firstName?: string | null
  lastName?: string | null
}

export const getFullname = (user: Props) => {
  if (!user) return null

  return [user.firstName, user.lastName].filter(Boolean).join(" ")
}
