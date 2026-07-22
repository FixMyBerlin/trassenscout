import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateInviteSchema,
  CreateInvitesSchema,
  GetInviteEmailStatusSchema,
  GetInvitesSchema,
} from "./invites.inputSchemas"
import { createInvite, createInvites, getInviteEmailStatus, getInvites } from "./invites.server"
export const getInvitesFn = createServerFn({ method: "GET" })
  .validator(GetInvitesSchema)
  .handler(({ data }) => getInvites(getRequestHeaders(), data))

export const createInviteFn = createServerFn({ method: "POST" })
  .validator(CreateInviteSchema)
  .handler(({ data }) => createInvite(getRequestHeaders(), data))

export const createInvitesFn = createServerFn({ method: "POST" })
  .validator(CreateInvitesSchema)
  .handler(({ data }) => createInvites(getRequestHeaders(), data))

export const getInviteEmailStatusFn = createServerFn({ method: "GET" })
  .validator(GetInviteEmailStatusSchema)
  .handler(({ data }) => getInviteEmailStatus(getRequestHeaders(), data))
