import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import type { MembershipRole } from "@/src/server/authorization/types"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug.server"
import { authMessages, AuthorizationError } from "@/src/shared/auth/errors"
import { compareApiKeyTimingSafe } from "./api-key.server"
import { endpointAuth as endpointAuthBoundary } from "./endpointAuthBoundary"
import { getAppSession, getFreshSession } from "./session.server"

type ProjectMemberOpts = {
  headers: Headers
  projectSlug: string
  roles: MembershipRole[]
}

/**
 * Sole public API for auth-boundary decisions at routes, API handlers, and `*.server.ts` exports.
 * The first statement in each boundary function must call exactly one of these methods.
 */
export const endpointAuth = {
  optionalSession: (headers: Headers) => getAppSession(headers),
  /** Require a logged-in user. Use in `*.server.ts` and API handlers; throws `AuthorizationError`. */
  session: async (headers: Headers) => {
    const session = await getAppSession(headers)
    if (!session) {
      throw new AuthorizationError(authMessages.notAuthenticated)
    }
    return session
  },
  /** Require admin role (fresh session, bypasses cookie cache). Throws `AuthorizationError`. */
  admin: async (headers: Headers) => {
    const session = await getFreshSession(headers)
    if (!session) {
      throw new AuthorizationError(authMessages.notAuthenticated)
    }
    if (session.role !== UserRoleEnum.ADMIN) {
      throw new AuthorizationError(authMessages.adminAccessRequired)
    }
    return {
      role: session.role,
      user: session.user,
      userId: session.user.id,
    }
  },
  /**
   * Require project membership with the given roles; returns session plus the matched membership role.
   * Prefer `projectRole` when you also need `projectId`.
   */
  projectMember: async (opts: ProjectMemberOpts) => {
    const session = await getAppSession(opts.headers)
    if (!session) {
      throw new AuthorizationError(authMessages.notAuthenticated)
    }
    const membershipRole = await authorizeProjectMemberByProjectSlug(
      session,
      opts.projectSlug,
      opts.roles,
    )
    return { ...session, membershipRole }
  },
  /** Require project membership; returns `{ projectId, session, membershipRole }`. Primary guard for `*.server.ts` exports. */
  projectRole: async (headers: Headers, projectSlug: string, roles: MembershipRole[]) => {
    const session = await getAppSession(headers)
    if (!session) {
      throw new AuthorizationError(authMessages.notAuthenticated)
    }
    const membershipRole = await authorizeProjectMemberByProjectSlug(session, projectSlug, roles)
    const projectId = await getProjectIdBySlug(projectSlug)
    return { projectId, session, membershipRole }
  },
  /** Validate `TS_API_KEY` from query or `Authorization` / `x-api-key` header. For cron and automation API routes. */
  apiKey: (request: Request) => {
    const url = new URL(request.url)
    const queryApiKey = url.searchParams.get("apiKey")
    const headerApiKey =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      request.headers.get("x-api-key")

    if (!compareApiKeyTimingSafe(queryApiKey ?? headerApiKey, process.env.TS_API_KEY)) {
      throw new AuthorizationError()
    }
  },
  ...endpointAuthBoundary,
} as const
