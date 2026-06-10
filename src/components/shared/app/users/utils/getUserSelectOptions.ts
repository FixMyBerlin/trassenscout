import type { Prettify } from "@/src/components/core/types"
import { getFullname } from "@/src/components/core/users/getFullname"
import type { User } from "@/src/prisma/generated/browser"

export type UserSelectOptions = Prettify<(Partial<User> & Required<Pick<User, "id" | "email">>)[]>

export const getUserSelectOptions = (users: UserSelectOptions) => {
  const result: [number | string, string][] = [["", "(Keine Auswahl)"]]
  users.forEach((u) => {
    result.push([u.id, [getFullname(u), `<${u.email}>`].join(" ")])
  })
  return result
}
