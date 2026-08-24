import { verifyAdminApiToken } from "@/src/server/admin/adminApiTokens.server"
import {
  getClientIp,
  isAdminApiAuthRateLimited,
  recordFailedAdminApiAuth,
} from "@/src/server/api/admin/adminApiAuthRateLimit.server"

export type AdminApiAuth = {
  tokenId: string
  createdById: number
}

type GuardResult =
  | { access: true; auth: AdminApiAuth; response: null }
  | { access: false; auth: null; response: Response }

export async function guardAdminApi(request: Request): Promise<GuardResult> {
  const clientIp = getClientIp(request)
  if (isAdminApiAuthRateLimited(clientIp)) {
    return {
      access: false,
      auth: null,
      response: Response.json({ message: "Too many requests" }, { status: 429 }),
    }
  }

  const header = request.headers.get("authorization") ?? request.headers.get("Authorization")
  const match = header?.match(/^Bearer\s+(.+)$/i)
  if (!match?.[1]) {
    recordFailedAdminApiAuth(clientIp)
    return {
      access: false,
      auth: null,
      response: Response.json({ message: "Unauthorized" }, { status: 401 }),
    }
  }

  const verified = await verifyAdminApiToken(match[1].trim())
  if (!verified) {
    recordFailedAdminApiAuth(clientIp)
    return {
      access: false,
      auth: null,
      response: Response.json({ message: "Unauthorized" }, { status: 401 }),
    }
  }

  return {
    access: true,
    auth: {
      tokenId: verified.tokenId,
      createdById: verified.createdById,
    },
    response: null,
  }
}
