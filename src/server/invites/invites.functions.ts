import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { CreateInviteSchema, GetInvitesSchema } from "./invites.inputSchemas"
import { createInvite, getInvites } from "./invites.server"
export const getInvitesFn = createServerFn({ method: "GET" })
  .validator(GetInvitesSchema)
  .handler(({ data }) => getInvites(getRequestHeaders(), data))

export const createInviteFn = createServerFn({ method: "POST" })
  .validator(CreateInviteSchema)
  .handler(({ data }) => createInvite(getRequestHeaders(), data))
