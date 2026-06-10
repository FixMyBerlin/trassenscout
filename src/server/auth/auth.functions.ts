import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { UserRoleEnum } from "@/src/prisma/generated/client"
import { checkProjectAuthorization } from "@/src/server/authorization/checkProjectAuthorization.server"
import type { LocationLike } from "./authBoundary.types"
import { getAppSession, getFreshSession } from "./session.server"

export const getSessionForRouteFn = createServerFn({ method: "GET" }).handler(() =>
  getAppSession(getRequestHeaders()),
)

/** Layout `beforeLoad` — redirect logged-in users away from guest routes (`/auth`, `_marketing`). */
export const routeGuestFn = createServerFn({ method: "GET" })
  .inputValidator((location?: LocationLike) => location)
  .handler(async ({ data: location }) => {
    if (location?.pathname === "/auth/logout") return

    const session = await getAppSession(getRequestHeaders())
    if (session) {
      throw redirect({ to: "/dashboard" })
    }
  })

/** Layout `beforeLoad` — require session; redirect to login when logged out. */
export const routeSessionFn = createServerFn({ method: "GET" })
  .inputValidator((location: LocationLike) => location)
  .handler(async ({ data: location }) => {
    const session = await getAppSession(getRequestHeaders())
    if (!session) {
      throw redirect({
        to: "/auth/login",
        search: { callbackURL: location.href },
      })
    }
    return session
  })

/** Layout `beforeLoad` — admin-only layout. */
export const routeAdminFn = createServerFn({ method: "GET" })
  .inputValidator((location: LocationLike) => location)
  .handler(async ({ data: location }) => {
    const session = await getFreshSession(getRequestHeaders())
    if (session?.role === UserRoleEnum.ADMIN) {
      return {
        role: session.role,
        user: session.user,
        userId: session.user.id,
      }
    }
    if (session) {
      throw redirect({ to: "/dashboard", search: { from: location.href } })
    }
    throw redirect({
      to: "/auth/login",
      search: { callbackURL: location.href },
    })
  })

/** Layout `beforeLoad` — session plus project membership. */
export const routeProjectFn = createServerFn({ method: "GET" })
  .inputValidator((input: { location: LocationLike; projectSlug: string }) => input)
  .handler(async ({ data: { location, projectSlug } }) => {
    const session = await getAppSession(getRequestHeaders())
    if (!session) {
      throw redirect({
        to: "/auth/login",
        search: { callbackURL: location.href },
      })
    }

    const authorization = await checkProjectAuthorization(session, projectSlug)
    if (!authorization.authorized) {
      throw redirect({
        to: "/access-denied",
        search: { from: location.href },
      })
    }

    return authorization
  })
