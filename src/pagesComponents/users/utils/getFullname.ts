import { CurrentUser } from "@/src/server/users/types"
import { Contact } from "@prisma/client"

type Props = (Partial<CurrentUser> | Partial<Contact>) & {
  firstName?: string | null
  lastName?: string | null
}

export const getFullname = (user: Props) => {
  if (!user) return null

  return [user.firstName, user.lastName].filter(Boolean).join(" ")
}
