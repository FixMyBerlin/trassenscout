import type { getInvites } from "./invites.server"

export type InvitesResult = Awaited<ReturnType<typeof getInvites>>
