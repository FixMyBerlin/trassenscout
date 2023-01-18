import { CurrentUser } from "../types"

export const isAdmin = (user: CurrentUser | null) => {
  return user?.role === "ADMIN"
}
