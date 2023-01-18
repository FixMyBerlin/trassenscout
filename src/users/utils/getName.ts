import { CurrentUser } from "../types"

export const getFullname = (user: CurrentUser) => {
  if (!user) return null

  return [user.firstName, user.lastName].filter(Boolean).join(" ")
}
