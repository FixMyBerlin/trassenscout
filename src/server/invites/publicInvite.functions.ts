import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { getPublicInviteByToken } from "./publicInvite.server"
const GetPublicInviteSchema = z.object({
  token: z.string().nullable(),
})

export const getPublicInviteByTokenFn = createServerFn({ method: "GET" })
  .inputValidator(GetPublicInviteSchema)
  .handler(({ data }) => getPublicInviteByToken(data.token))
