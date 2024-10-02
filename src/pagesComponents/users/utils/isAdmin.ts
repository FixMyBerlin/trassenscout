import { CurrentUser } from "@/src/server/users/types"

export const isAdmin = (user: CurrentUser | null) => {
  return user?.role === "ADMIN"
}
