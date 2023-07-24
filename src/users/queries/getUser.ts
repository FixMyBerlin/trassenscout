import { CurrentUser } from "../types"
import db from "db"

export default async function getUser(id: number) {
  const user = await db.user.findFirst({
    where: { id: id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
    },
  })

  // TODO: Change `as` to `satisfies` once TS 4.9 is available
  return user as CurrentUser | null
}
