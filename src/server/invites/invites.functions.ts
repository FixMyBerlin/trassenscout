import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateInvitesSchema,
  GetInviteEmailStatusSchema,
  GetInvitesSchema,
  RevokeInviteSchema,
} from "./invites.inputSchemas"
import { createInvites, getInviteEmailStatus, getInvites, revokeInvite } from "./invites.server"
export const getInvitesFn = createServerFn({ method: "GET" })
  .validator(GetInvitesSchema)
  .handler(({ data }) => getInvites(getRequestHeaders(), data))

export const createInvitesFn = createServerFn({ method: "POST" })
  .validator(CreateInvitesSchema)
  .handler(({ data }) => createInvites(getRequestHeaders(), data))

export const revokeInviteFn = createServerFn({ method: "POST" })
  .validator(RevokeInviteSchema)
  .handler(({ data }) => revokeInvite(getRequestHeaders(), data))

export const getInviteEmailStatusFn = createServerFn({ method: "GET" })
  .validator(GetInviteEmailStatusSchema)
  .handler(({ data }) => getInviteEmailStatus(getRequestHeaders(), data))
