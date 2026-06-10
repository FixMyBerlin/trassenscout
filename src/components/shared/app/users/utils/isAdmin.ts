import { UserRoleEnum } from "@/src/prisma/generated/browser"
import type { CurrentUser } from "@/src/server/users/types"

export const isAdmin = (user: CurrentUser | null) => {
  return user?.role === UserRoleEnum.ADMIN
}
