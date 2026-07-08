import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { getCurrentUser } from "./users.server"

export async function getOptionalCurrentUser(headers: Headers) {
  const session = await endpointAuth.optionalSession(headers)
  if (!session) return null
  return getCurrentUser(headers)
}
