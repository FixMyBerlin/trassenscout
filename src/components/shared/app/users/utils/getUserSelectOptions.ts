import type { ComboboxSingleItem } from "@/src/components/core/components/forms/ComboboxSingleBase"
import type { Prettify } from "@/src/components/core/types"
import { getFullname } from "@/src/components/core/users/getFullname"
import type { User } from "@/src/prisma/generated/browser"

export type UserSelectOptions = Prettify<(Partial<User> & Required<Pick<User, "id" | "email">>)[]>

const userOptionLabel = (user: UserSelectOptions[number]) => getFullname(user) ?? user.email

export const getUserSelectOptions = (users: UserSelectOptions) => {
  const result: [number | string, string][] = [["", "(Keine Auswahl)"]]
  users.forEach((u) => {
    result.push([u.id, userOptionLabel(u)])
  })
  return result
}

export const getUserComboboxItems = (users: UserSelectOptions): ComboboxSingleItem[] => {
  const result: ComboboxSingleItem[] = [{ value: "", label: "(Keine Auswahl)" }]
  users.forEach((user) => {
    result.push({
      value: String(user.id),
      label: userOptionLabel(user),
    })
  })
  return result
}
