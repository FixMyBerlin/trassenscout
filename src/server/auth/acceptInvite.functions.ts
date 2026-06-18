import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { z } from "zod"
import { acceptInviteForSession } from "./acceptInvite.server"
import { endpointAuth } from "./endpointAuth.server"
const AcceptInviteSchema = z.object({
  inviteToken: z.string().optional(),
})

export const acceptInviteFn = createServerFn({ method: "POST" })
  .validator(AcceptInviteSchema)
  .handler(async ({ data }) => {
    const session = await endpointAuth.session(getRequestHeaders())
    return acceptInviteForSession(data.inviteToken, session)
  })
