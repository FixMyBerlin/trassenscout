import { User } from "@prisma/client"
import { Prettify } from "src/core/types"
import { getFullname } from "./getFullname"

export type UserSelectOptions = Prettify<(Partial<User> & Required<Pick<User, "id" | "email">>)[]>

export const getUserSelectOptions = (users: UserSelectOptions) => {
  return users.map((u) => [u.id, [getFullname(u), `<${u.email}>`].join(" ")] as [number, string])
}
