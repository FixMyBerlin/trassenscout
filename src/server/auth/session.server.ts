import { UserRoleEnum } from "@/src/prisma/generated/client"
import { auth } from "./auth.server"

type Session = typeof auth.$Infer.Session

export type AppSession = {
  role: UserRoleEnum
  user: Session["user"]
  userId: Session["user"]["id"]
}

async function getSession(headers: Headers) {
  const result = await auth.api.getSession({ headers })
  return result as Session | null
}

export async function getFreshSession(headers: Headers) {
  const result = await auth.api.getSession({
    headers,
    query: { disableCookieCache: true },
  })
  return result as Session | null
}

export async function getAppSession(headers: Headers) {
  const session = await getSession(headers)
  if (!session) return null

  return {
    role: session.role,
    user: session.user,
    userId: session.user.id,
  }
}
