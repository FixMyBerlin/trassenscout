import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { checkProjectAuthorization } from "@/src/server/authorization/checkProjectAuthorization.server"
import { acceptInviteForSession } from "./acceptInvite.server"
import type { LocationLike } from "./authBoundary.types"
import { getAppSession, getFreshSession } from "./session.server"

function getInviteTokenFromHref(href: string | undefined) {
  if (!href) return undefined
  try {
    return new URL(href, "http://relative").searchParams.get("inviteToken") ?? undefined
  } catch {
    return undefined
  }
}

export const getSessionForRouteFn = createServerFn({ method: "GET" }).handler(() =>
  getAppSession(getRequestHeaders()),
)

/** Layout `beforeLoad` — redirect logged-in users away from guest routes (`/auth`, `_marketing`). */
export const routeGuestFn = createServerFn({ method: "GET" })
  .validator((location?: LocationLike) => location)
  .handler(async ({ data: location }) => {
    if (location?.pathname === "/auth/logout") return

    const session = await getAppSession(getRequestHeaders())
    if (session) {
      // A logged-in user following an invite mail link would otherwise lose the
      // token to this redirect and the invite would silently never be accepted.
      const inviteToken = getInviteTokenFromHref(location?.href)
      if (inviteToken) {
        const result = await acceptInviteForSession(inviteToken, session).catch(() => null)
        if (result?.accepted && result.projectSlug) {
          throw redirect({ href: `/${result.projectSlug}` })
        }
      }
      throw redirect({ to: "/dashboard" })
    }
  })

/** Layout `beforeLoad` — require session; redirect to login when logged out. */
export const routeSessionFn = createServerFn({ method: "GET" })
  .validator((location: LocationLike) => location)
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
  .validator((location: LocationLike) => location)
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
  .validator((input: { location: LocationLike; projectSlug: string }) => input)
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
